/**
 * Utilidades auxiliares del panel de autenticación.
 * Agrupa helpers de UI, rate limiting y autenticación local
 * para mantener el flujo principal de auth más legible.
 */

import { S } from '../core/state.js';
import { REGISTER_RATE_LIMIT } from '../core/constants.js';
import { authEmailKey, normalizeAuthAccessMode } from '../core/utils.js';

let registerPasswordStrengthVisible = false;
let authCornerToastTimer = 0;

export function setAuthNote(message = '', tone = 'info', options = {}) {
  const note = document.getElementById('auth-note');
  const noteTitle = document.getElementById('auth-note-title');
  const noteText = document.getElementById('auth-note-text');
  if (!note) return;

  const msg = String(message || '').trim();
  if (!msg) {
    note.hidden = true;
    if (noteTitle) noteTitle.textContent = '';
    if (noteText) noteText.textContent = '';
    note.className = 'auth-note';
    return;
  }

  const { title = '' } = options;
  note.hidden = false;
  if (noteTitle) noteTitle.textContent = title;
  if (noteText) noteText.textContent = msg;
  note.className = `auth-note ${tone}`;
}

export function showAuthCornerToast(message = '', title = 'Aviso', tone = 'info') {
  const msg = String(message || '').trim();
  if (!msg) return;

  const safeTone = ['info', 'warn', 'error'].includes(String(tone || '').trim()) ? String(tone || '').trim() : 'info';
  let toastEl = document.getElementById('auth-corner-toast');
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.id = 'auth-corner-toast';
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.innerHTML = `
      <div class="auth-corner-toast-dot" aria-hidden="true">
        <span class="material-symbols-outlined">info</span>
      </div>
      <div class="auth-corner-toast-body">
        <strong class="auth-corner-toast-title"></strong>
        <div class="auth-corner-toast-text"></div>
      </div>`;
    document.body.appendChild(toastEl);
  }

  toastEl.className = `auth-corner-toast tone-${safeTone}`;
  toastEl.dataset.tone = safeTone;
  const titleNode = toastEl.querySelector('.auth-corner-toast-title');
  const textNode = toastEl.querySelector('.auth-corner-toast-text');
  if (titleNode) titleNode.textContent = String(title || 'Aviso').trim();
  if (textNode) textNode.textContent = msg;
  toastEl.classList.remove('show');
  void toastEl.offsetWidth;
  toastEl.classList.add('show');
  if (authCornerToastTimer) window.clearTimeout(authCornerToastTimer);
  authCornerToastTimer = window.setTimeout(() => {
    toastEl.classList.remove('show');
  }, 5000);
}

export function rememberCurrentAuthAccessMode(mode) {
  const normalized = normalizeAuthAccessMode(mode);
  if (!normalized) return;
  if (!S.profile || typeof S.profile !== 'object') S.profile = {};
  S.profile.authAccessMode = normalized;
}

export function resetRegisterCodeFlow(clearCode = true) {
  const code = document.getElementById('ar-code');
  const registerBtn = document.getElementById('auth-register-submit');
  if (code && clearCode) code.value = '';
  if (registerBtn) {
    registerBtn.innerHTML = 'Registrarse <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>';
  }
}

function readRegisterRateState() {
  try {
    const raw = window.localStorage.getItem(REGISTER_RATE_LIMIT.key);
    if (!raw) return { attempts: [], blockedUntil: 0 };
    const parsed = JSON.parse(raw);
    return {
      attempts: Array.isArray(parsed?.attempts) ? parsed.attempts.filter((value) => Number.isFinite(value)) : [],
      blockedUntil: Number(parsed?.blockedUntil) || 0,
    };
  } catch (_) {
    return { attempts: [], blockedUntil: 0 };
  }
}

function persistRegisterRateState(state) {
  try {
    window.localStorage.setItem(REGISTER_RATE_LIMIT.key, JSON.stringify({
      attempts: Array.isArray(state?.attempts) ? state.attempts : [],
      blockedUntil: Number(state?.blockedUntil) || 0,
    }));
  } catch (_) {}
}

export function evaluateRegisterRateLimit() {
  const now = Date.now();
  const state = readRegisterRateState();
  const attempts = state.attempts.filter((ts) => now - ts <= REGISTER_RATE_LIMIT.windowMs);
  let blockedUntil = Number(state.blockedUntil) || 0;
  if (blockedUntil <= now) blockedUntil = 0;
  if (!blockedUntil && attempts.length >= REGISTER_RATE_LIMIT.maxAttempts) {
    blockedUntil = now + REGISTER_RATE_LIMIT.blockMs;
  }
  const remainingMs = blockedUntil > now ? blockedUntil - now : 0;
  const blocked = remainingMs > 0;
  persistRegisterRateState({ attempts, blockedUntil });
  return { blocked, remainingMs, attempts };
}

export function recordRegisterAttempt(success = false) {
  const now = Date.now();
  if (success) {
    persistRegisterRateState({ attempts: [], blockedUntil: 0 });
    return;
  }
  const state = readRegisterRateState();
  const attempts = state.attempts.filter((ts) => now - ts <= REGISTER_RATE_LIMIT.windowMs);
  attempts.push(now);
  persistRegisterRateState({ attempts, blockedUntil: Number(state.blockedUntil) || 0 });
}

