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
    exports: 'named',
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
    input: 'src/main.js',
    output: [
      {
        name: 'NocturnaWheel',
        file: pkg.main,
        format: 'umd',
        exports: 'named',
        sourcemap: true
      },
      {
        name: 'NocturnaWheel',
        file: 'dist/nocturna-wheel.min.js',
        format: 'umd',
        exports: 'named',
        plugins: [terser()],
        sourcemap: true
      }
    ],
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
  },
  
  // ESM build (for bundlers)
  {
    input: 'src/main.js',
    output: {
      file: pkg.module,
      format: 'es',
      sourcemap: true
    },
    plugins: [
      nodeResolve(),
      commonjs()
    ]
  }
];

// Use production config for production builds, development config otherwise
export default process.env.NODE_ENV === 'production' ? productionConfig : developmentConfig; 