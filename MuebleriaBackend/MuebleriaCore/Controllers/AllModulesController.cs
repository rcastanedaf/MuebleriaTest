// ============================================================
// Todos los módulos CRUD restantes del DDL Oracle
// SELECTs  → vistas  VW_<ENTIDAD>
// INSERTs  → procedimientos SP_<ENT>_INS
// UPDATEs  → procedimientos SP_<ENT>_UPD
// DELETEs  → procedimientos SP_<ENT>_DEL
// ============================================================
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MuebleriaCore.Data;
using Oracle.ManagedDataAccess.Client;

namespace MuebleriaCore.Controllers;

// ── Configuración General ─────────────────────────────────────

[Route("api/empresas")]
public class EmpresasController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll() =>
        OkList(_db.ExecuteReader("SELECT * FROM VW_EMPRESAS ORDER BY NOMBRE_EMPRESA"));

    [HttpGet("{id:long}")] public IActionResult GetById(long id)
    {
        var dt = _db.ExecuteReader("SELECT * FROM VW_EMPRESAS WHERE ID_EMPRESA = :p", [OracleHelper.PInt("p", id)]);
        return dt.Rows.Count == 0 ? NotFound() : Ok(OracleHelper.ToList(dt)[0]);
    }

    [HttpPost] public IActionResult Create([FromBody] EmpresaDto d)
    {
        var id = _db.ExecuteInsert("SP_EMP_INS",
            [OracleHelper.P("p_nm",d.NombreEmpresa), OracleHelper.P("p_nit",d.NitEmpresa),
             OracleHelper.P("p_rs",d.RazonSocialEmpresa), OracleHelper.P("p_dir",d.DireccionEmpresa),
             OracleHelper.P("p_logo",d.LogoEmpresa), OracleHelper.P("p_est",d.EstadoEmpresa),
             OracleHelper.POut("p_id_out")], isStoredProc: true);
        return Created($"api/empresas/{id}", new { idEmpresa = id });
    }

    [HttpPut("{id:long}")] public IActionResult Update(long id, [FromBody] EmpresaDto d)
    {
        _db.ExecuteNonQuery("SP_EMP_UPD",
            [OracleHelper.P("p_nm",d.NombreEmpresa), OracleHelper.P("p_dir",d.DireccionEmpresa),
             OracleHelper.P("p_est",d.EstadoEmpresa), OracleHelper.PInt("p_id",id)],
            isStoredProc: true);
        return Ok(new { message = "OK" });
    }

    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        _db.ExecuteNonQuery("SP_EMP_DEL", [OracleHelper.PInt("p_id", id)], isStoredProc: true);
        return Ok();
    }
}
public record EmpresaDto(string? NombreEmpresa, string? NitEmpresa, string? RazonSocialEmpresa, string? DireccionEmpresa, string? LogoEmpresa, string? EstadoEmpresa);


[Route("api/sucursales")]
public class SucursalesController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll() =>
        OkList(_db.ExecuteReader("SELECT * FROM VW_SUCURSALES ORDER BY NOMBRE_SUCURSAL"));

    [HttpGet("{id:long}")] public IActionResult GetById(long id)
    {
        var dt = _db.ExecuteReader("SELECT * FROM VW_SUCURSALES WHERE ID_SUCURSAL = :p", [OracleHelper.PInt("p", id)]);
        return dt.Rows.Count == 0 ? NotFound() : Ok(OracleHelper.ToList(dt)[0]);
    }

    [HttpPost] public IActionResult Create([FromBody] SucursalDto d)
    {
        var id = _db.ExecuteInsert("SP_SUC_INS",
            [OracleHelper.P("p_c",d.CodigoSucursal), OracleHelper.P("p_n",d.NombreSucursal),
             OracleHelper.P("p_dir",d.DireccionSucursal), OracleHelper.P("p_e",d.EmailSucursal),
             OracleHelper.P("p_est",d.EstadoSucursal), OracleHelper.PInt("p_emp",d.IdEmpresa),
             OracleHelper.PInt("p_mun",d.IdMunicipio), OracleHelper.POut("p_id_out")],
            isStoredProc: true);
        return Created($"api/sucursales/{id}", new { idSucursal = id });
    }

    [HttpPut("{id:long}")] public IActionResult Update(long id, [FromBody] SucursalDto d)
    {
        _db.ExecuteNonQuery("SP_SUC_UPD",
            [OracleHelper.P("p_n",d.NombreSucursal), OracleHelper.P("p_est",d.EstadoSucursal),
             OracleHelper.PInt("p_id",id)], isStoredProc: true);
        return Ok();
    }

    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        _db.ExecuteNonQuery("SP_SUC_DEL", [OracleHelper.PInt("p_id", id)], isStoredProc: true);
        return Ok();
    }
}
public record SucursalDto(string? CodigoSucursal, string? NombreSucursal, string? DireccionSucursal, string? EmailSucursal, string? EstadoSucursal, long? IdEmpresa, long? IdMunicipio);


[Route("api/roles")]
public class RolesController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll() => OkList(_db.ExecuteReader("SELECT * FROM VW_ROLES ORDER BY RANGO_ROL"));

    [HttpPost] public IActionResult Create([FromBody] RolDto d)
    {
        var id = _db.ExecuteInsert("SP_ROL_INS",
            [OracleHelper.P("p_n",d.NombreRol), OracleHelper.P("p_d",d.DescripcionRol),
             OracleHelper.PInt("p_r",d.RangoRol), OracleHelper.POut("p_id_out")],
            isStoredProc: true);
        return Created($"api/roles/{id}", new { idRol = id });
    }

    [HttpPut("{id:long}")] public IActionResult Update(long id, [FromBody] RolDto d)
    {
        _db.ExecuteNonQuery("SP_ROL_UPD",
            [OracleHelper.P("p_n",d.NombreRol), OracleHelper.P("p_d",d.DescripcionRol),
             OracleHelper.PInt("p_r",d.RangoRol), OracleHelper.PInt("p_id",id)],
            isStoredProc: true);
        return Ok();
    }

    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        try
        {
            _db.ExecuteNonQuery("SP_ROL_DEL", [OracleHelper.PInt("p_id", id)], isStoredProc: true);
            return Ok();
        }
        catch (OracleException ex) { return HandleOracleError(ex); }
    }
}
public record RolDto(string? NombreRol, string? DescripcionRol, long? RangoRol);


