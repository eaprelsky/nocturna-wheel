# Migration Guide: Inline Icons Update

## What Changed

The new version of the library uses a **hybrid approach** for icon management:

### Before (v2.x)
- Icons existed only as external files
- Required copying assets to user's project
- Path configuration issues in different environments

### After (v3.x)
- ✅ **Inline icons by default** - icons embedded as data URLs
- ✅ **Zero configuration** - works immediately after `npm install`
- ✅ **Optional external icons** - for customization
- ✅ **File exports** - access to SVG files via package.json exports

## For Library Users

### If you're using the library without custom icons

**No changes needed!** Just update to the latest version:

```bash
npm install @eaprelsky/nocturna-wheel@latest
```

Icons will work automatically.

### If you're using custom icons

Update your configuration:

#### Old code (v1.x):
```javascript
const chart = new WheelChart({
    container: '#chart',
    config: {
        assets: {
            basePath: '/my-icons/'
        }
    }
});
```

#### New code (v2.x):
```javascript
import { IconProvider, ServiceRegistry } from '@eaprelsky/nocturna-wheel';

const iconProvider = new IconProvider({
    useInline: false,  // Disable inline icons
    basePath: '/my-icons/'
});

ServiceRegistry.register('iconProvider', iconProvider);

const chart = new WheelChart({
    container: '#chart'
});
```

## For Demo Page

The demo page uses external files for development convenience. In `index.html` it's already configured:

```javascript
config: {
    assets: {
        basePath: "/assets/"  // Local assets
    }
}
```

This allows editing SVG files and seeing changes without rebuilding.

## Project Build

After updating, always run a full build:

```bash
npm run build:all
```

This will:
1. Run the SVG → data URLs conversion plugin
2. Generate `src/data/IconData.js`
3. Build all library versions (UMD, ES, minified)
4. Copy assets to `dist/assets/`

## Verifying Inline Icons

After building, verify that icons are loaded:

```javascript
import { IconData } from '@eaprelsky/nocturna-wheel';

console.log('Planets:', Object.keys(IconData.planets).length);  // Should be 14
console.log('Signs:', Object.keys(IconData.signs).length);      // Should be 12
console.log('Aspects:', Object.keys(IconData.aspects).length);  // Should be 9
```

## Benefits of the New Approach

### For Library Users
- ✅ Install via npm → works immediately
- ✅ No file path issues
- ✅ Works in any environment (Webpack, Vite, Parcel, browser)
- ✅ Fewer HTTP requests (icons in JS)

### For Development
- ✅ Demo uses external files - easy to edit
- ✅ Build automatically generates IconData
- ✅ Customization options for advanced use cases

## Additional Information

- [ASSET_MANAGEMENT.md](./ASSET_MANAGEMENT.md) - detailed asset management documentation
- [ICON_GUIDELINES.md](./ICON_GUIDELINES.md) - icon usage guidelines
- [README.md](../README.md) - main documentation

## Support

If you encounter issues:
1. Verify that you ran `npm run build:all`
2. Ensure that `src/data/IconData.js` contains data URLs
3. Check browser console for errors
4. Create a GitHub issue with a description of the problem


