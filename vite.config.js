import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    sourcemap: true,
    // Evita <script> inline do polyfill de modulepreload (incompatível com CSP script-src 'self')
    modulePreload: { polyfill: false },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          // Fora do leaflet (carregado sob demanda com EmpresaForm), agrupa o vendor
          // num chunk estável para melhor cache entre deploys.
          if (id.includes('leaflet')) return
          if (id.includes('@mui') || id.includes('@emotion')) return 'mui'
          if (id.includes('react-router')) return 'react-router'
          if (id.includes('axios')) return 'axios'
          if (id.includes('react')) return 'react'
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.jsx',
    css: true,
  },
})
