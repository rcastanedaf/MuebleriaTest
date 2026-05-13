# ?? QUICK START - Corrección de Nomenclatura

## Para Implementar HOY (5 minutos)

```bash
# 1. Ir a la carpeta Database
cd Database

# 2. Conectar a Oracle
sqlplus usuario/password@database

# 3. Ejecutar correcciones
SQL> @fix_column_names.sql

# 4. Validar (debe mostrar TODO OK ?)
SQL> @validate_corrections.sql

# 5. Listo! ??
```

---

## ?? ¿Qué Leer Primero?

### ????? Si eres Manager/Product Owner
? Lee: `Database/RESUMEN_EJECUTIVO.md`
?? Tiempo: 5 min

### ????? Si eres Desarrollador
? Lee: `Database/CORRECCION_NOMBRES_ATRIBUTOS.md`
?? Tiempo: 10 min

### ?? Si eres DBA/DevOps
? Lee: `Database/GUIA_APLICACION.md`
?? Tiempo: 15 min

### ?? Si eres Nuevo en el Proyecto
? Lee: `Database/README.md`
?? Tiempo: 5 min

---

## ? Comandos Útiles

### Verificar si ya se aplicaron las correcciones
```sql
SELECT column_name 
FROM user_tab_columns 
WHERE table_name = 'ORDEN_VENTA' 
AND column_name LIKE '%SUCURSAL%';

-- Si ves "ID_SUCURSAL_CLIENTE" ? Ya está corregido ?
-- Si ves "ID_SUCURSAL_CLEINTE" ? Falta aplicar corrección
```

### Compilar aplicación .NET
```bash
cd MuebleriaCore
dotnet build
dotnet run
```

### Probar endpoints
```bash
# Órdenes de venta
curl http://localhost:5000/api/ordenes-venta

# Artículos
curl http://localhost:5000/api/articulos
```

---

## ?? Lo Más Importante

### ? HACER:
1. **CREAR BACKUP** antes de cualquier cambio
2. **LEER** la guía de aplicación
3. **VALIDAR** después de ejecutar scripts
4. **PROBAR** la aplicación después del cambio

### ? NO HACER:
1. **NO** ejecutar scripts sin backup
2. **NO** aplicar en producción sin probar en desarrollo
3. **NO** ignorar errores de validación
4. **NO** olvidar actualizar documentación

---

## ?? Resumen Ultra-Rápido

```
PROBLEMA:
? ORA-01008: no todas las variables han sido enlazadas
? 25 columnas con nombres incorrectos (typos)

SOLUCIÓN:
? Scripts SQL para renombrar columnas
? Código C# actualizado con BindByName = true
? Documentación completa

RESULTADO:
? Proyecto compila sin errores
? Listo para deploy
```

---

## ?? Top 5 Correcciones

```
1. ID_SUCURSAL_CLEINTE      ? ID_SUCURSAL_CLIENTE
2. CANTIDAD_DIPONIBLE       ? CANTIDAD_DISPONIBLE
3. CANTIDADSOLICITUD...     ? CANTIDAD_SOLICITUD_...
4. FECHA_HASTA_..._PREICOS  ? FECHA_HASTA_..._PRECIOS
5. ID_FACRURA_VENTA         ? ID_FACTURA_VENTA
```

---

## ?? ¿Necesitas Ayuda?

**Documentación completa en:**
```
Database/
??? README.md                    ? Start here!
??? RESUMEN_EJECUTIVO.md         ? Para managers
??? CORRECCION_NOMBRES_ATRIBUTOS.md  ? Detalle técnico
??? GUIA_APLICACION.md           ? Paso a paso
??? fix_column_names.sql         ? Script principal ?
??? validate_corrections.sql     ? Validación
```

---

## ?? Tiempo Estimado

| Tarea | Tiempo |
|-------|--------|
| Leer documentación | 10 min |
| Crear backup | 5 min |
| Ejecutar scripts | 3 min |
| Validar | 2 min |
| Probar aplicación | 10 min |
| **TOTAL** | **30 min** |

---

## ?? Después de Aplicar

1. ? Marcar como completado en tu checklist
2. ?? Actualizar documentación del proyecto
3. ?? Notificar al equipo
4. ?? Monitorear logs por 24h
5. ?? Celebrar! Has mejorado el proyecto significativamente

---

## ?? Confianza del Deploy

```
????????????????????? 100%

? Scripts probados
? Código actualizado
? Proyecto compila
? Documentación completa
? Plan de rollback disponible
```

---

## ?? Semáforo de Prioridad

?? **CRÍTICO - Aplicar AHORA:**
- ORA-01008 bloqueando producción

?? **IMPORTANTE - Aplicar esta semana:**
- Mejora de calidad de código

?? **OPCIONAL - Aplicar cuando sea conveniente:**
- Typos cosméticos sin impacto funcional

---

## ?? Versión TL;DR (Too Long; Didn't Read)

```
1. cd Database
2. sqlplus user/pass@db
3. @fix_column_names.sql
4. @validate_corrections.sql
5. Done! ??
```

**Backup primero!** ??

---

## ?? Objetivo del Proyecto

> Corregir 25 errores tipográficos en nombres de columnas Oracle  
> para prevenir ORA-01008 y mejorar calidad del código.

**Estado:** ? COMPLETO  
**Listo para:** ?? DEPLOY  

---

*Creado para el equipo MuebleriaCore - 2025*

**¿Primera vez aquí?** ? Lee `Database/README.md`  
**¿Listo para aplicar?** ? Lee `Database/GUIA_APLICACION.md`  
**¿Quieres entender el impacto?** ? Lee `Database/RESUMEN_EJECUTIVO.md`
