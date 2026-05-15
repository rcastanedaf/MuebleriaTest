// ============================================================
// Todos los módulos CRUD restantes del DDL Oracle
// Cada controller sigue el patrón:
//   GET    /api/{resource}      → lista con filtros
//   GET    /api/{resource}/{id} → detalle
//   POST   /api/{resource}      → crear
//   PUT    /api/{resource}/{id} → actualizar
//   DELETE /api/{resource}/{id} → eliminar (lógico o validado)
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
        OkList(_db.ExecuteReader("SELECT * FROM EMPRESAS ORDER BY NOMBRE_EMPRESA"));

    [HttpGet("{id:long}")] public IActionResult GetById(long id)
    {
        var dt = _db.ExecuteReader("SELECT * FROM EMPRESAS WHERE ID_EMPRESA=:p", [OracleHelper.PInt("p", id)]);
        return dt.Rows.Count == 0 ? NotFound() : Ok(OracleHelper.ToList(dt)[0]);
    }

    [HttpPost] public IActionResult Create([FromBody] EmpresaDto d)
    {
        var id = _db.ExecuteInsert(@"INSERT INTO EMPRESAS(NOMBRE_EMPRESA,NIT_EMPRESA,RAZON_SOCIAL_EMPRESA,DIRECCION_EMPRESA,LOGO_EMPRESA,ESTADO_EMPRESA)
                                    VALUES(:nm,:nit,:rs,:dir,:logo,NVL(:est,'A')) RETURNING ID_EMPRESA INTO :p_id_out",
            [OracleHelper.P("nm",d.NombreEmpresa),OracleHelper.P("nit",d.NitEmpresa),OracleHelper.P("rs",d.RazonSocialEmpresa),
             OracleHelper.P("dir",d.DireccionEmpresa),OracleHelper.P("logo",d.LogoEmpresa),OracleHelper.P("est",d.EstadoEmpresa),OracleHelper.POut("p_id_out")]);
        return Created($"api/empresas/{id}", new { idEmpresa = id });
    }

    [HttpPut("{id:long}")] public IActionResult Update(long id, [FromBody] EmpresaDto d)
    {
        _db.ExecuteNonQuery("UPDATE EMPRESAS SET NOMBRE_EMPRESA=NVL(:nm,NOMBRE_EMPRESA),DIRECCION_EMPRESA=NVL(:dir,DIRECCION_EMPRESA),ESTADO_EMPRESA=NVL(:est,ESTADO_EMPRESA) WHERE ID_EMPRESA=:p",
            [OracleHelper.P("nm",d.NombreEmpresa),OracleHelper.P("dir",d.DireccionEmpresa),OracleHelper.P("est",d.EstadoEmpresa),OracleHelper.PInt("p",id)]);
        return Ok(new { message = "OK" });
    }

    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        _db.ExecuteNonQuery("UPDATE EMPRESAS SET ESTADO_EMPRESA='I' WHERE ID_EMPRESA=:p", [OracleHelper.PInt("p",id)]);
        return Ok();
    }
}
public record EmpresaDto(string? NombreEmpresa, string? NitEmpresa, string? RazonSocialEmpresa, string? DireccionEmpresa, string? LogoEmpresa, string? EstadoEmpresa);


[Route("api/sucursales")]
public class SucursalesController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll() =>
        OkList(_db.ExecuteReader("SELECT S.*,E.NOMBRE_EMPRESA FROM SUCURSALES S JOIN EMPRESAS E ON E.ID_EMPRESA=S.ID_EMPRESA ORDER BY S.NOMBRE_SUCURSAL"));

    [HttpGet("{id:long}")] public IActionResult GetById(long id)
    {
        var dt = _db.ExecuteReader("SELECT * FROM SUCURSALES WHERE ID_SUCURSAL=:p", [OracleHelper.PInt("p",id)]);
        return dt.Rows.Count == 0 ? NotFound() : Ok(OracleHelper.ToList(dt)[0]);
    }

    [HttpPost] public IActionResult Create([FromBody] SucursalDto d)
    {
        var id = _db.ExecuteInsert(@"INSERT INTO SUCURSALES(CODIGO_SUCURSAL,NOMBRE_SUCURSAL,DIRECCION_SUCURSAL,EMAIL_SUCURSAL,ESTADO_SUCURSAL,ID_EMPRESA,ID_MUNICIPIO)
                                    VALUES(:c,:n,:dir,:e,NVL(:est,'A'),:emp,:mun) RETURNING ID_SUCURSAL INTO :p_id_out",
            [OracleHelper.P("c",d.CodigoSucursal),OracleHelper.P("n",d.NombreSucursal),OracleHelper.P("dir",d.DireccionSucursal),
             OracleHelper.P("e",d.EmailSucursal),OracleHelper.P("est",d.EstadoSucursal),OracleHelper.PInt("emp",d.IdEmpresa),
             OracleHelper.PInt("mun",d.IdMunicipio),OracleHelper.POut("p_id_out")]);
        return Created($"api/sucursales/{id}", new { idSucursal = id });
    }

    [HttpPut("{id:long}")] public IActionResult Update(long id, [FromBody] SucursalDto d)
    {
        _db.ExecuteNonQuery("UPDATE SUCURSALES SET NOMBRE_SUCURSAL=NVL(:n,NOMBRE_SUCURSAL),ESTADO_SUCURSAL=NVL(:est,ESTADO_SUCURSAL) WHERE ID_SUCURSAL=:p",
            [OracleHelper.P("n",d.NombreSucursal),OracleHelper.P("est",d.EstadoSucursal),OracleHelper.PInt("p",id)]);
        return Ok();
    }

    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        _db.ExecuteNonQuery("UPDATE SUCURSALES SET ESTADO_SUCURSAL='I' WHERE ID_SUCURSAL=:p", [OracleHelper.PInt("p",id)]);
        return Ok();
    }
}
public record SucursalDto(string? CodigoSucursal, string? NombreSucursal, string? DireccionSucursal, string? EmailSucursal, string? EstadoSucursal, long? IdEmpresa, long? IdMunicipio);


[Route("api/roles")]
public class RolesController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll() => OkList(_db.ExecuteReader("SELECT * FROM ROLES ORDER BY RANGO_ROL"));
    [HttpPost] public IActionResult Create([FromBody] RolDto d)
    {
        var id = _db.ExecuteInsert("INSERT INTO ROLES(NOMBRE_ROL,DESCRIPCION_ROL,RANGO_ROL) VALUES(:n,:d,:r) RETURNING ID_ROL INTO :p_id_out",
            [OracleHelper.P("n",d.NombreRol),OracleHelper.P("d",d.DescripcionRol),OracleHelper.PInt("r",d.RangoRol),OracleHelper.POut("p_id_out")]);
        return Created($"api/roles/{id}", new { idRol = id });
    }
    [HttpPut("{id:long}")] public IActionResult Update(long id, [FromBody] RolDto d)
    {
        _db.ExecuteNonQuery("UPDATE ROLES SET NOMBRE_ROL=NVL(:n,NOMBRE_ROL),DESCRIPCION_ROL=NVL(:d,DESCRIPCION_ROL),RANGO_ROL=NVL(:r,RANGO_ROL) WHERE ID_ROL=:p",
            [OracleHelper.P("n",d.NombreRol),OracleHelper.P("d",d.DescripcionRol),OracleHelper.PInt("r",d.RangoRol),OracleHelper.PInt("p",id)]);
        return Ok();
    }
    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        try { _db.ExecuteNonQuery("DELETE FROM ROLES WHERE ID_ROL=:p", [OracleHelper.PInt("p",id)]); return Ok(); }
        catch (OracleException ex) { return HandleOracleError(ex); }
    }
}
public record RolDto(string? NombreRol, string? DescripcionRol, long? RangoRol);


