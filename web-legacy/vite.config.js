import { defineConfig } from 'vite'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Sirve la app legacy directamente como entrada principal.
export default defineConfig({
  root: resolve(__dirname, 'public/legacy'),
  publicDir: resolve(__dirname, 'public/legacy/public'),
})
