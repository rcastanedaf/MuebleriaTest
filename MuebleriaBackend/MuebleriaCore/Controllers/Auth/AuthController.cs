using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MuebleriaCore.Data;
using MuebleriaCore.Services;
using Oracle.ManagedDataAccess.Client;

namespace MuebleriaCore.Controllers.Auth;

[ApiController]
[Route("api/auth")]
public class AuthController : BaseController
{
    private readonly JwtService _jwt;

    public AuthController(OracleHelper db, JwtService jwt) : base(db) => _jwt = jwt;

    // ── POST /api/auth/login ──────────────────────────────────
    [HttpPost("login")]
    [AllowAnonymous]
    public IActionResult Login([FromBody] LoginDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest(new { message = "Email y contraseña son requeridos." });

        // SELECT via VW_LOGIN_USUARIO
        var dt = _db.ExecuteReader(
            @"SELECT ID_USUARIO, USERNAME_USUARIO, PASSWORD_USUARIO,
                     EMAIL_USUARIO, ESTADO_USUARIO, NOMBRE_ROL, ID_SUCURSAL, ID_CLIENTE
              FROM   VW_LOGIN_USUARIO
              WHERE  LOWER(EMAIL_USUARIO) = LOWER(:p_email)
                AND  ESTADO_USUARIO = 'A'",
            [OracleHelper.P("p_email", dto.Email)]);

        if (dt.Rows.Count == 0)
            return Unauthorized(new { message = "Credenciales inválidas." });

        var row  = dt.Rows[0];
        var hash = row["PASSWORD_USUARIO"]?.ToString() ?? "";

        if (!BCrypt.Net.BCrypt.Verify(dto.Password, hash))
            return Unauthorized(new { message = "Credenciales inválidas." });

        var userId    = OracleHelper.ConvertOracleToLong(row["ID_USUARIO"]);
        var email     = row["EMAIL_USUARIO"]?.ToString() ?? "";
        var name      = row["USERNAME_USUARIO"]?.ToString() ?? "";
        var role      = row["NOMBRE_ROL"]?.ToString()?.ToLower() ?? "cliente";
        var idCliente = row["ID_CLIENTE"] == DBNull.Value ? (long?)null
                        : OracleHelper.ConvertOracleToLong(row["ID_CLIENTE"]);

        // UPDATE via SP_USR_UPD_ACCESO
        _db.ExecuteNonQuery("SP_USR_UPD_ACCESO",
            [OracleHelper.PInt("p_id_usuario", userId)],
            isStoredProc: true);

        var token = _jwt.GenerateToken(userId, email, role, name);

        return Ok(new
        {
            token,
            user = new
            {
                id         = userId,
                name,
                email,
                role,
                idSucursal = row["ID_SUCURSAL"] == DBNull.Value ? (object?)null
                             : OracleHelper.ConvertOracleToLong(row["ID_SUCURSAL"]),
                idCliente  = (object?)idCliente
            }
        });
    }

    // ── POST /api/auth/register ───────────────────────────────
    [HttpPost("register")]
    [AllowAnonymous]
    public IActionResult Register([FromBody] RegisterDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name)  ||
            string.IsNullOrWhiteSpace(dto.Email) ||
            string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest(new { message = "Nombre, email y contraseña son requeridos." });

        var exists = OracleHelper.ConvertOracleToInt(
            _db.ExecuteScalar(
                "SELECT COUNT(*) FROM USUARIOS WHERE LOWER(EMAIL_USUARIO) = LOWER(:e)",
                [OracleHelper.P("e", dto.Email)]));
        if (exists > 0)
            return Conflict(new { message = "El email ya está registrado." });

        var idRol = OracleHelper.ConvertOracleToLong(
            _db.ExecuteScalar(
                "SELECT ID_ROL FROM VW_ROLES WHERE LOWER(NOMBRE_ROL) = 'cliente' AND ROWNUM = 1")
            ?? 2L);