[Route("api/usuarios")]
public class UsuariosController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll() =>
        OkList(_db.ExecuteReader("SELECT U.ID_USUARIO,U.USERNAME_USUARIO,U.EMAIL_USUARIO,U.ESTADO_USUARIO,U.ULTIMO_ACCESO_USUARIO,R.NOMBRE_ROL,S.NOMBRE_SUCURSAL FROM USUARIOS U JOIN ROLES R ON R.ID_ROL=U.ID_ROL JOIN SUCURSALES S ON S.ID_SUCURSAL=U.ID_SUCURSAL ORDER BY U.USERNAME_USUARIO"));
    [HttpPost] public IActionResult Create([FromBody] UsuarioDto d)
    {
        try
        {
            var id = _db.ExecuteInsert(@"INSERT INTO USUARIOS(USERNAME_USUARIO,PASSWORD_USUARIO,EMAIL_USUARIO,ESTADO_USUARIO,ID_ROL,ID_SUCURSAL)
                                        VALUES(:u,:p,:e,NVL(:est,'A'),:r,:s) RETURNING ID_USUARIO INTO :p_id_out",
                [OracleHelper.P("u",d.UsernameUsuario),OracleHelper.P("p",BCrypt.Net.BCrypt.HashPassword(d.PasswordUsuario??"temp",12)),
                 OracleHelper.P("e",d.EmailUsuario),OracleHelper.P("est",d.EstadoUsuario),OracleHelper.PInt("r",d.IdRol),
                 OracleHelper.PInt("s",d.IdSucursal),OracleHelper.POut("p_id_out")]);
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
            _db.ExecuteNonQuery(
                "UPDATE USUARIOS SET EMAIL_USUARIO=NVL(:e,EMAIL_USUARIO),ESTADO_USUARIO=NVL(:est,ESTADO_USUARIO),ID_ROL=NVL(:r,ID_ROL),PASSWORD_USUARIO=NVL(:p,PASSWORD_USUARIO) WHERE ID_USUARIO=:id",
                [OracleHelper.P("e",d.EmailUsuario),OracleHelper.P("est",d.EstadoUsuario),
                 OracleHelper.PInt("r",d.IdRol),OracleHelper.P("p",hashedPwd),OracleHelper.PInt("id",id)]);
            return Ok();
        }
        catch (OracleException ex) { return HandleOracleError(ex); }
    }
    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        try
        {
            _db.ExecuteNonQuery("UPDATE USUARIOS SET ESTADO_USUARIO='I' WHERE ID_USUARIO=:p", [OracleHelper.PInt("p",id)]);
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
        OkList(_db.ExecuteReader("SELECT P.*,R.NOMBRE_ROL FROM PERMISOS P JOIN ROLES R ON R.ID_ROL=P.ID_ROL ORDER BY P.MODULO_PERMISO"));

    // Returns one row per (role × module) combination; idPermiso is null if not yet granted
    [HttpGet("matriz")] public IActionResult GetMatriz()
    {
        var sql = @"SELECT R.ID_ROL, R.NOMBRE_ROL, R.RANGO_ROL,
                           P.ID_PERMISO, P.MODULO_PERMISO
                    FROM   ROLES R
                    LEFT JOIN PERMISOS P ON P.ID_ROL = R.ID_ROL
                    WHERE  LOWER(R.NOMBRE_ROL) NOT IN ('admin','cliente')
                    ORDER BY R.RANGO_ROL, P.MODULO_PERMISO";
        return OkList(_db.ExecuteReader(sql));
    }

    [HttpPost] public IActionResult Create([FromBody] PermisoDto d)
    {
        var id = _db.ExecuteInsert("INSERT INTO PERMISOS(NOMBRE_PERMISO,DESCRIPCION_PERMISO,MODULO_PERMISO,ESTADO,ID_ROL) VALUES(:n,:d,:m,NVL(:est,'A'),:r) RETURNING ID_PERMISO INTO :p_id_out",
            [OracleHelper.P("n",d.NombrePermiso),OracleHelper.P("d",d.DescripcionPermiso),OracleHelper.P("m",d.ModuloPermiso),OracleHelper.P("est",d.Estado),OracleHelper.PInt("r",d.IdRol),OracleHelper.POut("p_id_out")]);
        return Created($"api/permisos/{id}", new { idPermiso = id });
    }
    [HttpPut("{id:long}")] public IActionResult Update(long id, [FromBody] PermisoDto d)
    {
        _db.ExecuteNonQuery("UPDATE PERMISOS SET ESTADO=NVL(:est,ESTADO),MODULO_PERMISO=NVL(:m,MODULO_PERMISO) WHERE ID_PERMISO=:p",
            [OracleHelper.P("est",d.Estado),OracleHelper.P("m",d.ModuloPermiso),OracleHelper.PInt("p",id)]);
        return Ok();
    }
    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        _db.ExecuteNonQuery("DELETE FROM PERMISOS WHERE ID_PERMISO=:p_id", [OracleHelper.PInt("p_id",id)]);
        return NoContent();
    }
}
public record PermisoDto(string? NombrePermiso, string? DescripcionPermiso, string? ModuloPermiso, string? Estado, long? IdRol);


[Route("api/monedas")]
public class MonedasController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll() => OkList(_db.ExecuteReader("SELECT * FROM MONEDAS ORDER BY CODIGO_MONEDA"));
    [HttpPost] public IActionResult Create([FromBody] MonedaDto d)
    {
        var id = _db.ExecuteInsert("INSERT INTO MONEDAS(CODIGO_MONEDA,NOMBRE_MONEDA,SIMBOLO_MONEDA,DECIMALES_MONEDA) VALUES(:c,:n,:s,NVL(:d,2)) RETURNING ID_MONEDA INTO :p_id_out",
            [OracleHelper.P("c",d.CodigoMoneda),OracleHelper.P("n",d.NombreMoneda),OracleHelper.P("s",d.SimboloMoneda),OracleHelper.PInt("d",d.DecimalesMoneda),OracleHelper.POut("p_id_out")]);
        return Created($"api/monedas/{id}", new { idMoneda = id });
    }
    [HttpPut("{id:long}")] public IActionResult Update(long id, [FromBody] MonedaDto d)
    {
        _db.ExecuteNonQuery("UPDATE MONEDAS SET NOMBRE_MONEDA=NVL(:n,NOMBRE_MONEDA) WHERE ID_MONEDA=:p", [OracleHelper.P("n",d.NombreMoneda),OracleHelper.PInt("p",id)]);
        return Ok();
    }
    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        try { _db.ExecuteNonQuery("DELETE FROM MONEDAS WHERE ID_MONEDA=:p", [OracleHelper.PInt("p",id)]); return Ok(); }
        catch (OracleException ex) { return HandleOracleError(ex); }
    }
}
public record MonedaDto(string? CodigoMoneda, string? NombreMoneda, string? SimboloMoneda, int? DecimalesMoneda);


[Route("api/departamentos")]
public class DepartamentosController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll() => OkList(_db.ExecuteReader("SELECT * FROM DEPARTAMENTO ORDER BY NOMBRE_DEPARTAMENTO"));
    [HttpPost] public IActionResult Create([FromBody] DeptDto d)
    {
        var id = _db.ExecuteInsert("INSERT INTO DEPARTAMENTO(NOMBRE_DEPARTAMENTO,FRECUENCIA_DEPARTAMENTO,ZONA_TERRITORIAL_DEPARTAMENTO) VALUES(:n,:f,:z) RETURNING ID_DEPARTAMENTO INTO :p_id_out",
            [OracleHelper.P("n",d.NombreDepartamento),OracleHelper.P("f",d.FrecuenciaDepartamento),OracleHelper.P("z",d.ZonaTerritorialDepartamento),OracleHelper.POut("p_id_out")]);
        return Created($"api/departamentos/{id}", new { id });
    }
    [HttpPut("{id:long}")] public IActionResult Update(long id, [FromBody] DeptDto d)
    {
        _db.ExecuteNonQuery("UPDATE DEPARTAMENTO SET NOMBRE_DEPARTAMENTO=NVL(:n,NOMBRE_DEPARTAMENTO) WHERE ID_DEPARTAMENTO=:p",
            [OracleHelper.P("n",d.NombreDepartamento),OracleHelper.PInt("p",id)]);
        return Ok();
    }
    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        try { _db.ExecuteNonQuery("DELETE FROM DEPARTAMENTO WHERE ID_DEPARTAMENTO=:p", [OracleHelper.PInt("p",id)]); return Ok(); }
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
        var sql = "SELECT M.*,D.NOMBRE_DEPARTAMENTO FROM MUNICIPIOS M JOIN DEPARTAMENTO D ON D.ID_DEPARTAMENTO=M.ID_DEPARTAMENTO"
                + (idDepartamento.HasValue ? " WHERE M.ID_DEPARTAMENTO=:p" : "")
                + " ORDER BY M.NOMBRE_MUNICIPIO";
        OracleParameter[]? p = idDepartamento.HasValue ? [OracleHelper.PInt("p", idDepartamento)] : Array.Empty<OracleParameter>();
        return OkList(_db.ExecuteReader(sql, idDepartamento.HasValue ? p : null));
    }
    [HttpPost] public IActionResult Create([FromBody] MunicipioDto d)
    {
        var id = _db.ExecuteInsert("INSERT INTO MUNICIPIOS(NOMBRE_MUNICIPIO,CODIGO_POSTAL_MUNICIPIO,ID_DEPARTAMENTO) VALUES(:n,:cp,:dep) RETURNING ID_MUNICIPIO INTO :p_id_out",
            [OracleHelper.P("n",d.NombreMunicipio),OracleHelper.P("cp",d.CodigoPostalMunicipio),OracleHelper.PInt("dep",d.IdDepartamento),OracleHelper.POut("p_id_out")]);
        return Created($"api/municipios/{id}", new { id });
    }
    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        try { _db.ExecuteNonQuery("DELETE FROM MUNICIPIOS WHERE ID_MUNICIPIO=:p", [OracleHelper.PInt("p",id)]); return Ok(); }
        catch (OracleException ex) { return HandleOracleError(ex); }
    }
}
public record MunicipioDto(string? NombreMunicipio, string? CodigoPostalMunicipio, long? IdDepartamento);

// ── RRHH ──────────────────────────────────────────────────────

