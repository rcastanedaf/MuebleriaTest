using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MuebleriaCore.Data;
using Oracle.ManagedDataAccess.Client;

namespace MuebleriaCore.Controllers.Dashboard;

[Route("api/dashboard")]
[ApiController]
public class DashboardController : BaseController
{
    public DashboardController(OracleHelper db) : base(db) { }

    // ── GET /api/dashboard/stats ───────────────────────────────
    /// <summary>
    /// Obtiene las estadísticas principales del dashboard
    /// </summary>
    [HttpGet("stats")]
    public IActionResult GetStats()
    {
        try
        {
            var sql = @"
            SELECT 
                (SELECT COUNT(*) FROM ARTICULO WHERE ESTADO_ARTICULO = 'A') AS ARTICULOS_ACTIVOS,
                (SELECT COUNT(*) FROM ORDEN_VENTA WHERE ESTADO_ORDEN_VENTA IN ('P', 'E')) AS ORDENES_PENDIENTES,
                (SELECT COUNT(*) FROM CLIENTE WHERE ESTADO_CLIENTE = 'A') AS CLIENTES_ACTIVOS,
                (SELECT COUNT(*) FROM ORDEN_DESPACHADO WHERE ESTADO_ORDEN_DESPACHADO IN ('P', 'E')) AS DESPACHOS_EN_RUTA
            FROM DUAL";

            var dt = _db.ExecuteReader(sql);
            if (dt.Rows.Count == 0)
                return Ok(new { articulosActivos = 0, ordenesPendientes = 0, clientesActivos = 0, despachosEnRuta = 0 });

            var row = dt.Rows[0];
            return Ok(new
            {
                articulosActivos = Convert.ToInt32(row["ARTICULOS_ACTIVOS"]),
                ordenesPendientes = Convert.ToInt32(row["ORDENES_PENDIENTES"]),
                clientesActivos = Convert.ToInt32(row["CLIENTES_ACTIVOS"]),
                despachosEnRuta = Convert.ToInt32(row["DESPACHOS_EN_RUTA"])
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // ── GET /api/dashboard/sales-summary ───────────────────────
    /// <summary>
    /// Resumen de ventas del mes actual
    /// </summary>
    [HttpGet("sales-summary")]
    public IActionResult GetSalesSummary()
    {
        try
        {
            var sql = @"
            SELECT 
                COUNT(*) AS TOTAL_ORDENES,
                SUM(TOTAL_ORDEN_VENTA) AS TOTAL_VENTAS,
                AVG(TOTAL_ORDEN_VENTA) AS PROMEDIO_VENTA,
                COUNT(CASE WHEN ESTADO_ORDEN_VENTA = 'P' THEN 1 END) AS ORDENES_PENDIENTES,
                COUNT(CASE WHEN ESTADO_ORDEN_VENTA = 'E' THEN 1 END) AS ORDENES_PROCESO,
                COUNT(CASE WHEN ESTADO_ORDEN_VENTA = 'C' THEN 1 END) AS ORDENES_COMPLETADAS
            FROM ORDEN_VENTA
            WHERE TRUNC(FECHA_SOLICITUD_ORDEN_VENTA) >= TRUNC(SYSDATE, 'MM')";

            var dt = _db.ExecuteReader(sql);
            if (dt.Rows.Count == 0 || dt.Rows[0]["TOTAL_ORDENES"] is DBNull)
                return Ok(new { totalOrdenes = 0, totalVentas = 0, promedioVenta = 0, ordenesPendientes = 0, ordenesEnProceso = 0, ordenesCompletadas = 0 });

            var row = dt.Rows[0];
            return Ok(new
            {
                totalOrdenes = Convert.ToInt32(row["TOTAL_ORDENES"]),
                totalVentas = row["TOTAL_VENTAS"] is DBNull ? 0 : Convert.ToDecimal(row["TOTAL_VENTAS"]),
                promedioVenta = row["PROMEDIO_VENTA"] is DBNull ? 0 : Convert.ToDecimal(row["PROMEDIO_VENTA"]),
                ordenesPendientes = Convert.ToInt32(row["ORDENES_PENDIENTES"]),
                ordenesEnProceso = Convert.ToInt32(row["ORDENES_PROCESO"]),
                ordenesCompletadas = Convert.ToInt32(row["ORDENES_COMPLETADAS"])
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // ── GET /api/dashboard/top-products ────────────────────────
    /// <summary>
    /// Top 5 artículos más vendidos del mes
    /// </summary>
    [HttpGet("top-products")]
    public IActionResult GetTopProducts()
    {
        try
        {
            var sql = @"
            SELECT 
                A.CODIGO_ARTICULO,
                A.NOMBRE_ARTICULO,
                SUM(OVD.CANTIDAD_SOLICITUD_VENTA_COMPRA_DETALLE) AS CANTIDAD_VENDIDA,
                SUM(OVD.SUBTOTAL_ORDEN_VENTA_DETALLE) AS TOTAL_VENDIDO
            FROM ORDEN_VENTA_DETALLE OVD
            JOIN ARTICULO A ON A.ID_ARTICULO = OVD.ID_ARTICULO
            JOIN ORDEN_VENTA OV ON OV.ID_ORDEN_VENTA = OVD.ID_ORDEN_VENTA
            WHERE TRUNC(OV.FECHA_SOLICITUD_ORDEN_VENTA) >= TRUNC(SYSDATE, 'MM')
            GROUP BY A.CODIGO_ARTICULO, A.NOMBRE_ARTICULO
            ORDER BY CANTIDAD_VENDIDA DESC
            FETCH FIRST 5 ROWS ONLY";

            var dt = _db.ExecuteReader(sql);
            var lista = OracleHelper.ToList(dt);
            
            return Ok(lista.Select(x => new
            {
                codigo = x["codigoArticulo"],
                nombre = x["nombreArticulo"],
                cantidadVendida = x["cantidadVendida"],
                totalVendido = x["totalVendido"]
            }).ToList());
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // ── GET /api/dashboard/sales-by-month ──────────────────────
    /// <summary>
    /// Ingresos por mes (últimos 6 meses)
    /// </summary>
    [HttpGet("sales-by-month")]
    public IActionResult GetSalesByMonth()
    {
        try
        {
            var sql = @"
            SELECT 
                TO_CHAR(FECHA_SOLICITUD_ORDEN_VENTA, 'YYYY-MM') AS MES,
                SUM(TOTAL_ORDEN_VENTA) AS TOTAL
            FROM ORDEN_VENTA
            WHERE FECHA_SOLICITUD_ORDEN_VENTA >= ADD_MONTHS(TRUNC(SYSDATE, 'MM'), -5)
                  AND ESTADO_ORDEN_VENTA = 'C'
            GROUP BY TO_CHAR(FECHA_SOLICITUD_ORDEN_VENTA, 'YYYY-MM')
            ORDER BY MES ASC";

            var dt = _db.ExecuteReader(sql);
            var lista = OracleHelper.ToList(dt);

            return Ok(lista.Select(x => new
            {
                mes = x["mes"],
                total = x["total"] is DBNull ? 0 : Convert.ToDecimal(x["total"])
            }).ToList());
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // ── GET /api/dashboard/low-stock ──────────────────────────
    /// <summary>
    /// Artículos con stock bajo (menor al stock mínimo)
    /// </summary>
    [HttpGet("low-stock")]
    public IActionResult GetLowStock()
    {
        try
        {
            var sql = @"
            SELECT 
                A.CODIGO_ARTICULO,
                A.NOMBRE_ARTICULO,
                NVL(SA.CANTIDAD_DISPONIBLE_STOCK_ARTICULO, 0) AS STOCK_ACTUAL,
                A.STOCK_MINIMO,
                CASE 
                    WHEN NVL(SA.CANTIDAD_DISPONIBLE_STOCK_ARTICULO, 0) <= A.STOCK_MINIMO THEN 'CRITICO'
                    WHEN NVL(SA.CANTIDAD_DISPONIBLE_STOCK_ARTICULO, 0) <= A.STOCK_MINIMO * 1.5 THEN 'BAJO'
                    ELSE 'OK'
                END AS ESTADO
            FROM ARTICULO A
            LEFT JOIN STOCK_ARTICULO SA ON SA.ID_ARTICULO = A.ID_ARTICULO
            WHERE A.ESTADO_ARTICULO = 'A'
                  AND NVL(SA.CANTIDAD_DISPONIBLE_STOCK_ARTICULO, 0) <= A.STOCK_MINIMO * 1.5
            ORDER BY SA.CANTIDAD_DISPONIBLE_STOCK_ARTICULO ASC
            FETCH FIRST 10 ROWS ONLY";

            var dt = _db.ExecuteReader(sql);
            var lista = OracleHelper.ToList(dt);

            return Ok(lista.Select(x => new
            {
                codigo = x["codigoArticulo"],
                nombre = x["nombreArticulo"],
                stockActual = x["stockActual"],
                stockMinimo = x["stockMinimo"],
                estado = x["estado"]
            }).ToList());
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // ── GET /api/dashboard/pending-orders ──────────────────────
    /// <summary>
    /// Órdenes de compra pendientes
    /// </summary>
    [HttpGet("pending-orders")]
    public IActionResult GetPendingOrders()
    {
        try
        {
            var sql = @"
            SELECT 
                COUNT(*) AS TOTAL_PENDIENTES,
                COUNT(CASE WHEN OC.ESTADO_ORDEN_COMPRA = 'P' THEN 1 END) AS ORDENES_PENDIENTES,
                COUNT(CASE WHEN OC.ESTADO_ORDEN_COMPRA = 'E' THEN 1 END) AS ORDENES_PROCESO
            FROM ORDEN_COMPRA OC
            WHERE OC.ESTADO_ORDEN_COMPRA IN ('P', 'E')";

            var dt = _db.ExecuteReader(sql);
            if (dt.Rows.Count == 0)
                return Ok(new { totalPendientes = 0, ordenesPendientes = 0, ordenesEnProceso = 0 });

            var row = dt.Rows[0];
            return Ok(new
            {
                totalPendientes = Convert.ToInt32(row["TOTAL_PENDIENTES"]),
                ordenesPendientes = Convert.ToInt32(row["ORDENES_PENDIENTES"]),
                ordenesEnProceso = Convert.ToInt32(row["ORDENES_PROCESO"])
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // ── GET /api/dashboard/new-clients ───────────────────────
    /// <summary>
    /// Clientes nuevos del mes
    /// </summary>
    [HttpGet("new-clients")]
    public IActionResult GetNewClients()
    {
        try
        {
            var sql = @"
            SELECT 
                COUNT(DISTINCT C.ID_CLIENTE) AS TOTAL_NUEVOS,
                COUNT(DISTINCT CASE WHEN OV.ESTADO_ORDEN_VENTA = 'C' THEN OV.ID_CLIENTE END) AS CLIENTES_CON_COMPRAS
            FROM CLIENTE C
            LEFT JOIN ORDEN_VENTA OV ON OV.ID_CLIENTE = C.ID_CLIENTE
            WHERE C.ESTADO_CLIENTE = 'A'
              AND C.ID_CLIENTE IN (
                    SELECT ID_CLIENTE
                    FROM ORDEN_VENTA
                    WHERE TRUNC(FECHA_SOLICITUD_ORDEN_VENTA) >= TRUNC(SYSDATE, 'MM')
                )";

            var dt = _db.ExecuteReader(sql);
            if (dt.Rows.Count == 0)
                return Ok(new { totalNuevos = 0, clientesConCompras = 0 });

            var row = dt.Rows[0];
            return Ok(new
            {
                totalNuevos = Convert.ToInt32(row["TOTAL_NUEVOS"]),
                clientesConCompras = Convert.ToInt32(row["CLIENTES_CON_COMPRAS"] is DBNull ? 0 : row["CLIENTES_CON_COMPRAS"])
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // ── GET /api/dashboard/inventory-by-category ──────────────
    /// <summary>
    /// Resumen de inventario por categoría
    /// </summary>
    [HttpGet("inventory-by-category")]
    public IActionResult GetInventoryByCategory()
    {
        try
        {
            var sql = @"
            SELECT 
                CA.NOMBRE_CATEGORIA_ARTICULO AS CATEGORIA,
                COUNT(A.ID_ARTICULO) AS TOTAL_ARTICULOS,
                SUM(NVL(SA.CANTIDAD_DISPONIBLE_STOCK_ARTICULO, 0)) AS CANTIDAD_TOTAL
            FROM ARTICULO A
            LEFT JOIN CATEGORIAS_ARTICULO CA ON CA.ID_CATEGORIAS_ARTICULO = A.ID_CATEGORIA_ARTICULO
            LEFT JOIN STOCK_ARTICULO SA ON SA.ID_ARTICULO = A.ID_ARTICULO
            WHERE A.ESTADO_ARTICULO = 'A'
            GROUP BY CA.NOMBRE_CATEGORIA_ARTICULO
            ORDER BY CANTIDAD_TOTAL DESC";

            var dt = _db.ExecuteReader(sql);
            var lista = OracleHelper.ToList(dt);

            return Ok(lista.Select(x => new
            {
                categoria = x["categoria"],
                totalArticulos = x["totalArticulos"],
                cantidadTotal = x["cantidadTotal"]
            }).ToList());
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // ── GET /api/dashboard/recent-sales ────────────────────────
    /// <summary>
    /// Últimas órdenes de venta
    /// </summary>
    [HttpGet("recent-sales")]
    public IActionResult GetRecentSales(int limit = 10)
    {
        try
        {
            var sql = @"
            SELECT 
                OV.ID_ORDEN_VENTA,
                OV.NUMERO_ORDEN_VENTA,
                OV.FECHA_SOLICITUD_ORDEN_VENTA,
                OV.TOTAL_ORDEN_VENTA,
                OV.ESTADO_ORDEN_VENTA,
                C.RAZON_SOCIAL_CLIENTE
            FROM ORDEN_VENTA OV
            LEFT JOIN CLIENTE C ON C.ID_CLIENTE = OV.ID_CLIENTE
            ORDER BY OV.FECHA_SOLICITUD_ORDEN_VENTA DESC
            FETCH FIRST :p_limit ROWS ONLY";

            var dt = _db.ExecuteReader(sql, [OracleHelper.PInt("p_limit", limit)]);
            var lista = OracleHelper.ToList(dt);

            return Ok(lista.Select(x => new
            {
                id = x["idOrdenVenta"],
                numero = x["numeroOrdenVenta"],
                fecha = x["fechaSolicitudOrdenVenta"],
                total = x["totalOrdenVenta"],
                estado = x["estadoOrdenVenta"],
                cliente = x["razonSocialCliente"]
            }).ToList());
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // ── GET /api/dashboard/dispatch-status ─────────────────────
    /// <summary>
    /// Estado de despachos en progreso
    /// </summary>
    [HttpGet("dispatch-status")]
    public IActionResult GetDispatchStatus()
    {
        try
        {
            var sql = @"
            SELECT 
                COUNT(*) AS TOTAL_DESPACHOS,
                COUNT(CASE WHEN ESTADO_ORDEN_DESPACHADO = 'P' THEN 1 END) AS PENDIENTES,
                COUNT(CASE WHEN ESTADO_ORDEN_DESPACHADO = 'E' THEN 1 END) AS EN_PROGRESO,
                COUNT(CASE WHEN ESTADO_ORDEN_DESPACHADO = 'C' THEN 1 END) AS COMPLETADOS
            FROM ORDEN_DESPACHADO
            WHERE TRUNC(FECHA_CREA_ORDEN_DESPACHO) >= TRUNC(SYSDATE, 'MM')";

            var dt = _db.ExecuteReader(sql);
            if (dt.Rows.Count == 0)
                return Ok(new { totalDespachos = 0, pendientes = 0, enProgreso = 0, completados = 0 });

            var row = dt.Rows[0];
            return Ok(new
            {
                totalDespachos = Convert.ToInt32(row["TOTAL_DESPACHOS"]),
                pendientes = Convert.ToInt32(row["PENDIENTES"]),
                enProgreso = Convert.ToInt32(row["EN_PROGRESO"]),
                completados = Convert.ToInt32(row["COMPLETADOS"])
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}
