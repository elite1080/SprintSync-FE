import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001, // Changed to 3001 to avoid conflict with backend on 8000
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000', // Use IPv4 localhost to avoid IPv6 issues
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
})