[Route("api/empleados")]
public class EmpleadosController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll([FromQuery] string? search=null, [FromQuery] string? estado=null)
    {
        var sql = @"SELECT E.*,C.NOMBRE_CARGO_RRHH,D.NOMBRE_DEPARTAMENTO_RRHH
                    FROM EMPLEADOS E
                    LEFT JOIN CARGO_RRHH C ON C.ID_CARGO_RRHH=E.ID_CARGO
                    LEFT JOIN DEPARTAMENTO_RRHH D ON D.ID_DEPARTAMENTO_RRHH=C.ID_DEPARTAMENTO_RRHH
                    WHERE (:p_est IS NULL OR E.ESTADO_EMPLEADO=:p_est)
                      AND (:p_s IS NULL OR UPPER(E.NOMBRES_EMPLEADO) LIKE UPPER(:p_s)
                           OR UPPER(E.APELLIDOS_EMPLEADO) LIKE UPPER(:p_s)
                           OR E.NUMERO_EMPLEADO LIKE :p_s)
                    ORDER BY E.APELLIDOS_EMPLEADO";
        var q = search is null ? null : $"%{search}%";
        return OkList(_db.ExecuteReader(sql, [OracleHelper.P("p_est",estado),OracleHelper.P("p_s",q)]));
    }
    [HttpGet("{id:long}")] public IActionResult GetById(long id)
    {
        var dt = _db.ExecuteReader("SELECT E.*,C.NOMBRE_CARGO_RRHH FROM EMPLEADOS E LEFT JOIN CARGO_RRHH C ON C.ID_CARGO_RRHH=E.ID_CARGO WHERE E.ID_EMPLEADO=:p",[OracleHelper.PInt("p",id)]);
        return dt.Rows.Count==0?NotFound():Ok(OracleHelper.ToList(dt)[0]);
    }
    [HttpPost] public IActionResult Create([FromBody] EmpleadoDto d)
    {
        var id = _db.ExecuteInsert(@"INSERT INTO EMPLEADOS(NUMERO_EMPLEADO,DPI_EMPLEADO,NOMBRES_EMPLEADO,APELLIDOS_EMPLEADO,FECHA_NACIMIENTO_EMPLEADO,GENERO_EMPLEADO,EMAIL_COORPORARIVO_EMPLEADO,FECHA_INGRESO_EMPLEADO,ESTADO_EMPLEADO,ID_CARGO)
                                    VALUES(:num,:dpi,:nom,:ape,TO_DATE(:fn,'YYYY-MM-DD'),:gen,:email,TO_DATE(:fi,'YYYY-MM-DD'),NVL(:est,'A'),:cargo) RETURNING ID_EMPLEADO INTO :p_id_out",
            [OracleHelper.P("num",d.NumeroEmpleado),OracleHelper.P("dpi",d.DpiEmpleado),OracleHelper.P("nom",d.NombresEmpleado),
             OracleHelper.P("ape",d.ApellidosEmpleado),OracleHelper.P("fn",d.FechaNacimientoEmpleado),OracleHelper.P("gen",d.GeneroEmpleado),
             OracleHelper.P("email",d.EmailCorporativoEmpleado),OracleHelper.P("fi",d.FechaIngresoEmpleado),
             OracleHelper.P("est",d.EstadoEmpleado),OracleHelper.PInt("cargo",d.IdCargo),OracleHelper.POut("p_id_out")]);
        return Created($"api/empleados/{id}", new { idEmpleado = id });
    }
    [HttpPut("{id:long}")] public IActionResult Update(long id, [FromBody] EmpleadoDto d)
    {
        _db.ExecuteNonQuery("UPDATE EMPLEADOS SET NOMBRES_EMPLEADO=NVL(:nom,NOMBRES_EMPLEADO),APELLIDOS_EMPLEADO=NVL(:ape,APELLIDOS_EMPLEADO),ESTADO_EMPLEADO=NVL(:est,ESTADO_EMPLEADO),ID_CARGO=NVL(:cargo,ID_CARGO) WHERE ID_EMPLEADO=:p",
            [OracleHelper.P("nom",d.NombresEmpleado),OracleHelper.P("ape",d.ApellidosEmpleado),OracleHelper.P("est",d.EstadoEmpleado),OracleHelper.PInt("cargo",d.IdCargo),OracleHelper.PInt("p",id)]);
        return Ok();
    }
    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        _db.ExecuteNonQuery("UPDATE EMPLEADOS SET ESTADO_EMPLEADO='I' WHERE ID_EMPLEADO=:p",[OracleHelper.PInt("p",id)]);
        return Ok();
    }
}
public record EmpleadoDto(string? NumeroEmpleado, string? DpiEmpleado, string? NombresEmpleado, string? ApellidosEmpleado, string? FechaNacimientoEmpleado, string? GeneroEmpleado, string? EmailCorporativoEmpleado, string? FechaIngresoEmpleado, string? EstadoEmpleado, long? IdCargo);


[Route("api/departamentos-rrhh")]
public class DepartamentosRRHHController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll() =>
        OkList(_db.ExecuteReader("SELECT D.*,S.NOMBRE_SUCURSAL FROM DEPARTAMENTO_RRHH D JOIN SUCURSALES S ON S.ID_SUCURSAL=D.ID_SUCURSAL ORDER BY D.NOMBRE_DEPARTAMENTO_RRHH"));
    [HttpPost] public IActionResult Create([FromBody] DeptRRHHDto d)
    {
        var id = _db.ExecuteInsert("INSERT INTO DEPARTAMENTO_RRHH(NOMBRE_DEPARTAMENTO_RRHH,CODIGO_DEPARTAMENTO_RRHH,ID_SUCURSAL,ID_DEPARTAMENTO_RRHH_PADRE) VALUES(:n,:c,:s,:padre) RETURNING ID_DEPARTAMENTO_RRHH INTO :p_id_out",
            [OracleHelper.P("n",d.NombreDepartamentoRRHH),OracleHelper.P("c",d.CodigoDepartamentoRRHH),OracleHelper.PInt("s",d.IdSucursal),OracleHelper.PInt("padre",d.IdDepartamentoRRHHPadre),OracleHelper.POut("p_id_out")]);
        return Created($"api/departamentos-rrhh/{id}", new { id });
    }
    [HttpPut("{id:long}")] public IActionResult Update(long id,[FromBody] DeptRRHHDto d)
    {
        _db.ExecuteNonQuery("UPDATE DEPARTAMENTO_RRHH SET NOMBRE_DEPARTAMENTO_RRHH=NVL(:n,NOMBRE_DEPARTAMENTO_RRHH) WHERE ID_DEPARTAMENTO_RRHH=:p",[OracleHelper.P("n",d.NombreDepartamentoRRHH),OracleHelper.PInt("p",id)]);return Ok();
    }
    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        try{_db.ExecuteNonQuery("DELETE FROM DEPARTAMENTO_RRHH WHERE ID_DEPARTAMENTO_RRHH=:p",[OracleHelper.PInt("p",id)]);return Ok();}
        catch(OracleException ex){return HandleOracleError(ex);}
    }
}
public record DeptRRHHDto(string? NombreDepartamentoRRHH, string? CodigoDepartamentoRRHH, long? IdSucursal, long? IdDepartamentoRRHHPadre);


[Route("api/cargos-rrhh")]
public class CargosRRHHController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll() =>
        OkList(_db.ExecuteReader("SELECT C.*,D.NOMBRE_DEPARTAMENTO_RRHH FROM CARGO_RRHH C JOIN DEPARTAMENTO_RRHH D ON D.ID_DEPARTAMENTO_RRHH=C.ID_DEPARTAMENTO_RRHH ORDER BY C.NOMBRE_CARGO_RRHH"));
    [HttpPost] public IActionResult Create([FromBody] CargoDto d)
    {
        var id = _db.ExecuteInsert("INSERT INTO CARGO_RRHH(NOMBRE_CARGO_RRHH,NIVEL_CARGO_RRHH,SALARIO_MIN_CARGO_RRHH,SALARIO_MAX_CARGO_RRHH,ID_DEPARTAMENTO_RRHH) VALUES(:n,:niv,:smin,:smax,:dep) RETURNING ID_CARGO_RRHH INTO :p_id_out",
            [OracleHelper.P("n",d.NombreCargoRRHH),OracleHelper.P("niv",d.NivelCargoRRHH),OracleHelper.PDec("smin",d.SalarioMinCargoRRHH),OracleHelper.PDec("smax",d.SalarioMaxCargoRRHH),OracleHelper.PInt("dep",d.IdDepartamentoRRHH),OracleHelper.POut("p_id_out")]);
        return Created($"api/cargos-rrhh/{id}", new { id });
    }
    [HttpPut("{id:long}")] public IActionResult Update(long id,[FromBody] CargoDto d)
    {
        _db.ExecuteNonQuery("UPDATE CARGO_RRHH SET NOMBRE_CARGO_RRHH=NVL(:n,NOMBRE_CARGO_RRHH),NIVEL_CARGO_RRHH=NVL(:niv,NIVEL_CARGO_RRHH),SALARIO_MIN_CARGO_RRHH=NVL(:smin,SALARIO_MIN_CARGO_RRHH),SALARIO_MAX_CARGO_RRHH=NVL(:smax,SALARIO_MAX_CARGO_RRHH) WHERE ID_CARGO_RRHH=:p",
            [OracleHelper.P("n",d.NombreCargoRRHH),OracleHelper.P("niv",d.NivelCargoRRHH),OracleHelper.PDec("smin",d.SalarioMinCargoRRHH),OracleHelper.PDec("smax",d.SalarioMaxCargoRRHH),OracleHelper.PInt("p",id)]);return Ok();
    }
    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        try{_db.ExecuteNonQuery("DELETE FROM CARGO_RRHH WHERE ID_CARGO_RRHH=:p",[OracleHelper.PInt("p",id)]);return Ok();}
        catch(OracleException ex){return HandleOracleError(ex);}
    }
}
public record CargoDto(string? NombreCargoRRHH, string? NivelCargoRRHH, decimal? SalarioMinCargoRRHH, decimal? SalarioMaxCargoRRHH, long? IdDepartamentoRRHH);