        var idSuc = OracleHelper.ConvertOracleToLong(
            _db.ExecuteScalar(
                "SELECT ID_SUCURSAL FROM VW_SUCURSALES WHERE ESTADO_SUCURSAL = 'A' AND ROWNUM = 1")
            ?? 1L);

        try
        {
            using var conn = _db.GetConnection();
            using var txn  = conn.BeginTransaction();

            // 1) INSERT CLIENTE via SP_REG_INS_CLIENTE
            using var cmdC = new OracleCommand("SP_REG_INS_CLIENTE", conn)
                { CommandType = System.Data.CommandType.StoredProcedure, Transaction = txn, BindByName = true };
            cmdC.Parameters.Add(OracleHelper.P("p_cod",    "CLI-" + DateTime.Now.Ticks.ToString()[^8..]));
            cmdC.Parameters.Add(OracleHelper.P("p_nom",    dto.Name));
            cmdC.Parameters.Add(OracleHelper.P("p_nit",    dto.Nit ?? "CF"));
            cmdC.Parameters.Add(OracleHelper.P("p_tel",    dto.Phone ?? ""));
            cmdC.Parameters.Add(OracleHelper.P("p_email",  dto.Email));
            cmdC.Parameters.Add(OracleHelper.P("p_tdoc",   dto.TipoDocumento ?? "NIT"));
            cmdC.Parameters.Add(OracleHelper.P("p_ndoc",   dto.NumeroDocumento ?? dto.Nit ?? "CF"));
            cmdC.Parameters.Add(OracleHelper.P("p_telres", dto.TelefonoResidencia ?? dto.Phone ?? ""));
            cmdC.Parameters.Add(OracleHelper.P("p_telcel", dto.TelefonoCelular ?? dto.Phone ?? ""));
            cmdC.Parameters.Add(OracleHelper.P("p_dir",    dto.Address ?? ""));
            cmdC.Parameters.Add(OracleHelper.P("p_ciu",    dto.City ?? ""));
            cmdC.Parameters.Add(OracleHelper.P("p_dep",    dto.Departamento ?? ""));
            cmdC.Parameters.Add(OracleHelper.P("p_pais",   dto.Country ?? "Guatemala"));
            cmdC.Parameters.Add(OracleHelper.P("p_prof",   dto.Profesion ?? ""));
            cmdC.Parameters.Add(OracleHelper.P("p_tpers",  dto.TipoPersona ?? "N"));
            cmdC.Parameters.Add(OracleHelper.POut("p_id_out"));
            cmdC.ExecuteNonQuery();
            var newClienteId = OracleHelper.ConvertOracleToLong(cmdC.Parameters["p_id_out"].Value);

            // 2) INSERT USUARIO via SP_REG_INS_USUARIO
            using var cmdU = new OracleCommand("SP_REG_INS_USUARIO", conn)
                { CommandType = System.Data.CommandType.StoredProcedure, Transaction = txn, BindByName = true };
            cmdU.Parameters.Add(OracleHelper.P("p_user",  dto.Email.Split('@')[0]));
            cmdU.Parameters.Add(OracleHelper.P("p_pass",  BCrypt.Net.BCrypt.HashPassword(dto.Password, 12)));
            cmdU.Parameters.Add(OracleHelper.P("p_email", dto.Email));
            cmdU.Parameters.Add(OracleHelper.PInt("p_rol", idRol));
            cmdU.Parameters.Add(OracleHelper.PInt("p_suc", idSuc));
            cmdU.Parameters.Add(OracleHelper.POut("p_id_out"));
            cmdU.ExecuteNonQuery();
            var newUserId = OracleHelper.ConvertOracleToLong(cmdU.Parameters["p_id_out"].Value);

            txn.Commit();

            var token = _jwt.GenerateToken(newUserId, dto.Email, "cliente", dto.Name);
            return Ok(new
            {
                token,
                user = new
                {
                    id        = newUserId,
                    name      = dto.Name,
                    email     = dto.Email,
                    nit       = dto.Nit,
                    phone     = dto.Phone,
                    city      = dto.City,
                    country   = dto.Country,
                    role      = "cliente",
                    idCliente = (object?)newClienteId
                }
            });
        }
        catch (OracleException ex) { return HandleOracleError(ex); }
    }

    // ── GET /api/auth/mis-permisos ────────────────────────────
    [HttpGet("mis-permisos")]
    public IActionResult MisPermisos()
    {
        try
        {
            var role = CurrentUserRole;
            if (string.IsNullOrEmpty(role))
                return Ok(new { esAdmin = false, modulos = Array.Empty<string>() });

            // SELECT via VW_ROLES
            var rangoRaw = _db.ExecuteScalar(
                "SELECT RANGO_ROL FROM VW_ROLES WHERE LOWER(NOMBRE_ROL) = :p_rol",
                [OracleHelper.P("p_rol", role)]);
            var rango = OracleHelper.ConvertOracleToInt(rangoRaw);

            if (rango == 1)
                return Ok(new { esAdmin = true, modulos = (string[]?)null });

            // SELECT via VW_PERMISOS_USUARIO
            var dt = _db.ExecuteReader(
                "SELECT MODULO_PERMISO FROM VW_PERMISOS_USUARIO WHERE ID_USUARIO = :p_uid",
                [OracleHelper.PInt("p_uid", CurrentUserId)]);

            var modulos = OracleHelper.ToList(dt)
                .Select(row => row["moduloPermiso"]?.ToString() ?? "")
                .Where(m => m.Length > 0)
                .ToArray();

            return Ok(new { esAdmin = false, modulos });
        }
        catch (OracleException ex) { return HandleOracleError(ex); }
    }

    // ── GET /api/auth/profile ─────────────────────────────────
    [HttpGet("profile")]
    public IActionResult Profile()
    {
        // SELECT via VW_PERFIL_USUARIO
        var dt = _db.ExecuteReader(
            "SELECT * FROM VW_PERFIL_USUARIO WHERE ID_USUARIO = :p_id",
            [OracleHelper.PInt("p_id", CurrentUserId)]);
        if (dt.Rows.Count == 0) return NotFound();
        return Ok(OracleHelper.ToList(dt)[0]);
    }

    // ── PUT /api/auth/profile — edición self-service cliente ──
    [HttpPut("profile")]
    public IActionResult UpdateProfile([FromBody] ProfileUpdateDto dto)
    {
        try
        {
            // Look up idCliente via the login view (join CLIENTE on email)
            var raw = _db.ExecuteScalar(
                "SELECT ID_CLIENTE FROM VW_LOGIN_USUARIO WHERE ID_USUARIO = :p_id AND ROWNUM = 1",
                [OracleHelper.PInt("p_id", CurrentUserId)]);

            if (raw == null || raw == DBNull.Value)
                return BadRequest(new { message = "Solo clientes pueden editar su perfil." });

            var idCliente = OracleHelper.ConvertOracleToLong(raw);

            _db.ExecuteNonQuery("SP_CLI_UPD_PERFIL", [
                OracleHelper.PInt("p_id",  idCliente),
                OracleHelper.P("p_nom",    dto.Nombre),
                OracleHelper.P("p_email",  dto.Email),
                OracleHelper.P("p_tel",    dto.Telefono),
                OracleHelper.P("p_dir",    dto.Direccion),
                OracleHelper.P("p_ciu",    dto.Ciudad),
                OracleHelper.P("p_pais",   dto.Pais),
            ], isStoredProc: true);

            return Ok(new { message = "Perfil actualizado." });
        }
        catch (OracleException ex) { return HandleOracleError(ex); }
    }
}

public record LoginDto(string Email, string Password);
public record ProfileUpdateDto(
    string? Nombre, string? Email, string? Telefono,
    string? Direccion, string? Ciudad, string? Pais);
public record RegisterDto(
    string Name, string Email, string Password,
    string? Nit, string? Phone, string? Address,
    string? City, string? Country,
    // Campos adicionales requeridos por PDF seccion 1
    string? TipoDocumento, string? NumeroDocumento,
    string? TelefonoResidencia, string? TelefonoCelular,
    string? Departamento, string? Profesion,
    string? TipoPersona);
