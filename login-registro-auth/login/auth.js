/*
  Punto de referencia del login.
  La logica real vive en js/panels/auth.js para que login, registro y la app
  usen las mismas funciones sin duplicar reglas de sesion.
*/
export {
  authWithProvider,
  handleAuthLoginTab,
  handleForgotPassword,
  loginAuth,
  setAuthMode,
  submitForgotPassword,
} from '../../js/panels/auth.js';
