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

Avance aplicado:

- `js/panels/reportes/` movido físicamente a `apps/web/src/panels/reportes/`.
- `js/panels/planificaciones/` movido físicamente a `apps/web/src/panels/planificaciones/`.
- `js/panels/matriz/` movido físicamente a `apps/web/src/panels/matriz/`.
- `js/panels/instrumentos/` movido físicamente a `apps/web/src/panels/instrumentos/`.
- `js/panels/actividades/` movido físicamente a `apps/web/src/panels/actividades/`.
- `js/panels/usuarios/` movido físicamente a `apps/web/src/panels/usuarios/`.
- `js/panels/horario/` movido físicamente a `apps/web/src/panels/horario/`.
- `js/panels/asistencia/` movido físicamente a `apps/web/src/panels/asistencia/`.
- Las rutas legacy quedaron como adaptadores de reexportación para no romper imports existentes.
- `routing.ts` conserva claves públicas `/js/panels/...`, pero resuelve esos bundles hacia `apps/web/src/panels/...`.

Mover en grupos pequeños:

1. Estudiantes/académico por grupos pequeños cuando bajen sus fallbacks.
3. `login-registro-auth/`.
4. `sections/`.
5. `js/core/`.
6. `js/panels/` remanente.
7. `index.html`, `terminos.html`, `privacidad.html`.

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
- Dominio estudiantes migrado a `data-student-action` con registry explícito en `apps/web/src/panels/estudiantes/utils/student-actions.ts`.
- Carga masiva migrada para apertura, modo de entrada, archivo seleccionado, opciones, análisis, confirmación y exportaciones simples sin cambiar textos visibles ni formato esperado.
- Dominio académico migrado a `data-academic-action` con registry explícito en `js/panels/configuracion-academica/utils/academic-actions.ts`.
- Dominio asistencia migrado a `data-attendance-action` con registry explícito en `apps/web/src/panels/asistencia/utils/attendance-actions.ts`.
- Dominio horario migrado a `data-schedule-action` con registry explícito en `apps/web/src/panels/horario/utils/schedule-actions.ts`.
- Dominio actividades/calificaciones migrado a `data-activity-action` con registry explícito en `apps/web/src/panels/actividades/utils/activity-actions.ts`.
- Dominio usuarios/modales compartidos migrado a `data-user-action` con registry explícito en `apps/web/src/panels/usuarios/utils/user-actions.ts`.
- Dominios planificaciones y reportes migrados a `data-planning-action` y `data-report-action` con registries explícitos separados.
- Auditoría global documentada en `docs/GLOBALS_AUDIT.md`; quedan `0` handlers inline runtime reales.
- Shell/UI mínimo migrado a `data-ui-action` para tablero, institución y selectores globales de contexto.
- `window.openDashboardCourse` eliminado tras confirmar cero referencias runtime.
- `data-report-action` convertido a imports directos para exportaciones Excel/PDF/Word, conservando globals solo como compatibilidad.
- `data-planning-action` y `data-report-action` ahora se importan desde `apps/web/src/panels/...`.
- Acciones internas de planificaciones convertidas de `window.S` / `window.go` a imports directos de `S` y `go`.
- `data-schedule-action` convertido a imports directos para acciones visibles de horario; los globals quedan como adaptadores legacy.
- `data-activity-action` convertido a imports directos para acciones de bloques/matriz, instrumentos y guardado de actividad/plantilla.
- Acciones básicas de instrumentos separadas en `apps/web/src/panels/instrumentos/utils/instrument-actions.ts` y consumidas por `data-activity-action` con imports directos.
- Vinculación de instrumentos modularizada en `apps/web/src/panels/instrumentos/utils/instrument-linking.ts`.
- Fallback interno legacy de vinculación de instrumentos eliminado; `window.openApplyInstrumentModal`, `window.openCreateInstrumentTypePicker` y `window.confirmLinkInstrument` quedan solo como adaptadores publicados.
- Guardado de actividades y plantillas modularizado en `apps/web/src/panels/actividades/utils/activity-save.ts`.
- Sincronización SQL de acciones de actividades encapsulada en `apps/web/src/panels/actividades/utils/activity-sql.ts`, con fallback interno a `window.AulaBaseSqlApi`.
- Acciones de creación/eliminación de usuarios separadas en `apps/web/src/panels/usuarios/utils/user-save.ts` y `user-domain-actions.ts`, consumidas por `data-user-action` con imports directos.
- Acciones base de estudiantes separadas en `apps/web/src/panels/estudiantes/utils/student-domain-actions.ts`, consumidas por `data-student-action` con imports directos.
- Carga masiva/exportaciones de estudiantes separadas en `apps/web/src/panels/estudiantes/utils/student-bulk.ts`, sin cambiar parser ni formato esperado.
- Callbacks de `crear-estudiante` y `editar-estudiante` convertidos en funciones exportables; los globals quedan como adaptadores temporales.
- Migración física conjunta aplicada: `estudiantes`, `crear-estudiante` y `editar-estudiante` viven en `apps/web/src/panels/estudiantes/`, `create/` y `edit/`; las rutas legacy quedaron como reexports.

