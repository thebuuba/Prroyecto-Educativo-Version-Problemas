# Panel Auth (Autenticación)

## 📋 Descripción
Panel de autenticación que gestiona el login, registro, recuperación de contraseña y gestión de sesiones de usuarios en EduGest.

## 🎯 Funcionalidades
- **Login de usuarios**: Autenticación mediante email/contraseña (local y cloud)
- **Registro de usuarios**: Creación de nuevas cuentas con validación
- **Recuperación de contraseña**: Flujo de restablecimiento de contraseña
- **Autenticación social**: Login mediante proveedores OAuth (Google, etc.)
- **Gestión de sesiones**: Control de estado de autenticación y persistencia
- **Setup inicial**: Configuración obligatoria para nuevos usuarios

## 📁 Estructura de Archivos
```
auth/
├── principal.js              # Panel principal y lógica de autenticación
├── utils/
│   └── auth-support.js   # Utilidades de soporte para formularios
├── components/           # Componentes UI de autenticación
└── README.md            # Esta documentación
```

## 🔗 Dependencias
- `S` - Estado global desde `js/core/state.js`
- `go` - Sistema de navegación desde `js/core/routing.js`
- `persist` - Sistema de persistencia desde `js/core/hydration.js`
- `window.EduGestCloud` - API de autenticación en la nube
- Utilidades de dominio desde `js/core/domain-utils.js`

## 🚀 Flujo de Autenticación
1. **Login**: Usuario ingresa credenciales → Validación → Autenticación local/cloud → Dashboard
2. **Registro**: Usuario completa formulario → Validación → Creación de cuenta → Setup inicial
3. **Recuperación**: Usuario solicita recuperación → Email de recuperación → Restablecimiento
4. **Social**: Usuario selecciona proveedor → OAuth → Creación/actualización de cuenta → Dashboard

## 🔧 Funciones Principales
- `loginAuth()` - Ejecuta el proceso de inicio de sesión
- `registerAuth()` - Procesa el registro de nuevos usuarios
- `authWithProvider()` - Autenticación mediante proveedores sociales
- `finishAuthSession()` - Finaliza la sesión y redirige al dashboard
- `showAuthenticatedDashboard()` - Muestra el dashboard después del login
- `forceCloseM()` - Fuerza el cierre de modales

## 🎨 Componentes UI
- Formulario de login con validación
- Formulario de registro con campos de perfil
- Modal de recuperación de contraseña
- Botones de autenticación social
- Modal de setup inicial para nuevos usuarios

## 📊 Lógica de Negocio
- **Validación de credenciales**: Verificación de email y contraseña
- **Modo local vs cloud**: Fallback a autenticación local si cloud no está disponible
- **Gestión de errores**: Mensajes amigables para errores de autenticación
- **Persistencia de sesión**: Guardado de estado de autenticación localmente
- **Setup obligatorio**: Flujo de configuración inicial para nuevos usuarios

## 🔐 Seguridad
- Las contraseñas nunca se guardan en texto plano
- Validación de formato de email
- Protección contra ataques de fuerza bruta (limitación de intentos)
- Tokens de sesión con expiración
- Cifrado de datos sensibles

## 🔄 Actualización
El panel se actualiza cuando:
- Usuario inicia/cierra sesión
- Se actualiza el perfil del usuario
- Cambia el modo de autenticación (local/cloud)

## 🐛 Debugging
Para debugging, puedes agregar logs en las funciones principales para ver:
- Estado de autenticación
- Flujo de login/registro
- Errores de autenticación
- Estado de la sesión

## 📝 Notas para Desarrolladores
- Este panel es crítico para la seguridad de la aplicación
- Siempre validar credenciales antes de autenticar
- Manejar errores de forma amigable para el usuario
- El modal de auth debe cerrarse correctamente después del login (usar `setProperty('display', 'none', 'important')`)
- El setup inicial es obligatorio para nuevos usuarios

## ⚠️ Importante
- El fix del modal de auth usa `setProperty('display', 'none', 'important')` para forzar el cierre
- Esto es necesario debido a conflictos de especificidad CSS
- No remover esta línea sin entender el impacto