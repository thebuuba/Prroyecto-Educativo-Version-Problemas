/**
 * Control visual del modal de autenticacion.
 * Mantiene juntas las transiciones entre login y registro.
 */

import { S } from '../../../core/state.js';
import {
  clearRegisterFieldErrors,
  resetRegisterCodeFlow,
  resetRegisterStrengthState,
  setAuthNote,
  setupRegisterFieldUX,
  updateRegisterPasswordStrengthUI,
} from './auth-support.js';

export function currentAuthMode() {
  return document.querySelector('.auth-panel')?.dataset.mode === 'register' ? 'register' : 'login';
}

function animateAuthPanel(panel, direction) {
  if (!panel) return;
  if (S.preferences?.authLoginAnimation === false || S.preferences?.animations === false) {
    panel.classList.remove('is-entering-left', 'is-entering-right');
    return;
  }
  panel.classList.remove('is-entering-left', 'is-entering-right');
  void panel.offsetWidth;
  panel.classList.add(direction === 'left' ? 'is-entering-left' : 'is-entering-right');
}

function animateAuthChrome(direction) {
  if (S.preferences?.authLoginAnimation === false || S.preferences?.animations === false) return;
  const headingNodes = document.querySelectorAll('#auth-title, #auth-subtitle');
  const headingClass = direction === 'left' ? 'is-fading-left' : 'is-fading-right';
  headingNodes.forEach((node) => {
    node.classList.remove('is-fading-left', 'is-fading-right');
    void node.offsetWidth;
    node.classList.add(headingClass);
  });

  const animatedNodes = document.querySelectorAll('.auth-social, .auth-switch-row');
  if (!animatedNodes.length) return;
  const className = direction === 'left' ? 'is-shifting-left' : 'is-shifting-right';
  animatedNodes.forEach((node) => {
    node.classList.remove('is-shifting-left', 'is-shifting-right');
    void node.offsetWidth;
    node.classList.add(className);
  });
}

function transitionAuthPanels(showLogin) {
  const loginBox = document.getElementById('auth-login-box');
  const registerBox = document.getElementById('auth-register-box');
  if (loginBox) loginBox.style.display = showLogin ? '' : 'none';
  if (registerBox) registerBox.style.display = showLogin ? 'none' : '';
  animateAuthPanel(showLogin ? loginBox : registerBox, showLogin ? 'left' : 'right');
  animateAuthChrome(showLogin ? 'left' : 'right');
}

export function establecerAuthMode(mode) {
  const login = mode !== 'register';
  const panel = document.querySelector('.auth-panel');
  const title = document.getElementById('auth-title');
  const subtitle = document.getElementById('auth-subtitle');
  const loginSocial = document.querySelector('#m-auth .auth-panel > .auth-social');
  const socialDivider = document.getElementById('auth-social-divider');
  const switchCopy = document.getElementById('auth-switch-copy');
  const switchLink = document.getElementById('auth-switch-link');
  const registerSubmit = document.getElementById('auth-register-submit');
  const loginTab = document.getElementById('auth-tab-login');
  const registerTab = document.getElementById('auth-tab-register');

  transitionAuthPanels(login);
  if (panel) panel.dataset.mode = login ? 'login' : 'register';
  if (title) title.textContent = login ? 'Iniciar sesión' : 'Crear cuenta';
  if (subtitle) {
    subtitle.textContent = login
      ? 'Ingresa tus credenciales para continuar.'
      : 'Únete a la excelencia académica estructurada.';
  }
  if (loginSocial) loginSocial.style.display = login ? '' : 'none';
  if (socialDivider) socialDivider.textContent = 'o usa tu email';
  if (switchCopy) switchCopy.textContent = login ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?';
  if (switchLink && switchLink.dataset.bound !== '1') {
    switchLink.dataset.bound = '1';
    switchLink.addEventListener('click', () => {
      const isCurrentlyLogin = document.querySelector('.auth-panel')?.dataset.mode === 'login';
      establecerAuthMode(isCurrentlyLogin ? 'register' : 'login');
    });
  }
  if (switchLink) switchLink.textContent = login ? 'Regístrate' : 'Inicia sesión';
  if (loginTab) {
    loginTab.classList.toggle('is-active', login);
    loginTab.setAttribute('aria-selected', login ? 'true' : 'false');
  }
  if (registerTab) {
    registerTab.classList.toggle('is-active', !login);
    registerTab.setAttribute('aria-selected', login ? 'false' : 'true');
  }

  if (login) {
    resetRegisterCodeFlow();
    clearRegisterFieldErrors();
  } else if (registerSubmit) {
    registerSubmit.innerHTML = 'Registrarse <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>';
  }

  setAuthNote('');
  setupRegisterFieldUX();
  resetRegisterStrengthState();
  updateRegisterPasswordStrengthUI('');
}