function getRegisterStrengthMeta(password = '') {
  const pass = String(password || '');
  if (!pass) return { score: 0, label: '', percent: 0, tone: 'weak' };
  let score = 0;
  if (pass.length >= 8) score += 1;
  if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score += 1;
  if (/\d/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;
  const labels = ['Débil', 'Aceptable', 'Buena', 'Fuerte'];
  const tones = ['weak', 'fair', 'good', 'strong'];
  const idx = Math.max(0, Math.min(score - 1, 3));
  return {
    score,
    label: labels[idx] || 'Débil',
    percent: [25, 50, 75, 100][idx] || 0,
    tone: tones[idx] || 'weak',
  };
}

export function validateRegisterPassword(password = '') {
  const pass = String(password || '');
  if (pass.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
  if (!/[A-Za-z]/.test(pass) || !/\d/.test(pass)) return 'La contraseña debe incluir letras y números.';
  return '';
}

export function setRegisterFieldError(fieldId, message = '') {
  const input = document.getElementById(fieldId);
  const error = document.getElementById(`${fieldId}-error`);
  const msg = String(message || '').trim();
  if (error) {
    error.textContent = msg;
    error.hidden = !msg;
  }
  if (input) {
    input.classList.toggle('is-invalid', !!msg);
    if (msg) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  }
}

export function clearRegisterFieldErrors() {
  ['ar-name', 'ar-email', 'ar-pass', 'ar-pass2'].forEach((id) => setRegisterFieldError(id, ''));
  const termsError = document.getElementById('ar-terms-error');
  if (termsError) {
    termsError.hidden = true;
    termsError.textContent = '';
  }
}

export function updateRegisterPasswordStrengthUI(password = '') {
  const wrap = document.getElementById('ar-pass-strength');
  const fill = document.getElementById('ar-pass-strength-fill');
  const label = document.getElementById('ar-pass-strength-label');
  if (!wrap || !fill || !label) return;

  const meta = getRegisterStrengthMeta(password);
  if (!registerPasswordStrengthVisible || !password) {
    wrap.hidden = true;
    fill.style.width = '0%';
    fill.dataset.tone = '';
    label.textContent = 'Débil';
    return;
  }

  wrap.hidden = false;
  fill.style.width = `${meta.percent}%`;
  fill.dataset.tone = meta.tone;
  label.textContent = meta.label;
}

export function setupRegisterFieldUX() {
  const passInput = document.getElementById('ar-pass');
  const pass2Input = document.getElementById('ar-pass2');
  const nameInput = document.getElementById('ar-name');
  const emailInput = document.getElementById('ar-email');
  const termsInput = document.getElementById('ar-terms-check');

  if (passInput && passInput.dataset.registerUxBound !== '1') {
    passInput.dataset.registerUxBound = '1';
    passInput.addEventListener('input', () => {
      registerPasswordStrengthVisible = true;
      setRegisterFieldError('ar-pass', '');
      updateRegisterPasswordStrengthUI(passInput.value || '');
    });
  }

  if (pass2Input && pass2Input.dataset.registerUxBound !== '1') {
    pass2Input.dataset.registerUxBound = '1';
    pass2Input.addEventListener('input', () => setRegisterFieldError('ar-pass2', ''));
  }

  if (nameInput && nameInput.dataset.registerUxBound !== '1') {
    nameInput.dataset.registerUxBound = '1';
    nameInput.addEventListener('input', () => setRegisterFieldError('ar-name', ''));
  }

  if (emailInput && emailInput.dataset.registerUxBound !== '1') {
    emailInput.dataset.registerUxBound = '1';
    emailInput.addEventListener('input', () => setRegisterFieldError('ar-email', ''));
  }

  if (termsInput && termsInput.dataset.registerUxBound !== '1') {
    termsInput.dataset.registerUxBound = '1';
    termsInput.addEventListener('change', () => {
      const termsError = document.getElementById('ar-terms-error');
      if (termsError) {
        termsError.hidden = true;
        termsError.textContent = '';
      }
    });
  }
}

export function resetRegisterStrengthState() {
  registerPasswordStrengthVisible = false;
}

function createLocalPasswordSalt() {
  const bytes = new Uint8Array(16);
  if (window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes).map((value) => value.toString(16).padStart(2, '0')).join('');
}

export async function hashLocalPassword(password, salt) {
  const raw = `${salt}::${String(password || '')}`;
  if (window.crypto?.subtle && typeof TextEncoder !== 'undefined') {
    const digest = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
    return Array.from(new Uint8Array(digest)).map((value) => value.toString(16).padStart(2, '0')).join('');
  }
  return btoa(unescape(encodeURIComponent(raw)));
}

export async function createLocalPasswordRecord(password) {
  const salt = createLocalPasswordSalt();
  const hash = await hashLocalPassword(password, salt);
  return { salt, hash };
}

export async function resolveLocalAuthUser(email, password) {
  const user = S.authUsers.find((entry) => authEmailKey(entry.email) === authEmailKey(email));
  if (!user) return { user: null, migrated: false };

  const plainPassword = String(password || '');
  if (user.passHash && user.passSalt) {
    const hashed = await hashLocalPassword(plainPassword, user.passSalt);
    return { user: hashed === user.passHash ? user : null, migrated: false };
  }

  const legacyPass = String(user.pass || '');
  if (!legacyPass || legacyPass !== plainPassword) return { user: null, migrated: false };
  const record = await createLocalPasswordRecord(plainPassword);
  user.passHash = record.hash;
  user.passSalt = record.salt;
  user.passAlgo = 'sha256-salted-v1';
  delete user.pass;
  return { user, migrated: true };
}

export function togglePasswordVisibility(inputId, button) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const showing = input.type === 'text';
  input.type = showing ? 'password' : 'text';
  if (!button) return;

  const label = showing ? 'Mostrar contraseña' : 'Ocultar contraseña';
  button.setAttribute('aria-label', label);
  button.setAttribute('title', label);
  button.classList.toggle('is-visible', !showing);
  const icon = button.querySelector('img');
  if (icon) {
    icon.src = showing ? '/assets/icons/vercontrasena.png' : '/assets/icons/ocultarcontrasena.png';
  }
}
