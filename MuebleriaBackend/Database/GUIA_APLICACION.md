# Guía de Aplicación de Correcciones - Base de Datos Oracle

## 📋 Pre-requisitos

- Acceso a Oracle 21c con privilegios de ALTER TABLE
- Backup completo de la base de datos
- Conexión con SQL*Plus o SQL Developer
- Tiempo estimado: 15-30 minutos

---

## 🔧 Pasos de Implementación

### Paso 1: Crear Backup

```sql
-- Exportar schema completo
expdp usuario/password@database \
  schemas=NOMBRE_SCHEMA \
  directory=DATA_PUMP_DIR \
  dumpfile=backup_antes_correccion_%U.dmp \
  logfile=backup_antes_correccion.log \
  parallel=4

-- O backup con RMAN (recomendado para producción)
```

### Paso 2: Verificar Estado Actual

```bash
# Conectar a la base de datos
sqlplus usuario/password@database

# Ejecutar script de validación (mostrará los errores actuales)
@Database/validate_corrections.sql
```

**Resultado esperado:** Se mostrarán múltiples errores indicando que las columnas no existen con los nombres correctos.

### Paso 3: Aplicar Correcciones

```sql
-- Ejecutar el script de corrección
@Database/fix_column_names.sql
```

**Duración aproximada:** 2-5 minutos

**Salida esperada:**
```
Table altered.
Table altered.
...
Commit complete.
```

### Paso 4: Validar Correcciones

```sql
-- Ejecutar nuevamente el script de validación
@Database/validate_corrections.sql
```

**Resultado esperado:**
```
=== VALIDACIÓN DE CORRECCIONES DE COLUMNAS ===

✓ ORDEN_VENTA.ID_SUCURSAL_CLIENTE - OK
✓ LISTA_PRECIOS.FECHA_HASTA_LISTA_PRECIOS - OK
✓ ORDEN_VENTA_DETALLE.CANTIDAD_SOLICITUD_VENTA_COMPRA_DETALLE - OK
...
✓ TODAS LAS CORRECCIONES APLICADAS EXITOSAMENTE
```

### Paso 5: Verificar Aplicación .NET

```bash
# Navegar al directorio del proyecto
cd MuebleriaBackend/MuebleriaCore

# Compilar el proyecto
dotnet build

# Ejecutar las pruebas
dotnet test

# Iniciar la aplicación
dotnet run
```

### Paso 6: Pruebas Funcionales

#### 6.1 Probar Endpoints de Órdenes de Venta

```bash
# GET - Listar órdenes
curl -X GET "http://localhost:5000/api/ordenes-venta" \
  -H "Authorization: Bearer YOUR_TOKEN"

# GET - Obtener orden específica
curl -X GET "http://localhost:5000/api/ordenes-venta/1" \
  -H "Authorization: Bearer YOUR_TOKEN"

# POST - Crear nueva orden
curl -X POST "http://localhost:5000/api/ordenes-venta" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "clienteId": 1,
    "subtotal": 1000.00,
    "impuesto": 120.00,
    "total": 1120.00,
    "metodoPago": "Efectivo",
    "descripcion": "Orden de prueba",
    "items": [
      {
        "articuloId": 1,
        "cantidad": 5,
        "precioUnitario": 200.00
      }
    ]
  }'
```

#### 6.2 Probar Endpoints de Artículos

```bash
# GET - Listar artículos
curl -X GET "http://localhost:5000/api/articulos" \
  -H "Authorization: Bearer YOUR_TOKEN"

# GET - Obtener artículo con stock
curl -X GET "http://localhost:5000/api/articulos/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🚨 Resolución de Problemas

### Error: "ORA-00904: invalid identifier"

**Causa:** La corrección no se aplicó correctamente o hay código que aún usa nombres antiguos.

**Solución:**
```sql
-- Verificar nombre actual de la columna
SELECT column_name 
FROM user_tab_columns 
WHERE table_name = 'NOMBRE_TABLA';

-- Si es necesario, ejecutar corrección manual
ALTER TABLE nombre_tabla 
RENAME COLUMN nombre_viejo TO nombre_nuevo;
```

### Error: "ORA-02264: name already used by an existing constraint"

**Causa:** Un constraint ya existe con ese nombre.

**Solución:**
```sql
-- Eliminar constraint existente
ALTER TABLE nombre_tabla DROP CONSTRAINT nombre_constraint;

