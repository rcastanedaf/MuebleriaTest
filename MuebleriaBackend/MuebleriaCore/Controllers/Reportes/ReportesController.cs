// ============================================================
// Reportes requeridos por PDF - Seccion 4
// Todas las consultas apuntan a BD replica (DashboardOracleHelper)
// ============================================================
using Microsoft.AspNetCore.Mvc;
using MuebleriaCore.Data;

namespace MuebleriaCore.Controllers.Reportes;

[Route("api/reportes")]
[ApiController]
public class ReportesController : BaseController
{
    public ReportesController(DashboardOracleHelper db) : base(db) { }

    // ── GET /api/reportes/ventas-diarias ──────────────────────
    // Reporte de ventas diarias agrupadas por tipo de mueble
    // Parametros: fechaInicio, fechaFin, ciudad (opcional)
    [HttpGet("ventas-diarias")]
    public IActionResult VentasDiarias(
        [FromQuery] string? fechaInicio = null,
        [FromQuery] string? fechaFin    = null,
        [FromQuery] string? ciudad      = null)
    {
        try
        {
            var sql = @"
                SELECT *
                FROM   VW_RPT_VENTAS_DIARIAS
                WHERE  (:p_fi IS NULL OR FECHA_VENTA >= TO_DATE(:p_fi, 'YYYY-MM-DD'))
                  AND  (:p_ff IS NULL OR FECHA_VENTA <= TO_DATE(:p_ff, 'YYYY-MM-DD'))
                  AND  (:p_ciu IS NULL OR UPPER(CIUDAD) = UPPER(:p_ciu))
                ORDER BY FECHA_VENTA, TIPO_MUEBLE, NOMBRE_ARTICULO";

            var dt = _db.ExecuteReader(sql, [
                OracleHelper.P("p_fi",  fechaInicio),
                OracleHelper.P("p_ff",  fechaFin),
                OracleHelper.P("p_ciu", ciudad),
            ]);

            var rows    = OracleHelper.ToList(dt);
            var fechaGen = DateTime.Now.ToString("yyyy-MM-dd HH:mm");

            // Agrupar por tipo de mueble para el formato del PDF
            var interior = rows.Where(r => r["tipoMueble"]?.ToString()?.ToUpper() == "INTERIOR").ToList();
            var exterior = rows.Where(r => r["tipoMueble"]?.ToString()?.ToUpper() == "EXTERIOR").ToList();

            var totalGeneral = rows.Sum(r =>
            {
                var v = r["costoTotal"];
                return v is null || v is DBNull ? 0m : Convert.ToDecimal(v);
            });

            return Ok(new
            {
                fechaGeneracion = fechaGen,
                fechaInicio,
                fechaFin,
                ciudad = ciudad ?? "Todas",
                interior,
                exterior,
                totalGeneral
            });
        }
        catch (Exception ex) { return StatusCode(500, new { error = ex.Message }); }
    }

    // ── GET /api/reportes/producto-mas-vendido ────────────────
    // Producto mas vendido por ciudad en un periodo
    [HttpGet("producto-mas-vendido")]
    public IActionResult ProductoMasVendido(
        [FromQuery] string? fechaInicio = null,
        [FromQuery] string? fechaFin    = null,
        [FromQuery] string? ciudad      = null)
    {
        try
        {
            var sql = @"
                SELECT CIUDAD, TIPO_MUEBLE, NOMBRE_ARTICULO, CODIGO_ARTICULO,
                       SUM(TOTAL_VENDIDO) AS TOTAL_VENDIDO
                FROM   VW_RPT_PRODUCTO_VENDIDO
                WHERE  (:p_fi IS NULL OR FECHA_VENTA >= TO_DATE(:p_fi, 'YYYY-MM-DD'))
                  AND  (:p_ff IS NULL OR FECHA_VENTA <= TO_DATE(:p_ff, 'YYYY-MM-DD'))
                  AND  (:p_ciu IS NULL OR UPPER(CIUDAD) = UPPER(:p_ciu))
                GROUP BY CIUDAD, TIPO_MUEBLE, NOMBRE_ARTICULO, CODIGO_ARTICULO
                ORDER BY TOTAL_VENDIDO DESC";

            var dt = _db.ExecuteReader(sql, [
                OracleHelper.P("p_fi",  fechaInicio),
                OracleHelper.P("p_ff",  fechaFin),
                OracleHelper.P("p_ciu", ciudad),
            ]);

            return Ok(new
            {
                fechaGeneracion = DateTime.Now.ToString("yyyy-MM-dd HH:mm"),
                fechaInicio,
                fechaFin,
                ciudad = ciudad ?? "Todas",
                resultados = OracleHelper.ToList(dt)
            });
        }
        catch (Exception ex) { return StatusCode(500, new { error = ex.Message }); }
    }

