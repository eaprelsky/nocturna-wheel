# Icon Usage Guidelines

This document outlines the best practices for handling icons in the Nocturna Wheel astrological chart library.

## Core Principles

1. **SVG Only**: All visual elements must use SVG icons exclusively
2. **Centralized Management**: All icon paths are managed through the IconProvider service
3. **Consistent Fallbacks**: Text fallbacks should be created using the IconProvider's fallback method
4. **No Unicode Symbols**: Unicode astrological symbols are not used in our library

## Using the IconProvider

### Getting the IconProvider

Always inject the IconProvider in renderer constructors:

```javascript
constructor(options) {
    super(options);
    this.iconProvider = options.iconProvider || ServiceRegistry.getIconProvider();
}
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

## Troubleshooting

If icon loading fails:

1. Check if the path is correct in IconProvider
2. Verify the asset exists in the specified directory
3. Ensure the asset base path is properly configured
4. Verify the icon naming follows the established conventions 