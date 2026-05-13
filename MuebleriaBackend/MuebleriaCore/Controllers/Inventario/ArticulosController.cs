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
    public IActionResult GetAll(
        [FromQuery] string? tipo   = null,
        [FromQuery] string? search = null,
        [FromQuery] bool soloActivos = true)
    {
        var sql = @"
            SELECT A.ID_ARTICULO,
                   A.CODIGO_ARTICULO,
                   A.NOMBRE_ARTICULO,
                   A.DESCRIPCION_ARTICULO,
                   A.TIPO_ARTICULO,
                   A.PESO_ARTICULO,
                   A.STOCK_MINIMO,
                   A.STOCK_MAXIMO,
                   A.ESTADO_ARTICULO,
                   A.MANEJA_LOTE_ARTICULO,
                   A.MANEJA_SERIE_ARTICULO,
                   A.ID_CATEGORIA_ARTICULO,
                   CA.NOMBRE_CATEGORIA_ARTICULO,
                   NVL(SA.CANTIDAD_DISPONIBLE_STOCK_ARTICULO, 0) AS STOCK_DISPONIBLE,
                   NVL(LP.PRECIO_LISTA_PRECIOS_DET, 0)          AS PRECIO
            FROM   ARTICULO A
            LEFT JOIN CATEGORIAS_ARTICULO CA
                   ON CA.ID_CATEGORIAS_ARTICULO = A.ID_CATEGORIA_ARTICULO
            LEFT JOIN STOCK_ARTICULO SA
                   ON SA.ID_ARTICULO = A.ID_ARTICULO
            LEFT JOIN LISTA_PRECIOS_DET LP
                   ON LP.ID_ARTICULO = A.ID_ARTICULO
            LEFT JOIN LISTA_PRECIOS LPH
                   ON LPH.ID_LISTA_PRECIOS = LP.ID_LISTA_PRECIOS
                  AND LPH.FECHA_DESDE_LISTA_PRECIOS <= SYSDATE
                  AND (LPH.FECHA_HASTA_LISTA_PRECIOS IS NULL
                       OR LPH.FECHA_HASTA_LISTA_PRECIOS >= SYSDATE)
            WHERE  (:p_solo = 0 OR A.ESTADO_ARTICULO = 'A')
              AND  (:p_tipo IS NULL OR UPPER(A.TIPO_ARTICULO) = UPPER(:p_tipo))
              AND  (:p_search IS NULL
                    OR UPPER(A.NOMBRE_ARTICULO) LIKE UPPER(:p_search)
                    OR UPPER(A.CODIGO_ARTICULO) LIKE UPPER(:p_search))
            ORDER BY A.NOMBRE_ARTICULO";

        var q = string.IsNullOrWhiteSpace(search) ? null : $"%{search}%";
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
        var sql = @"
            SELECT A.*, CA.NOMBRE_CATEGORIA_ARTICULO,
                   NVL(SA.CANTIDAD_DISPONIBLE_STOCK_ARTICULO, 0) AS STOCK_DISPONIBLE,
                   NVL(SA.COSTO_PROMEDIO_STOCK_ARTICULO, 0)     AS COSTO_PROMEDIO,
                   NVL(LP.PRECIO_LISTA_PRECIOS_DET, 0)          AS PRECIO,
                   NVL(LP.DESCUENTO_MAX_LISTA_PRECIOS_DET, 0)   AS DESCUENTO_MAX
            FROM   ARTICULO A
            LEFT JOIN CATEGORIAS_ARTICULO CA ON CA.ID_CATEGORIAS_ARTICULO = A.ID_CATEGORIA_ARTICULO
            LEFT JOIN STOCK_ARTICULO SA ON SA.ID_ARTICULO = A.ID_ARTICULO
            LEFT JOIN LISTA_PRECIOS_DET LP ON LP.ID_ARTICULO = A.ID_ARTICULO
            WHERE  A.ID_ARTICULO = :p_id";

        var dt = _db.ExecuteReader(sql, [OracleHelper.PInt("p_id", id)]);
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
            var sql = @"INSERT INTO ARTICULO
                         (CODIGO_ARTICULO, CODIGO_BARRA_ARTICULO, NOMBRE_ARTICULO,
                          DESCRIPCION_ARTICULO, TIPO_ARTICULO, PESO_ARTICULO,
                          STOCK_MINIMO, STOCK_MAXIMO, ESTADO_ARTICULO,
                          MANEJA_LOTE_ARTICULO, MANEJA_SERIE_ARTICULO,
                          ID_CATEGORIA_ARTICULO)
                        VALUES
                         (:p_cod, :p_barra, :p_nom, :p_desc, :p_tipo,
                          :p_peso, :p_smin, :p_smax, NVL(:p_est,'A'),
                          NVL(:p_lote,'N'), NVL(:p_serie,'N'), :p_cat)
                        RETURNING ID_ARTICULO INTO :p_id_out";

            var newId = _db.ExecuteInsert(sql, [
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
            ]);
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
            _db.ExecuteNonQuery(@"
                UPDATE ARTICULO SET
                    CODIGO_ARTICULO       = NVL(:p_cod,  CODIGO_ARTICULO),
                    NOMBRE_ARTICULO       = NVL(:p_nom,  NOMBRE_ARTICULO),
                    DESCRIPCION_ARTICULO  = NVL(:p_desc, DESCRIPCION_ARTICULO),
                    TIPO_ARTICULO         = NVL(:p_tipo, TIPO_ARTICULO),
                    PESO_ARTICULO         = NVL(:p_peso, PESO_ARTICULO),
                    STOCK_MINIMO          = NVL(:p_smin, STOCK_MINIMO),
                    STOCK_MAXIMO          = NVL(:p_smax, STOCK_MAXIMO),
                    ESTADO_ARTICULO       = NVL(:p_est,  ESTADO_ARTICULO),
                    ID_CATEGORIA_ARTICULO = NVL(:p_cat,  ID_CATEGORIA_ARTICULO)
                WHERE ID_ARTICULO = :p_id", [
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
            ]);
            return Ok(new { message = "Artículo actualizado." });
        }
        catch (OracleException ex) { return HandleOracleError(ex); }
    }

    // ── DELETE /api/articulos/{id} — lógico ───────────────────
    [HttpDelete("{id:long}")]
    public IActionResult Delete(long id)
    {
        _db.ExecuteNonQuery(
            "UPDATE ARTICULO SET ESTADO_ARTICULO = 'I' WHERE ID_ARTICULO = :p_id",
            [OracleHelper.PInt("p_id", id)]);
        return Ok(new { message = "Artículo desactivado." });
    }
}

public record ArticuloDto(
    string? CodigoArticulo, string? CodigoBarraArticulo,
    string? NombreArticulo, string? DescripcionArticulo,
    string? TipoArticulo,   decimal? PesoArticulo,
    decimal? StockMinimo,   decimal? StockMaximo,
    string? EstadoArticulo, string? ManejaLoteArticulo,
    string? ManejaSerieArticulo, long? IdCategoriaArticulo);
