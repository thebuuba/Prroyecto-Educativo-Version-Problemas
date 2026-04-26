/*
  Punto de referencia del registro.
  La logica real vive en js/panels/auth.js para que login, registro y la app
  usen las mismas funciones sin duplicar reglas de sesion.
*/
export {
  handleAuthRegisterTab,
  registerAuth,
  setAuthMode,
} from '../../js/panels/auth.js';