[Route("api/jornadas")]
public class JornadasController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll() => OkList(_db.ExecuteReader("SELECT * FROM JORNADAS ORDER BY NOMBRE_JORNADA"));
    [HttpPost] public IActionResult Create([FromBody] JornadaDto d)
    {
        var id = _db.ExecuteInsert("INSERT INTO JORNADAS(NOMBRE_JORNADA,CODIGO_JORNADA,HORA_IN_JORNADA,JORA_FIN_JORNADA,HORA_DESCANSO_JORNADA,OBSERVACIONES_JORNADA) VALUES(:n,:c,:hi,:hf,:hd,:obs) RETURNING ID_JORNADA INTO :p_id_out",
            [OracleHelper.P("n",d.NombreJornada),OracleHelper.P("c",d.CodigoJornada),OracleHelper.P("hi",d.HoraInJornada),OracleHelper.P("hf",d.HoraFinJornada),OracleHelper.P("hd",d.HoraDescansoJornada),OracleHelper.P("obs",d.ObservacionesJornada),OracleHelper.POut("p_id_out")]);
        return Created($"api/jornadas/{id}", new { id });
    }
    [HttpPut("{id:long}")] public IActionResult Update(long id,[FromBody] JornadaDto d)
    {
        _db.ExecuteNonQuery("UPDATE JORNADAS SET NOMBRE_JORNADA=NVL(:n,NOMBRE_JORNADA),HORA_IN_JORNADA=NVL(:hi,HORA_IN_JORNADA),JORA_FIN_JORNADA=NVL(:hf,JORA_FIN_JORNADA) WHERE ID_JORNADA=:p",
            [OracleHelper.P("n",d.NombreJornada),OracleHelper.P("hi",d.HoraInJornada),OracleHelper.P("hf",d.HoraFinJornada),OracleHelper.PInt("p",id)]);return Ok();
    }
    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        try{_db.ExecuteNonQuery("DELETE FROM JORNADAS WHERE ID_JORNADA=:p",[OracleHelper.PInt("p",id)]);return Ok();}
        catch(OracleException ex){return HandleOracleError(ex);}
    }
}
public record JornadaDto(string? NombreJornada, string? CodigoJornada, string? HoraInJornada, string? HoraFinJornada, string? HoraDescansoJornada, string? ObservacionesJornada);


[Route("api/nomina")]
public class NominaController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll() =>
        OkList(_db.ExecuteReader("SELECT N.*,S.NOMBRE_SUCURSAL FROM NOMINA N JOIN SUCURSALES S ON S.ID_SUCURSAL=N.ID_SUCURSAL ORDER BY N.PERIODO_NOMINA DESC"));
    [HttpPost] public IActionResult Create([FromBody] NominaDto d)
    {
        var id = _db.ExecuteInsert(@"INSERT INTO NOMINA(PERIODO_NOMINA,FECHA_PAGO_NOMINA,TOTAL_BRUTO_NOMINA,TOTAL_DESCUENTOS_NOMINA,TOTAL_NETO_NOMINA,ESTADO_NOMINA,ID_SUCURSAL,ID_USUARIO_CREA)
                                    VALUES(:per,TO_DATE(:fp,'YYYY-MM-DD'),:tb,:td,:tn,'A',:suc,:ucrea) RETURNING ID_NOMINA INTO :p_id_out",
            [OracleHelper.P("per",d.PeriodoNomina),OracleHelper.P("fp",d.FechaPagoNomina),OracleHelper.PDec("tb",d.TotalBrutoNomina),
             OracleHelper.PDec("td",d.TotalDescuentosNomina),OracleHelper.PDec("tn",d.TotalNetoNomina),OracleHelper.PInt("suc",d.IdSucursal),
             OracleHelper.PInt("ucrea",CurrentUserId),OracleHelper.POut("p_id_out")]);
        return Created($"api/nomina/{id}", new { id });
    }
    [HttpPut("{id:long}")] public IActionResult Update(long id,[FromBody] NominaDto d)
    {
        _db.ExecuteNonQuery("UPDATE NOMINA SET TOTAL_BRUTO_NOMINA=NVL(:tb,TOTAL_BRUTO_NOMINA),TOTAL_DESCUENTOS_NOMINA=NVL(:td,TOTAL_DESCUENTOS_NOMINA),TOTAL_NETO_NOMINA=NVL(:tn,TOTAL_NETO_NOMINA),ESTADO_NOMINA=NVL(:est,ESTADO_NOMINA) WHERE ID_NOMINA=:p",
            [OracleHelper.PDec("tb",d.TotalBrutoNomina),OracleHelper.PDec("td",d.TotalDescuentosNomina),OracleHelper.PDec("tn",d.TotalNetoNomina),OracleHelper.P("est",d.EstadoNomina),OracleHelper.PInt("p",id)]);return Ok();
    }
    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        _db.ExecuteNonQuery("UPDATE NOMINA SET ESTADO_NOMINA='I' WHERE ID_NOMINA=:p",[OracleHelper.PInt("p",id)]);return Ok();
    }
}
public record NominaDto(string? PeriodoNomina, string? FechaPagoNomina, decimal? TotalBrutoNomina, decimal? TotalDescuentosNomina, decimal? TotalNetoNomina, string? EstadoNomina, long? IdSucursal);


// ── Inventario ─────────────────────────────────────────────────

[Route("api/categorias-articulo")]
public class CategoriasArticuloController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll() => OkList(_db.ExecuteReader("SELECT * FROM CATEGORIAS_ARTICULO ORDER BY NIVEL_CATEGORIA_ARTICULO,NOMBRE_CATEGORIA_ARTICULO"));
    [HttpPost] public IActionResult Create([FromBody] CategoriaDto d)
    {
        var id = _db.ExecuteInsert("INSERT INTO CATEGORIAS_ARTICULO(NOMBRE_CATEGORIA_ARTICULO,CODIGO_CATEGORIA_ARTICULO,NIVEL_CATEGORIA_ARTICULO,ID_CATEGORIA_ARTICULO_PADRE) VALUES(:n,:c,:niv,:padre) RETURNING ID_CATEGORIAS_ARTICULO INTO :p_id_out",
            [OracleHelper.P("n",d.NombreCategoriaArticulo),OracleHelper.P("c",d.CodigoCategoriaArticulo),OracleHelper.PInt("niv",d.NivelCategoriaArticulo),OracleHelper.PInt("padre",d.IdCategoriaArticuloPadre),OracleHelper.POut("p_id_out")]);
        return Created($"api/categorias-articulo/{id}", new { id });
    }
    [HttpPut("{id:long}")] public IActionResult Update(long id,[FromBody] CategoriaDto d)
    {
        _db.ExecuteNonQuery("UPDATE CATEGORIAS_ARTICULO SET NOMBRE_CATEGORIA_ARTICULO=NVL(:n,NOMBRE_CATEGORIA_ARTICULO) WHERE ID_CATEGORIAS_ARTICULO=:p",[OracleHelper.P("n",d.NombreCategoriaArticulo),OracleHelper.PInt("p",id)]);return Ok();
    }
    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        try{_db.ExecuteNonQuery("DELETE FROM CATEGORIAS_ARTICULO WHERE ID_CATEGORIAS_ARTICULO=:p",[OracleHelper.PInt("p",id)]);return Ok();}
        catch(OracleException ex){return HandleOracleError(ex);}
    }
}
public record CategoriaDto(string? NombreCategoriaArticulo, string? CodigoCategoriaArticulo, int? NivelCategoriaArticulo, long? IdCategoriaArticuloPadre);


[Route("api/bodegas")]
public class BodegasController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll() =>
        OkList(_db.ExecuteReader("SELECT B.*,S.NOMBRE_SUCURSAL FROM BODEGAS B JOIN SUCURSALES S ON S.ID_SUCURSAL=B.ID_SUCURSAL ORDER BY B.NOMBRE_BODEGA"));
    [HttpPost] public IActionResult Create([FromBody] BodegaDto d)
    {
        var id = _db.ExecuteInsert("INSERT INTO BODEGAS(CODIGO_BODEGA,NOMBRE_BODEGA,TIPO_BODEGA,DIRECCION_BODEGA,ESTADO_BODEGA,ID_SUCURSAL) VALUES(:c,:n,:t,:d,NVL(:est,'A'),:suc) RETURNING ID_BODEGA INTO :p_id_out",
            [OracleHelper.P("c",d.CodigoBodega),OracleHelper.P("n",d.NombreBodega),OracleHelper.P("t",d.TipoBodega),OracleHelper.P("d",d.DireccionBodega),OracleHelper.P("est",d.EstadoBodega),OracleHelper.PInt("suc",d.IdSucursal),OracleHelper.POut("p_id_out")]);
        return Created($"api/bodegas/{id}", new { id });
    }
    [HttpPut("{id:long}")] public IActionResult Update(long id,[FromBody] BodegaDto d)
    {
        _db.ExecuteNonQuery("UPDATE BODEGAS SET NOMBRE_BODEGA=NVL(:n,NOMBRE_BODEGA),ESTADO_BODEGA=NVL(:est,ESTADO_BODEGA) WHERE ID_BODEGA=:p",[OracleHelper.P("n",d.NombreBodega),OracleHelper.P("est",d.EstadoBodega),OracleHelper.PInt("p",id)]);return Ok();
    }
    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        _db.ExecuteNonQuery("UPDATE BODEGAS SET ESTADO_BODEGA='I' WHERE ID_BODEGA=:p",[OracleHelper.PInt("p",id)]);return Ok();
    }
}
public record BodegaDto(string? CodigoBodega, string? NombreBodega, string? TipoBodega, string? DireccionBodega, string? EstadoBodega, long? IdSucursal);


