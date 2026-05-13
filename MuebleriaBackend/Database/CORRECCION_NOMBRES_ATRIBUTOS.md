# Corrección de Nombres de Atributos - Base de Datos Oracle

## Resumen de Errores Encontrados y Corregidos

Este documento detalla todos los errores tipográficos encontrados en los nombres de columnas del esquema de base de datos Oracle 21c y las correcciones aplicadas.

---

## Lista de Correcciones

### 1. **Tabla: ORDEN_VENTA**
- **Error:** `ID_SUCURSAL_CLEINTE`
- **Correcto:** `ID_SUCURSAL_CLIENTE`
- **Tipo:** Typo en "CLIENTE"
- **Impacto:** Constraint FK_OV_SUCLI actualizado

### 2. **Tabla: LISTA_PRECIOS**
- **Error:** `FECHA_HASTA_LISTA_PREICOS`
- **Correcto:** `FECHA_HASTA_LISTA_PRECIOS`
- **Tipo:** Typo en "PRECIOS"

### 3. **Tabla: ORDEN_VENTA_DETALLE**
- **Error:** `CANTIDADSOLICITUDVENTACOMPRADETALLE`
- **Correcto:** `CANTIDAD_SOLICITUD_VENTA_COMPRA_DETALLE`
- **Tipo:** Falta de separación con guiones bajos

### 4. **Tabla: PERMISOS**
- **Error:** `ULTMO_CMABIO_PERMISO`
- **Correcto:** `ULTIMO_CAMBIO_PERMISO`
- **Tipo:** Múltiples typos

### 5. **Tabla: JORNADAS**
- **Error:** `JORA_FIN_JORNADA`
- **Correcto:** `HORA_FIN_JORNADA`
- **Tipo:** Falta letra "H"

### 6. **Tabla: FACTURA_VENTA**
- **Error:** `ORSIFRVACION_SALIDA_MERCADERIA`
- **Correcto:** `OBSERVACION_SALIDA_MERCADERIA`
- **Tipo:** Typo severo en "OBSERVACION"

### 7. **Tabla: FACTURA_VENTA_DETALLE**
- **Error:** `ID_FACRURA_VENTA`
- **Correcto:** `ID_FACTURA_VENTA`
- **Tipo:** Typo en "FACTURA"
- **Impacto:** Constraint FK_FVD_FV actualizado

### 8. **Tabla: ENTREGA**
- **Error:** `APELLIDAS_RECIBE_ENTREGA`
- **Correcto:** `APELLIDOS_RECIBE_ENTREGA`
- **Tipo:** Singular/plural incorrecto

### 9. **Tabla: ENTREGA**
- **Error:** `DPL_RECIBRE_ENTREGA`
- **Correcto:** `DPI_RECIBE_ENTREGA`
- **Tipo:** Múltiples typos (DPI es el documento de identificación estándar)

### 10. **Tabla: ENTREGA**
- **Error:** `OBSERVACIÓN_ENTREGA`
- **Correcto:** `OBSERVACION_ENTREGA`
- **Tipo:** Carácter especial (tilde) no recomendado en nombres de columnas

### 11. **Tabla: SEGUIMIENTO_ENVIO**
- **Error:** `DESCRIPCION_SEGUIMINETO_ENVIO`
- **Correcto:** `DESCRIPCION_SEGUIMIENTO_ENVIO`
- **Tipo:** Typo en "SEGUIMIENTO"

### 12. **Tabla: SEGUIMIENTO_ENVIO**
- **Error:** `ID_USUARIO_MODIFCA`
- **Correcto:** `ID_USUARIO_MODIFICA`
- **Tipo:** Falta letra "I"
- **Impacto:** Constraint FK_SE_UMOD actualizado

### 13. **Tabla: CENTRO_TRABAJO**
- **Error:** `VOSTO_HORA_CENTRO_TRABAJO`
- **Correcto:** `COSTO_HORA_CENTRO_TRABAJO`
- **Tipo:** Letra "V" en lugar de "C"

### 14. **Tabla: LISTA_MATERIALES**
- **Error:** `NOMBRE_LISTA__MATERIALES`
- **Correcto:** `NOMBRE_LISTA_MATERIALES`
- **Tipo:** Doble guion bajo

### 15. **Tabla: LISTA_MATERIALES**
- **Error:** `VERRSION_LISTA_MATERIALES`
- **Correcto:** `VERSION_LISTA_MATERIALES`
- **Tipo:** Doble "R"

### 16. **Tabla: ORDEN_PRODUCCION**
- **Error:** `FECHA_IN_REAL_OIRDEN_PRODUCCION`
- **Correcto:** `FECHA_IN_REAL_ORDEN_PRODUCCION`
- **Tipo:** Typo en "ORDEN"

