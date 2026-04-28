/**
 * Aplicacion y restauracion de sesiones autenticadas.
 */

import { S } from '../../../core/state.js';
import {
  ACCOUNT_MAX_ACTIVE_SESSIONS,
  ACCOUNT_MAX_TRUSTED_DEVICES,
  LICENSE_MODEL_VERSION,
} from '../../../core/constants.js';
import { nowIso } from '../../../core/utils.js';
import { closeM, forceCloseM, openM } from '../../../core/ui.js';
import {
  applySessionUser,
  hydrateCloudStateForUser,
  persist,
} from '../../../core/hydration.js';
import { go } from '../../../core/routing.js';
import {
  getSqlAuthSession,
  isEnabled as canUseSqlAuth,
} from '../../../core/api-sql.js';

export function ensureIndividualLicenseModel() {
  if (!S.profile || typeof S.profile !== 'object') S.profile = {};
  const current = S.profile.accountLicense || {};
  S.profile.accountLicense = {
    ...current,
    type: 'individual_teacher',
    shareAllowed: false,
    maxTrustedDevices: ACCOUNT_MAX_TRUSTED_DEVICES,
    maxActiveSessions: ACCOUNT_MAX_ACTIVE_SESSIONS,
    policyVersion: LICENSE_MODEL_VERSION,
    updatedAt: nowIso(),
  };
}

export function mostrarTableroAutenticado() {
  forceCloseM('m-auth');
  forceCloseM('m-auth-forgot');

  document.body?.classList.remove('auth-screen-open');

  const authModal = document.getElementById('m-auth');
  if (authModal) {
    authModal.classList.remove('open');
    authModal.style.setProperty('display', 'none', 'important');
  }

  const splash = document.getElementById('app-boot');
  if (splash) {
    splash.dataset.bootHidden = '1';
    splash.classList.add('is-hidden');
    setTimeout(() => splash.remove(), 280);
  }

  go('dashboard');

  setTimeout(() => {
    if (typeof window.refreshTop === 'function') {
      window.refreshTop();
    }
  }, 100);
}

export function finalizarSesionAutenticacion(user, options = {}) {
  const { openSetup = false, isNewAccount = false } = options;
  const shouldOpenSetup = isNewAccount && openSetup;

  applySessionUser(user);
  ensureIndividualLicenseModel();
  persist();

  if (shouldOpenSetup) {
    closeM('m-auth');
    openM('m-setup', { fromAuth: true });
  } else {
    mostrarTableroAutenticado();
  }
}

export async function restoreSqlSessionIfAvailable() {
  if (!canUseSqlAuth() || S.sessionUserId) return;
  try {
    const payload = await getSqlAuthSession();
    const user = payload?.user;
    if (!user?.id) return;
    const normalizedUser = {
      ...user,
      id: user.id,
      uid: user.uid || user.id,
      name: user.name || user.displayName || '',
      email: user.email || '',
      authMode: 'sql',
    };
    await hydrateCloudStateForUser(normalizedUser);
    if (document.getElementById('m-auth')?.classList.contains('open')) {
      mostrarTableroAutenticado();
    }
  } catch (_) {
    // Sin cookie vigente: el flujo normal de login se mantiene.
  }
}
