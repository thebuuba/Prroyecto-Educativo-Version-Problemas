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
- Dominio académico migrado a `data-academic-action` con registry explícito en `js/panels/configuracion-academica/utils/academic-actions.ts`.
- Dominio asistencia migrado a `data-attendance-action` con registry explícito en `js/panels/asistencia/utils/attendance-actions.ts`.
- Dominio horario migrado a `data-schedule-action` con registry explícito en `js/panels/horario/utils/schedule-actions.ts`.
- Dominio actividades/calificaciones migrado a `data-activity-action` con registry explícito en `js/panels/actividades/utils/activity-actions.ts`.
- Dominio usuarios/modales compartidos migrado a `data-user-action` con registry explícito en `js/panels/usuarios/utils/user-actions.ts`.
- Dominios planificaciones y reportes migrados a `data-planning-action` y `data-report-action` con registries explícitos separados.

Conteo de la fase estudiantes:

| Alcance | Inline antes | Inline después | `data-student-action` después |
| --- | ---: | ---: | ---: |
| Fuentes reales de estudiantes y modales `m-est*` | 53 | 0 | 56 |
| Fragmento combinado legacy `sections/panels/estudiantes/modals.html` | 25 | 0 | 25 |

Riesgos:

- El registry mantiene adaptadores temporales hacia funciones globales existentes mientras `legacy-api.ts` siga publicando APIs.
- La carga masiva conserva el parser legacy actual; seleccionar archivo marca el archivo, pero no introduce un parser nuevo para `.xlsx/.xls`.

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
| `js/panels/asistencia/` | 11 | 0 | 10 |

Riesgos asistencia:

- `exportToExcel` y `exportToPdf` siguen como adaptadores legacy si existen; no se implementó un exportador nuevo.
- Algunas acciones del registry (`previous-day`, `next-day`, `select-student`, `clear-filter`) quedan reservadas como ramas seguras porque no hay controles visibles todavía.

Conteo de la fase horario:

| Alcance | Inline antes | Inline después | `data-schedule-action` después |
| --- | ---: | ---: | ---: |
| `js/panels/horario/` y fragments `m-schedule*` | 10 | 0 | 10 |

Riesgos horario:

- La generación de plantilla base conserva compatibilidad con `generateTeacherScheduleBase` si existe en runtime; si no, abre el asistente.
- Varias acciones del registry quedan como placeholders seguros hasta que se modularicen edición avanzada, exportación y eliminación de bloques.

Conteo de la fase actividades/calificaciones:

| Alcance | Inline antes | Inline después | `data-activity-action` después |
| --- | ---: | ---: | ---: |
| Componentes y fragments directos de actividades/instrumentos | 25 | 0 | 25 |
| Alcance ampliado con fragmento combinado legacy | 26 | 1 | 25 |

Riesgos actividades/calificaciones:

- `saveUsr()` fue migrado en la fase usuarios porque pertenece a ese dominio aunque viva en el fragmento combinado de actividades.
- `saveAct`, `saveTpl`, `openApplyInstrumentModal`, `openCreateInstrumentTypePicker` y `confirmLinkInstrument` se mantienen como adaptadores legacy explícitos si existen en runtime.
- Acciones sin controles visibles actuales (`export`, `sync`, `clear-grade`, edición profunda de matriz) quedan registradas como ramas seguras hasta modularizar esos flujos.

Conteo de la fase usuarios:

| Alcance | Inline antes | Inline después | `data-user-action` después |
| --- | ---: | ---: | ---: |
| `js/panels/usuarios/` y fragments `m-usr` | 5 | 0 | 5 |

Riesgos usuarios:

- Edición, permisos, activación/desactivación, reseteo de contraseña, invitación y perfil quedan como ramas seguras porque no hay controles visibles actuales.
- `delUsr` y `saveUsr` se invocan solo como adaptadores legacy explícitos si existen en runtime.

Conteo de la fase planificaciones/reportes:

| Alcance | Inline antes | Inline después | Declarativos después |
| --- | ---: | ---: | ---: |
| `js/panels/planificaciones/` | 22 | 0 | 20 |
| `js/panels/reportes/` | 3 | 0 | 3 |
| Total | 25 | 0 | 23 |

Riesgos planificaciones/reportes:

- Planificaciones conserva edición de campos simples y navegación del editor; eliminación, duplicado, plantillas y exportación específica quedan como ramas seguras sin controles visibles actuales.
- Reportes conserva exportación Excel/PDF/Word; filtros, selección de tipo y detalle quedan registrados sin lógica destructiva hasta que existan controles.

Siguiente trabajo:

1. Migrar handlers inline restantes por dominio con registries explícitos.
2. Reemplazar accesos `window.X` por imports ES cuando ya no haya HTML inline.
3. Mantener `legacy-api.ts` como lista explícita de deuda.
4. Remover globals por dominio cuando no existan referencias.

Orden recomendado:

- UI básica: `openM`, `closeM`, `toast`
- routing: `go`
- planificaciones/reportes avanzados y modales compartidos restantes
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
