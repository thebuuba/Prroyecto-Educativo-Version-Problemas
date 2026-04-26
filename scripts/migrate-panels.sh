#!/bin/bash

# Script para migrar paneles a la nueva estructura de carpetas
# Cada panel tendrá su propia carpeta con components/, utils/, types/ y README.md

PANELS_DIR="/Users/natanael/Documents/edugest-main/js/panels"

# Lista de paneles a migrar (excluyendo dashboard y auth que ya están migrados)
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
)

for panel in "${PANELS[@]}"; do
    echo "Migrando panel: $panel"
    
    # Crear estructura de carpetas
    mkdir -p "$PANELS_DIR/$panel"/{components,utils,types}
    
    # Mover archivos principales si existen
    if [ -f "$PANELS_DIR/$panel.js" ]; then
        mv "$PANELS_DIR/$panel.js" "$PANELS_DIR/$panel/index.js"
        echo "  - Movido $panel.js a $panel/index.js"
    fi
    
    # Mover archivos de acciones si existen
    if [ -f "$PANELS_DIR/$panel-actions.js" ]; then
        mv "$PANELS_DIR/$panel-actions.js" "$PANELS_DIR/$panel/utils/actions.js"
        echo "  - Movido $panel-actions.js a $panel/utils/actions.js"
    fi
    
    # Mover archivos de render si existen
    if [ -f "$PANELS_DIR/$panel-render.js" ]; then
        mv "$PANELS_DIR/$panel-render.js" "$PANELS_DIR/$panel/components/render.js"
        echo "  - Movido $panel-render.js a $panel/components/render.js"
    fi
    
    # Mover archivos de model si existen
    if [ -f "$PANELS_DIR/$panel-model.js" ]; then
        mv "$PANELS_DIR/$panel-model.js" "$PANELS_DIR/$panel/utils/model.js"
        echo "  - Movido $panel-model.js a $panel/utils/model.js"
    fi
    
    # Mover archivos de support si existen
    if [ -f "$PANELS_DIR/$panel-support.js" ]; then
        mv "$PANELS_DIR/$panel-support.js" "$PANELS_DIR/$panel/utils/support.js"
        echo "  - Movido $panel-support.js a $panel/utils/support.js"
    fi
    
    echo "  - Estructura creada para $panel"
    echo ""
done

echo "Migración completada para todos los paneles"