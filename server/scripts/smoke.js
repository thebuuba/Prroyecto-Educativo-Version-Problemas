const { spawn } = require('child_process');

const host = process.env.SMOKE_HOST || '127.0.0.1';
const port = Number(process.env.PORT || '4000');
const baseUrl = `http://${host}:${port}`;
const startupTimeoutMs = Number(process.env.SMOKE_STARTUP_TIMEOUT_MS || '12000');
const requestTimeoutMs = Number(process.env.SMOKE_REQUEST_TIMEOUT_MS || '7000');

function waitForServerReady(child, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout esperando el arranque del API (${timeoutMs}ms).`));
    }, timeoutMs);

    const onStdout = (chunk) => {
      const text = String(chunk || '');
      if (text.includes('escuchando')) {
        clearTimeout(timer);
        resolve();
      }
    };

    const onExit = (code, signal) => {
      clearTimeout(timer);
      reject(new Error(`El API terminó antes del smoke test (code=${code}, signal=${signal || 'none'}).`));
    };

    child.stdout.on('data', onStdout);
    child.once('exit', onExit);
  });
}

async function fetchJson(pathname) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), requestTimeoutMs);
  try {
    const response = await fetch(`${baseUrl}${pathname}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(`${pathname} respondió ${response.status}: ${JSON.stringify(body)}`);
    }
    return body;
  } finally {
    clearTimeout(timer);
  }
}

async function run() {
  const child = spawn('node', ['src/app.js'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: process.env,
  });

  child.stderr.on('data', (chunk) => {
    process.stderr.write(String(chunk || ''));
  });

  try {
    await waitForServerReady(child, startupTimeoutMs);

    const health = await fetchJson('/health');
    if (!health?.ok || health?.database !== 'connected') {
      throw new Error(`Health inválido: ${JSON.stringify(health)}`);
    }

    const catalog = await fetchJson('/api/bootstrap/catalog');
    if (!catalog?.ok || !Array.isArray(catalog?.schools)) {
      throw new Error(`Catalog inválido: ${JSON.stringify(catalog)}`);
    }

    console.log('[smoke] OK: API y base de datos responden correctamente.');
  } finally {
    child.kill('SIGTERM');
  }
}

run().catch((error) => {
  console.error('[smoke] FAIL:', error.message || error);
  process.exitCode = 1;
});
