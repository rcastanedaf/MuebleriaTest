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

        var sql = @"SELECT U.ID_USUARIO, U.USERNAME_USUARIO, U.PASSWORD_USUARIO,
                           U.EMAIL_USUARIO, U.ESTADO_USUARIO,
                           R.NOMBRE_ROL, U.ID_SUCURSAL
                    FROM   USUARIOS U
                    JOIN   ROLES R ON R.ID_ROL = U.ID_ROL
                    WHERE  LOWER(U.EMAIL_USUARIO) = LOWER(:p_email)
                      AND  U.ESTADO_USUARIO = 'A'";

        var dt = _db.ExecuteReader(sql, [OracleHelper.P("p_email", dto.Email)]);
        if (dt.Rows.Count == 0)
            return Unauthorized(new { message = "Credenciales inválidas." });

        var row  = dt.Rows[0];
        var hash = row["PASSWORD_USUARIO"]?.ToString() ?? "";

        if (!BCrypt.Net.BCrypt.Verify(dto.Password, hash))
            return Unauthorized(new { message = "Credenciales inválidas." });

        var userId = OracleHelper.ConvertOracleToLong(row["ID_USUARIO"]);
        var email  = row["EMAIL_USUARIO"]?.ToString() ?? "";
        var name   = row["USERNAME_USUARIO"]?.ToString() ?? "";
        var role   = row["NOMBRE_ROL"]?.ToString()?.ToLower() ?? "cliente";

        // Actualizar último acceso
        _db.ExecuteNonQuery(
            "UPDATE USUARIOS SET ULTIMO_ACCESO_USUARIO = SYSTIMESTAMP WHERE ID_USUARIO = :p_id",
            [OracleHelper.PInt("p_id", userId)]);

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
                             : OracleHelper.ConvertOracleToLong(row["ID_SUCURSAL"])
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

        // Check email único
        var exists = OracleHelper.ConvertOracleToInt(
            _db.ExecuteScalar(
                "SELECT COUNT(*) FROM USUARIOS WHERE LOWER(EMAIL_USUARIO) = LOWER(:e)",
                [OracleHelper.P("e", dto.Email)]));
        if (exists > 0)
            return Conflict(new { message = "El email ya está registrado." });

        // Obtener rol cliente e ID sucursal principal
        var idRol = OracleHelper.ConvertOracleToLong(
            _db.ExecuteScalar(
                "SELECT ID_ROL FROM ROLES WHERE LOWER(NOMBRE_ROL) = 'cliente' AND ROWNUM = 1")
            ?? 2L);

        var idSuc = OracleHelper.ConvertOracleToLong(
            _db.ExecuteScalar(
                "SELECT ID_SUCURSAL FROM SUCURSALES WHERE ESTADO_SUCURSAL = 'A' AND ROWNUM = 1")
            ?? 1L);

        try
        {
            using var conn = _db.GetConnection();
            using var txn  = conn.BeginTransaction();

            // 1) INSERT CLIENTE
            var sqlCliente = @"INSERT INTO CLIENTE
                                (CODIGO_CLIENTE, RAZON_SOCIAL_CLIENTE, NIT_CLIENTE,
                                 TELEFON_CLIENTE, EMAIL_CLIENTE, ESTADO_CLIENTE)
                               VALUES (:p_cod, :p_nom, :p_nit, :p_tel, :p_email, 'A')
                               RETURNING ID_CLIENTE INTO :p_id_out";

            using var cmdC = new OracleCommand(sqlCliente, conn) { Transaction = txn, BindByName = true };
            cmdC.Parameters.Add(OracleHelper.P("p_cod",   "CLI-" + DateTime.Now.Ticks.ToString()[^8..]));
            cmdC.Parameters.Add(OracleHelper.P("p_nom",   dto.Name));
            cmdC.Parameters.Add(OracleHelper.P("p_nit",   dto.Nit ?? "CF"));
            cmdC.Parameters.Add(OracleHelper.P("p_tel",   dto.Phone ?? ""));
            cmdC.Parameters.Add(OracleHelper.P("p_email", dto.Email));
            cmdC.Parameters.Add(OracleHelper.POut("p_id_out"));
            cmdC.ExecuteNonQuery();

            // 2) INSERT USUARIO
            var sqlUser = @"INSERT INTO USUARIOS
                             (USERNAME_USUARIO, PASSWORD_USUARIO, EMAIL_USUARIO,
                              ESTADO_USUARIO, ID_ROL, ID_SUCURSAL)
                            VALUES (:p_user, :p_pass, :p_email, 'A', :p_rol, :p_suc)
                            RETURNING ID_USUARIO INTO :p_id_out";

            using var cmdU = new OracleCommand(sqlUser, conn) { Transaction = txn, BindByName = true };
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
                    id      = newUserId,
                    name    = dto.Name,
                    email   = dto.Email,
                    nit     = dto.Nit,
                    phone   = dto.Phone,
                    city    = dto.City,
                    country = dto.Country,
                    role    = "cliente"
                }
            });
        }
        catch (OracleException ex) { return HandleOracleError(ex); }
    }

    // ── GET /api/auth/profile ─────────────────────────────────
    [HttpGet("profile")]
    public IActionResult Profile()
    {
        var sql = @"SELECT U.ID_USUARIO, U.USERNAME_USUARIO, U.EMAIL_USUARIO,
                           U.ULTIMO_ACCESO_USUARIO, R.NOMBRE_ROL, S.NOMBRE_SUCURSAL
                    FROM   USUARIOS U
                    JOIN   ROLES R     ON R.ID_ROL      = U.ID_ROL
                    JOIN   SUCURSALES S ON S.ID_SUCURSAL = U.ID_SUCURSAL
                    WHERE  U.ID_USUARIO = :p_id";

        var dt = _db.ExecuteReader(sql, [OracleHelper.PInt("p_id", CurrentUserId)]);
        if (dt.Rows.Count == 0) return NotFound();
        return Ok(OracleHelper.ToList(dt)[0]);
    }
}

public record LoginDto(string Email, string Password);
public record RegisterDto(
    string Name, string Email, string Password,
    string? Nit, string? Phone, string? Address,
    string? City, string? Country);