    // ── GET /api/reportes/compras-cliente/{clienteId} ─────────
    // Compras de un cliente ordenadas por fecha (PDF seccion 4)
    [HttpGet("compras-cliente/{clienteId:long}")]
    public IActionResult ComprasCliente(long clienteId)
    {
        try
        {
            // Cabecera del cliente
            var dtCli = _db.ExecuteReader(
                @"SELECT ID_CLIENTE, NOMBRE_CLIENTE, NUMERO_DOCUMENTO_CLIENTE, EMAIL_CLIENTE
                  FROM   VW_RPT_COMPRAS_CLIENTE
                  WHERE  ID_CLIENTE = :p_cli AND ROWNUM = 1",
                [OracleHelper.PInt("p_cli", clienteId)]);

            // Ordenes del cliente
            var dtOrdenes = _db.ExecuteReader(
                @"SELECT ID_ORDEN_VENTA, NUMERO_ORDEN_VENTA, FECHA_COMPRA,
                         VALOR_COMPRA, FORMA_PAGO, ESTADO_ORDEN_VENTA
                  FROM   VW_RPT_COMPRAS_CLIENTE
                  WHERE  ID_CLIENTE = :p_cli
                  ORDER BY FECHA_COMPRA DESC",
                [OracleHelper.PInt("p_cli", clienteId)]);

            var ordenes       = OracleHelper.ToList(dtOrdenes);
            var clienteInfo   = dtCli.Rows.Count > 0 ? OracleHelper.ToList(dtCli)[0] : null;
            var totalComprado = ordenes.Sum(o =>
            {
                var v = o["valorCompra"];
                return v is null || v is DBNull ? 0m : Convert.ToDecimal(v);
            });

            // Detalle de articulos por orden
            var ordenesConDetalle = new List<object>();
            foreach (var o in ordenes)
            {
                var ovId = Convert.ToInt64(o["idOrdenVenta"]);
                var dtDet = _db.ExecuteReader(
                    @"SELECT NOMBRE_ARTICULO, CANTIDAD, PRECIO_UNITARIO, SUBTOTAL
                      FROM   VW_ORDEN_VENTA_DETALLE
                      WHERE  ID_ORDEN_VENTA = :p_ov",
                    [OracleHelper.PInt("p_ov", ovId)]);

                ordenesConDetalle.Add(new
                {
                    numeroOrden    = o["numeroOrdenVenta"],
                    fechaCompra    = o["fechaCompra"],
                    valorCompra    = o["valorCompra"],
                    formaPago      = o["formaPago"],
                    estado         = o["estadoOrdenVenta"],
                    muebles        = OracleHelper.ToList(dtDet)
                });
            }

            return Ok(new
            {
                fechaGeneracion = DateTime.Now.ToString("yyyy-MM-dd HH:mm"),
                cliente         = clienteInfo,
                totalComprado,
                compras         = ordenesConDetalle
            });
        }
        catch (Exception ex) { return StatusCode(500, new { error = ex.Message }); }
    }