Conteo de la fase estudiantes:

| Alcance | Inline antes | Inline después | `data-student-action` después |
| --- | ---: | ---: | ---: |
| Fuentes reales de estudiantes y modales `m-est*` | 53 | 0 | 56 |
| Fragmento combinado legacy `sections/panels/estudiantes/modals.html` | 25 | 0 | 25 |

Riesgos:

- El registry mantiene adaptadores temporales puntuales hacia funciones globales de crear/editar mientras esas rutas conserven `FormState` local.
- La carga masiva conserva el parser legacy actual; seleccionar archivo marca el archivo, pero no introduce un parser nuevo para `.xlsx/.xls`.
- `FormState` permanece local en los subpaneles `create` y `edit`; no se fusionó para no alterar el flujo validado.

Conteo de la fase académica:

| Alcance | Inline antes | Inline después | `data-academic-action` después |
| --- | ---: | ---: | ---: |
| `sections/panels/estudiantes/modals.html` grados/secciones | 18 | 0 | 18 |
| Fragments individuales y paneles modernos académicos | 33 | 0 | 33 |
| Total alcance académico migrado | 51 | 0 | 51 |

Riesgos académicos:

- La edición de grado usa fallback local si no existe `window.saveEditGrade`; no agrega migraciones ni cambia schema.
- La sincronización SQL profunda de edición de grado queda pendiente para una fase posterior si se requiere equivalencia backend.

Conteo de la fase asistencia:

| Alcance | Inline antes | Inline después | `data-attendance-action` después |
| --- | ---: | ---: | ---: |
| `apps/web/src/panels/asistencia/` | 11 | 0 | 10 |

Riesgos asistencia:

- `exportToExcel` y `exportToPdf` quedan encapsulados en `apps/web/src/panels/asistencia/utils/attendance-export.ts`; no se implementó un exportador nuevo.
- Algunas acciones del registry (`previous-day`, `next-day`, `select-student`, `clear-filter`) quedan reservadas como ramas seguras porque no hay controles visibles todavía.

Conteo de la fase horario:

| Alcance | Inline antes | Inline después | `data-schedule-action` después |
| --- | ---: | ---: | ---: |
| `apps/web/src/panels/horario/` y fragments `m-schedule*` | 10 | 0 | 10 |

Riesgos horario:

- La generación de plantilla base vive en `apps/web/src/panels/horario/utils/actions.ts`; conserva compatibilidad con un generador legacy externo si existe y, si no, abre el asistente.
- Tabs, cambio de mes, apertura de asistente, edición de celdas y eventos ya usan imports directos con fallback temporal.
- Varias acciones del registry quedan como placeholders seguros hasta que se modularicen edición avanzada, exportación y eliminación de bloques.

Conteo de la fase actividades/calificaciones:

