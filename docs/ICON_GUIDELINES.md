# Icon Usage Guidelines

This document outlines the best practices for handling icons in the Nocturna Wheel astrological chart library.

## Core Principles

1. **SVG Only**: All visual elements must use SVG icons exclusively
2. **Inline by Default**: Icons are bundled as data URLs for easy distribution
3. **Centralized Management**: All icon paths are managed through the IconProvider service
4. **Consistent Fallbacks**: Text fallbacks should be created using the IconProvider's fallback method
5. **No Unicode Symbols**: Unicode astrological symbols are not used in our library

## Icon Distribution Strategy

The library uses a **hybrid approach** for icon distribution:

### 1. Inline Icons (Default)

All SVG icons are automatically converted to data URLs during the build process and bundled with the JavaScript. This provides:

- **Zero configuration** - works immediately after `npm install`
- **No path issues** - icons are embedded in the code
- **Cross-platform** - works in any environment

The conversion is done by `build-tools/svg-to-dataurl-plugin.js` which:
1. Reads all SVG files from `assets/svg/zodiac/`
2. Converts them to URL-encoded data URLs
3. Generates `src/data/IconData.js` with all icon data
4. Bundles into the final distribution

### 2. External Icons (Optional)

Users can opt-in to use external icon files:

```javascript
const iconProvider = new IconProvider({
    useInline: false,
    basePath: '/custom-path/to/icons/'
});
```

### 3. Custom Icons

Users can provide their own custom icons:

```javascript
const iconProvider = new IconProvider({
    customIcons: {
        planets: { sun: 'data:image/svg+xml,...' },
        signs: { aries: 'data:image/svg+xml,...' },
        aspects: { trine: 'data:image/svg+xml,...' }
    }
});
```

## Using the IconProvider

### Getting the IconProvider

The IconProvider is automatically initialized by the ServiceRegistry with inline icons loaded. In renderer constructors:

```javascript
constructor(options) {
    super(options);
    this.iconProvider = options.iconProvider || ServiceRegistry.getIconProvider();
}
```

### IconProvider Modes

The IconProvider supports three priority levels for icon resolution:

1. **Custom icons** (highest priority) - provided via `customIcons` option
2. **Inline icons** (default) - bundled data URLs
3. **External paths** (fallback) - file system paths

```javascript
// Priority order example:
const iconProvider = new IconProvider({
    useInline: true,  // Enable inline icons
    basePath: './fallback/path/',  // Used if inline not found
    customIcons: {
        planets: { sun: 'data:image/svg+xml,...' }  // Highest priority
    }
});

// Resolution order for 'sun':
// 1. Check customIcons.planets.sun
// 2. Check IconData.planets.sun (inline)
// 3. Return basePath + 'zodiac-planet-sun.svg'
```

### Getting Icon Paths

Use the appropriate methods to get icon paths:

```javascript
// For planet icons
const planetIconPath = this.iconProvider.getPlanetIconPath('mars');

// For zodiac sign icons
const zodiacIconPath = this.iconProvider.getZodiacIconPath('leo');

// For aspect icons
const aspectIconPath = this.iconProvider.getAspectIconPath('trine');
```

### Handling Fallbacks

Always implement proper fallbacks using IconProvider.createTextFallback():

```javascript
// When an icon fails to load
icon.addEventListener('error', () => {
    console.warn(`Icon not found: ${iconPath}`);
    icon.setAttribute('href', ''); // Remove broken link
    
    // Create text fallback with first letter or abbreviation
    const fallbackText = name.charAt(0).toUpperCase();
    const textElement = this.iconProvider.createTextFallback(
        this.svgUtils,
        {
            x: centerX,
            y: centerY,
            size: '16px',
            color: '#000000',
            className: 'icon-fallback-class'
        },
        fallbackText
    );
    parent.appendChild(textElement);
});
```

## Icon Naming Conventions

All icons should follow these naming conventions:

- Planet icons: `zodiac-planet-{planetName}.svg` (e.g., `zodiac-planet-mars.svg`)
- Zodiac sign icons: `zodiac-sign-{signName}.svg` (e.g., `zodiac-sign-leo.svg`)
- Aspect icons: `zodiac-aspect-{aspectType}.svg` (e.g., `zodiac-aspect-trine.svg`)

## Aspect Abbreviations

When SVG icons cannot be loaded, we use standardized text abbreviations for aspects:

| Aspect | Abbreviation |
|--------|--------------|
| Conjunction | CON |
| Opposition | OPP |
| Trine | TRI |
| Square | SQR |
| Sextile | SEX |
| Semisextile | SSX |
| Quincunx | QCX |

These abbreviations are defined in `ClientSideAspectRenderer.defaultAspectDefinitions` and should be used consistently.

## Asset Structure

Icons should be stored in the following structure:

```
assets/
└── svg/
    └── zodiac/
        ├── zodiac-planet-*.svg
        ├── zodiac-sign-*.svg
        └── zodiac-aspect-*.svg
```

## Build Process

### Generating IconData

The icon data module is automatically generated during build:

```bash
npm run build
```

This runs the `svg-to-dataurl-plugin` which:
1. Scans `assets/svg/zodiac/` for SVG files
2. URL-encodes each SVG
3. Generates `src/data/IconData.js` with categorized icons
4. Bundles with the main library code

### Development Mode

During development, `src/data/IconData.js` exists as a placeholder with empty data. After the first build, it will be populated with actual icon data.

## Troubleshooting

If icon loading fails:

1. **Inline icons not working**: Run `npm run build` to generate IconData
2. **External icons not loading**: Check if `useInline: false` is set
3. **Path issues**: Verify the `basePath` configuration
4. **Custom icons**: Ensure data URLs are properly formatted
5. **Icon naming**: Verify naming follows conventions (zodiac-planet-*, zodiac-sign-*, zodiac-aspect-*)

### Checking Icon Availability

```javascript
import { IconData } from '@eaprelsky/nocturna-wheel';

// Check if inline icons are loaded
console.log('Planets:', Object.keys(IconData.planets));
console.log('Signs:', Object.keys(IconData.signs));
console.log('Aspects:', Object.keys(IconData.aspects));
``` 