[Route("api/usuarios")]
public class UsuariosController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll() =>
        OkList(_db.ExecuteReader("SELECT * FROM VW_USUARIOS ORDER BY USERNAME_USUARIO"));

    [HttpPost] public IActionResult Create([FromBody] UsuarioDto d)
    {
        try
        {
            var id = _db.ExecuteInsert("SP_USR_INS",
                [OracleHelper.P("p_u",d.UsernameUsuario),
                 OracleHelper.P("p_p", BCrypt.Net.BCrypt.HashPassword(d.PasswordUsuario ?? "temp", 12)),
                 OracleHelper.P("p_e",d.EmailUsuario), OracleHelper.P("p_est",d.EstadoUsuario),
                 OracleHelper.PInt("p_r",d.IdRol), OracleHelper.PInt("p_s",d.IdSucursal),
                 OracleHelper.POut("p_id_out")], isStoredProc: true);
            return Created($"api/usuarios/{id}", new { idUsuario = id });
        }
        catch (OracleException ex) { return HandleOracleError(ex); }
    }

    [HttpPut("{id:long}")] public IActionResult Update(long id, [FromBody] UsuarioDto d)
    {
        try
        {
            var hashedPwd = string.IsNullOrEmpty(d.PasswordUsuario) ? null
                : BCrypt.Net.BCrypt.HashPassword(d.PasswordUsuario, 12);
            _db.ExecuteNonQuery("SP_USR_UPD",
                [OracleHelper.P("p_e",d.EmailUsuario), OracleHelper.P("p_est",d.EstadoUsuario),
                 OracleHelper.PInt("p_r",d.IdRol), OracleHelper.P("p_p",hashedPwd),
                 OracleHelper.PInt("p_id",id)], isStoredProc: true);
            return Ok();
        }
        catch (OracleException ex) { return HandleOracleError(ex); }
    }

    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        try
        {
            _db.ExecuteNonQuery("SP_USR_DEL", [OracleHelper.PInt("p_id", id)], isStoredProc: true);
            return Ok();
        }
        catch (OracleException ex) { return HandleOracleError(ex); }
    }
}
public record UsuarioDto(string? UsernameUsuario, string? PasswordUsuario, string? EmailUsuario, string? EstadoUsuario, long? IdRol, long? IdSucursal);


[Route("api/permisos")]
public class PermisosController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll() =>
        OkList(_db.ExecuteReader("SELECT * FROM VW_PERMISOS ORDER BY MODULO_PERMISO"));

    [HttpGet("matriz")] public IActionResult GetMatriz() =>
        OkList(_db.ExecuteReader("SELECT * FROM VW_PERMISOS_MATRIZ ORDER BY RANGO_ROL, MODULO_PERMISO"));

    [HttpPost] public IActionResult Create([FromBody] PermisoDto d)
    {
        var id = _db.ExecuteInsert("SP_PERM_INS",
            [OracleHelper.P("p_n",d.NombrePermiso), OracleHelper.P("p_d",d.DescripcionPermiso),
             OracleHelper.P("p_m",d.ModuloPermiso), OracleHelper.P("p_est",d.Estado),
             OracleHelper.PInt("p_r",d.IdRol), OracleHelper.POut("p_id_out")],
            isStoredProc: true);
        return Created($"api/permisos/{id}", new { idPermiso = id });
    }

    [HttpPut("{id:long}")] public IActionResult Update(long id, [FromBody] PermisoDto d)
    {
        _db.ExecuteNonQuery("SP_PERM_UPD",
            [OracleHelper.P("p_est",d.Estado), OracleHelper.P("p_m",d.ModuloPermiso),
             OracleHelper.PInt("p_id",id)], isStoredProc: true);
        return Ok();
    }

    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        _db.ExecuteNonQuery("SP_PERM_DEL", [OracleHelper.PInt("p_id", id)], isStoredProc: true);
        return NoContent();
    }
}
public record PermisoDto(string? NombrePermiso, string? DescripcionPermiso, string? ModuloPermiso, string? Estado, long? IdRol);


[Route("api/monedas")]
public class MonedasController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll() => OkList(_db.ExecuteReader("SELECT * FROM VW_MONEDAS ORDER BY CODIGO_MONEDA"));

    [HttpPost] public IActionResult Create([FromBody] MonedaDto d)
    {
        var id = _db.ExecuteInsert("SP_MON_INS",
            [OracleHelper.P("p_c",d.CodigoMoneda), OracleHelper.P("p_n",d.NombreMoneda),
             OracleHelper.P("p_s",d.SimboloMoneda), OracleHelper.PInt("p_d",d.DecimalesMoneda),
             OracleHelper.POut("p_id_out")], isStoredProc: true);
        return Created($"api/monedas/{id}", new { idMoneda = id });
    }

    [HttpPut("{id:long}")] public IActionResult Update(long id, [FromBody] MonedaDto d)
    {
        _db.ExecuteNonQuery("SP_MON_UPD",
            [OracleHelper.P("p_n",d.NombreMoneda), OracleHelper.PInt("p_id",id)],
            isStoredProc: true);
        return Ok();
    }

    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        try
        {
            _db.ExecuteNonQuery("SP_MON_DEL", [OracleHelper.PInt("p_id", id)], isStoredProc: true);
            return Ok();
        }
        catch (OracleException ex) { return HandleOracleError(ex); }
    }
}
public record MonedaDto(string? CodigoMoneda, string? NombreMoneda, string? SimboloMoneda, int? DecimalesMoneda);


[Route("api/departamentos")]
public class DepartamentosController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll() => OkList(_db.ExecuteReader("SELECT * FROM VW_DEPARTAMENTOS ORDER BY NOMBRE_DEPARTAMENTO"));

    [HttpPost] public IActionResult Create([FromBody] DeptDto d)
    {
        var id = _db.ExecuteInsert("SP_DEPT_INS",
            [OracleHelper.P("p_n",d.NombreDepartamento), OracleHelper.P("p_f",d.FrecuenciaDepartamento),
             OracleHelper.P("p_z",d.ZonaTerritorialDepartamento), OracleHelper.POut("p_id_out")],
            isStoredProc: true);
        return Created($"api/departamentos/{id}", new { id });
    }

    [HttpPut("{id:long}")] public IActionResult Update(long id, [FromBody] DeptDto d)
    {
        _db.ExecuteNonQuery("SP_DEPT_UPD",
            [OracleHelper.P("p_n",d.NombreDepartamento), OracleHelper.PInt("p_id",id)],
            isStoredProc: true);
        return Ok();
    }

    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        try
        {
            _db.ExecuteNonQuery("SP_DEPT_DEL", [OracleHelper.PInt("p_id", id)], isStoredProc: true);
            return Ok();
        }
        catch (OracleException ex) { return HandleOracleError(ex); }
    }
}
public record DeptDto(string? NombreDepartamento, string? FrecuenciaDepartamento, string? ZonaTerritorialDepartamento);


[Route("api/municipios")]
public class MunicipiosController(OracleHelper db) : BaseController(db)
{
    [HttpGet]
    public IActionResult GetAll([FromQuery] int? idDepartamento = null)
    {
        var sql = "SELECT * FROM VW_MUNICIPIOS"
                + (idDepartamento.HasValue ? " WHERE ID_DEPARTAMENTO = :p" : "")
                + " ORDER BY NOMBRE_MUNICIPIO";
        return OkList(_db.ExecuteReader(sql,
            idDepartamento.HasValue ? [OracleHelper.PInt("p", idDepartamento)] : null));
    }

