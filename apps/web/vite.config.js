import { defineConfig } from 'vite';
import { resolve } from 'path';
import { cpSync, existsSync } from 'fs';

const repoRoot = resolve(__dirname, '../..');

function copyModalFragments() {
  let rootDir = repoRoot;
  let outDir = 'dist';

  return {
    name: 'edugest-copy-modal-fragments',
    configResolved(config) {
      rootDir = config.root;
      outDir = config.build.outDir;
    },
    closeBundle() {
      const source = resolve(rootDir, 'sections/modals');
      if (!existsSync(source)) return;
      cpSync(source, resolve(rootDir, outDir, 'sections/modals'), { recursive: true });
    },
  };
}

export default defineConfig({
  root: repoRoot,
  base: '/',
  publicDir: resolve(repoRoot, 'apps/web/public'),
  plugins: [copyModalFragments()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(repoRoot, 'index.html'),
        terminos: resolve(repoRoot, 'terminos.html'),
        privacidad: resolve(repoRoot, 'privacidad.html'),
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
