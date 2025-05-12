# Building Nocturna Wheel

This document explains how to build different versions of the Nocturna Wheel library.

## Development Build

For development with hot reloading:

```bash
npm run dev
```

## Library Builds

### Standard Library Build

To build the standard library files (separate files):

```bash
npm run build
```

This will generate:
- `dist/nocturna-wheel.umd.js` - UMD format for browsers
- `dist/nocturna-wheel.es.js` - ES module format for bundlers
- Plus other supporting files

### Production Bundle

To build the optimized production bundle that combines all JavaScript files into one:

```bash
npm run build:bundle
```

This will generate:
- `dist/nocturna-wheel.bundle.js` - Single, optimized UMD file with all components

### Complete Build

To build both the standard library and production bundle:

```bash
npm run build:all
```

## Using the Bundled Version

For production environments, use the bundled version for optimal performance:

```html
<!-- Production (bundled) version -->
<script src="/dist/nocturna-wheel.bundle.js"></script>
```

This single file includes all functionality previously split across:
- globals.js
- nocturna-wheel.umd.js
- nocturna-fix.js

## Benefits of the Bundled Version

The bundled version offers:
- Faster page loading with a single HTTP request
- Proper dependency management internally
- Minified code for reduced file size
- Source maps for debugging
- Simplified HTML without requiring multiple script tags

## Troubleshooting

### Module resolution issues

If you encounter errors like "Could not resolve './file-name'" when building:

1. Check that all imported files exist in the correct locations
2. For the main entry point (`src/main.js`), ensure imports use the correct relative paths:
   - Files in the `src` directory: `import './filename'`
   - Files in other directories: `import '../path/to/filename'`

### Windows build issues

When building on Windows, you may need to modify the build:bundle script in package.json:

```json
"build:bundle": "cross-env NODE_ENV=production rollup -c"
```

This requires installing the cross-env package:

```bash
npm install --save-dev cross-env 