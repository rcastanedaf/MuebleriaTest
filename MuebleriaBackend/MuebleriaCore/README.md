# MuebleriaCore — .NET 8 Web API + Oracle 21c

## Requisitos
| Herramienta | Versión |
|---|---|
| .NET SDK | **8.0** (https://dotnet.microsoft.com/download/dotnet/8.0) |
| Oracle Database | 21c XE (XEPDB1) |
| Visual Studio | 2022 **o** VS Code con extensión C# |

---

## Inicio rápido

### 1. Restaurar y ejecutar
```bash
cd MuebleriaCore
dotnet restore
dotnet run
```
La API arranca en `https://localhost:5001` y `http://localhost:5000`.
Swagger disponible en: **https://localhost:5001/swagger**

### 2. Configurar Oracle en appsettings.json
```json
"ConnectionStrings": {
  "Oracle": "Data Source=(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=localhost)(PORT=1521))(CONNECT_DATA=(SERVICE_NAME=XEPDB1)));User Id=MUEBLERIA_USER;Password=TuPassword;"
}
```

### 3. Crear usuario Oracle
```sql
ALTER SESSION SET CONTAINER = XEPDB1;
CREATE USER MUEBLERIA_USER IDENTIFIED BY "Muebleria2025!"
  DEFAULT TABLESPACE USERS QUOTA UNLIMITED ON USERS;
GRANT CONNECT, RESOURCE, CREATE SESSION TO MUEBLERIA_USER;
```
Ejecutar el DDL `MuebleríaSql.txt` conectado como MUEBLERIA_USER.

### 4. Datos iniciales mínimos
```sql
INSERT INTO ROLES(NOMBRE_ROL,DESCRIPCION_ROL,RANGO_ROL) VALUES('admin','Administrador',1);
INSERT INTO ROLES(NOMBRE_ROL,DESCRIPCION_ROL,RANGO_ROL) VALUES('cliente','Cliente Portal',10);
INSERT INTO EMPRESAS(NOMBRE_EMPRESA,NIT_EMPRESA,RAZON_SOCIAL_EMPRESA)
  VALUES('Muebles Los Alpes','1234567-8','Muebles Los Alpes S.A.');
INSERT INTO SUCURSALES(CODIGO_SUCURSAL,NOMBRE_SUCURSAL,ESTADO_SUCURSAL,ID_EMPRESA)
  VALUES('SUC-01','Sucursal Central','A',1);
COMMIT;
```

### 5. Conectar con el frontend React
Editar `src/core/api/apiClient.ts`:
```typescript
const API_BASE_URL = "https://localhost:5001/api";
```

---

## Estructura
```
MuebleriaCore/
├── Program.cs                         ← Startup: JWT, CORS, Swagger, DI
├── appsettings.json                   ← Oracle connection string + JWT config
├── MuebleriaCore.csproj               ← .NET 8, paquetes NuGet
├── Data/
│   └── OracleHelper.cs                ← Conexión Oracle centralizada
├── Services/
│   └── JwtService.cs                  ← Generación de tokens JWT
├── Controllers/
│   ├── BaseController.cs              ← Helpers comunes (CurrentUserId, OkList, HandleOracleError)
│   ├── Auth/AuthController.cs         ← POST /login, /register · GET /profile
│   ├── Inventario/ArticulosController.cs  ← GET/POST/PUT/DELETE /articulos
│   ├── Ventas/OrdenesVentaController.cs   ← checkout atómico con transacción Oracle
│   └── AllModulesController.cs        ← 25+ módulos CRUD restantes
```

## Endpoints principales

| Módulo | Endpoint | Auth |
|---|---|---|
| Auth | POST /api/auth/login | Público |
| Auth | POST /api/auth/register | Público |
| Auth | GET /api/auth/profile | Bearer |
| Artículos | GET /api/articulos | Público |
| Artículos | POST/PUT/DELETE | admin |
| Órdenes Venta | POST /api/ordenes-venta | Bearer (checkout) |
| Clientes | DELETE (valida compras) | admin |
| Todos los módulos | GET/POST/PUT/DELETE | admin |

## Publicar en IIS
```bash
dotnet publish -c Release -o ./publish
```
Copiar `./publish` al directorio del sitio IIS.
Instalar el **ASP.NET Core Hosting Bundle** en el servidor.