    [HttpPost] public IActionResult Create([FromBody] MunicipioDto d)
    {
        var id = _db.ExecuteInsert("SP_MUN_INS",
            [OracleHelper.P("p_n",d.NombreMunicipio), OracleHelper.P("p_cp",d.CodigoPostalMunicipio),
             OracleHelper.PInt("p_dep",d.IdDepartamento), OracleHelper.POut("p_id_out")],
            isStoredProc: true);
        return Created($"api/municipios/{id}", new { id });
    }

    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        try
        {
            _db.ExecuteNonQuery("SP_MUN_DEL", [OracleHelper.PInt("p_id", id)], isStoredProc: true);
            return Ok();
        }
        catch (OracleException ex) { return HandleOracleError(ex); }
    }
}
public record MunicipioDto(string? NombreMunicipio, string? CodigoPostalMunicipio, long? IdDepartamento);

// ── RRHH ──────────────────────────────────────────────────────

[Route("api/empleados")]
public class EmpleadosController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll([FromQuery] string? search = null, [FromQuery] string? estado = null)
    {
        var sql = @"SELECT * FROM VW_EMPLEADOS
                    WHERE (:p_est IS NULL OR ESTADO_EMPLEADO = :p_est)
                      AND (:p_s IS NULL OR UPPER(NOMBRES_EMPLEADO) LIKE UPPER(:p_s)
                           OR UPPER(APELLIDOS_EMPLEADO) LIKE UPPER(:p_s)
                           OR NUMERO_EMPLEADO LIKE :p_s)
                    ORDER BY APELLIDOS_EMPLEADO";
        var q = search is null ? null : $"%{search}%";
        return OkList(_db.ExecuteReader(sql, [OracleHelper.P("p_est", estado), OracleHelper.P("p_s", q)]));
    }

    [HttpGet("{id:long}")] public IActionResult GetById(long id)
    {
        var dt = _db.ExecuteReader("SELECT * FROM VW_EMPLEADOS WHERE ID_EMPLEADO = :p", [OracleHelper.PInt("p", id)]);
        return dt.Rows.Count == 0 ? NotFound() : Ok(OracleHelper.ToList(dt)[0]);
    }

    [HttpPost] public IActionResult Create([FromBody] EmpleadoDto d)
    {
        var id = _db.ExecuteInsert("SP_EMPL_INS",
            [OracleHelper.P("p_num",d.NumeroEmpleado), OracleHelper.P("p_dpi",d.DpiEmpleado),
             OracleHelper.P("p_nom",d.NombresEmpleado), OracleHelper.P("p_ape",d.ApellidosEmpleado),
             OracleHelper.P("p_fn",d.FechaNacimientoEmpleado), OracleHelper.P("p_gen",d.GeneroEmpleado),
             OracleHelper.P("p_email",d.EmailCorporativoEmpleado), OracleHelper.P("p_fi",d.FechaIngresoEmpleado),
             OracleHelper.P("p_est",d.EstadoEmpleado), OracleHelper.PInt("p_cargo",d.IdCargo),
             OracleHelper.POut("p_id_out")], isStoredProc: true);
        return Created($"api/empleados/{id}", new { idEmpleado = id });
    }

    [HttpPut("{id:long}")] public IActionResult Update(long id, [FromBody] EmpleadoDto d)
    {
        _db.ExecuteNonQuery("SP_EMPL_UPD",
            [OracleHelper.P("p_nom",d.NombresEmpleado), OracleHelper.P("p_ape",d.ApellidosEmpleado),
             OracleHelper.P("p_est",d.EstadoEmpleado), OracleHelper.PInt("p_cargo",d.IdCargo),
             OracleHelper.PInt("p_id",id)], isStoredProc: true);
        return Ok();
    }

    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        _db.ExecuteNonQuery("SP_EMPL_DEL", [OracleHelper.PInt("p_id", id)], isStoredProc: true);
        return Ok();
    }
}
public record EmpleadoDto(string? NumeroEmpleado, string? DpiEmpleado, string? NombresEmpleado, string? ApellidosEmpleado, string? FechaNacimientoEmpleado, string? GeneroEmpleado, string? EmailCorporativoEmpleado, string? FechaIngresoEmpleado, string? EstadoEmpleado, long? IdCargo);


[Route("api/departamentos-rrhh")]
public class DepartamentosRRHHController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll() =>
        OkList(_db.ExecuteReader("SELECT * FROM VW_DEPARTAMENTOS_RRHH ORDER BY NOMBRE_DEPARTAMENTO_RRHH"));

    [HttpPost] public IActionResult Create([FromBody] DeptRRHHDto d)
    {
        var id = _db.ExecuteInsert("SP_DEPRRHH_INS",
            [OracleHelper.P("p_n",d.NombreDepartamentoRRHH), OracleHelper.P("p_c",d.CodigoDepartamentoRRHH),
             OracleHelper.PInt("p_s",d.IdSucursal), OracleHelper.PInt("p_padre",d.IdDepartamentoRRHHPadre),
             OracleHelper.POut("p_id_out")], isStoredProc: true);
        return Created($"api/departamentos-rrhh/{id}", new { id });
    }

    [HttpPut("{id:long}")] public IActionResult Update(long id, [FromBody] DeptRRHHDto d)
    {
        _db.ExecuteNonQuery("SP_DEPRRHH_UPD",
            [OracleHelper.P("p_n",d.NombreDepartamentoRRHH), OracleHelper.PInt("p_id",id)],
            isStoredProc: true);
        return Ok();
    }

    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        try
        {
            _db.ExecuteNonQuery("SP_DEPRRHH_DEL", [OracleHelper.PInt("p_id", id)], isStoredProc: true);
            return Ok();
        }
        catch (OracleException ex) { return HandleOracleError(ex); }
    }
}
public record DeptRRHHDto(string? NombreDepartamentoRRHH, string? CodigoDepartamentoRRHH, long? IdSucursal, long? IdDepartamentoRRHHPadre);


[Route("api/cargos-rrhh")]
public class CargosRRHHController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll() =>
        OkList(_db.ExecuteReader("SELECT * FROM VW_CARGOS_RRHH ORDER BY NOMBRE_CARGO_RRHH"));

    [HttpPost] public IActionResult Create([FromBody] CargoDto d)
    {
        var id = _db.ExecuteInsert("SP_CARRRHH_INS",
            [OracleHelper.P("p_n",d.NombreCargoRRHH), OracleHelper.P("p_niv",d.NivelCargoRRHH),
             OracleHelper.PDec("p_smin",d.SalarioMinCargoRRHH), OracleHelper.PDec("p_smax",d.SalarioMaxCargoRRHH),
             OracleHelper.PInt("p_dep",d.IdDepartamentoRRHH), OracleHelper.POut("p_id_out")],
            isStoredProc: true);
        return Created($"api/cargos-rrhh/{id}", new { id });
    }

    [HttpPut("{id:long}")] public IActionResult Update(long id, [FromBody] CargoDto d)
    {
        _db.ExecuteNonQuery("SP_CARRRHH_UPD",
            [OracleHelper.P("p_n",d.NombreCargoRRHH), OracleHelper.P("p_niv",d.NivelCargoRRHH),
             OracleHelper.PDec("p_smin",d.SalarioMinCargoRRHH), OracleHelper.PDec("p_smax",d.SalarioMaxCargoRRHH),
             OracleHelper.PInt("p_id",id)], isStoredProc: true);
        return Ok();
    }

    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        try
        {
            _db.ExecuteNonQuery("SP_CARRRHH_DEL", [OracleHelper.PInt("p_id", id)], isStoredProc: true);
            return Ok();
        }
        catch (OracleException ex) { return HandleOracleError(ex); }
    }
}
public record CargoDto(string? NombreCargoRRHH, string? NivelCargoRRHH, decimal? SalarioMinCargoRRHH, decimal? SalarioMaxCargoRRHH, long? IdDepartamentoRRHH);


