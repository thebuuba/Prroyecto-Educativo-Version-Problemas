# Flujo de Trabajo en Equipo (2 Personas)

Este flujo esta pensado para que trabajen en paralelo sin romper produccion.

## 1) Ramas
- `main`: solo codigo estable, listo para produccion.
- `feature/...`: nuevas funciones.
- `fix/...`: correcciones de bugs.
- `ui/...`: mejoras visuales/UX.

Ejemplos:
- `feature/panel-ia-preguntas-rapidas`
- `fix/sidebar-hover-expand`
- `ui/panel-estudiantes-tabla-pro`

## 2) Commits
Hagan commits pequenos y claros.

Formato recomendado:
- `feat: mejora panel IA con respuestas rapidas`
- `fix: sidebar permanece expandida en hover`
- `ui: alinea textos del menu lateral`
- `chore: ajusta workflow de ci`

## 3) Pull Request
Regla: nada directo a `main` (excepto emergencias).

Pasos:
1. Subes tu rama.
2. Abres PR contra `main`.
3. Tu amigo revisa (funcional + visual).
4. Verifican el build.
5. Merge.

## 4) CI y publicación
GitHub Actions valida el build y el backend en PR y ramas principales.
La publicación se hace con `npm run prepare:dist` y subiendo `dist/` al hosting elegido.

Archivo de referencia:
- `.github/workflows/ci.yml`

## 5) Regla corta de sincronizacion diaria
Antes de empezar:
1. `git checkout main`
2. `git pull --rebase`
3. `git checkout -b <rama-nueva>`

Durante el dia:
1. Commits pequenos cada bloque de trabajo.
2. `git push origin <rama>`

Al cerrar tarea:
1. Abrir PR.
2. Revisar build/QA.
3. Merge a `main`.

## 6) Emergencias
Si produccion se rompe:
1. Crear rama `hotfix/...`
2. Corregir y PR rapido.
3. Merge a `main` y publicar `dist/` nuevamente.

## 7) Reglas practicas
- Antes de editar, ejecuta el flujo de ensamblado o build que corresponda.
- Para cambios frontend modernos, valida `npm run check`.
- Todo backend persistente debe pasar por `server/` y Supabase SQL.
