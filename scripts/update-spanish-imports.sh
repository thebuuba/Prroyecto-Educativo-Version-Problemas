#!/bin/bash

# Script para actualizar rutas de importación a nombres en español

JS_DIR="/Users/natanael/Documents/edugest-main/js"

echo "Actualizando rutas de importación a español..."

# Mapeo de nombres en inglés a español para rutas
declare -A ROUTE_MAP=(
    ["dashboard"]="tablero"
    ["auth"]="autenticacion"
    ["activities"]="actividades"
    ["students"]="estudiantes"
    ["attendance"]="asistencia"
    ["planning"]="planificaciones"
    ["schedule"]="horario"
    ["reports"]="reportes"
    ["instruments"]="instrumentos"
    ["settings"]="configuracion"
    ["grade-setup"]="configuracion-academica"
    ["student-create"]="crear-estudiante"
    ["student-edit"]="editar-estudiante"
    ["section-create"]="crear-seccion"
    ["users"]="usuarios"
    ["setup"]="configuracion-inicial"
    ["matrix"]="matriz"
)

# Actualizar routing.js
echo "Actualizando routing.js..."
cd "$JS_DIR/core"
sed -i '' "s|dashboard/index|tablero/principal|g" routing.js
sed -i '' "s|activities/index|actividades/principal|g" routing.js
sed -i '' "s|students/index|estudiantes/principal|g" routing.js
sed -i '' "s|attendance/index|asistencia/principal|g" routing.js
sed -i '' "s|planning/index|planificaciones/principal|g" routing.js
sed -i '' "s|schedule/index|horario/principal|g" routing.js
sed -i '' "s|reports/index|reportes/principal|g" routing.js
sed -i '' "s|instruments/index|instrumentos/principal|g" routing.js
sed -i '' "s|settings/index|configuracion/principal|g" routing.js
sed -i '' "s|grade-setup/index|configuracion-academica/principal|g" routing.js
sed -i '' "s|student-create/index|crear-estudiante/principal|g" routing.js
sed -i '' "s|student-edit/index|editar-estudiante/principal|g" routing.js
sed -i '' "s|section-create/index|crear-seccion/principal|g" routing.js
sed -i '' "s|users/index|usuarios/principal|g" routing.js
sed -i '' "s|matrix/index|matriz/principal|g" routing.js

sed -i '' "s|dashboard.js|tablero/principal.js|g" routing.js
sed -i '' "s|activities.js|actividades/principal.js|g" routing.js
sed -i '' "s|students.js|estudiantes/principal.js|g" routing.js
sed -i '' "s|attendance.js|asistencia/principal.js|g" routing.js
sed -i '' "s|planning.js|planificaciones/principal.js|g" routing.js
sed -i '' "s|schedule.js|horario/principal.js|g" routing.js
sed -i '' "s|reports.js|reportes/principal.js|g" routing.js
sed -i '' "s|instruments.js|instrumentos/principal.js|g" routing.js
sed -i '' "s|settings.js|configuracion/principal.js|g" routing.js
sed -i '' "s|grade-setup.js|configuracion-academica/principal.js|g" routing.js
sed -i '' "s|student-create.js|crear-estudiante/principal.js|g" routing.js
sed -i '' "s|student-edit.js|editar-estudiante/principal.js|g" routing.js
sed -i '' "s|section-create.js|crear-seccion/principal.js|g" routing.js
sed -i '' "s|users.js|usuarios/principal.js|g" routing.js
sed -i '' "s|matrix.js|matriz/principal.js|g" routing.js

# Actualizar app.js
echo "Actualizando app.js..."
sed -i '' "s|panels/auth/index|panels/autenticacion/principal|g" app.js

# Actualizar root.js
echo "Actualizando root.js..."
cd "$JS_DIR/page-entry"
sed -i '' "s|panels/setup/index|panels/configuracion-inicial/principal|g" root.js

# Actualizar archivos dentro de paneles
echo "Actualizando archivos dentro de paneles..."
cd "$JS_DIR/panels"

# Actualizar imports entre paneles
find . -name "*.js" -type f -exec sed -i '' "s|from '\.\./auth/|from '../autenticacion/|g" {} \;
find . -name "*.js" -type f -exec sed -i '' "s|from '\.\./setup/|from '../configuracion-inicial/|g" {} \;

# Actualizar nombres de archivos internos
find . -name "*.js" -type f -exec sed -i '' "s|/index\.js|/principal.js|g" {} \;
find . -name "*.js" -type f -exec sed -i '' "s|/actions\.js|/acciones.js|g" {} \;
find . -name "*.js" -type f -exec sed -i '' "s|/render\.js|/vista.js|g" {} \;
find . -name "*.js" -type f -exec sed -i '' "s|/model\.js|/modelo.js|g" {} \;
find . -name "*.js" -type f -exec sed -i '' "s|/support\.js|/soporte.js|g" {} \;
find . -name "*.js" -type f -exec sed -i '' "s|/auth-support\.js|/autenticacion-soporte.js|g" {} \;

echo "Actualización de rutas completada"