[Route("api/jornadas")]
public class JornadasController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll() => OkList(_db.ExecuteReader("SELECT * FROM VW_JORNADAS ORDER BY NOMBRE_JORNADA"));

    [HttpPost] public IActionResult Create([FromBody] JornadaDto d)
    {
        var id = _db.ExecuteInsert("SP_JOR_INS",
            [OracleHelper.P("p_n",d.NombreJornada), OracleHelper.P("p_c",d.CodigoJornada),
             OracleHelper.P("p_hi",d.HoraInJornada), OracleHelper.P("p_hf",d.HoraFinJornada),
             OracleHelper.P("p_hd",d.HoraDescansoJornada), OracleHelper.P("p_obs",d.ObservacionesJornada),
             OracleHelper.POut("p_id_out")], isStoredProc: true);
        return Created($"api/jornadas/{id}", new { id });
    }

    [HttpPut("{id:long}")] public IActionResult Update(long id, [FromBody] JornadaDto d)
    {
        _db.ExecuteNonQuery("SP_JOR_UPD",
            [OracleHelper.P("p_n",d.NombreJornada), OracleHelper.P("p_hi",d.HoraInJornada),
             OracleHelper.P("p_hf",d.HoraFinJornada), OracleHelper.PInt("p_id",id)],
            isStoredProc: true);
        return Ok();
    }

    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        try
        {
            _db.ExecuteNonQuery("SP_JOR_DEL", [OracleHelper.PInt("p_id", id)], isStoredProc: true);
            return Ok();
        }
        catch (OracleException ex) { return HandleOracleError(ex); }
    }
}
public record JornadaDto(string? NombreJornada, string? CodigoJornada, string? HoraInJornada, string? HoraFinJornada, string? HoraDescansoJornada, string? ObservacionesJornada);


[Route("api/nomina")]
public class NominaController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll() =>
        OkList(_db.ExecuteReader("SELECT * FROM VW_NOMINA ORDER BY PERIODO_NOMINA DESC"));

    [HttpPost] public IActionResult Create([FromBody] NominaDto d)
    {
        var id = _db.ExecuteInsert("SP_NOM_INS",
            [OracleHelper.P("p_per",d.PeriodoNomina), OracleHelper.P("p_fp",d.FechaPagoNomina),
             OracleHelper.PDec("p_tb",d.TotalBrutoNomina), OracleHelper.PDec("p_td",d.TotalDescuentosNomina),
             OracleHelper.PDec("p_tn",d.TotalNetoNomina), OracleHelper.PInt("p_suc",d.IdSucursal),
             OracleHelper.PInt("p_ucrea",CurrentUserId), OracleHelper.POut("p_id_out")],
            isStoredProc: true);
        return Created($"api/nomina/{id}", new { id });
    }

    [HttpPut("{id:long}")] public IActionResult Update(long id, [FromBody] NominaDto d)
    {
        _db.ExecuteNonQuery("SP_NOM_UPD",
            [OracleHelper.PDec("p_tb",d.TotalBrutoNomina), OracleHelper.PDec("p_td",d.TotalDescuentosNomina),
             OracleHelper.PDec("p_tn",d.TotalNetoNomina), OracleHelper.P("p_est",d.EstadoNomina),
             OracleHelper.PInt("p_id",id)], isStoredProc: true);
        return Ok();
    }

    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        _db.ExecuteNonQuery("SP_NOM_DEL", [OracleHelper.PInt("p_id", id)], isStoredProc: true);
        return Ok();
    }
}
public record NominaDto(string? PeriodoNomina, string? FechaPagoNomina, decimal? TotalBrutoNomina, decimal? TotalDescuentosNomina, decimal? TotalNetoNomina, string? EstadoNomina, long? IdSucursal);


// ── Inventario ─────────────────────────────────────────────────

[Route("api/categorias-articulo")]
public class CategoriasArticuloController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll() =>
        OkList(_db.ExecuteReader("SELECT * FROM VW_CATEGORIAS_ARTICULO ORDER BY NIVEL_CATEGORIA_ARTICULO, NOMBRE_CATEGORIA_ARTICULO"));

    [HttpPost] public IActionResult Create([FromBody] CategoriaDto d)
    {
        var id = _db.ExecuteInsert("SP_CATART_INS",
            [OracleHelper.P("p_n",d.NombreCategoriaArticulo), OracleHelper.P("p_c",d.CodigoCategoriaArticulo),
             OracleHelper.PInt("p_niv",d.NivelCategoriaArticulo), OracleHelper.PInt("p_padre",d.IdCategoriaArticuloPadre),
             OracleHelper.POut("p_id_out")], isStoredProc: true);
        return Created($"api/categorias-articulo/{id}", new { id });
    }

    [HttpPut("{id:long}")] public IActionResult Update(long id, [FromBody] CategoriaDto d)
    {
        _db.ExecuteNonQuery("SP_CATART_UPD",
            [OracleHelper.P("p_n",d.NombreCategoriaArticulo), OracleHelper.PInt("p_id",id)],
            isStoredProc: true);
        return Ok();
    }

    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        try
        {
            _db.ExecuteNonQuery("SP_CATART_DEL", [OracleHelper.PInt("p_id", id)], isStoredProc: true);
            return Ok();
        }
        catch (OracleException ex) { return HandleOracleError(ex); }
    }
}
public record CategoriaDto(string? NombreCategoriaArticulo, string? CodigoCategoriaArticulo, int? NivelCategoriaArticulo, long? IdCategoriaArticuloPadre);


[Route("api/bodegas")]
public class BodegasController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll() =>
        OkList(_db.ExecuteReader("SELECT * FROM VW_BODEGAS ORDER BY NOMBRE_BODEGA"));

    [HttpPost] public IActionResult Create([FromBody] BodegaDto d)
    {
        var id = _db.ExecuteInsert("SP_BOD_INS",
            [OracleHelper.P("p_c",d.CodigoBodega), OracleHelper.P("p_n",d.NombreBodega),
             OracleHelper.P("p_t",d.TipoBodega), OracleHelper.P("p_d",d.DireccionBodega),
             OracleHelper.P("p_est",d.EstadoBodega), OracleHelper.PInt("p_suc",d.IdSucursal),
             OracleHelper.POut("p_id_out")], isStoredProc: true);
        return Created($"api/bodegas/{id}", new { id });
    }

    [HttpPut("{id:long}")] public IActionResult Update(long id, [FromBody] BodegaDto d)
    {
        _db.ExecuteNonQuery("SP_BOD_UPD",
            [OracleHelper.P("p_n",d.NombreBodega), OracleHelper.P("p_est",d.EstadoBodega),
             OracleHelper.PInt("p_id",id)], isStoredProc: true);
        return Ok();
    }

    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        _db.ExecuteNonQuery("SP_BOD_DEL", [OracleHelper.PInt("p_id", id)], isStoredProc: true);
        return Ok();
    }
}
public record BodegaDto(string? CodigoBodega, string? NombreBodega, string? TipoBodega, string? DireccionBodega, string? EstadoBodega, long? IdSucursal);


