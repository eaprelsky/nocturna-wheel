import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Development server configuration
  server: {
    port: 3000,
    open: true,
    hmr: {
      overlay: true
    }
  },
  
  // Resolve aliases for easier imports
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@core': resolve(__dirname, 'src/core'),
      '@renderers': resolve(__dirname, 'src/renderers'),
      '@managers': resolve(__dirname, 'src/managers')
    }
  },
  
  // Build configuration
  build: {
    // Lib mode for when building the library
    lib: {
      entry: resolve(__dirname, 'src/NocturnaWheel.js'),
      name: 'NocturnaWheel',
      fileName: (format) => `nocturna-wheel.${format}.js`
    },
    outDir: 'dist',
    sourcemap: true,
    
    // Rollup options
    rollupOptions: {
      output: {
        // Ensure external dependencies are not bundled
        globals: {
          // Add any external dependencies here
        }
      }
    }
  },
  
  // Optimize dependencies explicitly
  optimizeDeps: {
    include: []
  }
}); 