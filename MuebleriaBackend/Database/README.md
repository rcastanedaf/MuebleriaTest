# 📁 Database - Scripts y Documentación

Este directorio contiene todos los scripts SQL y documentación relacionada con las correcciones de nomenclatura aplicadas al esquema de base de datos Oracle 21c del proyecto MuebleriaCore.

## 📄 Archivos en este Directorio

### Scripts SQL

#### `fix_column_names.sql` ⭐ **PRINCIPAL**
Script completo de corrección que renombra 25 columnas con errores tipográficos.

**Uso:**
```bash
sqlplus usuario/password@database
SQL> @fix_column_names.sql
```

**Tiempo estimado:** 2-5 minutos  
**Prerrequisitos:** Backup de base de datos

---

#### `validate_corrections.sql` 🔍
Script de validación que verifica que todas las correcciones se hayan aplicado correctamente.

**Uso:**
```bash
SQL> @validate_corrections.sql
```

**Salida esperada:** Mensaje de confirmación con checkmarks (✓) para cada corrección

---

### Documentación

#### `RESUMEN_EJECUTIVO.md` 📊
Documento de alto nivel para stakeholders y management.

**Contenido:**
- Métricas del proyecto
- Impacto en el negocio
- Plan de implementación
- KPIs de éxito

**Audiencia:** Product Owners, Tech Leads, Management

---

#### `CORRECCION_NOMBRES_ATRIBUTOS.md` 📝
Documentación técnica detallada de cada corrección.

**Contenido:**
- Lista completa de 25 errores corregidos
- Explicación de cada typo
- Impacto de cada cambio
- Archivos de código actualizados

**Audiencia:** Desarrolladores, DBAs, Arquitectos

---

#### `GUIA_APLICACION.md` 🔧
Guía práctica paso a paso para aplicar las correcciones.

**Contenido:**
- Pre-requisitos detallados
- Pasos de implementación
- Validación y testing
- Troubleshooting
- Plan de rollback

**Audiencia:** DBAs, DevOps, Desarrolladores Senior

---

## 🚀 Quick Start

### Para Desarrolladores

```bash
# 1. Leer el resumen
cat Database/RESUMEN_EJECUTIVO.md

# 2. Revisar cambios específicos
cat Database/CORRECCION_NOMBRES_ATRIBUTOS.md

# 3. Compilar proyecto (ya actualizado)
dotnet build
```

### Para DBAs

```bash
# 1. Crear backup
expdp usuario/password@database schemas=SCHEMA directory=BACKUP_DIR dumpfile=backup.dmp

# 2. Aplicar correcciones
sqlplus usuario/password@database @Database/fix_column_names.sql

# 3. Validar
sqlplus usuario/password@database @Database/validate_corrections.sql
```

---

## 📋 Checklist de Implementación

### Pre-Implementación
- [ ] Leer RESUMEN_EJECUTIVO.md
- [ ] Revisar GUIA_APLICACION.md
- [ ] Obtener aprobaciones necesarias
- [ ] Programar ventana de mantenimiento

### Implementación
- [ ] Crear backup completo de BD
- [ ] Ejecutar fix_column_names.sql
- [ ] Ejecutar validate_corrections.sql
- [ ] Verificar que todas las validaciones pasen

### Post-Implementación
- [ ] Compilar aplicación .NET
- [ ] Ejecutar suite de pruebas
- [ ] Validar endpoints críticos
- [ ] Monitorear logs por 24h

---

## 🔍 Correcciones Principales

Las 5 correcciones más importantes:

1. **ORDEN_VENTA.ID_SUCURSAL_CLEINTE** → `ID_SUCURSAL_CLIENTE`
2. **STOCK_ARTICULO.CANTIDAD_DIPONIBLE_STOCK_ARTICULO** → `CANTIDAD_DIPONIBLE_STOCK_ARTICULO`
3. **ORDEN_VENTA_DETALLE.CANTIDADSOLICITUDVENTACOMPRADETALLE** → `CANTIDAD_SOLICITUD_VENTA_COMPRA_DETALLE`
4. **LISTA_PRECIOS.FECHA_HASTA_LISTA_PREICOS** → `FECHA_HASTA_LISTA_PRECIOS`
5. **FACTURA_VENTA_DETALLE.ID_FACRURA_VENTA** → `ID_FACTURA_VENTA`