[Route("api/stock-articulo")]
public class StockController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll([FromQuery] long? idArticulo=null)
    {
        var sql = "SELECT SA.*,A.NOMBRE_ARTICULO,A.CODIGO_ARTICULO FROM STOCK_ARTICULO SA JOIN ARTICULO A ON A.ID_ARTICULO=SA.ID_ARTICULO"
                + (idArticulo.HasValue ? " WHERE SA.ID_ARTICULO=:p" : "");
        return OkList(_db.ExecuteReader(sql, idArticulo.HasValue ? [OracleHelper.PInt("p",idArticulo)] : null));
    }
    [HttpPost] public IActionResult Create([FromBody] StockDto d)
    {
        var id = _db.ExecuteInsert("INSERT INTO STOCK_ARTICULO(CANTIDAD_DIPONIBLE_STOCK_ARTICULO,CANTIDAD_RESERVADA_STOCK_ARTICULO,CANTIDAD_TRNASITO_STOCK_ARTICULO,COSTO_PROMEDIO_STOCK_ARTICULO,ID_ARTICULO,ID_UBICACION_BODEGA) VALUES(:cd,NVL(:cr,0),NVL(:ct,0),NVL(:cp,0),:art,:ubod) RETURNING ID_STOCK_ARTICULO INTO :p_id_out",
            [OracleHelper.PDec("cd",d.CantidadDisponible),OracleHelper.PDec("cr",d.CantidadReservada),OracleHelper.PDec("ct",d.CantidadTransito),OracleHelper.PDec("cp",d.CostoPromedio),OracleHelper.PInt("art",d.IdArticulo),OracleHelper.PInt("ubod",d.IdUbicacionBodega),OracleHelper.POut("p_id_out")]);
        return Created($"api/stock-articulo/{id}", new { id });
    }
    [HttpPut("{id:long}")] public IActionResult Update(long id,[FromBody] StockDto d)
    {
        _db.ExecuteNonQuery("UPDATE STOCK_ARTICULO SET CANTIDAD_DIPONIBLE_STOCK_ARTICULO=NVL(:cd,CANTIDAD_DIPONIBLE_STOCK_ARTICULO),COSTO_PROMEDIO_STOCK_ARTICULO=NVL(:cp,COSTO_PROMEDIO_STOCK_ARTICULO) WHERE ID_STOCK_ARTICULO=:p",
            [OracleHelper.PDec("cd",d.CantidadDisponible),OracleHelper.PDec("cp",d.CostoPromedio),OracleHelper.PInt("p",id)]);return Ok();
    }
}
public record StockDto(decimal? CantidadDisponible, decimal? CantidadReservada, decimal? CantidadTransito, decimal? CostoPromedio, long? IdArticulo, long? IdUbicacionBodega);


// ── Compras ────────────────────────────────────────────────────

[Route("api/proveedores")]
public class ProveedoresController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll([FromQuery] string? search=null)
    {
        var sql = "SELECT P.*,M.CODIGO_MONEDA FROM PROVEEDORES P LEFT JOIN MONEDAS M ON M.ID_MONEDA=P.ID_MONEDA"
                + (search is null ? "" : " WHERE UPPER(P.RAZON_SOCIAL_PROVEEDOR) LIKE UPPER(:s) OR P.NIT_PROVEEDOR LIKE :s")
                + " ORDER BY P.RAZON_SOCIAL_PROVEEDOR";
        var q = search is null ? null : $"%{search}%";
        return OkList(_db.ExecuteReader(sql, search is null ? null : [OracleHelper.P("s",q)]));
    }
    [HttpPost] public IActionResult Create([FromBody] ProveedorDto d)
    {
        var id = _db.ExecuteInsert(@"INSERT INTO PROVEEDORES(CODIGO_PROVEEDOR,RAZON_SOCIAL_PROVEEDOR,NIT_PROVEEDOR,DIRECCION_PROVEEDOR,TELEFON_PROVEEDOR,EMAIL_PROVEEDOR,PLAZO_PAGO_PROVEEDOR,CLASIFICACION_PROVEEDOR,ESTADO_PROVEEDOR,ID_MONEDA)
                                    VALUES(:c,:rs,:nit,:dir,:tel,:email,:pp,:clas,NVL(:est,'A'),:mon) RETURNING ID_PROVEEDOR INTO :p_id_out",
            [OracleHelper.P("c",d.CodigoProveedor),OracleHelper.P("rs",d.RazonSocialProveedor),OracleHelper.P("nit",d.NitProveedor),
             OracleHelper.P("dir",d.DireccionProveedor),OracleHelper.P("tel",d.TelefonoProveedor),OracleHelper.P("email",d.EmailProveedor),
             OracleHelper.PInt("pp",d.PlazoPagoProveedor),OracleHelper.P("clas",d.ClasificacionProveedor),OracleHelper.P("est",d.EstadoProveedor),
             OracleHelper.PInt("mon",d.IdMoneda),OracleHelper.POut("p_id_out")]);
        return Created($"api/proveedores/{id}", new { id });
    }
    [HttpPut("{id:long}")] public IActionResult Update(long id,[FromBody] ProveedorDto d)
    {
        _db.ExecuteNonQuery("UPDATE PROVEEDORES SET RAZON_SOCIAL_PROVEEDOR=NVL(:rs,RAZON_SOCIAL_PROVEEDOR),PLAZO_PAGO_PROVEEDOR=NVL(:pp,PLAZO_PAGO_PROVEEDOR),ESTADO_PROVEEDOR=NVL(:est,ESTADO_PROVEEDOR) WHERE ID_PROVEEDOR=:p",
            [OracleHelper.P("rs",d.RazonSocialProveedor),OracleHelper.PInt("pp",d.PlazoPagoProveedor),OracleHelper.P("est",d.EstadoProveedor),OracleHelper.PInt("p",id)]);return Ok();
    }
    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        _db.ExecuteNonQuery("UPDATE PROVEEDORES SET ESTADO_PROVEEDOR='I' WHERE ID_PROVEEDOR=:p",[OracleHelper.PInt("p",id)]);return Ok();
    }
}
public record ProveedorDto(string? CodigoProveedor, string? RazonSocialProveedor, string? NitProveedor, string? DireccionProveedor, string? TelefonoProveedor, string? EmailProveedor, int? PlazoPagoProveedor, string? ClasificacionProveedor, string? EstadoProveedor, long? IdMoneda);


[Route("api/ordenes-compra")]
public class OrdenesCompraController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll() =>
        OkList(_db.ExecuteReader("SELECT OC.*,P.RAZON_SOCIAL_PROVEEDOR,M.CODIGO_MONEDA FROM ORDEN_COMPRA OC JOIN PROVEEDORES P ON P.ID_PROVEEDOR=OC.ID_PROVEEDOR LEFT JOIN MONEDAS M ON M.ID_MONEDA=OC.ID_MONEDA ORDER BY OC.FECHA_SOLICITUD_ORDEN_COMPRA DESC"));
    [HttpPost] public IActionResult Create([FromBody] OrdenCompraDto d)
    {
        var id = _db.ExecuteInsert(@"INSERT INTO ORDEN_COMPRA(NUMERO_ORDEN_COMPRA,FECHA_SOLICITUD_ORDEN_COMPRA,FECHA_INGRESO_ORDEN_COMPRA,SUBTOTAL_ORDEN_COMPRA,IMPUESTO_ORDEN_COMPRA,TOTAL_ORDEN_COMPRA,ESTADO_ORDEN_COMPRA,ID_PROVEEDOR,ID_MONEDA,ID_SOLICITUD_COMPRA,ID_USUARIO_CREA)
                                    VALUES(:num,SYSDATE,SYSDATE,:sub,:imp,:tot,'P',:prov,:mon,:sol,:ucrea) RETURNING ID_ORDEN_COMPRA INTO :p_id_out",
            [OracleHelper.P("num",d.NumeroOrdenCompra),OracleHelper.PDec("sub",d.SubtotalOrdenCompra),OracleHelper.PDec("imp",d.ImpuestoOrdenCompra),
             OracleHelper.PDec("tot",d.TotalOrdenCompra),OracleHelper.PInt("prov",d.IdProveedor),OracleHelper.PInt("mon",d.IdMoneda),
             OracleHelper.PInt("sol",d.IdSolicitudCompra),OracleHelper.PInt("ucrea",CurrentUserId),OracleHelper.POut("p_id_out")]);
        return Created($"api/ordenes-compra/{id}", new { id });
    }
    [HttpPut("{id:long}")] public IActionResult Update(long id,[FromBody] OrdenCompraDto d)
    {
        _db.ExecuteNonQuery("UPDATE ORDEN_COMPRA SET SUBTOTAL_ORDEN_COMPRA=NVL(:sub,SUBTOTAL_ORDEN_COMPRA),IMPUESTO_ORDEN_COMPRA=NVL(:imp,IMPUESTO_ORDEN_COMPRA),TOTAL_ORDEN_COMPRA=NVL(:tot,TOTAL_ORDEN_COMPRA),ESTADO_ORDEN_COMPRA=NVL(:est,ESTADO_ORDEN_COMPRA),ID_USUARIO_MODIFICA=:umod WHERE ID_ORDEN_COMPRA=:p",
            [OracleHelper.PDec("sub",d.SubtotalOrdenCompra),OracleHelper.PDec("imp",d.ImpuestoOrdenCompra),OracleHelper.PDec("tot",d.TotalOrdenCompra),OracleHelper.P("est",d.EstadoOrdenCompra),OracleHelper.PInt("umod",CurrentUserId),OracleHelper.PInt("p",id)]);return Ok();
    }
    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        _db.ExecuteNonQuery("UPDATE ORDEN_COMPRA SET ESTADO_ORDEN_COMPRA='C' WHERE ID_ORDEN_COMPRA=:p",[OracleHelper.PInt("p",id)]);return Ok();
    }
}
public record OrdenCompraDto(string? NumeroOrdenCompra, decimal? SubtotalOrdenCompra, decimal? ImpuestoOrdenCompra, decimal? TotalOrdenCompra, string? EstadoOrdenCompra, long? IdProveedor, long? IdMoneda, long? IdSolicitudCompra);


