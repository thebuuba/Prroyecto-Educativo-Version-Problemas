#!/bin/bash

# Script para renombrar carpetas y archivos a español

PANELS_DIR="/Users/natanael/Documents/edugest-main/js/panels"

# Mapeo de nombres en inglés a español
declare -A PANEL_NAMES=(
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

echo "Renombrando paneles a español..."

for english_name in "${!PANEL_NAMES[@]}"; do
    spanish_name="${PANEL_NAMES[$english_name]}"
    
    if [ -d "$PANELS_DIR/$english_name" ]; then
        echo "Renombrando: $english_name -> $spanish_name"
        mv "$PANELS_DIR/$english_name" "$PANELS_DIR/$spanish_name"
    fi
done

echo "Paneles renombrados. Ahora renombrando archivos internos..."

cd "$PANELS_DIR"

# Renombrar archivos en cada panel
for panel_dir in */; do
    if [ -d "$panel_dir" ]; then
        cd "$panel_dir"
        
        # Renombrar index.js -> principal.js
        if [ -f "index.js" ]; then
            echo "  Renombrando index.js -> principal.js en $panel_dir"
            mv "index.js" "principal.js"
        fi
        
        # Renombrar archivos en components/
        if [ -d "components" ]; then
            cd "components"
            if [ -f "render.js" ]; then
                echo "    Renombrando render.js -> vista.js"
                mv "render.js" "vista.js"
            fi
            cd ..
        fi
        
        # Renombrar archivos en utils/
        if [ -d "utils" ]; then
            cd "utils"
            if [ -f "actions.js" ]; then
                echo "    Renombrando actions.js -> acciones.js"
                mv "actions.js" "acciones.js"
            fi
            if [ -f "model.js" ]; then
                echo "    Renombrando model.js -> modelo.js"
                mv "model.js" "modelo.js"
            fi
            if [ -f "support.js" ]; then
                echo "    Renombrando support.js -> soporte.js"
                mv "support.js" "soporte.js"
            fi
            if [ -f "auth-support.js" ]; then
                echo "    Renombrando auth-support.js -> autenticacion-soporte.js"
                mv "auth-support.js" "autenticacion-soporte.js"
            fi
            cd ..
        fi
        
        cd "$PANELS_DIR"
    fi
done

echo "Renombramiento completado"