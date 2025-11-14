# Inline Icons Testing Guide

## Quick Test Instructions

HTTP server is running at: **http://localhost:8080**

### Test Files

1. **test-minimal.html** - Minimal reproduction from bug report
   - URL: http://localhost:8080/test-minimal.html
   - Tests exact scenario from bug report
   - Open DevTools Console to see detailed output

2. **test-inline-icons.html** - Comprehensive test suite
   - URL: http://localhost:8080/test-inline-icons.html
   - Tests all aspects of inline icon functionality
   - Visual status indicators for each test

3. **index.html** - Full demo page
   - URL: http://localhost:8080/index.html
   - Complete demo with all features
   - Uses external assets for development convenience

## What to Check

### ✅ Success Indicators

In browser console you should see:
```
IconProvider: Initialized with inline icons - Planets: 14 Signs: 12 Aspects: 9
IconProvider.setInlineData(): Data loaded successfully planets: 14 signs: 12 aspects: 9
```

In Network tab:
- **NO requests to** `./assets/svg/zodiac/*.svg`
- Only HTML, JS, and CSS files loaded

In the chart:
- All planet icons render correctly
- All zodiac sign icons render correctly  
- No text fallbacks (unless intentional)

### ❌ Failure Indicators

Console errors:
```
IconProvider: Inline data not loaded, falling back to external paths
Planet icon not found: ./assets/svg/zodiac/...
```

Network tab:
- Multiple failed requests to `./assets/svg/zodiac/*.svg`
- 404 errors for SVG files

In the chart:
- Text fallbacks instead of icons (e.g., "S" for Sun)
- Console warnings about missing icons

## Changes Made

### 1. ServiceRegistry (src/services/ServiceRegistry.js)
- ✅ Removed legacy IconProvider creation
- ✅ `getIconProvider()` now only retrieves, doesn't create
- ✅ Warns if IconProvider not registered

### 2. IconProvider (src/services/IconProvider.js)
- ✅ Removed problematic `InlineIconData` global variable
- ✅ Uses instance-level `this.inlineData` instead
- ✅ Added debug logging for data loading
- ✅ Warning shown only once to avoid spam

### 3. Main Entry Point (src/main.js)
- ✅ IconProvider created and initialized BEFORE `initializeServices()`
- ✅ IconData loaded into IconProvider immediately
- ✅ Logged icon counts for verification

### 4. Renderers
- ✅ `BasePlanetRenderer`: assetBasePath now optional if IconProvider present
- ✅ `ZodiacRenderer`: assetBasePath now optional if IconProvider present
- ✅ `ClientSideAspectRenderer`: proper fallback for assetBasePath
- ✅ Added null-checks and proper defaults

## Build Verification

After build, verify IconData in bundle:

```bash
# Check IconData is present
grep -c "IconData.planets\[" dist/nocturna-wheel.umd.js
# Should output: 14

# Check initialization code is present  
grep "IconProvider: Initialized with inline icons" dist/nocturna-wheel.umd.js
# Should find the initialization line

# Check ServiceRegistry registration
grep "ServiceRegistry.register('iconProvider'" dist/nocturna-wheel.umd.js
# Should find the registration line
```

## Manual Testing Steps

1. Open **test-minimal.html** in browser
2. Open DevTools (F12)
3. Go to Console tab
4. Look for: `IconProvider: Initialized with inline icons - Planets: 14 Signs: 12 Aspects: 9`
5. Go to Network tab
6. Filter by "svg"
7. **Should be empty** (no SVG requests)
8. Check that chart renders with icons

## Expected Console Output

```
=== Test Start ===
Library loaded: true
Exports: (10) ['AstrologyUtils', 'ChartConfig', ...]
IconProvider: Initialized with inline icons - Planets: 14 Signs: 12 Aspects: 9
IconProvider.setInlineData(): Data loaded successfully planets: 14 signs: 12 aspects: 9

IconData check:
  IconData exists: true
  Planets: 14
  Signs: 12
  Aspects: 9

ServiceRegistry check:
  IconProvider registered: true
  useInline: true
  basePath: ./assets/svg/zodiac/
  inlineData loaded: true
  inlineData.planets: 14

Icon resolution test:
  Sun icon: data:image/svg+xml,%3C%3Fxml%20version%3D%221.0...
  Is data URL: true

=== Creating Chart ===
ZodiacRenderer: Loading sign 'aries': inline data URL
... (12 more signs)
Chart created: true
Chart rendered

=== Network Check ===
Total resource requests: 3
SVG asset requests: 0
✅ SUCCESS: No external SVG requests - inline icons working!
```

## Troubleshooting

### Icons still loading from external files

Check console for:
- `IconProvider: Inline data not loaded` - IconData failed to load
- `IconProvider not registered` - Initialization order problem
- Verify `npm run build:all` was run after changes

### Chart fails to render

Check console for errors about missing assetBasePath or IconProvider

### Data URLs not working

Verify that `IconData.planets.sun` starts with `data:image/svg+xml`

## Next Steps

Once tests pass:
1. ✅ Update version in package.json (e.g., 2.1.0 or 3.0.0)
2. ✅ Update CHANGELOG.md
3. ✅ Commit changes with conventional commit message
4. ✅ Create GitHub release
5. ✅ Publish to npm: `npm publish`

## Files Changed

- `build-tools/svg-to-dataurl-plugin.js` - NEW: SVG to data URL converter
- `src/data/IconData.js` - NEW: Auto-generated icon data
- `src/services/IconProvider.js` - MODIFIED: Hybrid inline/external support
- `src/services/ServiceRegistry.js` - MODIFIED: Removed legacy provider
- `src/main.js` - MODIFIED: Proper IconProvider initialization
- `src/factories/RendererFactory.js` - MODIFIED: No basePath parameter
- `src/renderers/BasePlanetRenderer.js` - MODIFIED: Optional assetBasePath
- `src/renderers/ZodiacRenderer.js` - MODIFIED: Optional assetBasePath
- `src/renderers/ClientSideAspectRenderer.js` - MODIFIED: Proper fallback
- `package.json` - MODIFIED: Added assets exports
- `rollup.config.js` - MODIFIED: Added SVG plugin
- Documentation files - UPDATED/NEW

## Cleanup

After successful testing, you can remove:
- `test-minimal.html`
- `test-inline-icons.html`
- `test-inline-icons-node.js`
- `TEST_INLINE_ICONS.md` (this file)

