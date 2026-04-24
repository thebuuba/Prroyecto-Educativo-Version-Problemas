import authShellHtml from './shared/auth-shell.html?raw';
import authModalsHtml from './shared/auth-modals.html?raw';
import loginHtml from './login/login.html?raw';
import registroHtml from './registro/registro.html?raw';

export function mountAuthFragments() {
  const mount = document.getElementById('auth-fragments-root');
  if (!mount || document.getElementById('m-auth')) return;

  mount.innerHTML = [
    authShellHtml
      .replace('<!-- AUTH_LOGIN_SLOT -->', loginHtml)
      .replace('<!-- AUTH_REGISTER_SLOT -->', registroHtml),
    authModalsHtml,
  ].join('\n');
}