// ── Ventas ─────────────────────────────────────────────────────

[Route("api/clientes")]
public class ClientesController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll([FromQuery] string? search=null)
    {
        var sql = "SELECT C.*,LP.NOMBRE_LISTA_PRECIOS FROM CLIENTE C LEFT JOIN LISTA_PRECIOS LP ON LP.ID_LISTA_PRECIOS=C.ID_LISTA_PRECIOS"
                + (search is null ? "" : " WHERE UPPER(C.RAZON_SOCIAL_CLIENTE) LIKE UPPER(:s) OR C.NIT_CLIENTE LIKE :s")
                + " ORDER BY C.RAZON_SOCIAL_CLIENTE";
        var q = search is null ? null : $"%{search}%";
        return OkList(_db.ExecuteReader(sql, search is null ? null : [OracleHelper.P("s",q)]));
    }
    [HttpPost] public IActionResult Create([FromBody] ClienteDto d)
    {
        var id = _db.ExecuteInsert(@"INSERT INTO CLIENTE(CODIGO_CLIENTE,RAZON_SOCIAL_CLIENTE,NIT_CLIENTE,LIMITE_CREDITO_CLIENTE,TELEFON_CLIENTE,EMAIL_CLIENTE,PLAZO_PAGO_CLIENTES,ESTADO_CLIENTE,ID_LISTA_PRECIOS,ID_SUCURSAL)
                                    VALUES(:c,:rs,:nit,:lim,:tel,:email,:pp,NVL(:est,'A'),:lp,:suc) RETURNING ID_CLIENTE INTO :p_id_out",
            [OracleHelper.P("c",d.CodigoCliente),OracleHelper.P("rs",d.RazonSocialCliente),OracleHelper.P("nit",d.NitCliente),
             OracleHelper.PDec("lim",d.LimiteCreditoCliente),OracleHelper.P("tel",d.TelefonoCliente),OracleHelper.P("email",d.EmailCliente),
             OracleHelper.PInt("pp",d.PlazoPagoClientes),OracleHelper.P("est",d.EstadoCliente),OracleHelper.PInt("lp",d.IdListaPrecios),
             OracleHelper.PInt("suc",d.IdSucursal),OracleHelper.POut("p_id_out")]);
        return Created($"api/clientes/{id}", new { id });
    }
    [HttpPut("{id:long}")] public IActionResult Update(long id,[FromBody] ClienteDto d)
    {
        _db.ExecuteNonQuery("UPDATE CLIENTE SET RAZON_SOCIAL_CLIENTE=NVL(:rs,RAZON_SOCIAL_CLIENTE),LIMITE_CREDITO_CLIENTE=NVL(:lim,LIMITE_CREDITO_CLIENTE),ESTADO_CLIENTE=NVL(:est,ESTADO_CLIENTE) WHERE ID_CLIENTE=:p",
            [OracleHelper.P("rs",d.RazonSocialCliente),OracleHelper.PDec("lim",d.LimiteCreditoCliente),OracleHelper.P("est",d.EstadoCliente),OracleHelper.PInt("p",id)]);return Ok();
    }
    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        var count = Convert.ToInt32(_db.ExecuteScalar("SELECT COUNT(*) FROM ORDEN_VENTA WHERE ID_SUCURSAL_CLEINTE=:p",[OracleHelper.PInt("p",id)]));
        if (count > 0) return Conflict(new { message = "No se puede eliminar: el cliente tiene compras registradas." });
        _db.ExecuteNonQuery("UPDATE CLIENTE SET ESTADO_CLIENTE='I' WHERE ID_CLIENTE=:p",[OracleHelper.PInt("p",id)]);
        return Ok();
    }
}
public record ClienteDto(string? CodigoCliente, string? RazonSocialCliente, string? NitCliente, decimal? LimiteCreditoCliente, string? TelefonoCliente, string? EmailCliente, int? PlazoPagoClientes, string? EstadoCliente, long? IdListaPrecios, long? IdSucursal);


[Route("api/lista-precios")]
public class ListaPreciosController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll() =>
        OkList(_db.ExecuteReader("SELECT LP.*,M.CODIGO_MONEDA FROM LISTA_PRECIOS LP LEFT JOIN MONEDAS M ON M.ID_MONEDA=LP.ID_MONEDA ORDER BY LP.NOMBRE_LISTA_PRECIOS"));
    [HttpGet("{id:long}/detalle")] public IActionResult GetDetalle(long id) =>
        OkList(_db.ExecuteReader("SELECT LPD.*,A.NOMBRE_ARTICULO,A.CODIGO_ARTICULO FROM LISTA_PRECIOS_DET LPD JOIN ARTICULO A ON A.ID_ARTICULO=LPD.ID_ARTICULO WHERE LPD.ID_LISTA_PRECIOS=:p ORDER BY A.NOMBRE_ARTICULO",[OracleHelper.PInt("p",id)]));
    [HttpPost] public IActionResult Create([FromBody] ListaPreciosDto d)
    {
        var id = _db.ExecuteInsert("INSERT INTO LISTA_PRECIOS(NOMBRE_LISTA_PRECIOS,FECHA_DESDE_LISTA_PRECIOS,FECHA_HASTA_LISTA_PRECIOS,ID_MONEDA) VALUES(:n,TO_DATE(:fd,'YYYY-MM-DD'),TO_DATE(:fh,'YYYY-MM-DD'),:mon) RETURNING ID_LISTA_PRECIOS INTO :p_id_out",
            [OracleHelper.P("n",d.NombreListaPrecios),OracleHelper.P("fd",d.FechaDesdeListaPrecios),OracleHelper.P("fh",d.FechaHastaListaPrecios),OracleHelper.PInt("mon",d.IdMoneda),OracleHelper.POut("p_id_out")]);
        return Created($"api/lista-precios/{id}", new { id });
    }
    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        try{_db.ExecuteNonQuery("DELETE FROM LISTA_PRECIOS WHERE ID_LISTA_PRECIOS=:p",[OracleHelper.PInt("p",id)]);return Ok();}
        catch(OracleException ex){return HandleOracleError(ex);}
    }
}
public record ListaPreciosDto(string? NombreListaPrecios, string? FechaDesdeListaPrecios, string? FechaHastaListaPrecios, long? IdMoneda);


[Route("api/facturas-venta")]
public class FacturasVentaController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll() =>
        OkList(_db.ExecuteReader("SELECT FV.*,SM.NUMERO_SALIDA_MERCADERIA FROM FACTURA_VENTA FV LEFT JOIN SALIDA_MERCADERIA SM ON SM.ID_SALIDA_MERCADERIA=FV.ID_SALIDA_MERCADERIA ORDER BY FV.FECHA_FACTURA_VENTA DESC"));
    [HttpPost] public IActionResult Create([FromBody] FacturaDto d)
    {
        var id = _db.ExecuteInsert("INSERT INTO FACTURA_VENTA(SERIE_FACTURA_VENTA,CORRELATIVO_FACTURA_VENTA,FECHA_SALIDA_FACTURA_VENTA,FECHA_FACTURA_VENTA,ESTADO_SALIDA_MERCADERIA,TOTAL_FACTURA_VENTA,ID_SALIDA_MERCADERIA,ID_USUARIO_CREA) VALUES(:s,:cor,SYSDATE,SYSDATE,'A',:tot,:sm,:ucrea) RETURNING ID_FACTURA_VENTA INTO :p_id_out",
            [OracleHelper.P("s",d.SerieFacturaVenta),OracleHelper.P("cor",d.CorrelativoFacturaVenta),OracleHelper.PDec("tot",d.TotalFacturaVenta),OracleHelper.PInt("sm",d.IdSalidaMercaderia),OracleHelper.PInt("ucrea",CurrentUserId),OracleHelper.POut("p_id_out")]);
        return Created($"api/facturas-venta/{id}", new { id });
    }
    [HttpPut("{id:long}")] public IActionResult Update(long id,[FromBody] FacturaDto d)
    {
        _db.ExecuteNonQuery("UPDATE FACTURA_VENTA SET ESTADO_SALIDA_MERCADERIA=NVL(:est,ESTADO_SALIDA_MERCADERIA) WHERE ID_FACTURA_VENTA=:p",[OracleHelper.P("est",d.EstadoSalidaMercaderia),OracleHelper.PInt("p",id)]);return Ok();
    }
    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        _db.ExecuteNonQuery("UPDATE FACTURA_VENTA SET ESTADO_SALIDA_MERCADERIA='C' WHERE ID_FACTURA_VENTA=:p",[OracleHelper.PInt("p",id)]);return Ok();
    }
}
public record FacturaDto(string? SerieFacturaVenta, string? CorrelativoFacturaVenta, decimal? TotalFacturaVenta, string? EstadoSalidaMercaderia, long? IdSalidaMercaderia);


// ── Producción ─────────────────────────────────────────────────

