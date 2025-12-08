import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Disable source maps in production to avoid CSP issues
    sourcemap: false,
    // Use 'es' format to avoid eval issues
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        // Avoid using eval
        unsafe: false,
        unsafe_comps: false,
        unsafe_proto: false,
      },
      // Don't use eval in minified code
      mangle: {
        eval: false
      }
    }
  },
  server: {
    // For development
    hmr: {
      protocol: 'ws'
    }
  }
})
