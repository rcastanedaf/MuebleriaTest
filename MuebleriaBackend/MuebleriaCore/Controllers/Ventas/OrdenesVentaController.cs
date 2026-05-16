using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MuebleriaCore.Data;
using MuebleriaCore.Services;
using Oracle.ManagedDataAccess.Client;

namespace MuebleriaCore.Controllers.Ventas;

[Route("api/ordenes-venta")]
public class OrdenesVentaController : BaseController
{
    private readonly EmailService _email;

    public OrdenesVentaController(OracleHelper db, EmailService email) : base(db)
    {
        _email = email;
    }

    // ── GET /api/ordenes-venta ────────────────────────────────
    [HttpGet]
    public IActionResult GetAll(
        [FromQuery] string? estado   = null,
        [FromQuery] int     page     = 1,
        [FromQuery] int     pageSize = 20)
    {
        // SELECT via VW_ORDENES_VENTA
        var dt = _db.ExecuteReader(@"
            SELECT *
            FROM   VW_ORDENES_VENTA
            WHERE  (:p_estado IS NULL OR ESTADO_ORDEN_VENTA = :p_estado)
            ORDER BY FECHA_SOLICITUD_ORDEN_VENTA DESC
            OFFSET :p_offset ROWS FETCH NEXT :p_size ROWS ONLY",
            [
                OracleHelper.P("p_estado", estado),
                OracleHelper.PInt("p_offset", (page - 1) * pageSize),
                OracleHelper.PInt("p_size",   pageSize),
            ]);
        return OkList(dt);
    }

    // ── GET /api/ordenes-venta/{id} ───────────────────────────
    [HttpGet("{id:long}")]
    public IActionResult GetById(long id)
    {
        // SELECT cabecera via VW_ORDENES_VENTA
        var dtHead = _db.ExecuteReader(
            "SELECT * FROM VW_ORDENES_VENTA WHERE ID_ORDEN_VENTA = :p_id",
            [OracleHelper.PInt("p_id", id)]);
        if (dtHead.Rows.Count == 0) return NotFound();

        // SELECT detalle via VW_ORDEN_VENTA_DETALLE
        var dtDet = _db.ExecuteReader(
            "SELECT * FROM VW_ORDEN_VENTA_DETALLE WHERE ID_ORDEN_VENTA = :p_id",
            [OracleHelper.PInt("p_id", id)]);

        return Ok(new
        {
            cabecera = OracleHelper.ToList(dtHead)[0],
            detalle  = OracleHelper.ToList(dtDet)
        });
    }

    // ── GET /api/ordenes-venta/cliente/{clienteId} ────────────
    [HttpGet("cliente/{clienteId:long}")]
    public IActionResult GetByCliente(long clienteId)
    {
        // SELECT via VW_ORDENES_VENTA
        var dt = _db.ExecuteReader(@"
            SELECT ID_ORDEN_VENTA   AS ID,
                   NUMERO_ORDEN_VENTA AS NUMERO,
                   FECHA_SOLICITUD_ORDEN_VENTA AS FECHA,
                   TOTAL_ORDEN_VENTA  AS TOTAL,
                   ESTADO_ORDEN_VENTA AS ESTADO
            FROM   VW_ORDENES_VENTA
            WHERE  ID_CLIENTE = :p_cli
            ORDER BY FECHA_SOLICITUD_ORDEN_VENTA DESC",
            [OracleHelper.PInt("p_cli", clienteId)]);
        return OkList(dt);
    }

