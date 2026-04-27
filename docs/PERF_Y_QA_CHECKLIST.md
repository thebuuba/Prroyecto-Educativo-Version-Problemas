# Performance y QA - AulaBase

## 1) Revisión rápida antes de cerrar cambios
1. Abre la app en Chrome o Edge.
2. Navega por `Inicio`, `Estudiantes`, `Matriz General`, `Reportes` y `Configuración`.
3. Abre y cierra la sidebar varias veces.
4. Confirma que no haya saltos visuales, overlays pegados ni errores en consola.

## 2) Accesibilidad mínima
- `Tab` recorre sidebar, topbar y modales sin trabarse.
- `Enter` y `Space` activan botones.
- `Escape` cierra menús y modales abiertos.
- El item activo mantiene `aria-current="page"`.

## 3) Rendimiento visible
- La apertura y cierre de sidebar debe sentirse fluida en desktop.
- Al cambiar de módulo no deben aparecer bloqueos largos de UI.
- En `Network`, los assets estáticos deben responder con cache razonable.

## 4) Validación de despliegue
1. Haz hard reload en la app publicada.
2. Verifica que iconos e imágenes carguen bien.
3. Confirma que `npm run build` genera `dist/` sin errores antes de publicar.
