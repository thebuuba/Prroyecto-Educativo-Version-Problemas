import { S } from './state.js';
import { hydrate } from './hydration.js';
import { go } from './routing.js';
import '../panels/auth.js';

export async function boot() {
  console.log('[EduGest] Booting modular app...');
  
  // 1. Initial hydration
  await hydrate();
  
  // 2. Initial routing
  const urlParams = new URLSearchParams(window.location.search);
  const page = urlParams.get('p') || S.currentPage || 'dashboard';
  
  // 3. Start navigation
  go(page, { replace: true });
  
  // 4. Hide splash screen
  if (typeof window.hideBootSplash === 'function') {
    window.hideBootSplash('boot_complete');
  }
}

window.EduGestApp = { boot };
