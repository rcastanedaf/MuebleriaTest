-- ================================================================
-- roles_permisos.sql
-- Configura roles y permisos del panel administrativo.
-- Ejecutar en Oracle como usuario MUEBLERIA.
-- ================================================================

-- ── 1. ROLES ─────────────────────────────────────────────────
-- Inserta roles si aún no existen (MERGE por nombre).
-- admin   (rango 1) → acceso total, gestionado por esAdmin=true
-- cliente (rango 10) → solo portal de ventas, sin acceso admin

MERGE INTO ROLES tgt
USING (
    SELECT 'admin'       AS nombre, 'Administrador del Sistema'   AS descripcion, 1  AS rango FROM DUAL UNION ALL
    SELECT 'gerente',               'Gerente General',             2                            FROM DUAL UNION ALL
    SELECT 'rrhh',                  'Recursos Humanos',            3                            FROM DUAL UNION ALL
    SELECT 'ventas',                'Ejecutivo de Ventas',         4                            FROM DUAL UNION ALL
    SELECT 'compras',               'Encargado de Compras',        5                            FROM DUAL UNION ALL
    SELECT 'produccion',            'Operario de Produccion',      6                            FROM DUAL UNION ALL
    SELECT 'logistica',             'Encargado de Logistica',      7                            FROM DUAL UNION ALL
    SELECT 'inventario',            'Encargado de Inventario',     8                            FROM DUAL UNION ALL
    SELECT 'cliente',               'Cliente Portal de Ventas',    10                           FROM DUAL
) src ON (LOWER(tgt.NOMBRE_ROL) = src.nombre)
WHEN NOT MATCHED THEN
    INSERT (NOMBRE_ROL, DESCRIPCION_ROL, RANGO_ROL)
    VALUES (src.nombre, src.descripcion, src.rango)
WHEN MATCHED THEN
    UPDATE SET tgt.DESCRIPCION_ROL = src.descripcion,
               tgt.RANGO_ROL       = src.rango;


-- ── 2. PERMISOS ───────────────────────────────────────────────
-- Limpia permisos existentes de todos los roles gestionables
-- (admin y cliente no necesitan filas; admin usa esAdmin=true
--  y cliente no accede al panel).

DELETE FROM PERMISOS
WHERE ID_ROL IN (
    SELECT ID_ROL FROM ROLES
    WHERE LOWER(NOMBRE_ROL) NOT IN ('admin', 'cliente')
);


-- ── GERENTE ───────────────────────────────────────────────────
-- Visibilidad completa. Sin acceso a config sensible (usuarios/roles).
INSERT INTO PERMISOS (NOMBRE_PERMISO, DESCRIPCION_PERMISO, MODULO_PERMISO, ESTADO, ID_ROL)
SELECT 'Gerente - ' || modulo,
       'Acceso gerente al modulo ' || modulo,
       modulo, 'A',
       (SELECT ID_ROL FROM ROLES WHERE LOWER(NOMBRE_ROL) = 'gerente')
FROM (
    SELECT 'dashboard'      AS modulo FROM DUAL UNION ALL
    SELECT 'empleados'                FROM DUAL UNION ALL
    SELECT 'nomina'                   FROM DUAL UNION ALL
    SELECT 'articulos'                FROM DUAL UNION ALL
    SELECT 'bodegas'                  FROM DUAL UNION ALL
    SELECT 'proveedores'              FROM DUAL UNION ALL
    SELECT 'ordenesCompra'            FROM DUAL UNION ALL
    SELECT 'clientes'                 FROM DUAL UNION ALL
    SELECT 'ordenesVenta'             FROM DUAL UNION ALL
    SELECT 'produccion'               FROM DUAL UNION ALL
    SELECT 'vehiculos'                FROM DUAL UNION ALL
    SELECT 'despachos'                FROM DUAL UNION ALL
    SELECT 'sucursales'               FROM DUAL
);


-- ── RRHH ──────────────────────────────────────────────────────
-- Gestión de personal: empleados y nómina.
INSERT INTO PERMISOS (NOMBRE_PERMISO, DESCRIPCION_PERMISO, MODULO_PERMISO, ESTADO, ID_ROL)
SELECT 'RRHH - ' || modulo,
       'Acceso RRHH al modulo ' || modulo,
       modulo, 'A',
       (SELECT ID_ROL FROM ROLES WHERE LOWER(NOMBRE_ROL) = 'rrhh')
FROM (
    SELECT 'dashboard' AS modulo FROM DUAL UNION ALL
    SELECT 'empleados'            FROM DUAL UNION ALL
    SELECT 'nomina'               FROM DUAL
);


