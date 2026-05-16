-- ============================================================
-- SOLUCIÓN RÁPIDA: Agregar SUBTOTAL_ORDEN_VENTA
-- Copiar y pegar estas líneas en SQL*Plus o SQL Developer
-- ============================================================

-- Agregar la columna faltante
ALTER TABLE ORDEN_VENTA ADD SUBTOTAL_ORDEN_VENTA NUMBER(18,2) DEFAULT 0;

-- Verificar que se agregó correctamente
SELECT 'Columna agregada exitosamente' AS status 
FROM user_tab_columns 
WHERE table_name = 'ORDEN_VENTA' 
AND column_name = 'SUBTOTAL_ORDEN_VENTA';

COMMIT;

-- ============================================================
-- Si ves "Columna agregada exitosamente", todo está listo!
-- Ahora puedes crear órdenes de venta desde tu aplicación.
-- ============================================================
