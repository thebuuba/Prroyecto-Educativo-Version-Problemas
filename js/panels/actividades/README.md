# Panel Activities (Actividades)

## 📋 Descripción
Panel de gestión de actividades evaluativas para cursos y secciones. Permite crear, editar y gestionar actividades con sus respectivas calificaciones.

## 🎯 Funcionalidades
- **Gestión de actividades**: Crear, editar y eliminar actividades
- **Asignación de instrumentos**: Vincular instrumentos de evaluación a actividades
- **Calificaciones**: Registrar y gestionar calificaciones de estudiantes
- **Configuración de bloques**: Organizar actividades por bloques académicos
- **Vistas múltiples**: Vista de bloques, matriz y configuración

## 📁 Estructura de Archivos
```
activities/
├── index.js              # Archivo principal del panel
├── utils/
│   └── actions.js       # Acciones y lógica de negocio
├── components/           # Componentes UI reutilizables
├── types/               # Definiciones de tipos (si se usa TypeScript)
└── README.md            # Esta documentación
```

## 🔗 Dependencias
- `S` - Estado global desde `js/core/state.js`
- `go` - Sistema de navegación desde `js/core/routing.js`
- `persist` - Sistema de persistencia desde `js/core/hydration.js`
- Utilidades de dominio desde `js/core/domain-utils.js`
- Constantes desde `js/core/constants.js`

## 🚀 Flujo de Datos
1. El panel se registra en `window.RENDERS.activities`
2. Al navegar a '/actividades', el sistema llama a la función principal
3. Se cargan las actividades del curso/sección activo
4. Se renderiza la vista según el modo (blocks, matrix, config)
5. Se asigna al contenedor del panel

## 🎨 Componentes UI
- Lista de actividades por bloque
- Formulario de creación/edición de actividades
- Matriz de calificaciones
- Configuración de instrumentos

## 🔧 Funciones Principales
- Funciones de renderizado de actividades
- Acciones de CRUD para actividades
- Gestión de calificaciones
- Configuración de bloques

## 📊 Lógica de Negocio
- Validación de datos de actividades
- Cálculo de promedios y estadísticas
- Gestión de instrumentos vinculados
- Control de acceso por permisos

## 🔄 Actualización
El panel se actualiza cuando:
- Se navega a la ruta '/actividades'
- Se cambia el curso/sección activo
- Se modifican actividades
- Se actualizan calificaciones

## 🐛 Debugging
Para debugging, puedes agregar logs en las funciones principales para ver:
- Estado de actividades
- Flujo de creación/edición
- Errores de validación

## 📝 Notas para Desarrolladores
- Este panel es crítico para el proceso de evaluación
- Las actividades se organizan por bloques académicos
- Los instrumentos se vinculan para estandarizar evaluación
- La matriz de calificaciones es una vista alternativa

---
**Última actualización**: 2026-04-26