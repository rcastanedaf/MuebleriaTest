-- ============================================================
--  SCRIPT DE VALIDACIÓN POST-CORRECCIÓN
--  Motor: Oracle 21c
--  Verifica que todos los nombres de columnas estén correctos
-- ============================================================

SET SERVEROUTPUT ON;

DECLARE
    v_count NUMBER;
    v_errors NUMBER := 0;
BEGIN
    DBMS_OUTPUT.PUT_LINE('=== VALIDACIÓN DE CORRECCIONES DE COLUMNAS ===');
    DBMS_OUTPUT.PUT_LINE('');

    -- 1. Verificar ORDEN_VENTA.ID_SUCURSAL_CLIENTE
    SELECT COUNT(*) INTO v_count
    FROM user_tab_columns
    WHERE table_name = 'ORDEN_VENTA' 
    AND column_name = 'ID_SUCURSAL_CLIENTE';

    IF v_count = 1 THEN
        DBMS_OUTPUT.PUT_LINE('✓ ORDEN_VENTA.ID_SUCURSAL_CLIENTE - OK');
    ELSE
        DBMS_OUTPUT.PUT_LINE('✗ ORDEN_VENTA.ID_SUCURSAL_CLIENTE - ERROR');
        v_errors := v_errors + 1;
    END IF;

    -- 2. Verificar LISTA_PRECIOS.FECHA_HASTA_LISTA_PRECIOS
    SELECT COUNT(*) INTO v_count
    FROM user_tab_columns
    WHERE table_name = 'LISTA_PRECIOS' 
    AND column_name = 'FECHA_HASTA_LISTA_PRECIOS';

    IF v_count = 1 THEN
        DBMS_OUTPUT.PUT_LINE('✓ LISTA_PRECIOS.FECHA_HASTA_LISTA_PRECIOS - OK');
    ELSE
        DBMS_OUTPUT.PUT_LINE('✗ LISTA_PRECIOS.FECHA_HASTA_LISTA_PRECIOS - ERROR');
        v_errors := v_errors + 1;
    END IF;

    -- 3. Verificar ORDEN_VENTA_DETALLE.CANTIDAD_SOLICITUD_VENTA_COMPRA_DETALLE
    SELECT COUNT(*) INTO v_count
    FROM user_tab_columns
    WHERE table_name = 'ORDEN_VENTA_DETALLE' 
    AND column_name = 'CANTIDAD_SOLICITUD_VENTA_COMPRA_DETALLE';

    IF v_count = 1 THEN
        DBMS_OUTPUT.PUT_LINE('✓ ORDEN_VENTA_DETALLE.CANTIDAD_SOLICITUD_VENTA_COMPRA_DETALLE - OK');
    ELSE
        DBMS_OUTPUT.PUT_LINE('✗ ORDEN_VENTA_DETALLE.CANTIDAD_SOLICITUD_VENTA_COMPRA_DETALLE - ERROR');
        v_errors := v_errors + 1;
    END IF;

    -- 4. Verificar PERMISOS.ULTIMO_CAMBIO_PERMISO
    SELECT COUNT(*) INTO v_count
    FROM user_tab_columns
    WHERE table_name = 'PERMISOS' 
    AND column_name = 'ULTIMO_CAMBIO_PERMISO';

    IF v_count = 1 THEN
        DBMS_OUTPUT.PUT_LINE('✓ PERMISOS.ULTIMO_CAMBIO_PERMISO - OK');
    ELSE
        DBMS_OUTPUT.PUT_LINE('✗ PERMISOS.ULTIMO_CAMBIO_PERMISO - ERROR');
        v_errors := v_errors + 1;
    END IF;

    -- 5. Verificar JORNADAS.HORA_FIN_JORNADA
    SELECT COUNT(*) INTO v_count
    FROM user_tab_columns
    WHERE table_name = 'JORNADAS' 
    AND column_name = 'HORA_FIN_JORNADA';

    IF v_count = 1 THEN
        DBMS_OUTPUT.PUT_LINE('✓ JORNADAS.HORA_FIN_JORNADA - OK');
    ELSE
        DBMS_OUTPUT.PUT_LINE('✗ JORNADAS.HORA_FIN_JORNADA - ERROR');
        v_errors := v_errors + 1;
    END IF;

    -- 6. Verificar STOCK_ARTICULO.CANTIDAD_DIPONIBLE_STOCK_ARTICULO
    SELECT COUNT(*) INTO v_count
    FROM user_tab_columns
    WHERE table_name = 'STOCK_ARTICULO' 
    AND column_name = 'CANTIDAD_DIPONIBLE_STOCK_ARTICULO';

    IF v_count = 1 THEN
        DBMS_OUTPUT.PUT_LINE('✓ STOCK_ARTICULO.CANTIDAD_DIPONIBLE_STOCK_ARTICULO - OK');
    ELSE
        DBMS_OUTPUT.PUT_LINE('✗ STOCK_ARTICULO.CANTIDAD_DIPONIBLE_STOCK_ARTICULO - ERROR');
        v_errors := v_errors + 1;
    END IF;

    -- 7. Verificar FACTURA_VENTA_DETALLE.ID_FACTURA_VENTA
    SELECT COUNT(*) INTO v_count
    FROM user_tab_columns
    WHERE table_name = 'FACTURA_VENTA_DETALLE' 
    AND column_name = 'ID_FACTURA_VENTA';

    IF v_count = 1 THEN
        DBMS_OUTPUT.PUT_LINE('✓ FACTURA_VENTA_DETALLE.ID_FACTURA_VENTA - OK');
    ELSE
        DBMS_OUTPUT.PUT_LINE('✗ FACTURA_VENTA_DETALLE.ID_FACTURA_VENTA - ERROR');
        v_errors := v_errors + 1;
    END IF;

    -- 8. Verificar ENTREGA.APELLIDOS_RECIBE_ENTREGA
    SELECT COUNT(*) INTO v_count
    FROM user_tab_columns
    WHERE table_name = 'ENTREGA' 
    AND column_name = 'APELLIDOS_RECIBE_ENTREGA';

    IF v_count = 1 THEN
        DBMS_OUTPUT.PUT_LINE('✓ ENTREGA.APELLIDOS_RECIBE_ENTREGA - OK');
    ELSE
        DBMS_OUTPUT.PUT_LINE('✗ ENTREGA.APELLIDOS_RECIBE_ENTREGA - ERROR');
        v_errors := v_errors + 1;
    END IF;

    -- 9. Verificar ENTREGA.DPI_RECIBE_ENTREGA
    SELECT COUNT(*) INTO v_count
    FROM user_tab_columns
    WHERE table_name = 'ENTREGA' 
    AND column_name = 'DPI_RECIBE_ENTREGA';

    IF v_count = 1 THEN
        DBMS_OUTPUT.PUT_LINE('✓ ENTREGA.DPI_RECIBE_ENTREGA - OK');
    ELSE
        DBMS_OUTPUT.PUT_LINE('✗ ENTREGA.DPI_RECIBE_ENTREGA - ERROR');
        v_errors := v_errors + 1;
    END IF;

    -- 10. Verificar NOMINA.ID_USUARIO_MODIFICA
    SELECT COUNT(*) INTO v_count
    FROM user_tab_columns
    WHERE table_name = 'NOMINA' 
    AND column_name = 'ID_USUARIO_MODIFICA';

    IF v_count = 1 THEN
        DBMS_OUTPUT.PUT_LINE('✓ NOMINA.ID_USUARIO_MODIFICA - OK');
    ELSE
        DBMS_OUTPUT.PUT_LINE('✗ NOMINA.ID_USUARIO_MODIFICA - ERROR');
        v_errors := v_errors + 1;
    END IF;

    -- 11. Verificar CONTRATO_EMPLEADO.ID_CONTRATO_EMPLEADO
    SELECT COUNT(*) INTO v_count
    FROM user_tab_columns
    WHERE table_name = 'CONTRATO_EMPLEADO' 
    AND column_name = 'ID_CONTRATO_EMPLEADO';

    IF v_count = 1 THEN
        DBMS_OUTPUT.PUT_LINE('✓ CONTRATO_EMPLEADO.ID_CONTRATO_EMPLEADO - OK');
    ELSE
        DBMS_OUTPUT.PUT_LINE('✗ CONTRATO_EMPLEADO.ID_CONTRATO_EMPLEADO - ERROR');
        v_errors := v_errors + 1;
    END IF;

    -- 12. Verificar TRANSPORTISTA.DPI_TRANSPORTISTA
    SELECT COUNT(*) INTO v_count
    FROM user_tab_columns
    WHERE table_name = 'TRANSPORTISTA' 
    AND column_name = 'DPI_TRANSPORTISTA';

    IF v_count = 1 THEN
        DBMS_OUTPUT.PUT_LINE('✓ TRANSPORTISTA.DPI_TRANSPORTISTA - OK');
    ELSE
        DBMS_OUTPUT.PUT_LINE('✗ TRANSPORTISTA.DPI_TRANSPORTISTA - ERROR');
        v_errors := v_errors + 1;
    END IF;

    DBMS_OUTPUT.PUT_LINE('');
    DBMS_OUTPUT.PUT_LINE('===========================================');
    IF v_errors = 0 THEN
        DBMS_OUTPUT.PUT_LINE('✓ TODAS LAS CORRECCIONES APLICADAS EXITOSAMENTE');
    ELSE
        DBMS_OUTPUT.PUT_LINE('✗ SE ENCONTRARON ' || v_errors || ' ERRORES');
        DBMS_OUTPUT.PUT_LINE('Por favor, revise y ejecute el script fix_column_names.sql');
    END IF;
    DBMS_OUTPUT.PUT_LINE('===========================================');
END;
/

-- Verificar constraints que fueron actualizados
SELECT constraint_name, table_name, constraint_type, status
FROM user_constraints
WHERE constraint_name IN (
    'FK_OV_SUCLI',
    'FK_FVD_FV',
    'FK_SE_UMOD',
    'FK_NOM_UMOD'
)
ORDER BY table_name, constraint_name;

-- Verificar índices
SELECT index_name, table_name, uniqueness
FROM user_indexes
WHERE table_name IN (
    'ORDEN_VENTA',
    'ORDEN_VENTA_DETALLE',
    'STOCK_ARTICULO',
    'LISTA_PRECIOS'
)
ORDER BY table_name, index_name;
