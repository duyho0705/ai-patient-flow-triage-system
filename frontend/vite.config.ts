import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  define: {
    global: 'window',
  },
  server: {
    port: 5173,
    headers: {
      "Cross-Origin-Opener-Policy": "unsafe-none",
    },
    proxy: {
      '/api': { target: 'http://localhost:8080', changeOrigin: true },
      '/uploads': { target: 'http://localhost:8080', changeOrigin: true },
      '/ws-queue': { target: 'http://localhost:8080', ws: true, changeOrigin: true },
      '/swagger-ui': { target: 'http://localhost:8080', changeOrigin: true },
      '/v3/api-docs': { target: 'http://localhost:8080', changeOrigin: true },
    },
  },
})