[Route("api/stock-articulo")]
public class StockController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll([FromQuery] long? idArticulo = null)
    {
        var sql = "SELECT * FROM VW_STOCK_ARTICULO"
                + (idArticulo.HasValue ? " WHERE ID_ARTICULO = :p" : "");
        return OkList(_db.ExecuteReader(sql, idArticulo.HasValue ? [OracleHelper.PInt("p", idArticulo)] : null));
    }

    [HttpPost] public IActionResult Create([FromBody] StockDto d)
    {
        var id = _db.ExecuteInsert("SP_STOCK_INS",
            [OracleHelper.PDec("p_cd",d.CantidadDisponible), OracleHelper.PDec("p_cr",d.CantidadReservada),
             OracleHelper.PDec("p_ct",d.CantidadTransito), OracleHelper.PDec("p_cp",d.CostoPromedio),
             OracleHelper.PInt("p_art",d.IdArticulo), OracleHelper.PInt("p_ubod",d.IdUbicacionBodega),
             OracleHelper.POut("p_id_out")], isStoredProc: true);
        return Created($"api/stock-articulo/{id}", new { id });
    }

    [HttpPut("{id:long}")] public IActionResult Update(long id, [FromBody] StockDto d)
    {
        _db.ExecuteNonQuery("SP_STOCK_UPD",
            [OracleHelper.PDec("p_cd",d.CantidadDisponible), OracleHelper.PDec("p_cp",d.CostoPromedio),
             OracleHelper.PInt("p_id",id)], isStoredProc: true);
        return Ok();
    }
}
public record StockDto(decimal? CantidadDisponible, decimal? CantidadReservada, decimal? CantidadTransito, decimal? CostoPromedio, long? IdArticulo, long? IdUbicacionBodega);


// ── Compras ────────────────────────────────────────────────────

[Route("api/proveedores")]
public class ProveedoresController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll([FromQuery] string? search = null)
    {
        var sql = "SELECT * FROM VW_PROVEEDORES"
                + (search is null ? "" : " WHERE UPPER(RAZON_SOCIAL_PROVEEDOR) LIKE UPPER(:s) OR NIT_PROVEEDOR LIKE :s")
                + " ORDER BY RAZON_SOCIAL_PROVEEDOR";
        var q = search is null ? null : $"%{search}%";
        return OkList(_db.ExecuteReader(sql, search is null ? null : [OracleHelper.P("s", q)]));
    }

    [HttpPost] public IActionResult Create([FromBody] ProveedorDto d)
    {
        var id = _db.ExecuteInsert("SP_PROV_INS",
            [OracleHelper.P("p_c",d.CodigoProveedor), OracleHelper.P("p_rs",d.RazonSocialProveedor),
             OracleHelper.P("p_nit",d.NitProveedor), OracleHelper.P("p_dir",d.DireccionProveedor),
             OracleHelper.P("p_tel",d.TelefonoProveedor), OracleHelper.P("p_email",d.EmailProveedor),
             OracleHelper.PInt("p_pp",d.PlazoPagoProveedor), OracleHelper.P("p_clas",d.ClasificacionProveedor),
             OracleHelper.P("p_est",d.EstadoProveedor), OracleHelper.PInt("p_mon",d.IdMoneda),
             OracleHelper.POut("p_id_out")], isStoredProc: true);
        return Created($"api/proveedores/{id}", new { id });
    }

    [HttpPut("{id:long}")] public IActionResult Update(long id, [FromBody] ProveedorDto d)
    {
        _db.ExecuteNonQuery("SP_PROV_UPD",
            [OracleHelper.P("p_rs",d.RazonSocialProveedor), OracleHelper.PInt("p_pp",d.PlazoPagoProveedor),
             OracleHelper.P("p_est",d.EstadoProveedor), OracleHelper.PInt("p_id",id)],
            isStoredProc: true);
        return Ok();
    }

    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        _db.ExecuteNonQuery("SP_PROV_DEL", [OracleHelper.PInt("p_id", id)], isStoredProc: true);
        return Ok();
    }
}
public record ProveedorDto(string? CodigoProveedor, string? RazonSocialProveedor, string? NitProveedor, string? DireccionProveedor, string? TelefonoProveedor, string? EmailProveedor, int? PlazoPagoProveedor, string? ClasificacionProveedor, string? EstadoProveedor, long? IdMoneda);


[Route("api/ordenes-compra")]
public class OrdenesCompraController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll() =>
        OkList(_db.ExecuteReader("SELECT * FROM VW_ORDENES_COMPRA ORDER BY FECHA_SOLICITUD_ORDEN_COMPRA DESC"));

    [HttpPost] public IActionResult Create([FromBody] OrdenCompraDto d)
    {
        var id = _db.ExecuteInsert("SP_OC_INS",
            [OracleHelper.P("p_num",d.NumeroOrdenCompra), OracleHelper.PDec("p_sub",d.SubtotalOrdenCompra),
             OracleHelper.PDec("p_imp",d.ImpuestoOrdenCompra), OracleHelper.PDec("p_tot",d.TotalOrdenCompra),
             OracleHelper.PInt("p_prov",d.IdProveedor), OracleHelper.PInt("p_mon",d.IdMoneda),
             OracleHelper.PInt("p_sol",d.IdSolicitudCompra), OracleHelper.PInt("p_ucrea",CurrentUserId),
             OracleHelper.POut("p_id_out")], isStoredProc: true);
        return Created($"api/ordenes-compra/{id}", new { id });
    }

    [HttpPut("{id:long}")] public IActionResult Update(long id, [FromBody] OrdenCompraDto d)
    {
        _db.ExecuteNonQuery("SP_OC_UPD",
            [OracleHelper.PDec("p_sub",d.SubtotalOrdenCompra), OracleHelper.PDec("p_imp",d.ImpuestoOrdenCompra),
             OracleHelper.PDec("p_tot",d.TotalOrdenCompra), OracleHelper.P("p_est",d.EstadoOrdenCompra),
             OracleHelper.PInt("p_umod",CurrentUserId), OracleHelper.PInt("p_id",id)],
            isStoredProc: true);
        return Ok();
    }

    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        _db.ExecuteNonQuery("SP_OC_DEL", [OracleHelper.PInt("p_id", id)], isStoredProc: true);
        return Ok();
    }
}
public record OrdenCompraDto(string? NumeroOrdenCompra, decimal? SubtotalOrdenCompra, decimal? ImpuestoOrdenCompra, decimal? TotalOrdenCompra, string? EstadoOrdenCompra, long? IdProveedor, long? IdMoneda, long? IdSolicitudCompra);