    // ── GET /api/reportes/cierre-caja ─────────────────────────
    // Cierre de caja por fecha (PDF seccion 4)
    [HttpGet("cierre-caja")]
    public IActionResult CierreCaja([FromQuery] string? fecha = null)
    {
        try
        {
            var fechaFiltro = fecha ?? DateTime.Now.ToString("yyyy-MM-dd");

            var dt = _db.ExecuteReader(
                @"SELECT FECHA_CIERRE, FORMA_PAGO, TOTAL_TRANSACCIONES,
                         TOTAL_SUBTOTAL, TOTAL_IMPUESTO, TOTAL_GENERAL
                  FROM   VW_RPT_CIERRE_CAJA
                  WHERE  FECHA_CIERRE = TO_DATE(:p_fecha, 'YYYY-MM-DD')
                  ORDER BY FORMA_PAGO",
                [OracleHelper.P("p_fecha", fechaFiltro)]);

            var filas        = OracleHelper.ToList(dt);
            var totalGeneral = filas.Sum(r =>
            {
                var v = r["totalGeneral"];
                return v is null || v is DBNull ? 0m : Convert.ToDecimal(v);
            });

            return Ok(new
            {
                fechaGeneracion    = DateTime.Now.ToString("yyyy-MM-dd HH:mm"),
                fechaCierre        = fechaFiltro,
                totalGeneral,
                detallesPorMetodo  = filas
            });
        }
        catch (Exception ex) { return StatusCode(500, new { error = ex.Message }); }
    }

    // ── GET /api/reportes/marketing/ltv ──────────────────────
    [HttpGet("marketing/ltv")]
    public IActionResult MarketingLtv([FromQuery] string? ciudad = null)
    {
        try
        {
            var sql = @"
                SELECT *
                FROM   VW_RPT_MARKETING_LTV
                WHERE  (:p_ciu IS NULL OR UPPER(CIUDAD_CLIENTE) = UPPER(:p_ciu))
                ORDER  BY VALOR_TOTAL_VIDA DESC";
            var dt = _db.ExecuteReader(sql, [OracleHelper.P("p_ciu", ciudad)]);
            return Ok(new
            {
                fechaGeneracion = DateTime.Now.ToString("yyyy-MM-dd HH:mm"),
                ciudad = ciudad ?? "Todas",
                clientes = OracleHelper.ToList(dt)
            });
        }
        catch (Exception ex) { return StatusCode(500, new { error = ex.Message }); }
    }

    // ── GET /api/reportes/marketing/actividad ─────────────────
    [HttpGet("marketing/actividad")]
    public IActionResult MarketingActividad(
        [FromQuery] string? fechaInicio = null,
        [FromQuery] string? fechaFin    = null)
    {
        try
        {
            var sql = @"
                SELECT *
                FROM   VW_RPT_MARKETING_ACTIVIDAD
                WHERE  (:p_fi IS NULL OR FECHA_ACTIVIDAD >= TO_DATE(:p_fi, 'YYYY-MM-DD'))
                  AND  (:p_ff IS NULL OR FECHA_ACTIVIDAD <= TO_DATE(:p_ff, 'YYYY-MM-DD'))
                ORDER  BY FECHA_ACTIVIDAD";
            var dt = _db.ExecuteReader(sql, [
                OracleHelper.P("p_fi", fechaInicio),
                OracleHelper.P("p_ff", fechaFin),
            ]);
            var filas = OracleHelper.ToList(dt);
            return Ok(new
            {
                fechaGeneracion = DateTime.Now.ToString("yyyy-MM-dd HH:mm"),
                fechaInicio,
                fechaFin,
                actividad = filas,
                totalOrdenes = filas.Sum(r => { var v = r["totalOrdenes"]; return v is null || v is DBNull ? 0L : Convert.ToInt64(v); }),
                totalVentas  = filas.Sum(r => { var v = r["totalVentas"];  return v is null || v is DBNull ? 0m : Convert.ToDecimal(v); }),
            });
        }
        catch (Exception ex) { return StatusCode(500, new { error = ex.Message }); }
    }

