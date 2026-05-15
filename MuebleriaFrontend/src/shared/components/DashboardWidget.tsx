import React from "react";
import { exportToExcel } from "../utils/exportExcel";

export interface WidgetProps {
  icon?: string;
  title: string;
  value?: string | number;
  color?: string;
  loading?: boolean;
  subtitle?: string;
  error?: string;
  children?: React.ReactNode;
  trend?: { value: number; label: string; positive: boolean };
  size?: "small" | "medium" | "large";
  exportRows?: { label: string; value: string | number }[];
  exportFilename?: string;
}

/**
 * Componente reutilizable para widgets del dashboard
 */
export function DashboardWidget({
  icon,
  title,
  value,
  color = "var(--gold)",
  loading = false,
  subtitle,
  error,
  children,
  trend,
  size = "medium",
  exportRows,
  exportFilename,
}: WidgetProps) {
  const sizeStyles = {
    small: {
      padding: "14px 12px",
      fontSize: "14px",
      valueSize: "18px",
      iconSize: "20px",
    },
    medium: {
      padding: "18px 16px",
      fontSize: "13px",
      valueSize: "24px",
      iconSize: "28px",
    },
    large: {
      padding: "24px 20px",
      fontSize: "14px",
      valueSize: "32px",
      iconSize: "36px",
    },
  };

  const style = sizeStyles[size];

  return (
    <div
      style={{
        padding: style.padding,
        background: "var(--bg3)",
        border: "1px solid var(--sand)",
        borderRadius: "var(--radiusLg)",
        borderLeft: `3px solid ${color}`,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {error && (
        <div
          style={{
            fontSize: "12px",
            color: "#c41e3a",
            marginBottom: "8px",
            padding: "4px 8px",
            background: "rgba(196, 30, 58, 0.1)",
            borderRadius: "4px",
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
        {icon && (
          <div style={{ fontSize: style.iconSize, lineHeight: 1 }}>
            {icon}
          </div>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
            <div style={{ fontSize: style.fontSize, color: "var(--txtMuted)" }}>
              {title}
            </div>
            {exportRows && exportRows.length > 0 && exportFilename && (
              <button
                onClick={() => exportToExcel(
                  exportRows.map((r) => ({ label: r.label, value: r.value })),
                  [{ key: "label", label: "Indicador" }, { key: "value", label: "Valor" }],
                  exportFilename
                )}
                title="Exportar a Excel"
                style={{
                  background: "none",
                  border: "1px solid var(--sand)",
                  borderRadius: "4px",
                  padding: "2px 6px",
                  cursor: "pointer",
                  fontSize: "11px",
                  color: "var(--txtMuted)",
                  lineHeight: 1.4,
                  flexShrink: 0,
                }}
              >
                ⬇ XLS
              </button>
            )}
          </div>
          {loading ? (
            <div style={{ fontSize: style.valueSize, fontWeight: 700, color: color }}>
              …
            </div>
          ) : (
            <>
              <div
                style={{
                  fontSize: style.valueSize,
                  fontWeight: 700,
                  color: color,
                  marginBottom: subtitle ? "4px" : "0",
                }}
              >
                {value}
              </div>
              {subtitle && (
                <div style={{ fontSize: "11px", color: "var(--txtMuted)" }}>
                  {subtitle}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {trend && (
        <div
          style={{
            fontSize: "11px",
            color: trend.positive ? "#2e6b4f" : "#c41e3a",
            marginBottom: "8px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <span>{trend.positive ? "↑" : "↓"}</span>
          <span>
            {trend.value}% {trend.label}
          </span>
        </div>
      )}

      {children && <div style={{ marginTop: "auto", flex: 1 }}>{children}</div>}
    </div>
  );
}

/**
 * Widget para tablas simples dentro del dashboard
 */
export function DashboardTableWidget({
  icon,
  title,
  columns,
  data,
  loading = false,
  error,
  color = "var(--olive)",
  exportFilename,
}: {
  icon?: string;
  title: string;
  columns: { key: string; label: string }[];
  data: Record<string, any>[];
  loading?: boolean;
  error?: string;
  color?: string;
  exportFilename?: string;
}) {
  return (
    <div
      style={{
        padding: "18px 16px",
        background: "var(--bg3)",
        border: "1px solid var(--sand)",
        borderRadius: "var(--radiusLg)",
        borderLeft: `3px solid ${color}`,
      }}
    >
      {error && (
        <div
          style={{
            fontSize: "12px",
            color: "#c41e3a",
            marginBottom: "12px",
            padding: "8px",
            background: "rgba(196, 30, 58, 0.1)",
            borderRadius: "4px",
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        {icon && <div style={{ fontSize: "24px" }}>{icon}</div>}
        <h3 style={{ fontSize: "13px", fontWeight: 600, margin: 0, color, flex: 1 }}>
          {title}
        </h3>
        {exportFilename && data.length > 0 && !loading && (
          <button
            onClick={() => exportToExcel(data, columns, exportFilename)}
            title="Exportar a Excel"
            style={{
              background: "none",
              border: "1px solid var(--sand)",
              borderRadius: "4px",
              padding: "3px 8px",
              cursor: "pointer",
              fontSize: "11px",
              color: "var(--txtMuted)",
              lineHeight: 1.4,
              flexShrink: 0,
            }}
          >
            ⬇ XLS
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "20px", color: "var(--txtMuted)" }}>
          Cargando…
        </div>
      ) : data.length === 0 ? (
        <div style={{ textAlign: "center", padding: "20px", color: "var(--txtMuted)", fontSize: "13px" }}>
          Sin datos
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "12px",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid var(--sand)" }}>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    style={{
                      padding: "8px 4px",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "var(--txtMuted)",
                    }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid var(--sand)" }}>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      style={{
                        padding: "8px 4px",
                        color: "var(--txt)",
                      }}
                    >
                      {row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/**
 * Componente simple para gráficos de línea (usando CSS/ASCII para no agregar dependencias)
 */
export function SimpleLineChart({
  title,
  icon,
  data,
  loading = false,
  error,
  color = "var(--gold)",
  exportFilename,
}: {
  title: string;
  icon?: string;
  data: { label: string; value: number }[];
  loading?: boolean;
  error?: string;
  color?: string;
  exportFilename?: string;
}) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const height = 150;

  return (
    <div
      style={{
        padding: "18px 16px",
        background: "var(--bg3)",
        border: "1px solid var(--sand)",
        borderRadius: "var(--radiusLg)",
        borderLeft: `3px solid ${color}`,
      }}
    >
      {error && (
        <div
          style={{
            fontSize: "12px",
            color: "#c41e3a",
            marginBottom: "12px",
            padding: "8px",
            background: "rgba(196, 30, 58, 0.1)",
            borderRadius: "4px",
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        {icon && <div style={{ fontSize: "24px" }}>{icon}</div>}
        <h3 style={{ fontSize: "13px", fontWeight: 600, margin: 0, color, flex: 1 }}>
          {title}
        </h3>
        {exportFilename && data.length > 0 && !loading && (
          <button
            onClick={() => exportToExcel(
              data.map((d) => ({ label: d.label, value: d.value })),
              [{ key: "label", label: "Mes" }, { key: "value", label: "Total" }],
              exportFilename
            )}
            title="Exportar a Excel"
            style={{
              background: "none",
              border: "1px solid var(--sand)",
              borderRadius: "4px",
              padding: "3px 8px",
              cursor: "pointer",
              fontSize: "11px",
              color: "var(--txtMuted)",
              lineHeight: 1.4,
              flexShrink: 0,
            }}
          >
            ⬇ XLS
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "var(--txtMuted)" }}>Cargando…</p>
        </div>
      ) : data.length === 0 ? (
        <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "var(--txtMuted)" }}>Sin datos</p>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height }}>
          {data.map((point, idx) => {
            const barHeight = (point.value / maxValue) * (height - 20);
            return (
              <div
                key={idx}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: barHeight,
                    background: `linear-gradient(to top, ${color}, ${color}cc)`,
                    borderRadius: "4px 4px 0 0",
                    transition: "all 0.2s ease",
                  }}
                  title={`${point.label}: ${point.value}`}
                />
                <span style={{ fontSize: "10px", color: "var(--txtMuted)", textAlign: "center" }}>
                  {point.label.slice(5)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
