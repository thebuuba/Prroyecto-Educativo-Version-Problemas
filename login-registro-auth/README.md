# Login y registro

Esta carpeta separa las piezas de autenticacion en dos grupos:

- `login/`: archivos relacionados con el inicio de sesion.
- `registro/`: archivos relacionados con la creacion de cuenta.
- `shared/`: shell visual y modales auxiliares compartidos por login y registro.
- `auth.css`: indice de estilos; importa base, login y registro en el orden correcto.

Archivos compartidos:

- `shared/auth-shell.html`: contenedor visual principal del modal de acceso.
- `shared/auth-modals.html`: recuperar contraseña, términos y selección de nivel educativo.
- `shared/auth-base.css`: estilos base compartidos por login, registro y modales auxiliares.
- `auth-loader.js`: monta el shell, login, registro y modales dentro de `index.html`.
- `auth-bootstrap.js`: ejecuta el montaje del auth en cada página.

Archivos especificos:

- `login/login.html`: formulario de inicio de sesion.
- `login/auth.css`: estilos especificos del login.
- `registro/registro.html`: formulario de registro.
- `registro/auth.css`: estilos especificos del registro.
- `login/auth.js`: copia de referencia de la logica de auth.
- `registro/auth.js`: copia de referencia de la logica de auth.
- `*/api-cloud.js`: funciones que conectan el acceso con Firebase.

Estilos:

- `shared/auth-base.css` contiene la estructura comun del modal y estilos reutilizados.
- `login/auth.css` contiene solo estilos especificos del login.
- `registro/auth.css` contiene solo estilos especificos del registro.
- `auth.css` funciona como indice para importar los tres archivos anteriores.
- `styles/02-auth.css` solo importa `login-registro-auth/auth.css` para mantener compatibilidad con el sistema global de estilos.

En `index.html` solo debe existir el contenedor:

```html
<div id="auth-fragments-root"></div>
```

El HTML real de login/registro se monta desde esta carpeta antes del arranque de la app.

Los placeholders legacy de `sections/auth` fueron eliminados. El HTML real de autenticación vive únicamente en esta carpeta.
