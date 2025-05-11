import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import copy from 'rollup-plugin-copy';
import commonjs from '@rollup/plugin-commonjs';
import pkg from './package.json';

// Main combined bundle for production
const productionConfig = {
  input: 'src/main.js',
  output: {
    name: 'NocturnaWheel',
    file: 'dist/nocturna-wheel.bundle.js',
    format: 'umd',
    plugins: [terser()],
    sourcemap: true
  },
  plugins: [
    nodeResolve(),
    commonjs(),
    copy({
      targets: [
        { src: 'assets/*', dest: 'dist/assets' },
        { src: 'src/css/*', dest: 'dist/css' }
      ]
    })
  ]
};

// Original config for development
const developmentConfig = [
  // UMD build (for browsers)
  {
    input: 'src/NocturnaWheel.js',
    output: [
      {
        name: 'NocturnaWheel',
        file: pkg.main,
        format: 'umd',
        sourcemap: true
      },
      {
        name: 'NocturnaWheel',
        file: 'dist/nocturna-wheel.min.js',
        format: 'umd',
        plugins: [terser()],
        sourcemap: true
      }
    ],
    plugins: [
      nodeResolve(),
      copy({
        targets: [
          { src: 'assets/*', dest: 'dist/assets' },
          { src: 'src/css/*', dest: 'dist/css' }
        ]
      })
    ]
  },
  
  // ESM build (for bundlers)
  {
    input: 'src/NocturnaWheel.js',
    output: {
      file: pkg.module,
      format: 'es',
      sourcemap: true
    },
    plugins: [
      nodeResolve()
    ]
  }
];

// Use production config for production builds, development config otherwise
export default process.env.NODE_ENV === 'production' ? productionConfig : developmentConfig; 