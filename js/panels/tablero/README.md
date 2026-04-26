# Panel Tablero

## 📋 Descripción
Panel principal (tablero Bento) que muestra estadísticas globales, accesos rápidos y guías contextuales para el docente.

## 🎯 Funcionalidades
- **Estadísticas KPI**: Cursos, estudiantes, actividades, cobertura de evaluación
- **Foco prioritario**: Sugerencias contextuales basadas en el estado del sistema
- **Mis cursos activos**: Lista de secciones con progreso de evaluación
- **Accesos rápidos**: Botones de navegación rápida a funcionalidades principales
- **Matriz de progreso**: Resumen de instrumentos y cursos vacíos

## 📁 Estructura de Archivos
```
tablero/
├── principal.js           # Panel principal y registro
├── components/            # Componentes UI reutilizables
│   ├── tarjeta-estadistica.js
│   ├── elemento-curso.js
│   └── elemento-resumen.js
├── utils/                # Utilidades específicas del tablero
│   └── elementos-enfoque.js
├── types/                # Definiciones de tipos (si se usa TypeScript)
└── README.md             # Esta documentación
```

## 🔗 Dependencias
- `S` - Estado global desde `js/core/state.js`
- `go` - Sistema de navegación desde `js/core/routing.js`
- `persist` - Sistema de persistencia desde `js/core/hydration.js`
- Utilidades de dominio desde `js/core/domain-utils.js`
- Constantes desde `js/core/constants.js`

## 🚀 Flujo de Datos
1. El panel se registra en `window.RENDERS.tablero`
2. Al navegar a 'tablero', el sistema llama a `registerTableroPanel()`
3. Se calculan estadísticas basadas en cursos, estudiantes y actividades
4. Se genera HTML dinámico con las estadísticas y elementos de enfoque
5. Se asigna al contenedor del panel

## 🎨 Componentes UI
- `renderTarjetaEstadistica()` - Tarjeta de estadística KPI
- `renderElementoCurso()` - Ítem de curso en la lista
- `renderElementoResumen()` - Ítem de resumen en la matriz de progreso
- `construirElementosEnfoque()` - Genera elementos de enfoque prioritario

## 🔧 Funciones Globales Expuestas
- `window.openTableroCourse(id)` - Abre un curso específico y navega a actividades

## 📊 Lógica de Negocio
- **Cálculo de estadísticas**: Se obtienen cursos, estudiantes y actividades del estado global
- **Cobertura de evaluación**: Porcentaje de actividades con instrumentos asignados
- **Elementos de enfoque**: Se determinan basados en el estado (sin cursos, sin estudiantes, sin planificación, etc.)

## 🔄 Actualización
El panel se actualiza automáticamente cuando:
- Se navega a la ruta '/inicio'
- Se llama a `window._renderPanel()` desde el sistema de routing

## 🐛 Debugging
Para debugging, puedes agregar logs en `registerTableroPanel()` para ver:
- Estado de cursos y estudiantes
- Cálculo de estadísticas
- Generación de HTML

## 📝 Notas para Desarrolladores
- Este panel es el punto de entrada principal después del login
- Usa un diseño tipo "Bento" con tarjetas y secciones
- Las estadísticas se calculan en tiempo real basándose en el estado global
- Los elementos de enfoque guían al usuario a través del flujo de configuración inicial