[Route("api/centros-trabajo")]
public class CentrosTrabajoController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll() =>
        OkList(_db.ExecuteReader("SELECT CT.*,S.NOMBRE_SUCURSAL FROM CENTRO_TRABAJO CT LEFT JOIN SUCURSALES S ON S.ID_SUCURSAL=CT.ID_SUCURSAL ORDER BY CT.NOMBRE_CENTRO_TRABAJO"));
    [HttpPost] public IActionResult Create([FromBody] CentroTrabajoDto d)
    {
        var id = _db.ExecuteInsert("INSERT INTO CENTRO_TRABAJO(CODIGO_CENTRO_TRABAJO,NOMBRE_CENTRO_TRABAJO,CAPACIDAD_HORA,VOSTO_HORA_CENTRO_TRABAJO,ESTADO_CENTRO_TRABAJO,ID_SUCURSAL) VALUES(:c,:n,:ch,:vh,NVL(:est,'A'),:suc) RETURNING ID_CENTRO_TRABAJO INTO :p_id_out",
            [OracleHelper.P("c",d.CodigoCentroTrabajo),OracleHelper.P("n",d.NombreCentroTrabajo),OracleHelper.PDec("ch",d.CapacidadHora),OracleHelper.PDec("vh",d.VostoHoraCentroTrabajo),OracleHelper.P("est",d.EstadoCentroTrabajo),OracleHelper.PInt("suc",d.IdSucursal),OracleHelper.POut("p_id_out")]);
        return Created($"api/centros-trabajo/{id}", new { id });
    }
    [HttpPut("{id:long}")] public IActionResult Update(long id,[FromBody] CentroTrabajoDto d)
    {
        _db.ExecuteNonQuery("UPDATE CENTRO_TRABAJO SET NOMBRE_CENTRO_TRABAJO=NVL(:n,NOMBRE_CENTRO_TRABAJO),ESTADO_CENTRO_TRABAJO=NVL(:est,ESTADO_CENTRO_TRABAJO) WHERE ID_CENTRO_TRABAJO=:p",[OracleHelper.P("n",d.NombreCentroTrabajo),OracleHelper.P("est",d.EstadoCentroTrabajo),OracleHelper.PInt("p",id)]);return Ok();
    }
    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        _db.ExecuteNonQuery("UPDATE CENTRO_TRABAJO SET ESTADO_CENTRO_TRABAJO='I' WHERE ID_CENTRO_TRABAJO=:p",[OracleHelper.PInt("p",id)]);return Ok();
    }
}
public record CentroTrabajoDto(string? CodigoCentroTrabajo, string? NombreCentroTrabajo, decimal? CapacidadHora, decimal? VostoHoraCentroTrabajo, string? EstadoCentroTrabajo, long? IdSucursal);


[Route("api/ordenes-produccion")]
public class OrdenesProduccionController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll() =>
        OkList(_db.ExecuteReader("SELECT OP.*,CT.NOMBRE_CENTRO_TRABAJO,LM.NOMBRE_LISTA__MATERIALES FROM ORDEN_PRODUCCION OP LEFT JOIN CENTRO_TRABAJO CT ON CT.ID_CENTRO_TRABAJO=OP.ID_CENTRO_TRABAJO LEFT JOIN LISTA_MATERIALES LM ON LM.ID_LISTA_MATERIALES=OP.ID_LISTA_MATERIALES ORDER BY OP.FECHA_IN_ORDEN_PRODUCCION DESC"));
    [HttpPost] public IActionResult Create([FromBody] OrdenProduccionDto d)
    {
        var id = _db.ExecuteInsert(@"INSERT INTO ORDEN_PRODUCCION(CODIGO_ORDEN_PRODUCCION,FECHA_IN_ORDEN_PRODUCCION,FECHA_FIN_ORDEN_PRODUCCION,CANTIDAD_PLANIFICADA_ORDEN_PRODUCCION,CANTIDAD_PRODUCIDA_ORIDEN_PRODUCCION,CANTIDAD_MERMA_ORDEN_PRODUCCION,ESTADO_ORDEN_PRODUCCION,ID_LISTA_MATERIALES,ID_CENTRO_TRABAJO,ID_SUCURSAL,ID_USUARIO_CREA)
                                    VALUES(:cod,TO_DATE(:fi,'YYYY-MM-DD'),TO_DATE(:ff,'YYYY-MM-DD'),:cp,0,0,'P',:lm,:ct,:suc,:ucrea) RETURNING ID_ORDEN_PRODUCCION INTO :p_id_out",
            [OracleHelper.P("cod",d.CodigoOrdenProduccion),OracleHelper.P("fi",d.FechaInOrdenProduccion),OracleHelper.P("ff",d.FechaFinOrdenProduccion),
             OracleHelper.PDec("cp",d.CantidadPlanificadaOrdenProduccion),OracleHelper.PInt("lm",d.IdListaMateriales),OracleHelper.PInt("ct",d.IdCentroTrabajo),
             OracleHelper.PInt("suc",d.IdSucursal),OracleHelper.PInt("ucrea",CurrentUserId),OracleHelper.POut("p_id_out")]);
        return Created($"api/ordenes-produccion/{id}", new { id });
    }
    [HttpPut("{id:long}")] public IActionResult Update(long id,[FromBody] OrdenProduccionDto d)
    {
        _db.ExecuteNonQuery("UPDATE ORDEN_PRODUCCION SET CANTIDAD_PLANIFICADA_ORDEN_PRODUCCION=NVL(:cplan,CANTIDAD_PLANIFICADA_ORDEN_PRODUCCION),CANTIDAD_PRODUCIDA_ORDEN_PRODUCCION=NVL(:cprod,CANTIDAD_PRODUCIDA_ORDEN_PRODUCCION),ESTADO_ORDEN_PRODUCCION=NVL(:est,ESTADO_ORDEN_PRODUCCION),ID_USUARIO_MODIFICA=:umod WHERE ID_ORDEN_PRODUCCION=:p",
            [OracleHelper.PDec("cplan",d.CantidadPlanificadaOrdenProduccion),OracleHelper.PDec("cprod",d.CantidadProducida),OracleHelper.P("est",d.EstadoOrdenProduccion),OracleHelper.PInt("umod",CurrentUserId),OracleHelper.PInt("p",id)]);return Ok();
    }
    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        _db.ExecuteNonQuery("UPDATE ORDEN_PRODUCCION SET ESTADO_ORDEN_PRODUCCION='R' WHERE ID_ORDEN_PRODUCCION=:p",[OracleHelper.PInt("p",id)]);return Ok();
    }
}
public record OrdenProduccionDto(string? CodigoOrdenProduccion, string? FechaInOrdenProduccion, string? FechaFinOrdenProduccion, decimal? CantidadPlanificadaOrdenProduccion, decimal? CantidadProducida, string? EstadoOrdenProduccion, long? IdListaMateriales, long? IdCentroTrabajo, long? IdSucursal);


// ── Transporte ─────────────────────────────────────────────────

[Route("api/vehiculos")]
public class VehiculosController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll() =>
        OkList(_db.ExecuteReader("SELECT V.*,S.NOMBRE_SUCURSAL FROM VEHICULO V LEFT JOIN SUCURSALES S ON S.ID_SUCURSAL=V.ID_SUCURSAL ORDER BY V.PLACA_VEHICULO"));
    [HttpPost] public IActionResult Create([FromBody] VehiculoDto d)
    {
        var id = _db.ExecuteInsert("INSERT INTO VEHICULO(PLACA_VEHICULO,MARCA_VEHICULO,MODELO_VEHICULO,TIPO_VEHICULO,CAPACIDAD_KG_VEHICULO,KM_ULT_SERV_VEHICULO,KM_SIG_SERV_VEHICULO,ESTADO_VEHICULO,ID_SUCURSAL) VALUES(:p,:m,:mod,:t,:cap,:kult,:ksig,NVL(:est,'A'),:suc) RETURNING ID_VEHICULO INTO :p_id_out",
            [OracleHelper.P("p",d.PlacaVehiculo),OracleHelper.P("m",d.MarcaVehiculo),OracleHelper.P("mod",d.ModeloVehiculo),OracleHelper.P("t",d.TipoVehiculo),OracleHelper.PDec("cap",d.CapacidadKgVehiculo),OracleHelper.PDec("kult",d.KmUltServVehiculo),OracleHelper.PDec("ksig",d.KmSigServVehiculo),OracleHelper.P("est",d.EstadoVehiculo),OracleHelper.PInt("suc",d.IdSucursal),OracleHelper.POut("p_id_out")]);
        return Created($"api/vehiculos/{id}", new { id });
    }
    [HttpPut("{id:long}")] public IActionResult Update(long id,[FromBody] VehiculoDto d)
    {
        _db.ExecuteNonQuery("UPDATE VEHICULO SET ESTADO_VEHICULO=NVL(:est,ESTADO_VEHICULO),KM_SIG_SERV_VEHICULO=NVL(:ksig,KM_SIG_SERV_VEHICULO) WHERE ID_VEHICULO=:p",[OracleHelper.P("est",d.EstadoVehiculo),OracleHelper.PDec("ksig",d.KmSigServVehiculo),OracleHelper.PInt("p",id)]);return Ok();
    }
    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        _db.ExecuteNonQuery("UPDATE VEHICULO SET ESTADO_VEHICULO='I' WHERE ID_VEHICULO=:p",[OracleHelper.PInt("p",id)]);return Ok();
    }
}
public record VehiculoDto(string? PlacaVehiculo, string? MarcaVehiculo, string? ModeloVehiculo, string? TipoVehiculo, decimal? CapacidadKgVehiculo, decimal? KmUltServVehiculo, decimal? KmSigServVehiculo, string? EstadoVehiculo, long? IdSucursal);


