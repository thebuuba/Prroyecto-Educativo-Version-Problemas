# Login y registro

Esta carpeta separa las piezas de autenticacion en dos grupos:

- `login/`: archivos relacionados con el inicio de sesion.
- `registro/`: archivos relacionados con la creacion de cuenta.
- `shared/`: shell visual y modales auxiliares compartidos por login y registro.

Archivos compartidos:

- `shared/auth-shell.html`: contenedor visual principal del modal de acceso.
- `shared/auth-modals.html`: recuperar contraseña, términos y selección de nivel educativo.
- `shared/auth.css`: estilos reales usados por el login, registro y modales de auth.
- `auth-loader.js`: monta el shell, login, registro y modales dentro de `index.html`.
- `auth-bootstrap.js`: ejecuta el montaje del auth en cada página.

Archivos especificos:

- `login/login.html`: formulario de inicio de sesion.
- `registro/registro.html`: formulario de registro.
- `login/auth.css`: import de referencia hacia `shared/auth.css`.
- `login/auth.js`: copia de referencia de la logica de auth.
- `registro/auth.css`: import de referencia hacia `shared/auth.css`.
- `registro/auth.js`: copia de referencia de la logica de auth.
- `*/api-cloud.js`: funciones que conectan el acceso con Firebase.

En `index.html` solo debe existir el contenedor:

```html
<div id="auth-fragments-root"></div>
```

El HTML real de login/registro se monta desde esta carpeta antes del arranque de la app.

Origen de los archivos fuente:

- `sections/html/02-auth-access-shell.html`
- `sections/html/03-auth-login-box.html`
- `sections/html/04-auth-register-box.html`
- `styles/02-auth.css`
- `js/panels/auth.js`
- `js/core/api-cloud.js`
