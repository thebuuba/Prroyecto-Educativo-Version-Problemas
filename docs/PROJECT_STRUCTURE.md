# Project Structure

## Estructura actual

```text
.
├── apps/
│   ├── api/                    # API Express movida desde server/
│   │   ├── src/
│   │   │   ├── app.js          # Express app sin listen()
│   │   │   ├── server.js       # Arranque HTTP
│   │   │   ├── config/
│   │   │   ├── middleware/
│   │   │   ├── routes/         # Rutas legacy actuales
│   │   │   ├── controllers/    # Destino de migración
│   │   │   ├── services/       # Destino de lógica de negocio
│   │   │   ├── repositories/   # Destino de SQL/acceso a datos
│   │   │   ├── validators/     # Destino de validaciones
│   │   │   ├── db/
│   │   │   └── utils/
│   │   └── scripts/
│   └── web/
│       ├── vite.config.js      # Configuración real de Vite
│       ├── public/             # Assets servidos como /assets/...
│       ├── styles.css          # Entrada CSS real
│       ├── styles/             # CSS global actual
│       ├── src/page-entry/      # Entrada real del frontend
│       └── README.md
├── js/
│   ├── core/
│   │   ├── legacy-api.ts       # Registro ES por dominio para globals legacy
│   │   ├── legacy-bridge.ts    # Instalación mínima en window
│   │   ├── routing.ts
│   │   ├── hydration.ts
│   │   ├── api-sql.ts
│   │   └── ...
│   ├── panels/
│   └── page-entry/
├── login-registro-auth/
├── packages/
│   ├── shared/
│   ├── ui/
│   └── database/
├── scripts/
├── sections/
├── supabase/
│   ├── schema.sql
│   ├── migrations/
│   └── seed.sql
├── server/                     # Adaptador temporal hacia apps/api
├── index.html                  # Frontend root legacy temporal
└── vite.config.js              # Adaptador hacia apps/web/vite.config.js
```

## Estructura objetivo

```text
aulabase/
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   ├── shared/
│   ├── ui/
│   └── database/
├── docs/
├── scripts/
├── supabase/
├── package.json
└── README.md
```

## Frontend

El frontend runtime sigue temporalmente en la raíz:

- `index.html`
- `js/`
- `sections/`
- `login-registro-auth/`
- `styles.css` raíz se conserva como adaptador hacia `apps/web/styles.css`.
- `js/page-entry/root.ts` raíz se conserva como adaptador hacia `apps/web/src/page-entry/root.ts`.

Motivo: hay imports absolutos (`/js/...`, `/login-registro-auth/...`), HTML inline y scripts de ensamblado que dependen de esas rutas. La separación segura consiste en mover por grupos y dejar adaptadores hasta que `npm run build` y `npm run imports:check` pasen en cada etapa.

## Paneles

Estructura esperada por panel:

```text
js/panels/<panel>/
├── principal.ts
├── components/
│   └── vista.ts
├── services/
├── utils/
│   └── actions.ts
├── styles/
├── html/
└── README.md
```

Reglas:

- `principal.ts` registra renderizadores y acciones, pero no debe acumular reglas de negocio.
- `components/vista.ts` contiene render grande.
- `utils/actions.ts` contiene handlers de UI, especialmente los que aún se exponen a `window`.
- `services/` debe recibir lógica de negocio pura cuando el panel crezca.

## Backend

`apps/api/src/app.js` exporta la app Express; `apps/api/src/server.js` escucha el puerto. Esto permite testear `app` sin levantar servidor.

Las rutas actuales todavía contienen SQL y reglas de negocio. La migración futura debe mover:

- normalización y validación a `validators/`
- reglas de negocio a `services/`
- SQL a `repositories/`
- request/response a `controllers/`

## Base de datos

SQL ejecutable:

- `supabase/schema.sql`
- `supabase/migrations/*.sql`
- `supabase/seed.sql`

`apps/api/src/db/migrate.js` lee esa ubicación y mantiene fallback a la ubicación legacy.
