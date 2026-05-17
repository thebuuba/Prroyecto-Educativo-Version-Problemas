# AulaBase / EduGest

Sistema de gestión educativa para docentes: cursos, estudiantes, calificaciones, asistencia, planificación, horario, instrumentos y reportes.

## Estado de arquitectura

El proyecto está en una migración gradual hacia una estructura de monorepo:

```text
aulabase/
├── apps/
│   ├── web/      # Configuración y futuro root del frontend Vite
│   └── api/      # Backend Express
├── packages/
│   ├── shared/   # Futuras constantes/tipos/normalizadores compartidos
│   ├── ui/       # Futuro sistema UI reutilizable
│   └── database/ # Futuros contratos/helpers de datos
├── docs/
├── scripts/
├── supabase/     # schema.sql, migraciones y seed
├── index.html    # Root legacy temporal del frontend
├── js/           # Frontend legacy/modular actual y adaptadores
├── sections/     # Fragmentos HTML ensamblados
├── styles.css    # Adaptador CSS hacia apps/web/styles.css
└── package.json
```

La API ya vive en `apps/api`. El frontend ya tiene configuración Vite, CSS global, assets públicos y la entrada `page-entry/root.ts` en `apps/web/`, pero todavía usa `index.html`, gran parte de `js/`, `sections/` y `login-registro-auth/` desde la raíz para no romper imports absolutos ni el ensamblado actual. `styles.css` y `js/page-entry/root.ts` quedan como adaptadores de compatibilidad.

## Comandos

```bash
npm run dev              # Vite dev server
npm run build            # Build frontend
npm run imports:check    # Verifica imports locales básicos
npm run backend:check    # Sintaxis backend
npm run backend:smoke    # Smoke test API + DB
npm run check            # Build + imports + backend check
npm run prepare:dist     # Ensambla index.html y genera dist/
```

Backend:

```bash
cd apps/api
npm run dev
npm run migrate
npm run smoke
```

## Variables de entorno

- `.env.example`: variables públicas de frontend y variables backend de referencia.
- `apps/api/.env.example`: variables específicas de la API.

No uses `service_role` ni claves privadas en el frontend. El frontend solo debe recibir claves publishable/anon.

## Documentación principal

- `docs/PROJECT_STRUCTURE.md`: estructura actual y estructura objetivo.
- `docs/MIGRATION_PLAN.md`: fases de migración.
- `docs/LEGACY_BRIDGE.md`: globals legacy y plan para reducir `window`.
- `docs/LEGACY_INLINE_HANDLERS.md`: inventario de handlers HTML inline.
- `docs/DECLARATIVE_ACTIONS.md`: acciones declarativas permitidas.
- `docs/AUTH_MIGRATION_PLAN.md`: plan seguro para mover `login-registro-auth/`.
- `docs/BACKEND_LAYERING_PATTERN.md`: patrón route/controller/service/repository.
- `docs/DEPLOYMENT.md`: Vercel, Render y variables.
- `docs/DATABASE.md`: tablas, migraciones, seguridad e índices.
- `apps/api/README.md`: API Express.
- `supabase/README.md`: SQL ejecutable.

## Reglas de cambio

1. No mover `index.html`, `js/core`, `js/panels`, `sections` o `login-registro-auth` sin actualizar imports y ejecutar `npm run check`.
2. Los paneles deben mantener `principal.ts` pequeño y delegar render grande a `components/vista.ts`.
3. La compatibilidad con HTML inline debe pasar por `js/core/legacy-api.ts` y `js/core/legacy-bridge.ts`.
4. La API debe separar gradualmente rutas, controladores, servicios, repositorios y validadores.
5. Las migraciones SQL deben ser idempotentes y compatibles con Supabase PostgreSQL.
