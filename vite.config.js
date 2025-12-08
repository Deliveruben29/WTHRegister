import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Disable source maps to avoid CSP issues in production
    sourcemap: false,
    // Use esbuild (default) instead of terser
    minify: 'esbuild',
    target: 'es2015'
  }
})
