# Login y registro

Esta carpeta separa las piezas de autenticacion en dos grupos:

- `login/`: archivos relacionados con el inicio de sesion.
- `registro/`: archivos relacionados con la creacion de cuenta.

Cada carpeta incluye:

- `auth-shell.html`: contenedor visual principal del modal de acceso.
- `auth.css`: estilos del login, registro, recuperacion y elementos relacionados.
- `auth.js`: logica de UI, validaciones, cambio entre login/registro y acciones de los botones.
- `api-cloud.js`: funciones que conectan el acceso con Firebase.

Archivos especificos:

- `login/login.html`: formulario de inicio de sesion.
- `registro/registro.html`: formulario de registro.

Origen de los archivos fuente:

- `sections/html/02-auth-access-shell.html`
- `sections/html/03-auth-login-box.html`
- `sections/html/04-auth-register-box.html`
- `styles/02-auth.css`
- `js/panels/auth.js`
- `js/core/api-cloud.js`
