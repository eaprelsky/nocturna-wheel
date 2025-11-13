# Asset Management Guide

This guide explains how assets (SVG icons, CSS files) are managed in the Nocturna Wheel library and how to use them in your project.

## Overview

The Nocturna Wheel library uses a **hybrid approach** for asset management:

1. **Inline Icons (Default)** - SVG icons bundled as data URLs in JavaScript
2. **External Assets (Optional)** - Traditional file-based assets for customization
3. **Exported Assets** - Direct access to asset files via package.json exports

## For Library Users

### Default Usage (Zero Configuration) ✅ Recommended

After installing via npm, icons work automatically:

```bash
npm install @eaprelsky/nocturna-wheel
```

```javascript
import { WheelChart } from '@eaprelsky/nocturna-wheel';

// Icons work out of the box - no configuration needed!
const chart = new WheelChart({
    container: '#chart-container',
    planets: {
        sun: { lon: 85.83 },
        moon: { lon: 133.21 }
    }
});

chart.render();
```

**How it works:**
- All SVG icons are converted to data URLs during build
- Icons are bundled with the JavaScript code
- No need to copy files or configure paths
- Works in any environment (browser, webpack, vite, parcel, etc.)

### Using External Custom Icons

If you want to use your own icon set:

#### Option 1: Configure IconProvider

```javascript
import { IconProvider, ServiceRegistry } from '@eaprelsky/nocturna-wheel';

// Create IconProvider with custom settings
const iconProvider = new IconProvider({
    useInline: false,  // Disable inline icons
    basePath: '/my-icons/'  // Path to your custom icons
});

// Register it before creating charts
ServiceRegistry.register('iconProvider', iconProvider);

// Now create your chart
const chart = new WheelChart({ /* ... */ });
```

#### Option 2: Copy Bundled Assets

If you want to use the bundled SVG files as a starting point:

```bash
# Copy assets to your public directory
cp -r node_modules/@eaprelsky/nocturna-wheel/dist/assets ./public/nocturna-assets
```

Then configure the library:

```javascript
const chart = new WheelChart({
    container: '#chart-container',
    planets: { /* ... */ },
    config: {
        assets: {
            basePath: '/nocturna-assets/'
        }
    }
});
```

#### Option 3: Import Individual Icons

Use package.json exports to import specific icons:

```javascript
// Import icon files directly
import sunIconUrl from '@eaprelsky/nocturna-wheel/icons/zodiac-planet-sun.svg';
import moonIconUrl from '@eaprelsky/nocturna-wheel/icons/zodiac-planet-moon.svg';

// Use in your custom implementation
const img = document.createElement('img');
img.src = sunIconUrl;
```

### Using Custom Data URL Icons

Provide your own icons as data URLs:

```javascript
import { IconProvider, ServiceRegistry } from '@eaprelsky/nocturna-wheel';

const myCustomIcons = {
    planets: {
        sun: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"...',
        moon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"...'
    },
    signs: {
        aries: 'data:image/svg+xml,...',
        // ... other signs
    },
    aspects: {
        trine: 'data:image/svg+xml,...',
        // ... other aspects
    }
};

const iconProvider = new IconProvider({
    customIcons: myCustomIcons
});

ServiceRegistry.register('iconProvider', iconProvider);
```

## For Demo Page / Development

The demo page (`index.html`) uses external assets for easier development:

```html
<!-- Demo page configuration -->
<script>
const chart = new WheelChart({
    container: '#chart-container',
    config: {
        assets: {
            basePath: "/assets/"  // Points to local assets folder
        }
    }
});
</script>
```

This allows you to:
- Edit SVG files and see changes immediately
- Test different icon designs
- Debug icon loading issues

## Icon Resolution Priority

The IconProvider resolves icons in this order:

1. **Custom icons** (if provided via `customIcons` option)
2. **Inline icons** (bundled data URLs, if `useInline: true`)
3. **External paths** (file system paths via `basePath`)

```javascript
// Example showing all three levels
const iconProvider = new IconProvider({
    useInline: true,
    basePath: '/fallback-icons/',
    customIcons: {
        planets: {
            sun: 'data:image/svg+xml,...'  // This takes priority
        }
    }
});

// When requesting 'sun' icon:
// 1. Returns customIcons.planets.sun (found!)
// When requesting 'moon' icon:
// 1. Check customIcons.planets.moon (not found)
// 2. Check IconData.planets.moon (found if useInline: true)
// When requesting 'mars' icon (if not in inline data):
// 1. Check customIcons.planets.mars (not found)
// 2. Check IconData.planets.mars (not found)
// 3. Return basePath + 'zodiac-planet-mars.svg'
```

