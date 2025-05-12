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
    })
  ]
}; 