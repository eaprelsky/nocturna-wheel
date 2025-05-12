import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import copy from 'rollup-plugin-copy';
import commonjs from '@rollup/plugin-commonjs';
import pkg from './package.json';

// Main configuration with multiple output formats
export default {
  input: 'src/main.js',
  output: [
    // UMD build (for browsers)
    {
      name: 'NocturnaWheel',
      file: pkg.main,
      format: 'umd',
      exports: 'named',
      sourcemap: true,
      // Ensure all named exports are properly exposed
      extend: false,
      // Crucial: Make named exports available as properties of NocturnaWheel
      esModule: true,
      // Important: Define how external globals are managed
      globals: {}
    },
    // ESM build (for bundlers)
    {
      file: pkg.module,
      format: 'es',
      sourcemap: true
    }
  ],
  plugins: [
    // Essential: Resolve modules in node_modules and source directories
    nodeResolve({
      extensions: ['.js'], // Only use .js files
      browser: true, // Target browser environment
      preferBuiltins: false, // Prefer our own implementations
      dedupe: ['svgutils', 'astrologyutils'] // Deduplicate these modules
    }),
    // Handle CommonJS modules
    commonjs(),
    // Copy static assets
    copy({
      targets: [
        { src: 'assets/*', dest: 'dist/assets' },
        { src: 'src/css/*', dest: 'dist/css' }
      ]
    }),
    // Create a special bundle that includes nocturna-fix.js
    {
      name: 'create-bundle',
      generateBundle(outputOptions, bundle) {
        // Create a special bundle file that fixes globals issue
        const fixCode = `
/**
 * nocturna-wheel.bundle.js - Complete package with fixes
 */
(function() {
  // Store original module and exports for proper resolution
  var module = window.module || {};
  var exports = window.exports || {};
  
  // Ensure ServiceRegistry is initialized immediately
  if (window.NocturnaWheel && window.NocturnaWheel.ServiceRegistry) {
    window.NocturnaWheel.ServiceRegistry.initializeServices();
  }
  
  // Fix common reference errors by providing fallbacks
  window.SvgUtils = window.SvgUtils || 
    (window.NocturnaWheel && window.NocturnaWheel.SvgUtils) || 
    function() { console.error('SvgUtils not properly loaded'); };
  
  window.AstrologyUtils = window.AstrologyUtils || 
    (window.NocturnaWheel && window.NocturnaWheel.AstrologyUtils) || 
    function() { console.error('AstrologyUtils not properly loaded'); };
})();
`;

        // Add this to the bundle outputs
        this.emitFile({
          type: 'asset',
          fileName: 'nocturna-wheel.bundle.js',
          source: fixCode + (bundle['nocturna-wheel.umd.js'] ? bundle['nocturna-wheel.umd.js'].code : '')
        });
      }
    }
  ]
}; 