import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

// Get the globals.js content for the plugin
const globalsContent = fs.readFileSync('./src/globals.js', 'utf-8');

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
      '@managers': resolve(__dirname, 'src/managers'),
      '@svg': resolve(__dirname, 'assets/svg')
    }
  },
  
  // Build configuration
  build: {
    // Lib mode for when building the library
    lib: {
      entry: 'src/nocturna-entry.js',
      name: 'NocturnaWheel',
      formats: ['es', 'umd'],
      fileName: (format) => `nocturna-wheel.${format}.js`
    },
    outDir: 'dist',
    sourcemap: true,
    
    // Rollup options
    rollupOptions: {
      // If you had external dependencies like Vue or React, you'd configure them here
      // external: ['vue'],
      // output: {
      //   globals: {
      //     vue: 'Vue',
      //   },
      // },
      plugins: [
        {
          name: 'copy-globals-js',
          generateBundle() {
            this.emitFile({
              type: 'asset',
              fileName: 'globals.js',
              source: globalsContent
            });
          }
        }
      ]
    }
  },
  
  // Optimize dependencies explicitly
  optimizeDeps: {
    include: []
  }
}); 