    // ── GET /api/reportes/marketing/retencion ─────────────────
    [HttpGet("marketing/retencion")]
    public IActionResult MarketingRetencion()
    {
        try
        {
            var dt = _db.ExecuteReader(
                "SELECT * FROM VW_RPT_MARKETING_RETENCION ORDER BY TOTAL_COMPRAS DESC");
            var filas = OracleHelper.ToList(dt);
            return Ok(new
            {
                fechaGeneracion = DateTime.Now.ToString("yyyy-MM-dd HH:mm"),
                totalClientesRetenidos = filas.Count,
                clientes = filas
            });
        }
        catch (Exception ex) { return StatusCode(500, new { error = ex.Message }); }
    }

    // ── GET /api/reportes/marketing/cohorte ──────────────────
    [HttpGet("marketing/cohorte")]
    public IActionResult MarketingCohorte()
    {
        try
        {
            var dt = _db.ExecuteReader(
                "SELECT * FROM VW_RPT_MARKETING_COHORTE ORDER BY MES_COHORTE, MES_ACTIVIDAD");
            return Ok(new
            {
                fechaGeneracion = DateTime.Now.ToString("yyyy-MM-dd HH:mm"),
                filas = OracleHelper.ToList(dt)
            });
        }
        catch (Exception ex) { return StatusCode(500, new { error = ex.Message }); }
    }

    // ── GET /api/reportes/marketing/remarketing ───────────────
    [HttpGet("marketing/remarketing")]
    public IActionResult MarketingRemarketing([FromQuery] int diasInactivo = 30)
    {
        try
        {
            var dt = _db.ExecuteReader(
                @"SELECT *
                  FROM   VW_RPT_MARKETING_REMARKETING
                  WHERE  DIAS_INACTIVO >= :p_dias
                  ORDER  BY DIAS_INACTIVO DESC",
                [OracleHelper.PInt("p_dias", diasInactivo)]);
            var filas = OracleHelper.ToList(dt);
            return Ok(new
            {
                fechaGeneracion = DateTime.Now.ToString("yyyy-MM-dd HH:mm"),
                diasInactivo,
                totalClientes = filas.Count,
                clientes = filas
            });
        }
        catch (Exception ex) { return StatusCode(500, new { error = ex.Message }); }
    }

    // ── GET /api/reportes/clientes-lista ─────────────────────
    // Lista completa de clientes con datos del PDF (busqueda por doc/nombre/email)
    [HttpGet("clientes-lista")]
    public IActionResult ClientesLista([FromQuery] string? search = null)
    {
        try
        {
            var sql = @"
                SELECT ID_CLIENTE, NVL(NOMBRES_CLIENTE, RAZON_SOCIAL_CLIENTE) AS NOMBRE_CLIENTE,
                       NUMERO_DOCUMENTO_CLIENTE, EMAIL_CLIENTE,
                       TIPO_DOCUMENTO_CLIENTE, CIUDAD_CLIENTE, PAIS_CLIENTE,
                       TIPO_PERSONA_CLIENTE, ESTADO_CLIENTE
                FROM   VW_CLIENTES
                WHERE  (:p_s IS NULL
                        OR UPPER(NVL(NOMBRES_CLIENTE, RAZON_SOCIAL_CLIENTE)) LIKE UPPER(:p_s)
                        OR UPPER(NVL(NUMERO_DOCUMENTO_CLIENTE,''))            LIKE UPPER(:p_s)
                        OR UPPER(NVL(EMAIL_CLIENTE,''))                       LIKE UPPER(:p_s))
                ORDER BY NVL(NOMBRES_CLIENTE, RAZON_SOCIAL_CLIENTE)";

            var q  = search is null ? null : $"%{search}%";
            var dt = _db.ExecuteReader(sql, [OracleHelper.P("p_s", q)]);
            return OkList(dt);
        }
        catch (Exception ex) { return StatusCode(500, new { error = ex.Message }); }
    }
}
