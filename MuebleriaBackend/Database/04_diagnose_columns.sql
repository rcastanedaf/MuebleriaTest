-- ============================================================
--  DIAGNÓSTICO: Columnas reales de DEVOLUCION_VENTA y ENTREGA
--  Ejecutar en SQL Developer antes de correr el fix de vistas
-- ============================================================

-- Columnas de DEVOLUCION_VENTA
SELECT column_name, data_type, nullable
FROM   user_tab_columns
WHERE  table_name = 'DEVOLUCION_VENTA'
ORDER  BY column_id;

-- Columnas de ENTREGA
SELECT column_name, data_type, nullable
FROM   user_tab_columns
WHERE  table_name = 'ENTREGA'
ORDER  BY column_id;

-- Constraints de FK para ver qué columna apunta a ORDEN_VENTA / ORDEN_DESPACHADO
SELECT acc.column_name, ac.table_name, ac.constraint_name,
       arc.table_name AS tabla_referenciada
FROM   user_constraints   ac
JOIN   user_cons_columns  acc ON acc.constraint_name = ac.constraint_name
JOIN   user_constraints   arc ON arc.constraint_name = ac.r_constraint_name
WHERE  ac.constraint_type = 'R'
  AND  ac.table_name IN ('DEVOLUCION_VENTA','ENTREGA')
ORDER  BY ac.table_name, acc.position;
