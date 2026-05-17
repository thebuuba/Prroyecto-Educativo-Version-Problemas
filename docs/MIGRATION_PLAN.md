# Migration Plan

## Objetivo

Convertir AulaBase/EduGest en una arquitectura profesional, mantenible y escalable sin romper la funcionalidad existente.

## Fase 1 completada

- Backend movido de `server/` a `apps/api/`.
- `server/` quedó como adaptador temporal de scripts.
- Configuración real de Vite movida a `apps/web/vite.config.js`.
- CSS global y assets públicos movidos a `apps/web/` con adaptador raíz para `/styles.css`.
- Entrada `js/page-entry/root.ts` movida a `apps/web/src/page-entry/root.ts` con adaptador raíz.
- SQL movido a `supabase/`.
- Registro legacy extraído a `js/core/legacy-api.ts`.
- `js/core/legacy-bridge.ts` reducido a instalación de compatibilidad y renderer.
- Estructura inicial de `packages/shared`, `packages/ui` y `packages/database`.
- Verificación de imports locales en `scripts/check-imports.mjs`.
- Vite actualizado a `6.4.2` para corregir vulnerabilidades auditadas.

## Fase 2: frontend físico en apps/web

Mover en grupos pequeños:

1. `login-registro-auth/`.
2. `sections/`.
3. `js/core/`.
4. `js/panels/`.
5. `index.html`, `terminos.html`, `privacidad.html`.

Cada grupo debe incluir:

- aliases o adaptadores temporales para rutas absolutas
- actualización de `scripts/assemble-index-html.sh`
- `npm run build`
- `npm run imports:check`

## Fase 3: reducir window

Avance aplicado:

- Cierres de modales migrados a `data-modal-close`.
- Navegación simple migrada a `data-route`.
- Navegación con opciones seguras migrada a `data-route-options`.
- Auth y setup inicial migrados a `data-auth-action`.
- Campos simples de setup inicial migrados a registry explícito en `form-actions.ts`.
- Dominio estudiantes migrado a `data-student-action` con registry explícito en `js/panels/estudiantes/utils/student-actions.ts`.
- Carga masiva migrada para apertura, modo de entrada, archivo seleccionado, opciones, análisis, confirmación y exportaciones simples sin cambiar textos visibles ni formato esperado.

Conteo de la fase estudiantes:

| Alcance | Inline antes | Inline después | `data-student-action` después |
| --- | ---: | ---: | ---: |
| Fuentes reales de estudiantes y modales `m-est*` | 53 | 0 | 56 |
| Fragmento combinado legacy `sections/panels/estudiantes/modals.html` | 25 | 0 | 25 |

Riesgos:

- El registry mantiene adaptadores temporales hacia funciones globales existentes mientras `legacy-api.ts` siga publicando APIs.
- La carga masiva conserva el parser legacy actual; seleccionar archivo marca el archivo, pero no introduce un parser nuevo para `.xlsx/.xls`.
- Quedan handlers inline académicos de grados/secciones dentro del fragmento combinado de estudiantes y deben tratarse en una fase de dominio académico.

Siguiente trabajo:

1. Migrar handlers inline restantes por dominio con registries explícitos.
2. Reemplazar accesos `window.X` por imports ES cuando ya no haya HTML inline.
3. Mantener `legacy-api.ts` como lista explícita de deuda.
4. Remover globals por dominio cuando no existan referencias.

Orden recomendado:

- UI básica: `openM`, `closeM`, `toast`
- routing: `go`
- secciones/grados académicos
- asistencia/horario
- calificaciones/evaluaciones
- auth/setup

## Fase 4: backend por capas

Ejemplo inicial completado:

- `health`: route, controller, service y repository.
- `users`: route, controller, service, validator y repository.
- `schools`: route, controller, service, validator y repository.

Migrar endpoint por endpoint:

1. `grades`, `sections`, `students`
3. `activities`, `evaluations`, `attendance`
4. `state` y `bootstrap`
5. `auth`

Cada migración debe separar:

- `routes/`: wiring Express
- `controllers/`: request/response
- `validators/`: normalización de input
- `services/`: reglas de negocio
- `repositories/`: SQL

## Fase 5: database

- Mantener migraciones idempotentes.
- Añadir tests de migración contra Postgres local.
- Documentar políticas RLS si se decide exponer tablas a Supabase Data API.
- Revisar índices con `EXPLAIN` sobre consultas reales.

## Fase 6: pruebas

- Smoke frontend con servidor Vite.
- Smoke backend con Postgres local.
- Tests unitarios para normalizadores compartidos.
- Tests de repositorios con DB transaccional.
