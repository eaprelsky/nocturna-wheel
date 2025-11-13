import { nodeResolve } from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';
import svgToDataUrlPlugin from './build-tools/svg-to-dataurl-plugin.js';

// Get environment variables
const production = process.env.NODE_ENV === 'production';
const createBundle = process.env.BUNDLE === 'true';
const createMin = process.env.MIN === 'true';

// Shared plugins
const basePlugins = [
  // Convert SVG icons to inline data URLs
  svgToDataUrlPlugin({
    svgDir: './assets/svg/zodiac',
    outputFile: './src/data/IconData.js'
  }),
  // Essential: Resolve modules in node_modules and source directories
  nodeResolve({
    extensions: ['.js'], // Only use .js files
    browser: true, // Target browser environment
    preferBuiltins: false, // Prefer our own implementations
    dedupe: ['svgutils', 'astrologyutils'] // Deduplicate these modules
  }),
  // Handle CommonJS modules
  commonjs(),
  // Copy static assets (still needed for demo page and optional external usage)
  copy({
    targets: [
      { src: 'assets/*', dest: 'dist/assets' },
      { src: 'src/css/*', dest: 'dist/css' }
    ]
  })
];

// Configuration based on environment
let config = [];

// Standard builds (ES and UMD)
if (!createBundle && !createMin) {
  config.push({
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
    plugins: basePlugins
  });
}

// Bundle build (all in one file)
if (createBundle) {
  config.push({
    input: 'src/main.js',
    output: {
      name: 'NocturnaWheel',
      file: 'dist/nocturna-wheel.bundle.js',
      format: 'umd',
      exports: 'named',
      sourcemap: true,
      extend: false,
      esModule: true,
      globals: {}
    },
    plugins: basePlugins
  });
}

// Minified build
if (createMin) {
  config.push({
    input: 'src/main.js',
    output: {
      name: 'NocturnaWheel',
      file: 'dist/nocturna-wheel.min.js',
      format: 'umd',
      exports: 'named',
      sourcemap: true,
      extend: false,
      esModule: true,
      globals: {}
    },
    plugins: [...basePlugins, terser()]
  });
}

export default config; 