# Muebles Los Alpes — Frontend

**Stack:** React 18 + TypeScript + Clean Architecture

## Configurar backend
Editar `src/core/api/apiClient.ts`:
```ts
const API_BASE_URL = "http://localhost:44300/api"; // tu URL VB.NET
```

## Instalar y correr
```bash
npm install
npm start        # http://localhost:3000
npm run build    # build de producción
```

## Estructura
```
src/
├── core/           # api client, errores, tipos Oracle
├── features/       # auth, catalog, cart, checkout, admin
│   └── [feature]/  # domain/ data/ hooks/ components/
├── shared/         # Button, Input, Modal, Badge, hooks, utils
├── pages/          # portal/ admin/
├── store/          # authStore, cartStore (Context)
└── App.tsx         # root con providers
```