### 17. **Tabla: ORDEN_PRODUCCION**
- **Error:** `FECHA_FIN_REAL_ORIDEN_PRODUCCION`
- **Correcto:** `FECHA_FIN_REAL_ORDEN_PRODUCCION`
- **Tipo:** Typo en "ORDEN"

### 18. **Tabla: ORDEN_PRODUCCION**
- **Error:** `CANTIDAD_PRODUCIDA_ORIDEN_PRODUCCION`
- **Correcto:** `CANTIDAD_PRODUCIDA_ORDEN_PRODUCCION`
- **Tipo:** Typo en "ORDEN"

### 19. **Tabla: MOVIMIENTO_INVENTARIO**
- **Error:** `ID_DOCUEMNTO_ORIGEN_MOVIMIENTO_INVENTARIO`
- **Correcto:** `ID_DOCUMENTO_ORIGEN_MOVIMIENTO_INVENTARIO`
- **Tipo:** Typo en "DOCUMENTO"

### 20. **Tabla: NOMINA**
- **Error:** `ID_USUSARIO_MODIFICA`
- **Correcto:** `ID_USUARIO_MODIFICA`
- **Tipo:** Doble "S"
- **Impacto:** Constraint FK_NOM_UMOD actualizado

### 21. **Tabla: CONTRATO_EMPLEADO**
- **Error:** `ID_CONTRADO_EMPLEADO`
- **Correcto:** `ID_CONTRATO_EMPLEADO`
- **Tipo:** Falta letra "T"

### 22. **Tabla: TRANSPORTISTA**
- **Error:** `DPI_TRANPORTISTA`
- **Correcto:** `DPI_TRANSPORTISTA`
- **Tipo:** Falta letra "S"

### 23. **Tabla: STOCK_ARTICULO**
- **Error:** `CANTIDAD_DIPONIBLE_STOCK_ARTICULO`
- **Correcto:** `CANTIDAD_DIPONIBLE_STOCK_ARTICULO`
- **Tipo:** Falta letra "S"

---

## Archivos Actualizados

### Scripts SQL
- **`Database/fix_column_names.sql`**: Script completo de corrección para ejecutar en Oracle

### Código C# (Controllers)
- **`MuebleriaCore/Controllers/Ventas/OrdenesVentaController.cs`**:
  - Corregido `ID_SUCURSAL_CLEINTE` → `ID_SUCURSAL_CLIENTE` (5 ocurrencias)
  - Corregido `CANTIDADSOLICITUDVENTACOMPRADETALLE` → `CANTIDAD_SOLICITUD_VENTA_COMPRA_DETALLE`

- **`MuebleriaCore/Controllers/Inventario/ArticulosController.cs`**:
  - Ya contenía los nombres correctos (verificado)

---

## Instrucciones de Aplicación

### 1. Aplicar Correcciones en la Base de Datos
```bash
# Conectarse a Oracle como usuario con privilegios
sqlplus usuario/password@database

# Ejecutar el script de corrección
@Database/fix_column_names.sql
```

### 2. Verificar las Correcciones
```sql
-- Verificar estructura de tablas corregidas
DESC ORDEN_VENTA;
DESC ORDEN_VENTA_DETALLE;
DESC LISTA_PRECIOS;
DESC STOCK_ARTICULO;
-- ... etc
```

### 3. Recompilar el Proyecto .NET
```bash
dotnet build
```

### 4. Ejecutar Pruebas
- Probar endpoints de órdenes de venta
- Verificar consultas de artículos
- Validar inserción de datos

---

## Notas Importantes

1. **Backup**: Siempre crear un backup de la base de datos antes de aplicar cambios estructurales
2. **Downtime**: Considerar realizar estos cambios durante una ventana de mantenimiento
3. **Dependencias**: Verificar que no existan vistas, procedimientos almacenados o triggers que referencien los nombres antiguos
4. **Testing**: Probar exhaustivamente después de aplicar los cambios

---

## Prevención de Errores Futuros

### Recomendaciones:
1. Usar herramientas de generación de DDL con validación de nombres
2. Implementar revisión de código para scripts SQL
3. Establecer convenciones de nomenclatura claras:
   - Usar solo caracteres ASCII
   - Separar palabras con guiones bajos
   - Evitar abreviaciones confusas
   - Mantener consistencia en singular/plural

---

## Estado del Proyecto

✅ **Correcciones Aplicadas:**
- Script SQL de corrección creado
- Código C# actualizado en controllers
- Proyecto compila correctamente

⚠️ **Pendiente:**
- Ejecutar script en base de datos Oracle
- Validar funcionamiento en ambiente de desarrollo
- Probar endpoints afectados

---

*Documento generado el: 2025*
*Autor: GitHub Copilot*