[Route("api/transportistas")]
public class TransportistasController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll() =>
        OkList(_db.ExecuteReader("SELECT T.*,E.NOMBRES_EMPLEADO FROM TRANSPORTISTA T LEFT JOIN EMPLEADOS E ON E.ID_EMPLEADO=T.ID_EMPLEADO ORDER BY T.NOMBRE_TRANSPORTISTA"));
    [HttpPost] public IActionResult Create([FromBody] TransportistaDto d)
    {
        var id = _db.ExecuteInsert("INSERT INTO TRANSPORTISTA(NOMBRE_TRANSPORTISTA,APELLIDOS_TRANSPORTISTA,LICENCIA_TRANSPORTISTA,DPI_TRANPORTISTA,TIPO_LIC_TRANSPORTISTA,ESTADO_TRANSPORTISTA,ID_EMPLEADO) VALUES(:n,:a,:lic,:dpi,:tlic,NVL(:est,'A'),:emp) RETURNING ID_TRANSPORTISTA INTO :p_id_out",
            [OracleHelper.P("n",d.NombreTransportista),OracleHelper.P("a",d.ApellidosTransportista),OracleHelper.P("lic",d.LicenciaTransportista),OracleHelper.P("dpi",d.DpiTransportista),OracleHelper.P("tlic",d.TipoLicTransportista),OracleHelper.P("est",d.EstadoTransportista),OracleHelper.PInt("emp",d.IdEmpleado),OracleHelper.POut("p_id_out")]);
        return Created($"api/transportistas/{id}", new { id });
    }
    [HttpPut("{id:long}")] public IActionResult Update(long id,[FromBody] TransportistaDto d)
    {
        _db.ExecuteNonQuery("UPDATE TRANSPORTISTA SET ESTADO_TRANSPORTISTA=NVL(:est,ESTADO_TRANSPORTISTA) WHERE ID_TRANSPORTISTA=:p",[OracleHelper.P("est",d.EstadoTransportista),OracleHelper.PInt("p",id)]);return Ok();
    }
    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        _db.ExecuteNonQuery("UPDATE TRANSPORTISTA SET ESTADO_TRANSPORTISTA='I' WHERE ID_TRANSPORTISTA=:p",[OracleHelper.PInt("p",id)]);return Ok();
    }
}
public record TransportistaDto(string? NombreTransportista, string? ApellidosTransportista, string? LicenciaTransportista, string? DpiTransportista, string? TipoLicTransportista, string? EstadoTransportista, long? IdEmpleado);


[Route("api/ordenes-despacho")]
public class DespachosController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll() =>
        OkList(_db.ExecuteReader("SELECT OD.*,V.PLACA_VEHICULO,T.NOMBRE_TRANSPORTISTA,T.APELLIDOS_TRANSPORTISTA FROM ORDEN_DESPACHADO OD LEFT JOIN VEHICULO V ON V.ID_VEHICULO=OD.ID_VEHICULO LEFT JOIN TRANSPORTISTA T ON T.ID_TRANSPORTISTA=OD.ID_TRANSPORTISTA ORDER BY OD.FECHA_CREA_ORDEN_DESPACHO DESC"));
    [HttpPost] public IActionResult Create([FromBody] DespachoDto d)
    {
        var id = _db.ExecuteInsert("INSERT INTO ORDEN_DESPACHADO(NOMBRE_ORDEN_DESPACHO,FECHA_CREA_ORDEN_DESPACHO,FECHA_ENTREGA_ORDEN_DESPACHO,PESO_KG_TOTAL_ORDEN_DESPACHO,ESTADO_ORDEN_DESPACHADO,ID_VEHICULO,ID_TRANSPORTISTA,ID_SUCURSAL) VALUES(:nom,SYSDATE,TO_DATE(:fent,'YYYY-MM-DD'),:peso,'P',:veh,:trans,:suc) RETURNING ID_ORDEN_DESPACHO INTO :p_id_out",
            [OracleHelper.P("nom",d.NombreOrdenDespacho),OracleHelper.P("fent",d.FechaEntregaOrdenDespacho),OracleHelper.PDec("peso",d.PesoKgTotalOrdenDespacho),OracleHelper.PInt("veh",d.IdVehiculo),OracleHelper.PInt("trans",d.IdTransportista),OracleHelper.PInt("suc",d.IdSucursal),OracleHelper.POut("p_id_out")]);
        return Created($"api/ordenes-despacho/{id}", new { id });
    }
    [HttpPut("{id:long}")] public IActionResult Update(long id,[FromBody] DespachoDto d)
    {
        _db.ExecuteNonQuery("UPDATE ORDEN_DESPACHADO SET ESTADO_ORDEN_DESPACHADO=NVL(:est,ESTADO_ORDEN_DESPACHADO) WHERE ID_ORDEN_DESPACHO=:p",[OracleHelper.P("est",d.EstadoOrdenDespachado),OracleHelper.PInt("p",id)]);return Ok();
    }
    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        _db.ExecuteNonQuery("UPDATE ORDEN_DESPACHADO SET ESTADO_ORDEN_DESPACHADO='C' WHERE ID_ORDEN_DESPACHO=:p",[OracleHelper.PInt("p",id)]);return Ok();
    }
}
public record DespachoDto(string? NombreOrdenDespacho, string? FechaEntregaOrdenDespacho, decimal? PesoKgTotalOrdenDespacho, string? EstadoOrdenDespachado, long? IdVehiculo, long? IdTransportista, long? IdSucursal);


[Route("api/devoluciones-venta")]
public class DevolucionesVentaController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll() =>
        OkList(_db.ExecuteReader("SELECT DV.*,OV.NUMERO_ORDEN_VENTA FROM DEVOLUCION_VENTA DV LEFT JOIN ORDEN_VENTA OV ON OV.ID_ORDEN_VENTA=DV.ID_ORDEN_VENTA ORDER BY DV.FECHA_DEVOLUCION_VENTA DESC"));
    [HttpPost] public IActionResult Create([FromBody] DevolucionDto d)
    {
        var id = _db.ExecuteInsert("INSERT INTO DEVOLUCION_VENTA(NUMERO_DEVOLUCION,MOTIVO_DEVOLUCION,FECHA_DEVOLUCION_VENTA,TOTAL_DEVOLUCION_VENTA,ESTADO_DEVOLUCION_VENTA,ID_ORDEN_VENTA) VALUES(:num,:mot,SYSDATE,:tot,'P',:ov) RETURNING ID_DEVOLUCION_VENTA INTO :p_id_out",
            [OracleHelper.P("num",d.NumeroDevolucion),OracleHelper.P("mot",d.MotivoDevolucion),OracleHelper.PDec("tot",d.TotalDevolucionVenta),OracleHelper.PInt("ov",d.IdOrdenVenta),OracleHelper.POut("p_id_out")]);
        return Created($"api/devoluciones-venta/{id}", new { id });
    }
    [HttpPut("{id:long}")] public IActionResult Update(long id,[FromBody] DevolucionDto d)
    {
        _db.ExecuteNonQuery("UPDATE DEVOLUCION_VENTA SET ESTADO_DEVOLUCION_VENTA=NVL(:est,ESTADO_DEVOLUCION_VENTA) WHERE ID_DEVOLUCION_VENTA=:p",[OracleHelper.P("est",d.EstadoDevolucionVenta),OracleHelper.PInt("p",id)]);return Ok();
    }
    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        _db.ExecuteNonQuery("UPDATE DEVOLUCION_VENTA SET ESTADO_DEVOLUCION_VENTA='C' WHERE ID_DEVOLUCION_VENTA=:p",[OracleHelper.PInt("p",id)]);return Ok();
    }
}
public record DevolucionDto(string? NumeroDevolucion, string? MotivoDevolucion, decimal? TotalDevolucionVenta, string? EstadoDevolucionVenta, long? IdOrdenVenta);


[Route("api/entregas")]
public class EntregasController(OracleHelper db) : BaseController(db)
{
    [HttpGet] public IActionResult GetAll() =>
        OkList(_db.ExecuteReader("SELECT E.*,OD.NOMBRE_ORDEN_DESPACHO FROM ENTREGA E LEFT JOIN ORDEN_DESPACHADO OD ON OD.ID_ORDEN_DESPACHO=E.ID_ORDEN_DESPACHO ORDER BY E.FECHA_ENTREGA DESC"));
    [HttpPost] public IActionResult Create([FromBody] EntregaDto d)
    {
        var id = _db.ExecuteInsert("INSERT INTO ENTREGA(FECHA_ENTREGA,OBSERVACIONES_ENTREGA,ESTADO_ENTREGA,ID_ORDEN_DESPACHO) VALUES(SYSDATE,:obs,'P',:od) RETURNING ID_ENTREGA INTO :p_id_out",
            [OracleHelper.P("obs",d.ObservacionesEntrega),OracleHelper.PInt("od",d.IdOrdenDespacho),OracleHelper.POut("p_id_out")]);
        return Created($"api/entregas/{id}", new { id });
    }
    [HttpPut("{id:long}")] public IActionResult Update(long id,[FromBody] EntregaDto d)
    {
        _db.ExecuteNonQuery("UPDATE ENTREGA SET ESTADO_ENTREGA=NVL(:est,ESTADO_ENTREGA) WHERE ID_ENTREGA=:p",[OracleHelper.P("est",d.EstadoEntrega),OracleHelper.PInt("p",id)]);return Ok();
    }
    [HttpDelete("{id:long}")] public IActionResult Delete(long id)
    {
        _db.ExecuteNonQuery("UPDATE ENTREGA SET ESTADO_ENTREGA='C' WHERE ID_ENTREGA=:p",[OracleHelper.PInt("p",id)]);return Ok();
    }
}
public record EntregaDto(string? ObservacionesEntrega, string? EstadoEntrega, long? IdOrdenDespacho);


// ── Dashboard ─────────────────────────────────────────────────
// El controlador de dashboard antiguo se eliminó para evitar conflictos de rutas.
// Las APIs del dashboard ahora están centralizadas en Controllers/Dashboard/DashboardController.cs
