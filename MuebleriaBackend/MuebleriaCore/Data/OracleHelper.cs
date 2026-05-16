using System.Data;
using Oracle.ManagedDataAccess.Client;

namespace MuebleriaCore.Data;

/// <summary>
/// Centraliza todas las operaciones con Oracle 21c.
/// Usa Oracle.ManagedDataAccess.Core — no requiere cliente Oracle instalado.
/// </summary>
public class OracleHelper
{
    private readonly string _connStr;

    public OracleHelper(IConfiguration config)
        : this(config, "Oracle")
    {
    }

    protected OracleHelper(IConfiguration config, string connectionStringName)
    {
        _connStr = config.GetConnectionString(connectionStringName)
            ?? throw new InvalidOperationException($"ConnectionStrings:{connectionStringName} no configurada.");
    }

    public OracleConnection GetConnection()
    {
        var conn = new OracleConnection(_connStr);
        conn.Open();
        return conn;
    }

    // ── ExecuteReader → DataTable ─────────────────────────────
    public DataTable ExecuteReader(string sql, OracleParameter[]? parameters = null, bool isStoredProc = false)
    {
        var dt = new DataTable();
        using var conn = GetConnection();
        using var cmd  = new OracleCommand(sql, conn)
        {
            CommandType = isStoredProc ? CommandType.StoredProcedure : CommandType.Text,
            BindByName = true
        };
        if (parameters != null) cmd.Parameters.AddRange(parameters);
        using var da = new OracleDataAdapter(cmd);
        da.Fill(dt);
        return dt;
    }

    // ── ExecuteNonQuery → rows affected ──────────────────────
    public int ExecuteNonQuery(string sql, OracleParameter[]? parameters = null, bool isStoredProc = false)
    {
        using var conn = GetConnection();
        using var cmd  = new OracleCommand(sql, conn)
        {
            CommandType = isStoredProc ? CommandType.StoredProcedure : CommandType.Text,
            BindByName = true
        };
        if (parameters != null) cmd.Parameters.AddRange(parameters);
        return cmd.ExecuteNonQuery();
    }

    // ── ExecuteScalar → single value ─────────────────────────
    public object? ExecuteScalar(string sql, OracleParameter[]? parameters = null)
    {
        using var conn = GetConnection();
        using var cmd  = new OracleCommand(sql, conn) 
        { 
            CommandType = CommandType.Text,
            BindByName = true
        };
        if (parameters != null) cmd.Parameters.AddRange(parameters);
        var result = cmd.ExecuteScalar();
        return result == DBNull.Value ? null : result;
    }

    // ── ExecuteInsert → returns new IDENTITY id ───────────────
    /// <summary>
    /// Ejecuta un INSERT (SQL directo o procedimiento almacenado) y devuelve el ID generado.
    /// El parámetro OUTPUT debe llamarse "p_id_out" y ser de tipo Int64, Direction = Output.
    /// </summary>
    public long ExecuteInsert(string sql, OracleParameter[] parameters, bool isStoredProc = false)
    {
        using var conn = GetConnection();
        using var cmd  = new OracleCommand(sql, conn)
        {
            CommandType = isStoredProc ? CommandType.StoredProcedure : CommandType.Text,
            BindByName = true
        };
        cmd.Parameters.AddRange(parameters);
        cmd.ExecuteNonQuery();
        var outParam = cmd.Parameters["p_id_out"];
        return outParam?.Value is not null and not DBNull ? ConvertOracleToLong(outParam.Value) : 0;
    }

    // ── Transactional INSERT + multiple statements ─────────────
    public long ExecuteInsertTransaction(
        string insertSql,
        OracleParameter[] insertParams,
        IEnumerable<(string Sql, OracleParameter[] Params)> additionalStatements)
    {
        using var conn = GetConnection();
        using var txn  = conn.BeginTransaction();
        try
        {
            using var cmd = new OracleCommand(insertSql, conn) 
            { 
                Transaction = txn,
                BindByName = true
            };
            cmd.Parameters.AddRange(insertParams);
            cmd.ExecuteNonQuery();
            long newId = ConvertOracleToLong(cmd.Parameters["p_id_out"].Value);

            foreach (var (sql, parms) in additionalStatements)
            {
                using var cmd2 = new OracleCommand(sql, conn) 
                { 
                    Transaction = txn,
                    BindByName = true
                };
                cmd2.Parameters.AddRange(parms);
                cmd2.ExecuteNonQuery();
            }

            txn.Commit();
            return newId;
        }
        catch
        {
            txn.Rollback();
            throw;
        }
    }

    // ── DataTable → List<Dictionary> (camelCase keys) ─────────
    public static List<Dictionary<string, object?>> ToList(DataTable dt)
    {
        var result = new List<Dictionary<string, object?>>();
        foreach (DataRow row in dt.Rows)
        {
            var dict = new Dictionary<string, object?>();
            foreach (DataColumn col in dt.Columns)
            {
                dict[ToCamel(col.ColumnName)] =
                    row[col] == DBNull.Value ? null : row[col];
            }
            result.Add(dict);
        }
        return result;
    }

    // ── NOMBRE_COLUMNA → nombreColumna (camelCase) ─────────────
    public static string ToCamel(string s)
    {
        if (string.IsNullOrEmpty(s)) return s;
        var parts = s.ToLower().Split('_');
        return parts[0] + string.Concat(parts.Skip(1).Select(p =>
            p.Length == 0 ? "" : char.ToUpper(p[0]) + p[1..]));
    }

    // ── Parameter helpers ─────────────────────────────────────
    public static OracleParameter P(string name, object? value,
        OracleDbType type = OracleDbType.Varchar2)
    {
        // Ensure parameter name starts with ':' for consistency
        var paramName = name.StartsWith(":") ? name : name;
        return new OracleParameter(paramName, type) { Value = value ?? (object)DBNull.Value };
    }

    public static OracleParameter PInt(string name, object? value)
        => P(name, value, OracleDbType.Int64);

    public static OracleParameter PDec(string name, object? value)
        => P(name, value, OracleDbType.Decimal);

    public static OracleParameter PDate(string name, object? value)
        => P(name, value, OracleDbType.Date);

    public static OracleParameter POut(string name)
    {
        var paramName = name.StartsWith(":") ? name : name;
        return new OracleParameter(paramName, OracleDbType.Int64) { Direction = System.Data.ParameterDirection.Output };
    }

    // ── Convertir valores de Oracle a tipos .NET ─────────────
    /// <summary>
    /// Convierte valores de Oracle (como OracleDecimal) a long de forma segura.
    /// </summary>
    public static long ConvertOracleToLong(object? value)
    {
        if (value == null || value == DBNull.Value)
            return 0;

        // Si es OracleDecimal, convertir explícitamente
        if (value is Oracle.ManagedDataAccess.Types.OracleDecimal oracleDecimal)
        {
            return oracleDecimal.IsNull ? 0 : (long)oracleDecimal.Value;
        }

        // Para otros tipos, usar Convert
        return Convert.ToInt64(value);
    }

    /// <summary>
    /// Convierte valores de Oracle (como OracleDecimal) a int de forma segura.
    /// </summary>
    public static int ConvertOracleToInt(object? value)
    {
        if (value == null || value == DBNull.Value)
            return 0;

        // Si es OracleDecimal, convertir explícitamente
        if (value is Oracle.ManagedDataAccess.Types.OracleDecimal oracleDecimal)
        {
            return oracleDecimal.IsNull ? 0 : (int)oracleDecimal.Value;
        }

        // Para otros tipos, usar Convert
        return Convert.ToInt32(value);
    }
}
