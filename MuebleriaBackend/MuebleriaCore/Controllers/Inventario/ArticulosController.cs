using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MuebleriaCore.Data;
using Oracle.ManagedDataAccess.Client;

namespace MuebleriaCore.Controllers.Inventario;

[Route("api/articulos")]
public class ArticulosController : BaseController
{
    public ArticulosController(OracleHelper db) : base(db) { }

    // ── GET /api/articulos ────────────────────────────────────
    [HttpGet]
    [AllowAnonymous]
    public IActionResult GetAll(
        [FromQuery] string? tipo   = null,
        [FromQuery] string? search = null,
        [FromQuery] bool soloActivos = true)
    {
        // SELECT via VW_ARTICULOS
        var sql = @"
            SELECT *
            FROM   VW_ARTICULOS
            WHERE  (:p_solo = 0 OR ESTADO_ARTICULO = 'A')
              AND  (:p_tipo IS NULL OR UPPER(TIPO_ARTICULO) = UPPER(:p_tipo))
              AND  (:p_search IS NULL
                    OR UPPER(NOMBRE_ARTICULO) LIKE UPPER(:p_search)
                    OR UPPER(CODIGO_ARTICULO) LIKE UPPER(:p_search))
            ORDER BY NOMBRE_ARTICULO";

        var q  = string.IsNullOrWhiteSpace(search) ? null : $"%{search}%";
        var dt = _db.ExecuteReader(sql, [
            OracleHelper.PInt("p_solo",   soloActivos ? 1 : 0),
            OracleHelper.P("p_tipo",      tipo),
            OracleHelper.P("p_search",    q)
        ]);
        return OkList(dt);
    }

    // ── GET /api/articulos/{id} ───────────────────────────────
    [HttpGet("{id:long}")]
    public IActionResult GetById(long id)
    {
        // SELECT via VW_ARTICULOS
        var dt = _db.ExecuteReader(
            "SELECT * FROM VW_ARTICULOS WHERE ID_ARTICULO = :p_id",
            [OracleHelper.PInt("p_id", id)]);
        if (dt.Rows.Count == 0) return NotFound();
        return Ok(OracleHelper.ToList(dt)[0]);
    }

    // ── POST /api/articulos ───────────────────────────────────
    [HttpPost]
    public IActionResult Create([FromBody] ArticuloDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.NombreArticulo))
            return BadRequest(new { message = "NombreArticulo es requerido." });

        try
        {
            // INSERT via SP_ART_INS
            var newId = _db.ExecuteInsert("SP_ART_INS", [
                OracleHelper.P("p_cod",   dto.CodigoArticulo),
                OracleHelper.P("p_barra", dto.CodigoBarraArticulo),
                OracleHelper.P("p_nom",   dto.NombreArticulo),
                OracleHelper.P("p_desc",  dto.DescripcionArticulo),
                OracleHelper.P("p_tipo",  dto.TipoArticulo),
                OracleHelper.PDec("p_peso",  dto.PesoArticulo),
                OracleHelper.PDec("p_smin",  dto.StockMinimo),
                OracleHelper.PDec("p_smax",  dto.StockMaximo),
                OracleHelper.P("p_est",   dto.EstadoArticulo),
                OracleHelper.P("p_lote",  dto.ManejaLoteArticulo),
                OracleHelper.P("p_serie", dto.ManejaSerieArticulo),
                OracleHelper.PInt("p_cat", dto.IdCategoriaArticulo),
                OracleHelper.POut("p_id_out"),
            ], isStoredProc: true);
            return Created($"api/articulos/{newId}", new { idArticulo = newId });
        }
        catch (OracleException ex) { return HandleOracleError(ex); }
    }

    // ── PUT /api/articulos/{id} ───────────────────────────────
    [HttpPut("{id:long}")]
    public IActionResult Update(long id, [FromBody] ArticuloDto dto)
    {
        try
        {
            // UPDATE via SP_ART_UPD
            _db.ExecuteNonQuery("SP_ART_UPD", [
                OracleHelper.P("p_cod",  dto.CodigoArticulo),
                OracleHelper.P("p_nom",  dto.NombreArticulo),
                OracleHelper.P("p_desc", dto.DescripcionArticulo),
                OracleHelper.P("p_tipo", dto.TipoArticulo),
                OracleHelper.PDec("p_peso", dto.PesoArticulo),
                OracleHelper.PDec("p_smin", dto.StockMinimo),
                OracleHelper.PDec("p_smax", dto.StockMaximo),
                OracleHelper.P("p_est",  dto.EstadoArticulo),
                OracleHelper.PInt("p_cat", dto.IdCategoriaArticulo),
                OracleHelper.PInt("p_id",  id),
            ], isStoredProc: true);

            // UPSERT stock via SP_STOCK_UPSERT
            if (dto.StockDisponible.HasValue)
                _db.ExecuteNonQuery("SP_STOCK_UPSERT", [
                    OracleHelper.PInt("p_id_articulo", id),
                    OracleHelper.PDec("p_stock", dto.StockDisponible.Value),
                ], isStoredProc: true);

            // UPSERT precio via SP_PRECIO_UPSERT
            if (dto.Precio.HasValue)
                _db.ExecuteNonQuery("SP_PRECIO_UPSERT", [
                    OracleHelper.PInt("p_id_articulo", id),
                    OracleHelper.PDec("p_precio", dto.Precio.Value),
                ], isStoredProc: true);

            return Ok(new { message = "Artículo actualizado." });
        }
        catch (OracleException ex) { return HandleOracleError(ex); }
    }

    // ── DELETE /api/articulos/{id} — lógico ───────────────────
    [HttpDelete("{id:long}")]
    public IActionResult Delete(long id)
    {
        // DELETE (lógico) via SP_ART_DEL
        _db.ExecuteNonQuery("SP_ART_DEL",
            [OracleHelper.PInt("p_id", id)],
            isStoredProc: true);
        return Ok(new { message = "Artículo desactivado." });
    }
}

public record ArticuloDto(
    string? CodigoArticulo, string? CodigoBarraArticulo,
    string? NombreArticulo, string? DescripcionArticulo,
    string? TipoArticulo,   decimal? PesoArticulo,
    decimal? StockMinimo,   decimal? StockMaximo,
    string? EstadoArticulo, string? ManejaLoteArticulo,
    string? ManejaSerieArticulo, long? IdCategoriaArticulo,
    decimal? StockDisponible, decimal? Precio);
