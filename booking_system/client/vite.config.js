import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://172.20.10.3:8080',
        changeOrigin: true
      },
      '/ws': {
        target: 'http://172.20.10.3:8080',
        ws: true
      }
    }
  }
})