// ── Ventas ─────────────────────────────────────────────────────

[Route("api/clientes")]
public class ClientesController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll([FromQuery] string? search = null)
    {
        var sql = "SELECT * FROM VW_CLIENTES"
                + (search is null ? "" :
                   " WHERE UPPER(NVL(NOMBRES_CLIENTE, RAZON_SOCIAL_CLIENTE)) LIKE UPPER(:s)"
                   + " OR UPPER(NIT_CLIENTE) LIKE UPPER(:s)"
                   + " OR UPPER(NVL(NUMERO_DOCUMENTO_CLIENTE,'')) LIKE UPPER(:s)"
                   + " OR UPPER(NVL(EMAIL_CLIENTE,'')) LIKE UPPER(:s)")
                + " ORDER BY NVL(NOMBRES_CLIENTE, RAZON_SOCIAL_CLIENTE)";
        var q = search is null ? null : $"%{search}%";
        return OkList(_db.ExecuteReader(sql, search is null ? null : [OracleHelper.P("s", q)]));
    }

    [HttpPost] public IActionResult Create([FromBody] ClienteDto d)
    {
        var id = _db.ExecuteInsert("SP_CLI_INS",
            [OracleHelper.P("p_c",     d.CodigoCliente),
             OracleHelper.P("p_rs",    d.RazonSocialCliente),
             OracleHelper.P("p_nit",   d.NitCliente),
             OracleHelper.PDec("p_lim",d.LimiteCreditoCliente),
             OracleHelper.P("p_tel",   d.TelefonoCliente),
             OracleHelper.P("p_email", d.EmailCliente),
             OracleHelper.PInt("p_pp", d.PlazoPagoClientes),
             OracleHelper.P("p_est",   d.EstadoCliente),
             OracleHelper.PInt("p_lp", d.IdListaPrecios),
             OracleHelper.PInt("p_suc",d.IdSucursal),
             OracleHelper.P("p_tdoc",  d.TipoDocumentoCliente),
             OracleHelper.P("p_ndoc",  d.NumeroDocumentoCliente),
             OracleHelper.P("p_nom",   d.NombresCliente),
             OracleHelper.P("p_telres",d.TelResidenciaCliente),
             OracleHelper.P("p_telcel",d.TelCelularCliente),
             OracleHelper.P("p_dir",   d.DireccionCliente),
             OracleHelper.P("p_ciu",   d.CiudadCliente),
             OracleHelper.P("p_dep",   d.DepartamentoCliente),
             OracleHelper.P("p_pais",  d.PaisCliente),
             OracleHelper.P("p_prof",  d.ProfesionCliente),
             OracleHelper.P("p_tpers", d.TipoPersonaCliente),
             OracleHelper.POut("p_id_out")], isStoredProc: true);
        return Created($"api/clientes/{id}", new { id });
    }

    [HttpPut("{id:long}")] public IActionResult Update(long id, [FromBody] ClienteDto d)
    {
        _db.ExecuteNonQuery("SP_CLI_UPD",
            [OracleHelper.P("p_rs",    d.RazonSocialCliente),
             OracleHelper.PDec("p_lim",d.LimiteCreditoCliente),
             OracleHelper.P("p_est",   d.EstadoCliente),
             OracleHelper.P("p_tel",   d.TelefonoCliente),
             OracleHelper.P("p_email", d.EmailCliente),
             OracleHelper.P("p_tdoc",  d.TipoDocumentoCliente),
             OracleHelper.P("p_ndoc",  d.NumeroDocumentoCliente),
             OracleHelper.P("p_nom",   d.NombresCliente),
             OracleHelper.P("p_telres",d.TelResidenciaCliente),
             OracleHelper.P("p_telcel",d.TelCelularCliente),
             OracleHelper.P("p_dir",   d.DireccionCliente),
             OracleHelper.P("p_ciu",   d.CiudadCliente),
             OracleHelper.P("p_dep",   d.DepartamentoCliente),
             OracleHelper.P("p_pais",  d.PaisCliente),
             OracleHelper.P("p_prof",  d.ProfesionCliente),
             OracleHelper.P("p_tpers", d.TipoPersonaCliente),
             OracleHelper.PInt("p_id", id)],
            isStoredProc: true);
        return Ok();
    }

    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        // Validación: no eliminar si tiene compras (PDF seccion 1)
        var count = Convert.ToInt32(_db.ExecuteScalar(
            "SELECT COUNT(*) FROM VW_ORDENES_VENTA WHERE ID_CLIENTE = :p",
            [OracleHelper.PInt("p", id)]));
        if (count > 0)
            return Conflict(new { message = "No se puede eliminar: el cliente tiene compras registradas." });

        _db.ExecuteNonQuery("SP_CLI_DEL", [OracleHelper.PInt("p_id", id)], isStoredProc: true);
        return Ok();
    }
}
public record ClienteDto(
    string? CodigoCliente, string? RazonSocialCliente, string? NitCliente,
    decimal? LimiteCreditoCliente, string? TelefonoCliente, string? EmailCliente,
    int? PlazoPagoClientes, string? EstadoCliente,
    long? IdListaPrecios, long? IdSucursal,
    // Campos requeridos por PDF seccion 1
    string? TipoDocumentoCliente, string? NumeroDocumentoCliente,
    string? NombresCliente, string? TelResidenciaCliente,
    string? TelCelularCliente, string? DireccionCliente,
    string? CiudadCliente, string? DepartamentoCliente,
    string? PaisCliente, string? ProfesionCliente,
    string? TipoPersonaCliente);


[Route("api/lista-precios")]
public class ListaPreciosController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll() =>
        OkList(_db.ExecuteReader("SELECT * FROM VW_LISTA_PRECIOS ORDER BY NOMBRE_LISTA_PRECIOS"));

    [HttpGet("{id:long}/detalle")] public IActionResult GetDetalle(long id) =>
        OkList(_db.ExecuteReader(
            "SELECT * FROM VW_LISTA_PRECIOS_DET WHERE ID_LISTA_PRECIOS = :p ORDER BY NOMBRE_ARTICULO",
            [OracleHelper.PInt("p", id)]));

    [HttpPost] public IActionResult Create([FromBody] ListaPreciosDto d)
    {
        var id = _db.ExecuteInsert("SP_LP_INS",
            [OracleHelper.P("p_n",d.NombreListaPrecios), OracleHelper.P("p_fd",d.FechaDesdeListaPrecios),
             OracleHelper.P("p_fh",d.FechaHastaListaPrecios), OracleHelper.PInt("p_mon",d.IdMoneda),
             OracleHelper.POut("p_id_out")], isStoredProc: true);
        return Created($"api/lista-precios/{id}", new { id });
    }

    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        try
        {
            _db.ExecuteNonQuery("SP_LP_DEL", [OracleHelper.PInt("p_id", id)], isStoredProc: true);
            return Ok();
        }
        catch (OracleException ex) { return HandleOracleError(ex); }
    }
}
public record ListaPreciosDto(string? NombreListaPrecios, string? FechaDesdeListaPrecios, string? FechaHastaListaPrecios, long? IdMoneda);


