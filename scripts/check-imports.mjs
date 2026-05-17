import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scanRoots = ['js', 'login-registro-auth', 'apps/web'];
const extensions = ['', '.ts', '.js', '.mjs', '.html', '.css', '.json'];
const importPattern = /\bimport\s+(?:[^'"()]*?\s+from\s+)?['"]([^'"]+)['"]|\bexport\s+[^'"]*?\s+from\s+['"]([^'"]+)['"]|\bimport\(\s*['"]([^'"]+)['"]\s*\)/g;

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    if (!/\.(?:js|mjs|ts)$/.test(entry.name)) return [];
    return [fullPath];
  });
}

function cleanSpecifier(specifier) {
  return String(specifier || '').split('?')[0].split('#')[0];
}

function isLocalSpecifier(specifier) {
  return specifier.startsWith('.') || specifier.startsWith('/');
}

function existsResolved(basePath) {
  for (const ext of extensions) {
    const candidate = `${basePath}${ext}`;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return true;
  }
  if (fs.existsSync(basePath) && fs.statSync(basePath).isDirectory()) {
    return extensions.some((ext) => ext && fs.existsSync(path.join(basePath, `index${ext}`)));
  }
  return false;
}

const failures = [];
for (const filePath of scanRoots.flatMap((root) => walk(path.join(repoRoot, root)))) {
  const source = fs.readFileSync(filePath, 'utf8');
  let match;
  while ((match = importPattern.exec(source))) {
    const specifier = cleanSpecifier(match[1] || match[2] || match[3]);
    if (!isLocalSpecifier(specifier)) continue;
    const basePath = specifier.startsWith('/')
      ? path.join(repoRoot, specifier.slice(1))
      : path.resolve(path.dirname(filePath), specifier);
    if (!existsResolved(basePath)) {
      failures.push(`${path.relative(repoRoot, filePath)} -> ${specifier}`);
    }
  }
}

if (failures.length) {
  console.error('[check-imports] Imports locales rotos:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('[check-imports] OK: imports locales resueltos.');
