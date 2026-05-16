namespace MuebleriaCore.Data;

public class DashboardOracleHelper : OracleHelper
{
    public DashboardOracleHelper(IConfiguration config)
        : base(config, "OracleReporting")
    {
    }
}