Ver lista completa en `CORRECCION_NOMBRES_ATRIBUTOS.md`

---

## 🎯 Impacto en el Código

### Archivos C# Actualizados

| Archivo | Cambios | Estado |
|---------|---------|--------|
| `OrdenesVentaController.cs` | 6 correcciones | ✅ Aplicado |
| `ArticulosController.cs` | Ya correcto | ✅ Verificado |
| `OracleHelper.cs` | BindByName agregado | ✅ Aplicado |

### Compilación
```bash
✅ Build successful
✅ 0 errors
✅ 0 warnings
```

---

## ⚠️ Advertencias Importantes

1. **SIEMPRE crear backup antes de ejecutar scripts**
2. **Ejecutar primero en ambiente de desarrollo**
3. **Validar con script de validación**
4. **Mantener ventana de rollback disponible**
5. **Monitorear aplicación después del deploy**

---

## 🆘 Soporte y Troubleshooting

### Problema: Script falla en la mitad
**Solución:** El script no tiene transacciones, las correcciones exitosas persisten. Identificar la línea que falló y ejecutar manualmente.

### Problema: Validación muestra errores
**Solución:** Revisar mensajes específicos y ejecutar correcciones pendientes manualmente.

### Problema: Aplicación no compila después del cambio
**Solución:** Verificar que el código C# esté actualizado. Ejecutar `dotnet clean` y `dotnet build`.

### Problema: Queries fallan con "invalid identifier"
**Solución:** 
```sql
-- Verificar nombre actual
SELECT column_name FROM user_tab_columns WHERE table_name = 'TABLA_PROBLEMA';
-- Corregir manualmente si es necesario
```

---

## 📞 Contacto

Para preguntas o problemas relacionados con estas correcciones:

- **Documentación completa:** Ver archivos .md en este directorio
- **Soporte técnico:** Consultar GUIA_APLICACION.md sección "Troubleshooting"
- **Rollback:** Seguir procedimiento en GUIA_APLICACION.md

---

## 📚 Referencias

- [Documentación Oracle - ALTER TABLE](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/ALTER-TABLE.html)
- [Oracle Naming Conventions Best Practices](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/Database-Object-Names-and-Qualifiers.html)
- [.NET Oracle Provider Documentation](https://www.oracle.com/database/technologies/appdev/dotnet/odp.html)

---

## 📜 Historial de Versiones

| Versión | Fecha | Cambios | Autor |
|---------|-------|---------|-------|
| 1.0 | 2025 | Correcciones iniciales de 25 columnas | GitHub Copilot |

---

## ✅ Estado del Proyecto

| Categoría | Estado |
|-----------|--------|
| Scripts SQL | ✅ Completos |
| Documentación | ✅ Completa |
| Código C# | ✅ Actualizado |
| Compilación | ✅ Exitosa |
| Testing | ⏳ Pendiente |
| Deploy Desarrollo | ⏳ Pendiente |
| Deploy Producción | ⏳ Pendiente |

---

**Última actualización:** 2025  
**Mantenido por:** Equipo de Desarrollo MuebleriaCore  
**Versión de Oracle:** 21c  
**Versión de .NET:** 8.0  

---

## 🏆 Siguientes Pasos

1. Revisar y aprobar documentación ✓
2. Programar ventana de mantenimiento
3. Ejecutar en desarrollo
4. Validar funcionamiento
5. Ejecutar en QA
6. Deploy a producción
7. Actualizar esta documentación con resultados

---

*Para comenzar, lee primero el **RESUMEN_EJECUTIVO.md** 📊*