[Route("api/facturas-venta")]
public class FacturasVentaController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll() =>
        OkList(_db.ExecuteReader("SELECT * FROM VW_FACTURAS_VENTA ORDER BY FECHA_FACTURA_VENTA DESC"));

    [HttpPost] public IActionResult Create([FromBody] FacturaDto d)
    {
        var id = _db.ExecuteInsert("SP_FV_INS",
            [OracleHelper.P("p_s",d.SerieFacturaVenta), OracleHelper.P("p_cor",d.CorrelativoFacturaVenta),
             OracleHelper.PDec("p_tot",d.TotalFacturaVenta), OracleHelper.PInt("p_sm",d.IdSalidaMercaderia),
             OracleHelper.PInt("p_ucrea",CurrentUserId), OracleHelper.POut("p_id_out")],
            isStoredProc: true);
        return Created($"api/facturas-venta/{id}", new { id });
    }

    [HttpPut("{id:long}")] public IActionResult Update(long id, [FromBody] FacturaDto d)
    {
        _db.ExecuteNonQuery("SP_FV_UPD",
            [OracleHelper.P("p_est",d.EstadoSalidaMercaderia), OracleHelper.PInt("p_id",id)],
            isStoredProc: true);
        return Ok();
    }

    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        _db.ExecuteNonQuery("SP_FV_DEL", [OracleHelper.PInt("p_id", id)], isStoredProc: true);
        return Ok();
    }
}
public record FacturaDto(string? SerieFacturaVenta, string? CorrelativoFacturaVenta, decimal? TotalFacturaVenta, string? EstadoSalidaMercaderia, long? IdSalidaMercaderia);


// ── Producción ─────────────────────────────────────────────────

[Route("api/centros-trabajo")]
public class CentrosTrabajoController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll() =>
        OkList(_db.ExecuteReader("SELECT * FROM VW_CENTROS_TRABAJO ORDER BY NOMBRE_CENTRO_TRABAJO"));

    [HttpPost] public IActionResult Create([FromBody] CentroTrabajoDto d)
    {
        var id = _db.ExecuteInsert("SP_CT_INS",
            [OracleHelper.P("p_c",d.CodigoCentroTrabajo), OracleHelper.P("p_n",d.NombreCentroTrabajo),
             OracleHelper.PDec("p_ch",d.CapacidadHora), OracleHelper.PDec("p_vh",d.VostoHoraCentroTrabajo),
             OracleHelper.P("p_est",d.EstadoCentroTrabajo), OracleHelper.PInt("p_suc",d.IdSucursal),
             OracleHelper.POut("p_id_out")], isStoredProc: true);
        return Created($"api/centros-trabajo/{id}", new { id });
    }

    [HttpPut("{id:long}")] public IActionResult Update(long id, [FromBody] CentroTrabajoDto d)
    {
        _db.ExecuteNonQuery("SP_CT_UPD",
            [OracleHelper.P("p_n",d.NombreCentroTrabajo), OracleHelper.P("p_est",d.EstadoCentroTrabajo),
             OracleHelper.PInt("p_id",id)], isStoredProc: true);
        return Ok();
    }

    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        _db.ExecuteNonQuery("SP_CT_DEL", [OracleHelper.PInt("p_id", id)], isStoredProc: true);
        return Ok();
    }
}
public record CentroTrabajoDto(string? CodigoCentroTrabajo, string? NombreCentroTrabajo, decimal? CapacidadHora, decimal? VostoHoraCentroTrabajo, string? EstadoCentroTrabajo, long? IdSucursal);


[Route("api/ordenes-produccion")]
public class OrdenesProduccionController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll() =>
        OkList(_db.ExecuteReader("SELECT * FROM VW_ORDENES_PRODUCCION ORDER BY FECHA_IN_ORDEN_PRODUCCION DESC"));

    [HttpPost] public IActionResult Create([FromBody] OrdenProduccionDto d)
    {
        var id = _db.ExecuteInsert("SP_OP_INS",
            [OracleHelper.P("p_cod",d.CodigoOrdenProduccion), OracleHelper.P("p_fi",d.FechaInOrdenProduccion),
             OracleHelper.P("p_ff",d.FechaFinOrdenProduccion), OracleHelper.PDec("p_cp",d.CantidadPlanificadaOrdenProduccion),
             OracleHelper.PInt("p_lm",d.IdListaMateriales), OracleHelper.PInt("p_ct",d.IdCentroTrabajo),
             OracleHelper.PInt("p_suc",d.IdSucursal), OracleHelper.PInt("p_ucrea",CurrentUserId),
             OracleHelper.POut("p_id_out")], isStoredProc: true);
        return Created($"api/ordenes-produccion/{id}", new { id });
    }

    [HttpPut("{id:long}")] public IActionResult Update(long id, [FromBody] OrdenProduccionDto d)
    {
        _db.ExecuteNonQuery("SP_OP_UPD",
            [OracleHelper.PDec("p_cplan",d.CantidadPlanificadaOrdenProduccion),
             OracleHelper.PDec("p_cprod",d.CantidadProducida),
             OracleHelper.P("p_est",d.EstadoOrdenProduccion),
             OracleHelper.PInt("p_umod",CurrentUserId), OracleHelper.PInt("p_id",id)],
            isStoredProc: true);
        return Ok();
    }

    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        _db.ExecuteNonQuery("SP_OP_DEL", [OracleHelper.PInt("p_id", id)], isStoredProc: true);
        return Ok();
    }
}
public record OrdenProduccionDto(string? CodigoOrdenProduccion, string? FechaInOrdenProduccion, string? FechaFinOrdenProduccion, decimal? CantidadPlanificadaOrdenProduccion, decimal? CantidadProducida, string? EstadoOrdenProduccion, long? IdListaMateriales, long? IdCentroTrabajo, long? IdSucursal);


// ── Transporte ─────────────────────────────────────────────────

[Route("api/vehiculos")]
public class VehiculosController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll() =>
        OkList(_db.ExecuteReader("SELECT * FROM VW_VEHICULOS ORDER BY PLACA_VEHICULO"));

    [HttpPost] public IActionResult Create([FromBody] VehiculoDto d)
    {
        var id = _db.ExecuteInsert("SP_VEH_INS",
            [OracleHelper.P("p_p",d.PlacaVehiculo), OracleHelper.P("p_m",d.MarcaVehiculo),
             OracleHelper.P("p_mod",d.ModeloVehiculo), OracleHelper.P("p_t",d.TipoVehiculo),
             OracleHelper.PDec("p_cap",d.CapacidadKgVehiculo), OracleHelper.PDec("p_kult",d.KmUltServVehiculo),
             OracleHelper.PDec("p_ksig",d.KmSigServVehiculo), OracleHelper.P("p_est",d.EstadoVehiculo),
             OracleHelper.PInt("p_suc",d.IdSucursal), OracleHelper.POut("p_id_out")],
            isStoredProc: true);
        return Created($"api/vehiculos/{id}", new { id });
    }

    [HttpPut("{id:long}")] public IActionResult Update(long id, [FromBody] VehiculoDto d)
    {
        _db.ExecuteNonQuery("SP_VEH_UPD",
            [OracleHelper.P("p_est",d.EstadoVehiculo), OracleHelper.PDec("p_ksig",d.KmSigServVehiculo),
             OracleHelper.PInt("p_id",id)], isStoredProc: true);
        return Ok();
    }

    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        _db.ExecuteNonQuery("SP_VEH_DEL", [OracleHelper.PInt("p_id", id)], isStoredProc: true);
        return Ok();
    }
}
public record VehiculoDto(string? PlacaVehiculo, string? MarcaVehiculo, string? ModeloVehiculo, string? TipoVehiculo, decimal? CapacidadKgVehiculo, decimal? KmUltServVehiculo, decimal? KmSigServVehiculo, string? EstadoVehiculo, long? IdSucursal);


