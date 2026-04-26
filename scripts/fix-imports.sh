#!/bin/bash

# Script para actualizar las rutas de importación en los paneles migrados
# Cambia '../core/' a '../../core/' y actualiza rutas locales

PANELS_DIR="/Users/natanael/Documents/edugest-main/js/panels"

# Lista de paneles migrados
PANELS=(
    "activities"
    "students" 
    "attendance"
    "planning"
    "schedule"
    "reports"
    "instruments"
    "settings"
    "grade-setup"
    "student-create"
    "student-edit"
    "section-create"
    "users"
    "setup"
    "matrix"
    "auth"
    "dashboard"
)

for panel in "${PANELS[@]}"; do
    echo "Actualizando importaciones en panel: $panel"
    
    # Buscar archivos JS en el panel
    find "$PANELS_DIR/$panel" -name "*.js" -type f | while read file; do
        echo "  - Procesando: $file"
        
        # Actualizar rutas de core
        sed -i '' "s|from '../core/|from '../../core/|g" "$file"
        
        # Actualizar rutas de otros paneles (ej: from '../setup.js' a from '../setup/index.js')
        sed -i '' "s|from '\.\./\([a-z-]*\)\.js'|from '../\1/index.js'|g" "$file"
        
        # Actualizar rutas de archivos actions
        sed -i '' "s|from '\./\([a-z-]*\)-actions\.js'|from './utils/actions.js'|g" "$file"
        
        # Actualizar rutas de archivos render
        sed -i '' "s|from '\./\([a-z-]*\)-render\.js'|from './components/render.js'|g" "$file"
        
        # Actualizar rutas de archivos model
        sed -i '' "s|from '\./\([a-z-]*\)-model\.js'|from './utils/model.js'|g" "$file"
        
        # Actualizar rutas de archivos support
        sed -i '' "s|from '\./\([a-z-]*\)-support\.js'|from './utils/support.js'|g" "$file"
        
        echo "    - Importaciones actualizadas"
    done
    
    echo ""
done

echo "Actualización de importaciones completada"