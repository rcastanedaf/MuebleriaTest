using System.Data;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using MuebleriaCore.Data;
using Oracle.ManagedDataAccess.Client;

namespace MuebleriaCore.Controllers;

[ApiController]
public abstract class BaseController : ControllerBase
{
    protected readonly OracleHelper _db;

    protected BaseController(OracleHelper db) => _db = db;

    // ── Current user from JWT ─────────────────────────────────
    protected long CurrentUserId =>
        long.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : 0;

    protected string CurrentUserRole =>
        User.FindFirstValue(ClaimTypes.Role) ?? "";

    // ── Standard list response ────────────────────────────────
    protected IActionResult OkList(DataTable dt)
    {
        var list = OracleHelper.ToList(dt);
        return Ok(new { data = list, total = list.Count });
    }

    // ── Oracle error handler ──────────────────────────────────
    protected IActionResult HandleOracleError(OracleException ex) => ex.Number switch
    {
        1    => Conflict(new { message = "Ya existe un registro con ese valor único." }),
        2292 => Conflict(new { message = "No se puede eliminar: existen registros relacionados." }),
        1400 => BadRequest(new { message = "Campo obligatorio no puede ser nulo." }),
        _    => StatusCode(500, new { message = $"Error Oracle {ex.Number}: {ex.Message}" })
    };
}