| Alcance | Inline antes | Inline después | `data-activity-action` después |
| --- | ---: | ---: | ---: |
| Componentes y fragments directos de actividades/instrumentos | 25 | 0 | 25 |
| Alcance ampliado con fragmento combinado legacy | 26 | 1 | 25 |

Riesgos actividades/calificaciones:

- `saveUsr()` fue migrado en la fase usuarios porque pertenece a ese dominio aunque viva en el fragmento combinado de actividades.
- `saveAct` y `saveTpl` usan implementación modular principal en `apps/web/src/panels/actividades/utils/activity-save.ts`; los globals quedan como adaptadores temporales.
- Vista de matriz, metas, edición de nombre/puntos, alta, eliminación y autoajuste ya usan imports directos desde `apps/web/src/panels/actividades/utils/actions.ts`.
- `actions.ts` de actividades ya no llama directamente a `window.AulaBaseSqlApi`; usa `activity-sql.ts`.
- Instrumentos (`setInstFilter`, `createNewInstrument`, `editInstrument`, `deleteInstrument`, `openInstrumentCreator`) ya usan imports directos desde `apps/web/src/panels/instrumentos/utils/instrument-actions.ts` y conservan globals como adaptadores.
- Vinculación de instrumentos (`openApplyInstrumentModal`, `openCreateInstrumentTypePicker`, `confirmLinkInstrument`) ya tiene implementación modular principal sin fallback interno; `instrument-link-state.ts` encapsula `_linkActId/_linkStudentId` y los globals quedan como adaptadores temporales.
- Acciones sin controles visibles actuales (`export`, `sync`, `clear-grade`, edición profunda de matriz) quedan registradas como ramas seguras hasta modularizar esos flujos.

Conteo de la fase usuarios:

| Alcance | Inline antes | Inline después | `data-user-action` después |
| --- | ---: | ---: | ---: |
| `js/panels/usuarios/` y fragments `m-usr` | 5 | 0 | 5 |

Riesgos usuarios:

- Edición, permisos, activación/desactivación, reseteo de contraseña, invitación y perfil quedan como ramas seguras porque no hay controles visibles actuales.
- `data-user-action` usa imports directos hacia `apps/web/src/panels/usuarios/utils/user-save.ts`; `saveUsr` y `delUsr` quedan como adaptadores globales temporales.

Conteo de la fase planificaciones/reportes:

| Alcance | Inline antes | Inline después | Declarativos después |
| --- | ---: | ---: | ---: |
| `js/panels/planificaciones/` | 22 | 0 | 20 |
| `js/panels/reportes/` | 3 | 0 | 3 |
| Total | 25 | 0 | 23 |

Riesgos planificaciones/reportes:

- Planificaciones conserva edición de campos simples y navegación del editor; eliminación, duplicado, plantillas y exportación específica quedan como ramas seguras sin controles visibles actuales.
- Reportes conserva exportación Excel/PDF/Word; filtros, selección de tipo y detalle quedan registrados sin lógica destructiva hasta que existan controles.

Conteo de auditoría global:

| Alcance | Cantidad |
| --- | ---: |
| Handlers inline runtime restantes | 0 |
| Globals eliminados | 1 |
| Globals conservados | Críticos, runtime dinámicos y fallbacks vigentes |

Riesgos de globals:

- `legacy-bridge.ts` sigue siendo necesario para `window.RENDERS`, `_renderPanel`, APIs cloud/SQL, routing y compatibilidad de paneles.
- Los globals usados por registries como fallback deben pasar a imports directos antes de eliminarse.

Siguiente trabajo:

1. Reducir dependencias restantes de estudiantes en `js/core/student-logic.ts`, `js/core/deleters.ts` y `legacy-api.ts` cuando no haya referencias runtime.
2. Reducir dependencias SQL/window restantes en académico.
3. Mantener `legacy-api.ts` como lista explícita de deuda.
4. Remover globals por dominio cuando no existan referencias runtime.

Orden recomendado:

- callbacks/globales restantes de estudiantes como una fase posterior a la migración física.
- académico por grupos pequeños.
- auth/setup y core crítico.

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
