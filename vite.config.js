import { defineConfig } from 'vite'

// base './' permite que funcione en GitHub Pages y también dentro de Capacitor.
export default defineConfig({
  base: './',
  server: {
    host: '0.0.0.0',
    port: 5173
  }
})