## Asset File Structure

The library includes these assets:

```
dist/
├── assets/
│   ├── css/
│   │   ├── demo.css
│   │   └── nocturna-wheel.css
│   ├── png/
│   │   └── nocturna-logo.png
│   └── svg/
│       └── zodiac/
│           ├── zodiac-planet-*.svg (14 files)
│           ├── zodiac-sign-*.svg (12 files)
│           └── zodiac-aspect-*.svg (9 files)
```

## Package.json Exports

The library exports assets via package.json:

```json
{
  "exports": {
    ".": "./dist/nocturna-wheel.es.js",
    "./assets/*": "./dist/assets/*",
    "./css/*": "./dist/assets/css/*",
    "./icons/*": "./dist/assets/svg/zodiac/*"
  }
}
```

This allows imports like:

```javascript
// CSS
import '@eaprelsky/nocturna-wheel/css/nocturna-wheel.css';

// Individual icons
import sunIcon from '@eaprelsky/nocturna-wheel/icons/zodiac-planet-sun.svg';

// Any asset
import logo from '@eaprelsky/nocturna-wheel/assets/png/nocturna-logo.png';
```

## Webpack/Vite Configuration

### Webpack

Most webpack configurations handle SVG imports automatically. If needed:

```javascript
// webpack.config.js
module.exports = {
    module: {
        rules: [
            {
                test: /\.svg$/,
                type: 'asset/resource'
            }
        ]
    }
};
```

### Vite

Vite handles SVG imports by default. For data URLs:

```javascript
// vite.config.js
export default {
    assetsInlineLimit: 0  // Disable inlining if you prefer file URLs
};
```

## Best Practices

### ✅ Recommended: Use Default Inline Icons

```javascript
import { WheelChart } from '@eaprelsky/nocturna-wheel';

const chart = new WheelChart({
    container: '#chart-container',
    planets: { sun: { lon: 85.83 } }
});
```

**Why:** Works everywhere, zero configuration, no extra HTTP requests.

### ⚠️ Advanced: External Icons for Customization

```javascript
import { IconProvider, ServiceRegistry } from '@eaprelsky/nocturna-wheel';

const iconProvider = new IconProvider({
    useInline: false,
    basePath: '/custom-icons/'
});

ServiceRegistry.register('iconProvider', iconProvider);
```

**When:** You need to replace icons with your own designs.

### 🎨 Expert: Mix Inline and Custom Icons

```javascript
const iconProvider = new IconProvider({
    useInline: true,  // Use bundled icons as base
    customIcons: {
        planets: {
            sun: 'data:image/svg+xml,...'  // Override just sun
        }
    }
});
```

**When:** You want to customize only specific icons while keeping others default.

## Troubleshooting

### Icons not showing after npm install

1. Make sure you're using the latest build:
   ```bash
   npm install @eaprelsky/nocturna-wheel@latest
   ```

2. Check if inline icons are loaded:
   ```javascript
   import { IconData } from '@eaprelsky/nocturna-wheel';
   console.log('Icons loaded:', Object.keys(IconData.planets).length > 0);
   ```

### External icons not loading in demo page

1. Check browser console for 404 errors
2. Verify `basePath` configuration
3. Ensure assets folder is served by your web server
4. Check file permissions

### Custom icons not appearing

1. Verify data URL format:
   ```javascript
   // Correct format
   'data:image/svg+xml,%3Csvg...'
   
   // Also correct (base64)
   'data:image/svg+xml;base64,PHN2Zy4uLg=='
   ```

2. Check icon names match expected format (lowercase)
3. Ensure IconProvider is registered before creating charts

## Summary

| Scenario | Method | Configuration |
|----------|--------|---------------|
| **Default usage** | Inline icons | None needed |
| **Custom icon set** | External files | `useInline: false, basePath: '...'` |
| **Replace few icons** | Custom data URLs | `customIcons: {...}` |
| **Demo development** | Local files | `assets.basePath: '/assets/'` |
| **Import specific icons** | Package exports | `import from '.../icons/...'` |

