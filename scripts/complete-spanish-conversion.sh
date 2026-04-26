#!/bin/bash

# Script para completar la conversión a español

PANELS_DIR="/Users/natanael/Documents/edugest-main/js/panels"

echo "Completando conversión a español..."

# Actualizar routing.js con nombres en español
cd /Users/natanael/Documents/edugest-main/js/core
sed -i '' "s|tablero/principal|tablero/principal|g" routing.js
sed -i '' "s|autenticacion/principal|autenticacion/principal|g" routing.js
sed -i '' "s|actividades/principal|actividades/principal|g" routing.js
sed -i '' "s|estudiantes/principal|estudiantes/principal|g" routing.js
sed -i '' "s|asistencia/principal|asistencia/principal|g" routing.js
sed -i '' "s|planificaciones/principal|planificaciones/principal|g" routing.js
sed -i '' "s|horario/principal|horario/principal|g" routing.js
sed -i '' "s|reportes/principal|reportes/principal|g" routing.js
sed -i '' "s|instrumentos/principal|instrumentos/principal|g" routing.js
sed -i '' "s|configuracion/principal|configuracion/principal|g" routing.js
sed -i '' "s|configuracion-academica/principal|configuracion-academica/principal|g" routing.js
sed -i '' "s|crear-estudiante/principal|crear-estudiante/principal|g" routing.js
sed -i '' "s|editar-estudiante/principal|editar-estudiante/principal|g" routing.js
sed -i '' "s|crear-seccion/principal|crear-seccion/principal|g" routing.js
sed -i '' "s|usuarios/principal|usuarios/principal|g" routing.js
sed -i '' "s|configuracion-inicial/principal|configuracion-inicial/principal|g" routing.js
sed -i '' "s|matriz/principal|matriz/principal|g" routing.js

# Actualizar PANEL_BUNDLE_URLS
sed -i '' "s|tablero: '/js/panels/dashboard/index.js'|tablero: '/js/panels/tablero/principal.js'|g" routing.js
sed -i '' "s|estudiantes: '/js/panels/students/index.js'|estudiantes: '/js/panels/estudiantes/principal.js'|g" routing.js
sed -i '' "s|actividades: '/js/panels/activities/index.js'|actividades: '/js/panels/actividades/principal.js'|g" routing.js
sed -i '' "s|matriz: '/js/panels/matrix/index.js'|matriz: '/js/panels/matriz/principal.js'|g" routing.js
sed -i '' "s|reportes: '/js/panels/reports/index.js'|reportes: '/js/panels/reportes/principal.js'|g" routing.js
sed -i '' "s|horario: '/js/panels/schedule/index.js'|horario: '/js/panels/horario/principal.js'|g" routing.js
sed -i '' "s|instrumentos: '/js/panels/instruments/index.js'|instrumentos: '/js/panels/instrumentos/principal.js'|g" routing.js
sed -i '' "s|planificaciones: '/js/panels/planning/index.js'|planificaciones: '/js/panels/planificaciones/principal.js'|g" routing.js
sed -i '' "s|asistencia: '/js/panels/attendance/index.js'|asistencia: '/js/panels/asistencia/principal.js'|g" routing.js
sed -i '' "s|ajustes: '/js/panels/settings/index.js'|ajustes: '/js/panels/configuracion/principal.js'|g" routing.js
sed -i '' "s|grados: '/js/panels/grade-setup/index.js'|grados: '/js/panels/configuracion-academica/principal.js'|g" routing.js
sed -i '' "s|'estudiantes-nuevo': '/js/panels/student-create/index.js'|'estudiantes-nuevo': '/js/panels/crear-estudiante/principal.js'|g" routing.js
sed -i '' "s|'secciones-nuevo': '/js/panels/section-create/index.js'|'secciones-nuevo': '/js/panels/crear-seccion/principal.js'|g" routing.js
sed -i '' "s|'estudiantes-edicion': '/js/panels/student-edit/index.js'|'estudiantes-edicion': '/js/panels/editar-estudiante/principal.js'|g" routing.js
sed -i '' "s|usuarios: '/js/panels/users/index.js'|usuarios: '/js/panels/usuarios/principal.js'|g" routing.js

echo "Conversión completada"