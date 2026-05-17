const { readdirSync, statSync } = require('fs');
const { join, relative } = require('path');
const { spawnSync } = require('child_process');

const rootDir = join(__dirname, '..', 'src');

function listJavaScriptFiles(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) return listJavaScriptFiles(fullPath);
    return entry.endsWith('.js') ? [fullPath] : [];
  });
}

for (const file of listJavaScriptFiles(rootDir)) {
  const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' });
  if (result.status !== 0) {
    console.error(`[check-syntax] Fallo de sintaxis en ${relative(process.cwd(), file)}`);
    process.exit(result.status || 1);
  }
}

console.log('[check-syntax] OK: backend JavaScript válido.');
