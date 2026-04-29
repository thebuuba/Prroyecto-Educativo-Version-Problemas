# EduGest - Sistema de Gestión Educativa

## 🎯 Descripción General
EduGest es un sistema de gestión educativa completo diseñado para docentes, permitiendo la administración de cursos, estudiantes, calificaciones, asistencia, planificaciones y reportes académicos.

## 🏗️ Arquitectura del Sistema

### Estructura de Carpetas
```
edugest-main/
├── js/                          # Código JavaScript principal
│   ├── core/                   # Módulos core del sistema
│   │   ├── state.js           # Estado global
│   │   ├── routing.js         # Sistema de navegación
│   │   ├── hydration.js       # Facade de hidratación y restauración
│   │   ├── hydration/         # Persistencia, flujo de sesión y estado académico
│   │   ├── ui.js              # Utilidades de UI
│   │   ├── utils.js           # Barrel de utilidades
│   │   ├── utils/             # Utilidades por dominio
│   │   ├── api-sql.js         # Facade/orquestador SQL académico
│   │   ├── api-sql/           # Cliente, auth, contexto, endpoints y sync SQL
│   │   ├── constants.js       # Constantes del sistema
│   │   ├── domain-utils.js    # Utilidades de dominio
│   │   └── ...                # Otros módulos core
│   ├── panels/                 # Paneles de la aplicación (carpetas en español)
│   │   ├── tablero/           # Panel principal
│   │   ├── autenticacion/     # Panel de autenticación
│   │   ├── actividades/       # Panel de actividades
│   │   ├── estudiantes/       # Panel de estudiantes
│   │   ├── asistencia/        # Panel de asistencia
│   │   ├── planificaciones/   # Panel de planificaciones
│   │   ├── horario/           # Panel de horario
│   │   ├── reportes/          # Panel de reportes
│   │   ├── instrumentos/      # Panel de instrumentos
│   │   ├── configuracion/     # Panel de configuración
│   │   └── ...                # Otros paneles
│   ├── page-entry/            # Punto de entrada raíz
│   └── cloud.js               # Integración con nube
├── styles/                     # Entradas globales de CSS
│   ├── 01-base.css            # Manifest de estilos base
│   ├── 02-auth.css            # Estilos de autenticación
│   ├── 03-app-panels.css      # Estilos de paneles
│   ├── 04-ui-overrides.css    # Manifest de overrides de UI
│   ├── base/                  # Parciales base por responsabilidad
│   └── overrides/             # Parciales de ajustes visuales
├── sections/                   # Fragmentos HTML del shell y modales compartidos
│   ├── shell/
│   └── panels/
├── login-registro-auth/        # HTML/CSS de login y registro
├── server/                     # Backend (si existe)
├── scripts/                    # Scripts de utilidad
└── index.html                  # Página principal
```

### Estructura de un Panel
Cada panel sigue una estructura estándar para facilitar el mantenimiento:

```
panel-name/
├── principal.js          # Archivo principal del panel (nombre en español)
├── components/           # Componentes UI reutilizables
│   ├── component1.js
│   └── component2.js
├── html/                 # Fragmentos HTML propios, si el panel los necesita
├── styles/               # CSS propio del panel, si el panel lo necesita
├── utils/               # Utilidades específicas del panel (archivos en inglés)
│   ├── actions.js       # Acciones y lógica de negocio
│   ├── model.js         # Modelos de datos
│   └── support.js       # Funciones de soporte
└── README.md            # Documentación del panel
```

## 🔑 Conceptos Fundamentales

### 1. Estado Global (S)
El estado global se gestiona en `js/core/state.js` y contiene:
- Información del usuario autenticado
- Configuración de la aplicación
- Datos de cursos, estudiantes, actividades
- Estado de navegación

### 2. Sistema de Navegación
El sistema de routing en `js/core/routing.js` gestiona:
- Navegación entre paneles
- Carga diferida de módulos
- Historial del navegador
- URLs amigables

### 3. Sistema de Persistencia
El sistema de hidratación en `js/core/hydration.js` coordina:
- Guardado de estado local mediante `js/core/hydration/persistence.js`
- Recuperación de datos y workspace activo
- Gestión de sesión/logout mediante `js/core/hydration/session-flow.js`
- Normalización académica mediante `js/core/hydration/academic-state.js`

### 4. Paneles
Los paneles son las principales unidades de la aplicación:
- Cada panel tiene su carpeta independiente
- Se registran en `window.RENDERS`
- Se cargan dinámicamente según la navegación
- Pueden tener componentes, utilidades y modelos propios

## 🚀 Flujo de la Aplicación

### 1. Inicialización
1. Carga de `index.html`
2. Ejecución de scripts de arranque
3. Inicialización del estado global
4. Configuración del sistema de routing
5. Carga del panel inicial (auth o dashboard)

