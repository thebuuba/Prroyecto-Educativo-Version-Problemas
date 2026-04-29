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

function setTextContent(selector, text) {
  const node = document.querySelector(selector);
  if (node) node.textContent = text;
}

function updateFeatureCard(index, { icon, title, text }) {
  const card = document.querySelectorAll('#m-auth .auth-feature-item')[index];
  if (!card) return;
  const iconNode = card.querySelector('.material-symbols-outlined');
  const titleNode = card.querySelector('strong');
  const textNode = card.querySelector('p');
  if (iconNode) iconNode.textContent = icon;
  if (titleNode) titleNode.textContent = title;
  if (textNode) textNode.textContent = text;
}

function updateAuthBrand(login) {
  const title = document.querySelector('#m-auth .auth-brand-name');
  if (title) {
    title.innerHTML = login
      ? 'Gestiona tu aula <span>sin perder el ritmo.</span>'
      : 'Crea tu cuenta y comienza a <span>gestionar tu aula.</span>';
  }

  setTextContent(
    '#m-auth .auth-brand-kicker',
    login
      ? 'Planifica, registra y consulta la información de tus estudiantes desde un panel claro, rápido y conectado.'
      : 'Empieza con un espacio organizado para tus estudiantes, evaluaciones y clases, listo para sincronizarse en la nube.',
  );

  const features = login
    ? [
        { icon: 'groups', title: 'Grupos y estudiantes', text: 'Todo organizado por curso, sección y periodo.' },
        { icon: 'fact_check', title: 'Evaluaciones al día', text: 'Registros guardados y sincronizados en la nube.' },
        { icon: 'monitoring', title: 'Trabajo más ligero', text: 'Menos pasos para llegar a lo importante.' },
      ]
    : [
        { icon: 'groups', title: 'Organización de estudiantes', text: 'Crea tu aula y mantén cada grupo bien estructurado.' },
        { icon: 'bolt', title: 'Evaluaciones rápidas', text: 'Registra el progreso sin complicar tu flujo de trabajo.' },
        { icon: 'cloud_done', title: 'Acceso desde cualquier lugar', text: 'Tu información permanece disponible y sincronizada.' },
      ];

  features.forEach((feature, index) => updateFeatureCard(index, feature));
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
  updateAuthBrand(login);
  if (title) title.textContent = login ? 'Iniciar sesión' : 'Crear cuenta';
  if (subtitle) {
    subtitle.textContent = login
      ? 'Ingresa tus credenciales para continuar.'
      : 'Regístrate en Aula Base';
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
    registerSubmit.innerHTML = 'Crear cuenta <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>';
  }

  setAuthNote('');
  setupRegisterFieldUX();
  resetRegisterStrengthState();
  updateRegisterPasswordStrengthUI('');
}
