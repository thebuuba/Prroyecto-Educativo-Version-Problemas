# Deploy Automatico (Firebase Hosting)

Este proyecto esta configurado para desplegar automaticamente en cada `push`.
La carpeta de produccion oficial es `dist/`, generada por Vite con `npm run build`.

## Requisito en GitHub
Configura el secret del repositorio:
- Nombre: `FIREBASE_TOKEN`
- Valor: token generado con:

```bash
firebase login:ci
```

## Flujo automatico activo
Workflow: `.github/workflows/firebase-hosting-deploy.yml`

Reglas:
- `main` o `master` -> deploy a produccion.
- Cualquier otra rama -> deploy preview con canal por rama (expira en 7 dias).

## Flujo recomendado de equipo
- Cada feature se trabaja en una rama propia (`feature/...`, `fix/...`, `ui/...`).
- Se abre PR hacia `main`.
- Se revisa el preview deploy del PR.
- Se hace merge.
- El merge a `main` publica automaticamente a produccion.

Guia completa: `docs/TEAM_WORKFLOW.md`.

## Fuente de verdad de produccion
- `index.html`: shell de la app moderna.
- `js/`, `styles/`, `sections/`, `login-registro-auth/`: fuentes de la app.
- `terminos.html` y `privacidad.html`: paginas legales incluidas en el build.
- `dist/`: salida generada, no se edita ni se versiona.

## Deploy manual recomendado
Para publicar exactamente la misma version preparada:

```bash
npm run deploy
```

## Deploy manual opcional
Si alguna vez necesitas desplegar manualmente despues de sincronizar:

```bash
firebase deploy --only hosting --project proyectivoeducativo
```