### 2. Autenticación
1. Usuario ingresa credenciales
2. Validación en `js/panels/autenticacion/`
3. Autenticación local o cloud
4. Establecimiento de sesión
5. Navegación al tablero

### 3. Navegación
1. Usuario selecciona una opción
2. Sistema de routing procesa la solicitud
3. Carga del panel correspondiente
4. Renderizado del panel
5. Actualización del estado global

### 4. Operaciones CRUD
1. Usuario realiza una acción
2. Validación de datos
3. Actualización del estado
4. Persistencia de cambios
5. Actualización de UI

## 🛠️ Tecnologías Utilizadas

### Frontend
- **JavaScript ES6+**: Lógica de la aplicación
- **Vite**: Build tool y desarrollo
- **CSS3**: Estilos y diseño
- **Material Symbols**: Iconos
- **HTML5**: Estructura de la aplicación

### Backend y nube
- **Node.js/Express**: API de sincronización SQL.
- **Supabase Auth**: Autenticación cloud.
- **Supabase PostgreSQL**: Base de datos cloud oficial para perfiles, grados, secciones, estudiantes, asistencia, actividades, evaluaciones y bloques de estado.

### Herramientas de Desarrollo
- **Git**: Control de versiones
- **npm**: Gestión de paquetes
- **Vite**: Desarrollo y build
- **ESLint**: Linting de código

## 📚 Guía de Aprendizaje

### Para Principiantes
1. **Comprender la estructura**: Lee esta documentación y `docs/PROJECT_STRUCTURE.md`
2. **Estudiar un panel simple**: Comienza con `tablero/` o `configuracion/`
3. **Entender el estado global**: Revisa `js/core/state.js`
4. **Aprender el routing**: Estudia `js/core/routing.js`
5. **Practicar con cambios pequeños**: Modifica textos, colores, etc.

### Para Desarrolladores Intermedios
1. **Crear un nuevo panel**: Usa la estructura estándar
2. **Agregar componentes**: Reutiliza componentes existentes
3. **Implementar lógica de negocio**: Usa utilidades core
4. **Conectar con el estado**: Usa el estado global
5. **Probar el sistema**: Verifica navegación y persistencia

### Para Desarrolladores Avanzados
1. **Optimizar rendimiento**: Mejora carga de módulos
2. **Refactorizar código**: Aplica patrones de diseño
3. **Agregar tests**: Implementa pruebas unitarias
4. **Mejorar seguridad**: Revisa autenticación y validación
5. **Documentar cambios**: Actualiza READMEs

## 🔧 Comandos Útiles

### Desarrollo
```bash
# Iniciar servidor de desarrollo
npm run dev

# Build para producción
npm run build

# Verificar frontend y backend
npm run check
```

### Scripts Personalizados
```bash
# Ensamblar HTML
npm run assemble

# Preparar dist para publicar en cualquier hosting
npm run prepare:dist

# Validar backend solamente
npm run backend:check
```

## 📖 Recursos de Aprendizaje

### Documentación Interna
- `docs/PROJECT_STRUCTURE.md` - Estructura detallada del proyecto
- `server/.env.example` - Variables para conectar PostgreSQL/Supabase
- `.env.example` - Variables públicas de Vite y Supabase Auth
- `server/README.md` - Setup de la API SQL sobre Supabase PostgreSQL
- `AGENTS.md` - Guía para agentes de desarrollo

### Documentación por Panel
Cada panel tiene su propio `README.md` con:
- Descripción del panel
- Funcionalidades
- Estructura de archivos
- Dependencias
- Flujo de datos
- Notas para desarrolladores

## 🤝 Contribución

### Flujo de Trabajo
1. Crea una rama para tu feature
2. Implementa los cambios
3. Prueba thoroughly
4. Actualiza la documentación
5. Crea un pull request

### Convenciones
- Usa la estructura estándar de paneles
- Documenta tu código
- Sigue los patrones existentes
- Mantén la consistencia
- Agrega tests cuando sea posible

## 🐛 Solución de Problemas

### Problemas Comunes
1. **Panel no carga**: Verifica rutas en `routing.js`
2. **Estado no persiste**: Revisa `hydration.js`
3. **Estilos no aplican**: Verifica CSS y clases
4. **Importaciones fallan**: Revisa rutas relativas

### Debugging
- Usa `console.log` para debugging
- Revisa el estado global en `S`
- Verifica la consola del navegador
- Usa el debugger del navegador

## 📞 Soporte

Para preguntas o problemas:
- Revisa la documentación del panel específico
- Consulta `docs/PROJECT_STRUCTURE.md`
- Verifica los logs de la consola
- Contacta al equipo de desarrollo

## 📄 Licencia

Este proyecto es propiedad de EduGest. Todos los derechos reservados.

---

**Última actualización**: 2026-04-26
**Versión**: 1.0.0
