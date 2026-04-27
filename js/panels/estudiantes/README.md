# Panel Students (Estudiantes)

## 📋 Descripción
Panel de gestión de estudiantes. Permite ver, buscar y gestionar la información de los estudiantes matriculados en diferentes cursos.

## 🎯 Funcionalidades
- **Listado de estudiantes**: Ver todos los estudiantes con sus datos
- **Búsqueda y filtrado**: Encontrar estudiantes por nombre, curso, etc.
- **Gestión de matrícula**: Agregar, editar y eliminar estudiantes
- **Información detallada**: Ver datos completos de cada estudiante
- **Acciones rápidas**: Navegar a edición, calificaciones, etc.

## 📁 Estructura de Archivos
```
students/
├── principal.js              # Archivo principal del panel
├── utils/
│   └── actions.js       # Acciones y lógica de negocio
├── components/           # Componentes UI reutilizables
└── README.md            # Esta documentación
```

## 🔗 Dependencias
- `S` - Estado global desde `js/core/state.js`
- `go` - Sistema de navegación desde `js/core/routing.js`
- `persist` - Sistema de persistencia desde `js/core/hydration.js`
- Utilidades de dominio desde `js/core/domain-utils.js`

## 🚀 Flujo de Datos
1. El panel se registra en `window.RENDERS.students`
2. Al navegar a '/estudiantes', se cargan los estudiantes
3. Se aplica filtrado si hay búsqueda activa
4. Se renderiza la lista de estudiantes
5. Se asigna al contenedor del panel

## 🎨 Componentes UI
- Lista de estudiantes con información básica
- Filtros y búsqueda
- Tarjetas de información de estudiantes
- Botones de acción rápida

## 🔧 Funciones Principales
- Renderizado de lista de estudiantes
- Búsqueda y filtrado
- Navegación a detalles
- Acciones de gestión

## 📊 Lógica de Negocio
- Filtrado por curso/sección
- Búsqueda por nombre
- Ordenamiento de resultados
- Validación de datos

## 🔄 Actualización
El panel se actualiza cuando:
- Se navega a '/estudiantes'
- Se modifica la matrícula
- Se cambia el curso activo
- Se actualiza la búsqueda

## 🐛 Debugging
Para debugging, puedes agregar logs para ver:
- Estado de estudiantes
- Resultados de búsqueda
- Errores de carga

## 📝 Notas para Desarrolladores
- Este panel es el punto central para gestión de estudiantes
- Conecta con otros paneles como activities y attendance
- Los datos se cargan desde el estado global

---
**Última actualización**: 2026-04-26