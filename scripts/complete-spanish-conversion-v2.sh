#!/bin/bash

# Script completo para conversión a español de todos los paneles

PANELS_DIR="/Users/natanael/Documents/edugest-main/js/panels"

echo "Iniciando conversión completa a español..."

# Función para convertir un panel específico
convert_panel() {
    local panel_name=$1
    local panel_dir="$PANELS_DIR/$panel_name"
    
    if [ ! -d "$panel_dir" ]; then
        echo "Panel $panel_name no encontrado, saltando..."
        return
    fi
    
    echo "Convirtiendo panel: $panel_name"
    
    cd "$panel_dir"
    
    # Convertir función principal register*Panel a registrar*Panel
    find . -name "principal.js" -type f -exec sed -i '' "s|export function register\([A-Z]\)|export function registrar\1|g" {} \;
    
    # Convertir nombres de funciones comunes
    find . -name "*.js" -type f -exec sed -i '' "s|function init|function inicializar|g" {} \;
    find . -name "*.js" -type f -exec sed -i '' "s|function render|function renderizar|g" {} \;
    find . -name "*.js" -type f -exec sed -i '' "s|function handle|function manejar|g" {} \;
    find . -name "*.js" -type f -exec sed -i '' "s|function update|function actualizar|g" {} \;
    find . -name "*.js" -type f -exec sed -i '' "s|function create|function crear|g" {} \;
    find . -name "*.js" -type f -exec sed -i '' "s|function delete|function eliminar|g" {} \;
    find . -name "*.js" -type f -exec sed -i '' "s|function save|function guardar|g" {} \;
    find . -name "*.js" -type f -exec sed -i '' "s|function load|function cargar|g" {} \;
    find . -name "*.js" -type f -exec sed -i '' "s|function get|function obtener|g" {} \;
    find . -name "*.js" -type f -exec sed -i '' "s|function set|function establecer|g" {} \;
    
    # Actualizar llamadas a funciones
    find . -name "*.js" -type f -exec sed -i '' "s|\.init(|.inicializar(|g" {} \;
    find . -name "*.js" -type f -exec sed -i '' "s|\.render(|.renderizar(|g" {} \;
    find . -name "*.js" -type f -exec sed -i '' "s|\.handle(|.manejar(|g" {} \;
    find . -name "*.js" -type f -exec sed -i '' "s|\.update(|.actualizar(|g" {} \;
    find . -name "*.js" -type f -exec sed -i '' "s|\.create(|.crear(|g" {} \;
    find . -name "*.js" -type f -exec sed -i '' "s|\.delete(|.eliminar(|g" {} \;
    find . -name "*.js" -type f -exec sed -i '' "s|\.save(|.guardar(|g" {} \;
    find . -name "*.js" -type f -exec sed -i '' "s|\.load(|.cargar(|g" {} \;
    find . -name "*.js" -type f -exec sed -i '' "s|\.get(|.obtener(|g" {} \;
    find . -name "*.js" -type f -exec sed -i '' "s|\.set(|.establecer(|g" {} \;
    
    cd "$PANELS_DIR"
}

# Lista de paneles a convertir
PANELS=(
    "tablero"
    "autenticacion"
    "actividades"
    "estudiantes"
    "asistencia"
    "planificaciones"
    "horario"
    "reportes"
    "instrumentos"
    "configuracion"
    "configuracion-academica"
    "crear-estudiante"
    "editar-estudiante"
    "crear-seccion"
    "usuarios"
    "configuracion-inicial"
    "matriz"
)

# Convertir cada panel
for panel in "${PANELS[@]}"; do
    convert_panel "$panel"
done

echo "Conversión de funciones completada"

# Actualizar referencias globales
echo "Actualizando referencias globales..."
cd /Users/natanael/Documents/edugest-main/js

# Actualizar referencias en core
find core/ -name "*.js" -type f -exec sed -i '' "s|registerAuthPanel|registrarPanelAutenticacion|g" {} \;
find core/ -name "*.js" -type f -exec sed -i '' "s|RENDERS.auth|RENDERS.autenticacion|g" {} \;
find core/ -name "*.js" -type f -exec sed -i '' "s|RENDERS.dashboard|RENDERS.tablero|g" {} \;

echo "Conversión completa finalizada"