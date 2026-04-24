import { mountAuthFragments } from './auth-loader.js';

function bootAuthFragments() {
  mountAuthFragments();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootAuthFragments, { once: true });
} else {
  bootAuthFragments();
}
