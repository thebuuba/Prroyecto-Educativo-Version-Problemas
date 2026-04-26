#!/bin/bash

# Script para generar README.md básico para paneles que no tienen documentación

PANELS_DIR="/Users/natanael/Documents/edugest-main/js/panels"

# Lista de paneles que necesitan README
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
    README_PATH="$PANELS_DIR/$panel/README.md"
    
    # Solo crear si no existe
    if [ ! -f "$README_PATH" ]; then
        echo "Creando README para panel: $panel"
        
        cat > "$README_PATH" << EOF
# Panel ${panel^}

## 📋 Descripción
Panel de ${panel} para el sistema EduGest.

## 🎯 Funcionalidades
- Funcionalidad 1
- Funcionalidad 2
- Funcionalidad 3

## 📁 Estructura de Archivos
\`\`\`
${panel}/
├── index.js              # Archivo principal del panel
├── components/           # Componentes UI reutilizables
├── utils/               # Utilidades específicas del panel
├── types/               # Definiciones de tipos (si se usa TypeScript)
└── README.md            # Esta documentación
\`\`\`

## 🔗 Dependencias
- \`S\` - Estado global desde \`js/core/state.js\`
- \`go\` - Sistema de navegación desde \`js/core/routing.js\`
- \`persist\` - Sistema de persistencia desde \`js/core/hydration.js\`
- Otras dependencias específicas del panel

## 🚀 Flujo de Datos
1. El panel se registra en \`window.RENDERS.${panel}\`
2. Al navegar a la ruta correspondiente, el sistema llama a la función principal
3. Se procesan los datos según la lógica del panel
4. Se genera HTML dinámico o se actualiza la UI
5. Se asigna al contenedor del panel

## 🎨 Componentes UI
- Componente 1 - Descripción
- Componente 2 - Descripción
- Componente 3 - Descripción

## 🔧 Funciones Principales
- \`funcionPrincipal()\` - Descripción
- \`funcionSecundaria()\` - Descripción
- \`funcionHelper()\` - Descripción

## 📊 Lógica de Negocio
- Lógica 1 - Descripción
- Lógica 2 - Descripción
- Lógica 3 - Descripción

## 🔄 Actualización
El panel se actualiza cuando:
- Evento 1
- Evento 2
- Evento 3

## 🐛 Debugging
Para debugging, puedes agregar logs en las funciones principales para ver:
- Estado del panel
- Flujo de datos
- Errores

## 📝 Notas para Desarrolladores
- Nota importante 1
- Nota importante 2
- Nota importante 3

## 🔗 Relación con otros paneles
- Panel relacionado 1
- Panel relacionado 2
- Panel relacionado 3

---
**Última actualización**: $(date +%Y-%m-%d)
EOF
        
        echo "  - README creado para $panel"
    else
        echo "  - README ya existe para $panel, saltando..."
    fi
done

echo "Generación de READMEs completada"