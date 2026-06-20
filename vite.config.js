import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/usuario': {
        target: 'http://localhost:27017',
        changeOrigin: true,
      },
      '/empresa': {
        target: 'http://localhost:27017',
        changeOrigin: true,
      },
    },
  },
})
