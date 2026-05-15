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
    [HttpGet("stats")]
    public IActionResult GetStats()
    {
        try
        {
            // SELECT via VW_DASHBOARD_STATS
            var dt = _db.ExecuteReader("SELECT * FROM VW_DASHBOARD_STATS");
            if (dt.Rows.Count == 0)
                return Ok(new { articulosActivos = 0, ordenesPendientes = 0, clientesActivos = 0, despachosEnRuta = 0 });

            var row = dt.Rows[0];
            return Ok(new
            {
                articulosActivos  = Convert.ToInt32(row["ARTICULOS_ACTIVOS"]),
                ordenesPendientes = Convert.ToInt32(row["ORDENES_PENDIENTES"]),
                clientesActivos   = Convert.ToInt32(row["CLIENTES_ACTIVOS"]),
                despachosEnRuta   = Convert.ToInt32(row["DESPACHOS_EN_RUTA"])
            });
        }
        catch (Exception ex) { return StatusCode(500, new { error = ex.Message }); }
    }

    // ── GET /api/dashboard/sales-summary ───────────────────────
    [HttpGet("sales-summary")]
    public IActionResult GetSalesSummary()
    {
        try
        {
            // SELECT via VW_DASHBOARD_VENTAS_MES
            var dt = _db.ExecuteReader("SELECT * FROM VW_DASHBOARD_VENTAS_MES");
            if (dt.Rows.Count == 0 || dt.Rows[0]["TOTAL_ORDENES"] is DBNull)
                return Ok(new { totalOrdenes = 0, totalVentas = 0, promedioVenta = 0, ordenesPendientes = 0, ordenesEnProceso = 0, ordenesCompletadas = 0 });

            var row = dt.Rows[0];
            return Ok(new
            {
                totalOrdenes       = Convert.ToInt32(row["TOTAL_ORDENES"]),
                totalVentas        = row["TOTAL_VENTAS"]   is DBNull ? 0 : Convert.ToDecimal(row["TOTAL_VENTAS"]),
                promedioVenta      = row["PROMEDIO_VENTA"] is DBNull ? 0 : Convert.ToDecimal(row["PROMEDIO_VENTA"]),
                ordenesPendientes  = Convert.ToInt32(row["ORDENES_PENDIENTES"]),
                ordenesEnProceso   = Convert.ToInt32(row["ORDENES_PROCESO"]),
                ordenesCompletadas = Convert.ToInt32(row["ORDENES_COMPLETADAS"])
            });
        }
        catch (Exception ex) { return StatusCode(500, new { error = ex.Message }); }
    }

    // ── GET /api/dashboard/top-products ────────────────────────
    [HttpGet("top-products")]
    public IActionResult GetTopProducts()
    {
        try
        {
            // SELECT via VW_DASHBOARD_TOP_PRODUCTOS (top 5 por cantidad)
            var dt = _db.ExecuteReader(
                "SELECT * FROM VW_DASHBOARD_TOP_PRODUCTOS ORDER BY CANTIDAD_VENDIDA DESC FETCH FIRST 5 ROWS ONLY");
            var lista = OracleHelper.ToList(dt);
            return Ok(lista.Select(x => new
            {
                codigo          = x["codigoArticulo"],
                nombre          = x["nombreArticulo"],
                cantidadVendida = x["cantidadVendida"],
                totalVendido    = x["totalVendido"]
            }).ToList());
        }
        catch (Exception ex) { return StatusCode(500, new { error = ex.Message }); }
    }

    // ── GET /api/dashboard/sales-by-month ──────────────────────
    [HttpGet("sales-by-month")]
    public IActionResult GetSalesByMonth()
    {
        try
        {
            // SELECT via VW_DASHBOARD_VENTAS_POR_MES
            var dt    = _db.ExecuteReader("SELECT * FROM VW_DASHBOARD_VENTAS_POR_MES ORDER BY MES ASC");
            var lista = OracleHelper.ToList(dt);
            return Ok(lista.Select(x => new
            {
                mes   = x["mes"],
                total = x["total"] is DBNull ? 0 : Convert.ToDecimal(x["total"])
            }).ToList());
        }
        catch (Exception ex) { return StatusCode(500, new { error = ex.Message }); }
    }

    // ── GET /api/dashboard/low-stock ──────────────────────────
    [HttpGet("low-stock")]
    public IActionResult GetLowStock()
    {
        try
        {
            // SELECT via VW_DASHBOARD_STOCK_BAJO (top 10 por stock más bajo)
            var dt    = _db.ExecuteReader(
                "SELECT * FROM VW_DASHBOARD_STOCK_BAJO ORDER BY STOCK_ACTUAL ASC FETCH FIRST 10 ROWS ONLY");
            var lista = OracleHelper.ToList(dt);
            return Ok(lista.Select(x => new
            {
                codigo      = x["codigoArticulo"],
                nombre      = x["nombreArticulo"],
                stockActual = x["stockActual"],
                stockMinimo = x["stockMinimo"],
                estado      = x["estado"]
            }).ToList());
        }
        catch (Exception ex) { return StatusCode(500, new { error = ex.Message }); }
    }

    // ── GET /api/dashboard/pending-orders ──────────────────────
    [HttpGet("pending-orders")]
    public IActionResult GetPendingOrders()
    {
        try
        {
            // SELECT via VW_DASHBOARD_OC_PENDIENTES
            var dt = _db.ExecuteReader("SELECT * FROM VW_DASHBOARD_OC_PENDIENTES");
            if (dt.Rows.Count == 0)
                return Ok(new { totalPendientes = 0, ordenesPendientes = 0, ordenesEnProceso = 0 });

            var row = dt.Rows[0];
            return Ok(new
            {
                totalPendientes   = Convert.ToInt32(row["TOTAL_PENDIENTES"]),
                ordenesPendientes = Convert.ToInt32(row["ORDENES_PENDIENTES"]),
                ordenesEnProceso  = Convert.ToInt32(row["ORDENES_PROCESO"])
            });
        }
        catch (Exception ex) { return StatusCode(500, new { error = ex.Message }); }
    }

    // ── GET /api/dashboard/new-clients ───────────────────────
    [HttpGet("new-clients")]
    public IActionResult GetNewClients()
    {
        try
        {
            // SELECT via VW_DASHBOARD_CLIENTES_NUEVOS
            var dt = _db.ExecuteReader("SELECT * FROM VW_DASHBOARD_CLIENTES_NUEVOS");
            if (dt.Rows.Count == 0)
                return Ok(new { totalNuevos = 0, clientesConCompras = 0 });

            var row = dt.Rows[0];
            return Ok(new
            {
                totalNuevos        = Convert.ToInt32(row["TOTAL_NUEVOS"]),
                clientesConCompras = Convert.ToInt32(row["CLIENTES_CON_COMPRAS"] is DBNull ? 0 : row["CLIENTES_CON_COMPRAS"])
            });
        }
        catch (Exception ex) { return StatusCode(500, new { error = ex.Message }); }
    }

    // ── GET /api/dashboard/inventory-by-category ──────────────
    [HttpGet("inventory-by-category")]
    public IActionResult GetInventoryByCategory()
    {
        try
        {
            // SELECT via VW_DASHBOARD_INV_CATEGORIA
            var dt    = _db.ExecuteReader("SELECT * FROM VW_DASHBOARD_INV_CATEGORIA ORDER BY CANTIDAD_TOTAL DESC");
            var lista = OracleHelper.ToList(dt);
            return Ok(lista.Select(x => new
            {
                categoria      = x["categoria"],
                totalArticulos = x["totalArticulos"],
                cantidadTotal  = x["cantidadTotal"]
            }).ToList());
        }
        catch (Exception ex) { return StatusCode(500, new { error = ex.Message }); }
    }

    // ── GET /api/dashboard/recent-sales ────────────────────────
    [HttpGet("recent-sales")]
    public IActionResult GetRecentSales(int limit = 10)
    {
        try
        {
            // SELECT via VW_ORDENES_VENTA (reutiliza la vista de órdenes)
            var dt    = _db.ExecuteReader(
                "SELECT * FROM VW_ORDENES_VENTA ORDER BY FECHA_SOLICITUD_ORDEN_VENTA DESC FETCH FIRST :p_limit ROWS ONLY",
                [OracleHelper.PInt("p_limit", limit)]);
            var lista = OracleHelper.ToList(dt);
            return Ok(lista.Select(x => new
            {
                id      = x["idOrdenVenta"],
                numero  = x["numeroOrdenVenta"],
                fecha   = x["fechaSolicitudOrdenVenta"],
                total   = x["totalOrdenVenta"],
                estado  = x["estadoOrdenVenta"],
                cliente = x["razonSocialCliente"]
            }).ToList());
        }
        catch (Exception ex) { return StatusCode(500, new { error = ex.Message }); }
    }

    // ── GET /api/dashboard/dispatch-status ─────────────────────
    [HttpGet("dispatch-status")]
    public IActionResult GetDispatchStatus()
    {
        try
        {
            // SELECT via VW_DASHBOARD_ESTADO_DESPACHOS
            var dt = _db.ExecuteReader("SELECT * FROM VW_DASHBOARD_ESTADO_DESPACHOS");
            if (dt.Rows.Count == 0)
                return Ok(new { totalDespachos = 0, pendientes = 0, enProgreso = 0, completados = 0 });

            var row = dt.Rows[0];
            return Ok(new
            {
                totalDespachos = Convert.ToInt32(row["TOTAL_DESPACHOS"]),
                pendientes     = Convert.ToInt32(row["PENDIENTES"]),
                enProgreso     = Convert.ToInt32(row["EN_PROGRESO"]),
                completados    = Convert.ToInt32(row["COMPLETADOS"])
            });
        }
        catch (Exception ex) { return StatusCode(500, new { error = ex.Message }); }
    }
}