-- Recrear con nombre correcto
ALTER TABLE nombre_tabla ADD CONSTRAINT nombre_constraint
  FOREIGN KEY (columna) REFERENCES otra_tabla(columna);
```

### Error: "Compilation failed" en .NET

**Causa:** El código C# aún referencia nombres antiguos de columnas.

**Solución:**
1. Buscar referencias al nombre antiguo:
   ```bash
   grep -r "ID_SUCURSAL_CLEINTE" MuebleriaCore/
   ```
2. Reemplazar con el nombre correcto
3. Recompilar: `dotnet build`

---

## 📊 Checklist de Validación

Marque cada ítem después de verificarlo:

### Base de Datos
- [ ] Backup creado y verificado
- [ ] Script fix_column_names.sql ejecutado sin errores
- [ ] Script validate_corrections.sql muestra todas las validaciones OK
- [ ] Constraints actualizados correctamente
- [ ] No hay objetos inválidos: `SELECT * FROM user_objects WHERE status = 'INVALID';`

### Aplicación .NET
- [ ] Proyecto compila sin errores
- [ ] Pruebas unitarias pasan
- [ ] Aplicación inicia correctamente
- [ ] Endpoint /api/ordenes-venta funciona
- [ ] Endpoint /api/articulos funciona
- [ ] Inserción de datos funciona
- [ ] Consultas con JOIN funcionan

### Pruebas Funcionales
- [ ] Crear orden de venta
- [ ] Listar órdenes de venta
- [ ] Consultar detalle de orden
- [ ] Actualizar estado de orden
- [ ] Listar artículos con stock
- [ ] Consultar artículo individual

---

## 📝 Rollback (Si es necesario)

### Opción 1: Restaurar desde Backup

```sql
-- Importar desde Data Pump
impdp usuario/password@database \
  schemas=NOMBRE_SCHEMA \
  directory=DATA_PUMP_DIR \
  dumpfile=backup_antes_correccion_%U.dmp \
  logfile=restore.log \
  table_exists_action=replace
```

### Opción 2: Script de Rollback Manual

```sql
-- Revertir cambios (ejemplo)
ALTER TABLE ORDEN_VENTA RENAME COLUMN ID_SUCURSAL_CLIENTE TO ID_SUCURSAL_CLEINTE;
ALTER TABLE LISTA_PRECIOS RENAME COLUMN FECHA_HASTA_LISTA_PRECIOS TO FECHA_HASTA_LISTA_PREICOS;
-- ... (continuar con todas las columnas)
```

**⚠️ Nota:** Solo ejecutar rollback si hay problemas críticos irresolubles.

---

## 📞 Soporte

Si encuentra problemas no documentados:

1. Verificar logs de Oracle: `$ORACLE_BASE/diag/rdbms/.../trace/alert_*.log`
2. Revisar logs de aplicación: `MuebleriaCore/logs/`
3. Consultar documento: `Database/CORRECCION_NOMBRES_ATRIBUTOS.md`

---

## ✅ Confirmación Final

Una vez completados todos los pasos y validaciones:

```sql
-- Ejecutar prueba integral
SELECT 
    'Prueba exitosa' as resultado,
    COUNT(*) as ordenes_totales
FROM ORDEN_VENTA ov
JOIN ORDEN_VENTA_DETALLE ovd ON ovd.ID_ORDEN_VENTA = ov.ID_ORDEN_VENTA
JOIN ARTICULO a ON a.ID_ARTICULO = ovd.ID_ARTICULO
JOIN STOCK_ARTICULO sa ON sa.ID_ARTICULO = a.ID_ARTICULO
WHERE ov.ID_SUCURSAL_CLIENTE IS NOT NULL
  AND sa.CANTIDAD_DIPONIBLE_STOCK_ARTICULO >= 0;
```

**Resultado esperado:** Query ejecuta sin errores.

---

**Fecha de aplicación:** _______________  
**Aplicado por:** _______________  
**Ambiente:** [ ] Desarrollo [ ] QA [ ] Producción  
**Estado:** [ ] Exitoso [ ] Parcial [ ] Fallido  

---

*Guía generada automáticamente - MuebleriaCore Project*
