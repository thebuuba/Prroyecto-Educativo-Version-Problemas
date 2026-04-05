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
- `chore: ajusta workflow de deploy`

## 3) Pull Request
Regla: nada directo a `main` (excepto emergencias).

Pasos:
1. Subes tu rama.
2. Abres PR contra `main`.
3. Tu amigo revisa (funcional + visual).
4. Verifican el preview deploy.
5. Merge.

## 4) Deploy
Automatizado por GitHub Actions:
- Push a rama feature/fix/ui -> preview deploy.
- Merge/push a `main` -> deploy a produccion.

Archivo de referencia:
- `.github/workflows/firebase-hosting-deploy.yml`
- `scripts/prepare-hosting-live.sh`

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
2. Revisar preview.
3. Merge a `main`.

## 6) Emergencias
Si produccion se rompe:
1. Crear rama `hotfix/...`
2. Corregir y PR rapido.
3. Merge a `main` para redeploy inmediato.

## 7) Reglas practicas
- Antes de editar, ejecuta el flujo de ensamblado o build que corresponda.
- Si tocas frontend legacy, valida `./scripts/prepare-hosting-live.sh` y `cd web-legacy && npm run build`.
- Si tocas Functions, valida `node --check functions/index.js` y el despliegue de Firebase Functions.
