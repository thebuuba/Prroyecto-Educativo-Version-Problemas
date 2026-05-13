import { defineConfig } from 'vite';
import { resolve } from 'path';
import { cpSync, existsSync } from 'fs';

function copyModalFragments() {
  let rootDir = process.cwd();
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
  root: './',
  base: '/',
  plugins: [copyModalFragments()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        terminos: resolve(__dirname, 'terminos.html'),
        privacidad: resolve(__dirname, 'privacidad.html'),
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