    // ── POST /api/ordenes-venta — checkout del portal ─────────
    [HttpPost]
    public IActionResult Create([FromBody] OrdenVentaDto dto)
    {
        if (dto.Items == null || dto.Items.Count == 0)
            return BadRequest(new { message = "La orden debe tener al menos un artículo." });

        var numOV = $"OV-{DateTime.Now:yyyyMMddHHmmss}-{CurrentUserId}";

        try
        {
            using var conn = _db.GetConnection();
            using var txn  = conn.BeginTransaction();

            // 1) INSERT ORDEN_VENTA via SP_OV_INS
            long idOV;
            using (var cmd = new OracleCommand("SP_OV_INS", conn)
                { CommandType = System.Data.CommandType.StoredProcedure, Transaction = txn, BindByName = true })
            {
                cmd.Parameters.Add(OracleHelper.P("p_num",    numOV));
                cmd.Parameters.Add(OracleHelper.PDec("p_sub", dto.Subtotal));
                cmd.Parameters.Add(OracleHelper.PDec("p_imp", dto.Impuesto));
                cmd.Parameters.Add(OracleHelper.PDec("p_tot", dto.Total));
                cmd.Parameters.Add(OracleHelper.PInt("p_cli",    dto.ClienteId));
                cmd.Parameters.Add(OracleHelper.PInt("p_ucrea",  CurrentUserId));
                cmd.Parameters.Add(OracleHelper.P("p_metodo",   dto.MetodoPago ?? "card"));
                cmd.Parameters.Add(OracleHelper.POut("p_id_out"));
                cmd.ExecuteNonQuery();
                idOV = OracleHelper.ConvertOracleToLong(cmd.Parameters["p_id_out"].Value);
            }

            // 2) Detalle + descuento de stock por cada ítem
            foreach (var item in dto.Items)
            {
                // INSERT ORDEN_VENTA_DETALLE via SP_OV_DET_INS
                using var cmdD = new OracleCommand("SP_OV_DET_INS", conn)
                    { CommandType = System.Data.CommandType.StoredProcedure, Transaction = txn, BindByName = true };
                cmdD.Parameters.Add(OracleHelper.PDec("p_cant",   item.Cantidad));
                cmdD.Parameters.Add(OracleHelper.PDec("p_precio", item.PrecioUnitario));
                cmdD.Parameters.Add(OracleHelper.PDec("p_sub",    item.Cantidad * item.PrecioUnitario));
                cmdD.Parameters.Add(OracleHelper.PInt("p_art",    item.ArticuloId));
                cmdD.Parameters.Add(OracleHelper.PInt("p_ov",     idOV));
                cmdD.ExecuteNonQuery();

                // UPDATE stock via SP_STOCK_DESCONTAR
                using var cmdS = new OracleCommand("SP_STOCK_DESCONTAR", conn)
                    { CommandType = System.Data.CommandType.StoredProcedure, Transaction = txn, BindByName = true };
                cmdS.Parameters.Add(OracleHelper.PDec("p_cant", item.Cantidad));
                cmdS.Parameters.Add(OracleHelper.PInt("p_art",  item.ArticuloId));
                cmdS.ExecuteNonQuery();
            }

            txn.Commit();

            // Send confirmation email asynchronously (fire-and-forget; order is already committed)
            _ = Task.Run(async () =>
            {
                var dtCli = _db.ExecuteReader(
                    "SELECT EMAIL_CLIENTE, NVL(NOMBRES_CLIENTE, RAZON_SOCIAL_CLIENTE) AS NOM FROM CLIENTE WHERE ID_CLIENTE = :p",
                    [OracleHelper.PInt("p", dto.ClienteId)]);
                if (dtCli.Rows.Count > 0)
                {
                    var emailCli = dtCli.Rows[0]["EMAIL_CLIENTE"]?.ToString() ?? "";
                    var nomCli   = dtCli.Rows[0]["NOM"]?.ToString() ?? "";
                    if (!string.IsNullOrWhiteSpace(emailCli))
                        await _email.SendOrderConfirmationAsync(emailCli, nomCli, numOV, dto.Total);
                }
            });

            return Ok(new
            {
                id     = idOV,
                numero = numOV,
                fecha  = DateTime.Now.ToString("yyyy-MM-dd"),
                total  = dto.Total,
                estado = "P"
            });
        }
        catch (OracleException ex) { return HandleOracleError(ex); }
    }

    // ── PUT /api/ordenes-venta/{id} ───────────────────────────
    [HttpPut("{id:long}")]
    public IActionResult Update(long id, [FromBody] OrdenVentaUpdateDto dto)
    {
        // UPDATE via SP_OV_UPD
        _db.ExecuteNonQuery("SP_OV_UPD", [
            OracleHelper.PDec("p_sub",  dto.Subtotal),
            OracleHelper.PDec("p_imp",  dto.Impuesto),
            OracleHelper.PDec("p_tot",  dto.Total),
            OracleHelper.P("p_est",     dto.Estado),
            OracleHelper.PInt("p_umod", CurrentUserId),
            OracleHelper.PInt("p_id",   id),
        ], isStoredProc: true);
        return Ok(new { message = "Orden de venta actualizada." });
    }
}

public record OrdenVentaDto(
    long ClienteId, decimal Subtotal, decimal Impuesto,
    decimal Total, string MetodoPago, string Descripcion,
    List<ItemVentaDto> Items);

public record ItemVentaDto(long ArticuloId, decimal Cantidad, decimal PrecioUnitario);
public record EstadoDto(string Estado);
public record OrdenVentaUpdateDto(decimal? Subtotal, decimal? Impuesto, decimal? Total, string? Estado);
