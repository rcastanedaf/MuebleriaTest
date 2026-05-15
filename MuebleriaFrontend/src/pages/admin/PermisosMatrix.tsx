// src/pages/admin/PermisosMatrix.tsx
import React, { useState, useEffect, useCallback } from "react";
import { apiClient } from "../../core/api/apiClient";
import { Spinner } from "../../shared/components"; // used for full-page loading state

interface Props {
  showToast: (msg: string, type?: "success" | "error") => void;
}

interface MatrizRow {
  idRol: number;
  nombreRol: string;
  rangoRol: number;
  idPermiso: number | null;
  moduloPermiso: string | null;
}

interface RoleInfo { idRol: number; nombreRol: string; rangoRol: number }

const ALL_MODULES: { key: string; label: string }[] = [
  { key: "dashboard",     label: "Dashboard" },
  { key: "empleados",     label: "Empleados" },
  { key: "nomina",        label: "Nómina" },
  { key: "articulos",     label: "Artículos" },
  { key: "bodegas",       label: "Bodegas" },
  { key: "proveedores",   label: "Proveedores" },
  { key: "ordenesCompra", label: "Órdenes Compra" },
  { key: "clientes",      label: "Clientes" },
  { key: "ordenesVenta",  label: "Órdenes Venta" },
  { key: "produccion",    label: "Producción" },
  { key: "vehiculos",     label: "Vehículos" },
  { key: "despachos",     label: "Despachos" },
  { key: "sucursales",    label: "Sucursales" },
  { key: "roles",         label: "Roles" },
  { key: "usuarios",      label: "Usuarios" },
];

export function PermisosMatrix({ showToast }: Props) {
  const [rows, setRows]     = useState<MatrizRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<{ data: MatrizRow[] }>("/permisos/matriz");
      setRows(res?.data ?? []);
    } catch {
      showToast("Error al cargar la matriz de permisos", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  // Unique roles ordered by rangoRol
  const roles: RoleInfo[] = [];
  const seen = new Set<number>();
  for (const r of rows) {
    if (!seen.has(r.idRol)) {
      seen.add(r.idRol);
      roles.push({ idRol: r.idRol, nombreRol: r.nombreRol, rangoRol: r.rangoRol });
    }
  }
  roles.sort((a, b) => a.rangoRol - b.rangoRol);

  // Map: `${idRol}_${moduloPermiso}` → idPermiso
  const permisoMap = new Map<string, number>();
  for (const r of rows) {
    if (r.idPermiso != null && r.moduloPermiso) {
      permisoMap.set(`${r.idRol}_${r.moduloPermiso}`, r.idPermiso);
    }
  }

  const cellKey = (idRol: number, mod: string) => `${idRol}_${mod}`;

  const toggle = async (role: RoleInfo, modKey: string, modLabel: string) => {
    const key    = cellKey(role.idRol, modKey);
    const existing = permisoMap.get(key);

    setSaving(prev => new Set(prev).add(key));
    try {
      if (existing != null) {
        await apiClient.delete(`/permisos/${existing}`);
        showToast(`Permiso "${modLabel}" eliminado de ${role.nombreRol}`, "success");
      } else {
        const res = await apiClient.post<{ idPermiso: number }>("/permisos", {
          nombrePermiso:      `${role.nombreRol} - ${modKey}`,
          descripcionPermiso: `Acceso ${role.nombreRol} al modulo ${modKey}`,
          moduloPermiso:      modKey,
          estado:             "A",
          idRol:              role.idRol,
        });
        showToast(`Permiso "${modLabel}" otorgado a ${role.nombreRol}`, "success");
        // Optimistic: update map immediately before reload
        if (res?.idPermiso) permisoMap.set(key, res.idPermiso);
      }
      await load();
    } catch {
      showToast("Error al actualizar el permiso", "error");
    } finally {
      setSaving(prev => { const s = new Set(prev); s.delete(key); return s; });
    }
  };

  if (loading) return (
    <div style={{ display:"flex", justifyContent:"center", padding:40 }}>
      <Spinner />
    </div>
  );

  const colWidth = Math.max(90, Math.floor(680 / roles.length));

  return (
    <div style={{ overflowX:"auto" }}>
      <p style={{ fontSize:12, color:"var(--txtMuted)", marginBottom:16 }}>
        Marca o desmarca el acceso de cada rol por módulo. Los roles <b>admin</b> y <b>cliente</b> no aparecen aquí (admin tiene acceso total; cliente solo usa el portal).
      </p>
      <table style={{
        borderCollapse:"collapse", width:"100%", fontSize:13,
        background:"var(--bg3)", borderRadius:"var(--radiusLg)",
        overflow:"hidden", boxShadow:"var(--shadow)",
      }}>
        <thead>
          <tr>
            <th style={thStyle(160)}>Módulo</th>
            {roles.map(r => (
              <th key={r.idRol} style={thStyle(colWidth)}>
                <span style={{ textTransform:"capitalize" }}>{r.nombreRol}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ALL_MODULES.map((mod, i) => (
            <tr key={mod.key} style={{ background: i % 2 === 0 ? "var(--bg3)" : "var(--bg2)" }}>
              <td style={tdStyle(160, true)}>{mod.label}</td>
              {roles.map(role => {
                const key     = cellKey(role.idRol, mod.key);
                const checked = permisoMap.has(key);
                const busy    = saving.has(key);
                return (
                  <td key={role.idRol} style={tdStyle(colWidth, false)}>
                    {busy
                      ? <span style={{ display:"inline-block", width:14, height:14, border:"2px solid var(--sandDark)", borderTopColor:"var(--olive)", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
                      : (
                        <label style={{ cursor:"pointer", display:"flex", justifyContent:"center", alignItems:"center" }}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggle(role, mod.key, mod.label)}
                            style={{ width:16, height:16, cursor:"pointer", accentColor:"var(--olive)" }}
                          />
                        </label>
                      )
                    }
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function thStyle(w: number): React.CSSProperties {
  return {
    padding: "10px 14px",
    background: "var(--dark)",
    color: "#fff",
    fontWeight: 600,
    textAlign: "center",
    minWidth: w,
    fontSize: 12,
    letterSpacing: "0.04em",
    textTransform: "uppercase" as const,
    whiteSpace: "nowrap",
    borderRight: "1px solid rgba(255,255,255,0.08)",
  };
}

function tdStyle(w: number, isLabel: boolean): React.CSSProperties {
  return {
    padding: "8px 14px",
    minWidth: w,
    textAlign: isLabel ? "left" : "center",
    borderRight: "1px solid var(--sand)",
    fontWeight: isLabel ? 500 : 400,
    color: isLabel ? "var(--txt)" : undefined,
    verticalAlign: "middle",
  };
}