[Route("api/transportistas")]
public class TransportistasController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll() =>
        OkList(_db.ExecuteReader("SELECT * FROM VW_TRANSPORTISTAS ORDER BY NOMBRE_TRANSPORTISTA"));

    [HttpPost] public IActionResult Create([FromBody] TransportistaDto d)
    {
        var id = _db.ExecuteInsert("SP_TRANS_INS",
            [OracleHelper.P("p_n",d.NombreTransportista), OracleHelper.P("p_a",d.ApellidosTransportista),
             OracleHelper.P("p_lic",d.LicenciaTransportista), OracleHelper.P("p_dpi",d.DpiTransportista),
             OracleHelper.P("p_tlic",d.TipoLicTransportista), OracleHelper.P("p_est",d.EstadoTransportista),
             OracleHelper.PInt("p_emp",d.IdEmpleado), OracleHelper.POut("p_id_out")],
            isStoredProc: true);
        return Created($"api/transportistas/{id}", new { id });
    }

    [HttpPut("{id:long}")] public IActionResult Update(long id, [FromBody] TransportistaDto d)
    {
        _db.ExecuteNonQuery("SP_TRANS_UPD",
            [OracleHelper.P("p_est",d.EstadoTransportista), OracleHelper.PInt("p_id",id)],
            isStoredProc: true);
        return Ok();
    }

    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        _db.ExecuteNonQuery("SP_TRANS_DEL", [OracleHelper.PInt("p_id", id)], isStoredProc: true);
        return Ok();
    }
}
public record TransportistaDto(string? NombreTransportista, string? ApellidosTransportista, string? LicenciaTransportista, string? DpiTransportista, string? TipoLicTransportista, string? EstadoTransportista, long? IdEmpleado);


[Route("api/ordenes-despacho")]
public class DespachosController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll() =>
        OkList(_db.ExecuteReader("SELECT * FROM VW_ORDENES_DESPACHO ORDER BY FECHA_CREA_ORDEN_DESPACHO DESC"));

    [HttpPost] public IActionResult Create([FromBody] DespachoDto d)
    {
        var id = _db.ExecuteInsert("SP_OD_INS",
            [OracleHelper.P("p_nom",d.NombreOrdenDespacho), OracleHelper.P("p_fent",d.FechaEntregaOrdenDespacho),
             OracleHelper.PDec("p_peso",d.PesoKgTotalOrdenDespacho), OracleHelper.PInt("p_veh",d.IdVehiculo),
             OracleHelper.PInt("p_trans",d.IdTransportista), OracleHelper.PInt("p_suc",d.IdSucursal),
             OracleHelper.POut("p_id_out")], isStoredProc: true);
        return Created($"api/ordenes-despacho/{id}", new { id });
    }

    [HttpPut("{id:long}")] public IActionResult Update(long id, [FromBody] DespachoDto d)
    {
        _db.ExecuteNonQuery("SP_OD_UPD",
            [OracleHelper.P("p_est",d.EstadoOrdenDespachado), OracleHelper.PInt("p_id",id)],
            isStoredProc: true);
        return Ok();
    }

    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        _db.ExecuteNonQuery("SP_OD_DEL", [OracleHelper.PInt("p_id", id)], isStoredProc: true);
        return Ok();
    }
}
public record DespachoDto(string? NombreOrdenDespacho, string? FechaEntregaOrdenDespacho, decimal? PesoKgTotalOrdenDespacho, string? EstadoOrdenDespachado, long? IdVehiculo, long? IdTransportista, long? IdSucursal);


[Route("api/devoluciones-venta")]
public class DevolucionesVentaController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll() =>
        OkList(_db.ExecuteReader("SELECT * FROM VW_DEVOLUCIONES_VENTA ORDER BY FECHA_DEVOLUCION_VENTA DESC"));

    [HttpPost] public IActionResult Create([FromBody] DevolucionDto d)
    {
        var id = _db.ExecuteInsert("SP_DV_INS",
            [OracleHelper.P("p_num",d.NumeroDevolucion), OracleHelper.P("p_mot",d.MotivoDevolucion),
             OracleHelper.PDec("p_tot",d.TotalDevolucionVenta), OracleHelper.PInt("p_ov",d.IdOrdenVenta),
             OracleHelper.POut("p_id_out")], isStoredProc: true);
        return Created($"api/devoluciones-venta/{id}", new { id });
    }

    [HttpPut("{id:long}")] public IActionResult Update(long id, [FromBody] DevolucionDto d)
    {
        _db.ExecuteNonQuery("SP_DV_UPD",
            [OracleHelper.P("p_est",d.EstadoDevolucionVenta), OracleHelper.PInt("p_id",id)],
            isStoredProc: true);
        return Ok();
    }

    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        _db.ExecuteNonQuery("SP_DV_DEL", [OracleHelper.PInt("p_id", id)], isStoredProc: true);
        return Ok();
    }
}
public record DevolucionDto(string? NumeroDevolucion, string? MotivoDevolucion, decimal? TotalDevolucionVenta, string? EstadoDevolucionVenta, long? IdOrdenVenta);


[Route("api/entregas")]
public class EntregasController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll() =>
        OkList(_db.ExecuteReader("SELECT * FROM VW_ENTREGAS ORDER BY FECHA_ENTREGA DESC"));

    [HttpPost] public IActionResult Create([FromBody] EntregaDto d)
    {
        var id = _db.ExecuteInsert("SP_ENT_INS",
            [OracleHelper.P("p_obs",d.ObservacionesEntrega), OracleHelper.PInt("p_od",d.IdOrdenDespacho),
             OracleHelper.POut("p_id_out")], isStoredProc: true);
        return Created($"api/entregas/{id}", new { id });
    }

    [HttpPut("{id:long}")] public IActionResult Update(long id, [FromBody] EntregaDto d)
    {
        _db.ExecuteNonQuery("SP_ENT_UPD",
            [OracleHelper.P("p_est",d.EstadoEntrega), OracleHelper.PInt("p_id",id)],
            isStoredProc: true);
        return Ok();
    }

    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        _db.ExecuteNonQuery("SP_ENT_DEL", [OracleHelper.PInt("p_id", id)], isStoredProc: true);
        return Ok();
    }
}
public record EntregaDto(string? ObservacionesEntrega, string? EstadoEntrega, long? IdOrdenDespacho);
