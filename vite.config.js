import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const isNetlifyBuild = process.env.NETLIFY === 'true'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: isNetlifyBuild ? 'dist' : '../backend/dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
       // target: 'http://localhost:1000',
        target: 'https://leostrend.com',
        changeOrigin: true,
      }
    }
  }
})
