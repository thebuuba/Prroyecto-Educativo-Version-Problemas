import { mountAuthFragments } from './auth-loader.js';

function bootAuthFragments() {
  mountAuthFragments();
  window.dispatchEvent(new CustomEvent('aulabase:auth-mounted'));
}

window.__AULABASE_AUTH_READY = window.__AULABASE_AUTH_READY || new Promise((resolve) => {
  window.addEventListener('aulabase:auth-mounted', resolve, { once: true });
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootAuthFragments, { once: true });
} else {
  bootAuthFragments();
}