-- ── VENTAS ────────────────────────────────────────────────────
-- Gestión comercial: clientes, órdenes de venta, catálogo y despachos.
INSERT INTO PERMISOS (NOMBRE_PERMISO, DESCRIPCION_PERMISO, MODULO_PERMISO, ESTADO, ID_ROL)
SELECT 'Ventas - ' || modulo,
       'Acceso ventas al modulo ' || modulo,
       modulo, 'A',
       (SELECT ID_ROL FROM ROLES WHERE LOWER(NOMBRE_ROL) = 'ventas')
FROM (
    SELECT 'dashboard'    AS modulo FROM DUAL UNION ALL
    SELECT 'clientes'               FROM DUAL UNION ALL
    SELECT 'ordenesVenta'           FROM DUAL UNION ALL
    SELECT 'articulos'              FROM DUAL UNION ALL
    SELECT 'despachos'              FROM DUAL
);


-- ── COMPRAS ───────────────────────────────────────────────────
-- Gestión de abastecimiento: proveedores, órdenes de compra,
-- artículos y bodegas.
INSERT INTO PERMISOS (NOMBRE_PERMISO, DESCRIPCION_PERMISO, MODULO_PERMISO, ESTADO, ID_ROL)
SELECT 'Compras - ' || modulo,
       'Acceso compras al modulo ' || modulo,
       modulo, 'A',
       (SELECT ID_ROL FROM ROLES WHERE LOWER(NOMBRE_ROL) = 'compras')
FROM (
    SELECT 'dashboard'    AS modulo FROM DUAL UNION ALL
    SELECT 'proveedores'            FROM DUAL UNION ALL
    SELECT 'ordenesCompra'          FROM DUAL UNION ALL
    SELECT 'articulos'              FROM DUAL UNION ALL
    SELECT 'bodegas'                FROM DUAL
);


-- ── PRODUCCION ────────────────────────────────────────────────
-- Gestión de manufactura: órdenes de producción, artículos y bodegas.
INSERT INTO PERMISOS (NOMBRE_PERMISO, DESCRIPCION_PERMISO, MODULO_PERMISO, ESTADO, ID_ROL)
SELECT 'Produccion - ' || modulo,
       'Acceso produccion al modulo ' || modulo,
       modulo, 'A',
       (SELECT ID_ROL FROM ROLES WHERE LOWER(NOMBRE_ROL) = 'produccion')
FROM (
    SELECT 'dashboard'  AS modulo FROM DUAL UNION ALL
    SELECT 'produccion'            FROM DUAL UNION ALL
    SELECT 'articulos'             FROM DUAL UNION ALL
    SELECT 'bodegas'               FROM DUAL
);


-- ── LOGISTICA ─────────────────────────────────────────────────
-- Gestión de transporte y entregas: vehículos y despachos.
INSERT INTO PERMISOS (NOMBRE_PERMISO, DESCRIPCION_PERMISO, MODULO_PERMISO, ESTADO, ID_ROL)
SELECT 'Logistica - ' || modulo,
       'Acceso logistica al modulo ' || modulo,
       modulo, 'A',
       (SELECT ID_ROL FROM ROLES WHERE LOWER(NOMBRE_ROL) = 'logistica')
FROM (
    SELECT 'dashboard' AS modulo FROM DUAL UNION ALL
    SELECT 'vehiculos'            FROM DUAL UNION ALL
    SELECT 'despachos'            FROM DUAL
);


-- ── INVENTARIO ────────────────────────────────────────────────
-- Control de stock: artículos y bodegas.
INSERT INTO PERMISOS (NOMBRE_PERMISO, DESCRIPCION_PERMISO, MODULO_PERMISO, ESTADO, ID_ROL)
SELECT 'Inventario - ' || modulo,
       'Acceso inventario al modulo ' || modulo,
       modulo, 'A',
       (SELECT ID_ROL FROM ROLES WHERE LOWER(NOMBRE_ROL) = 'inventario')
FROM (
    SELECT 'dashboard' AS modulo FROM DUAL UNION ALL
    SELECT 'articulos'            FROM DUAL UNION ALL
    SELECT 'bodegas'              FROM DUAL
);


COMMIT;

-- ── Verificación ──────────────────────────────────────────────
SELECT R.NOMBRE_ROL, R.RANGO_ROL, COUNT(P.ID_PERMISO) AS total_permisos
FROM   ROLES R
LEFT JOIN PERMISOS P ON P.ID_ROL = R.ID_ROL
GROUP BY R.NOMBRE_ROL, R.RANGO_ROL
ORDER BY R.RANGO_ROL;
