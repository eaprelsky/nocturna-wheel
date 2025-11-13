# Nocturna Wheel

A JavaScript library for rendering astrological natal charts.

## Features

- **Responsive SVG-based chart rendering**
- **Dual chart support** - independent inner and outer circles for synastry and transit charts
- **Zodiac sign display** with customizable styling
- **House system rendering** with multiple system options (Placidus, Koch, Equal, etc.)
- **Planet placement** with customizable icons and colors on two independent circles
- **Three types of aspects:**
  - Primary aspects (outer circle to outer circle)
  - Secondary aspects (inner circle to inner circle)
  - Synastry aspects (outer to inner circle with projection dots)
- **Interactive tooltips** for celestial objects
- **Full control** over colors, line styles, and orbs for each aspect type

## Installation

### NPM Installation (Recommended)

```bash
npm install @eaprelsky/nocturna-wheel
```

The library comes with **inline SVG icons** bundled as data URLs, so you don't need to worry about copying asset files. Icons work out of the box!

### Direct Script Include

```html
<!-- Include the Nocturna Wheel stylesheet -->
<link rel="stylesheet" href="path/to/nocturna-wheel.css">

<!-- Include the Nocturna Wheel library -->
<script src="path/to/nocturna-wheel.min.js"></script>
```

## Basic Usage

### ES Module (Recommended)

```javascript
import { WheelChart } from 'nocturna-wheel';

const chart = new WheelChart({
  container: "#chart-container",
  planets: {
    sun: { lon: 85.83 },
    moon: { lon: 133.21 }
  },
  houses: [
    { lon: 300.32 },  // 1st house cusp
    { lon: 330.15 },  // 2nd house cusp
    { lon: 355.24 },  // 3rd house cusp
    { lon: 20.32 },   // 4th house cusp
    { lon: 45.15 },   // 5th house cusp
    { lon: 75.24 },   // 6th house cusp
    { lon: 120.32 },  // 7th house cusp
    { lon: 150.15 },  // 8th house cusp
    { lon: 175.24 },  // 9th house cusp
    { lon: 200.32 },  // 10th house cusp
    { lon: 225.15 },  // 11th house cusp
    { lon: 255.24 }   // 12th house cusp
  ]
});

chart.render();
```

### Browser Script

```html
<div id="chart-container"></div>

<script>
  // The library exports a NocturnaWheel object with all components
  const { WheelChart } = NocturnaWheel;
  
  const chart = new WheelChart({
    container: "#chart-container",
    planets: {
      sun: { lon: 85.83 },
      moon: { lon: 133.21 }
    },
    houses: [
      { lon: 300.32 },  // 1st house cusp
      { lon: 330.15 },  // 2nd house cusp
      { lon: 355.24 },  // 3rd house cusp
      { lon: 20.32 },   // 4th house cusp
      { lon: 45.15 },   // 5th house cusp
      { lon: 75.24 },   // 6th house cusp
      { lon: 120.32 },  // 7th house cusp
      { lon: 150.15 },  // 8th house cusp
      { lon: 175.24 },  // 9th house cusp
      { lon: 200.32 },  // 10th house cusp
      { lon: 225.15 },  // 11th house cusp
      { lon: 255.24 }   // 12th house cusp
    ]
  });
  
  chart.render();
</script>
```

## API Documentation

### WheelChart Class

Main class for creating and managing astrological charts.

#### Constructor Options

- `container`: String selector or DOM element for the chart container
- `planets`: Object containing primary planet positions (outer circle)
- `secondaryPlanets`: Object containing secondary planet positions (inner circle, optional)
- `houses`: Array of house cusp positions
- `config`: Additional configuration options including aspect settings

```javascript
const chart = new NocturnaWheel.WheelChart({
  container: "#chart-container",
  planets: {
    sun: { lon: 85.83, color: "#000000" },
    moon: { lon: 133.21, color: "#000000" }
  },
  secondaryPlanets: {
    sun: { lon: 115.20, color: "#FF5500" },
    moon: { lon: 200.45, color: "#0066CC" }
  },
  houses: [{ lon: 300.32 }, ...],
  config: {
    zodiacSettings: { enabled: true },
    planetSettings: { enabled: true },
    // Primary aspects (outer circle to outer circle)
    primaryAspectSettings: {
      enabled: true,
      orb: 6,
      types: {
        conjunction: { angle: 0, orb: 8, color: "#000000", enabled: true, lineStyle: 'none', strokeWidth: 1 },
        opposition: { angle: 180, orb: 6, color: "#E41B17", enabled: true, lineStyle: 'solid', strokeWidth: 1 }
      }
    },
    // Secondary aspects (inner circle to inner circle)
    secondaryAspectSettings: {
      enabled: true,
      orb: 6,
      types: { /* ... */ }
    },
    // Synastry aspects (outer to inner circle projections)
    synastryAspectSettings: {
      enabled: true,
      orb: 6,
      types: { /* ... */ }
    }
  }
});
```

#### Methods

- `render()`: Renders the chart
- `update(config)`: Updates chart configuration
- `updateData(data)`: Updates planet and house data
- `togglePlanet(name, visible)`: Toggles visibility of a specific planet
- `toggleHouses(visible)`: Toggles visibility of houses
- `togglePrimaryPlanets(visible)`: Toggles visibility of primary planets (outer circle)
- `toggleSecondaryPlanets(visible)`: Toggles visibility of secondary planets (inner circle)
- `togglePrimaryAspects(visible)`: Toggles visibility of primary aspects (outer circle)
- `toggleSecondaryAspects(visible)`: Toggles visibility of secondary aspects (inner circle)
- `toggleSynastryAspects(visible)`: Toggles visibility of synastry aspects (cross-circle)
- `setHouseRotation(angle)`: Sets house system rotation
- `setHouseSystem(name)`: Changes the house system
- `destroy()`: Removes the chart and cleans up resources

## Advanced Configuration

### ChartConfig Options

```javascript
const chartConfig = {
  // Astronomical data
  astronomicalData: {
    ascendant: 0,
    mc: 90,
    latitude: 51.5,
    houseSystem: "Placidus"
  },
  
  // Primary aspect settings (outer circle to outer circle)
  primaryAspectSettings: {
    enabled: true,
    orb: 6,
    types: {
      conjunction: { angle: 0, orb: 8, color: "#000000", enabled: true, lineStyle: 'none', strokeWidth: 1 },
      opposition: { angle: 180, orb: 6, color: "#E41B17", enabled: true, lineStyle: 'solid', strokeWidth: 1 },
      trine: { angle: 120, orb: 6, color: "#4CC417", enabled: true, lineStyle: 'solid', strokeWidth: 1 },
      square: { angle: 90, orb: 6, color: "#F62817", enabled: true, lineStyle: 'dashed', strokeWidth: 1 },
      sextile: { angle: 60, orb: 4, color: "#56A5EC", enabled: true, lineStyle: 'dashed', strokeWidth: 1 }
    }
  },
  
  // Secondary aspect settings (inner circle to inner circle)
  secondaryAspectSettings: {
    enabled: true,
    orb: 6,
    types: {
      conjunction: { angle: 0, orb: 8, color: "#AA00AA", enabled: true, lineStyle: 'none', strokeWidth: 1 },
      opposition: { angle: 180, orb: 6, color: "#FF6600", enabled: true, lineStyle: 'solid', strokeWidth: 1 }
      // ... other aspects
    }
  },
  
  // Synastry aspect settings (outer to inner circle)
  synastryAspectSettings: {
    enabled: true,
    orb: 6,
    types: {
      conjunction: { angle: 0, orb: 8, color: "#666666", enabled: true, lineStyle: 'none', strokeWidth: 1 },
      opposition: { angle: 180, orb: 6, color: "#9933CC", enabled: true, lineStyle: 'solid', strokeWidth: 0.5 }
      // ... other aspects
    }
  },
  
  // Visual settings
  zodiacSettings: {
    enabled: true,
    colors: {
      aries: "#ff6666",
      taurus: "#66cc66"
      // Other signs...
    }
  },
  
  // SVG dimensions
  svg: {
    width: 460,
    height: 460,
    viewBox: "0 0 460 460",
    center: { x: 230, y: 230 }
  },
  
  // Asset paths
  assets: {
    basePath: "./assets/",
    zodiacIconPath: "svg/zodiac/"
  }
};
```

## Library Integration

The Nocturna Wheel library is available as both UMD and ES modules bundles for easy integration into modern web applications.

### Using with Module Bundlers (Webpack, Rollup, Vite)

```javascript
// Import specific components
import { WheelChart, ChartConfig } from 'nocturna-wheel';

// Create a chart instance
const chart = new WheelChart({
  container: '#chart-container',
  planets: {
    sun: { lon: 85.83 },
    moon: { lon: 133.21 }
  }
});

// Render the chart
chart.render();
```

### Using with Factory Injection Pattern

The library supports Factory Injection for better decoupling and testability:

```javascript
import { WheelChart, NocturnaWheel } from 'nocturna-wheel';

// Create a custom factory
const chartFactory = (options) => {
  console.log("Creating chart with custom factory");
  return new NocturnaWheel({
    ...options,
    // Apply custom configurations
    config: {
      ...options.config,
      theme: 'dark'
    }
  });
};

// Use the factory when creating WheelChart
const chart = new WheelChart(options, chartFactory);
chart.render();
```

See MODULE_ARCHITECTURE.md for more details on the library's architecture.

## Synastry and Dual Charts

The library supports dual charts for synastry, transits, and progressions. Each circle operates independently:

```javascript
const chart = new WheelChart({
  container: '#chart-container',
  // Natal chart (outer circle)
  planets: {
    sun: { lon: 85.83, color: '#000000' },
    moon: { lon: 133.21, color: '#000000' }
  },
  // Transit/Partner chart (inner circle)
  secondaryPlanets: {
    sun: { lon: 115.20, color: '#FF5500' },
    moon: { lon: 200.45, color: '#0066CC' }
  },
  config: {
    // Configure three independent aspect systems
    primaryAspectSettings: { /* natal-to-natal */ },
    secondaryAspectSettings: { /* transit-to-transit */ },
    synastryAspectSettings: { /* natal-to-transit with projection dots */ }
  }
});

// Toggle each aspect type independently
chart.togglePrimaryAspects(true);
chart.toggleSecondaryAspects(false);
chart.toggleSynastryAspects(true);
```

**Synastry aspects** are rendered with hollow projection dots on the inner circle, showing where outer circle planets project onto the inner radius. This creates a cleaner, more aesthetically pleasing visualization.

## Working with Icons

### Inline Icons (Default)

By default, the library uses **inline SVG icons** bundled as data URLs. This means:
- ✅ **No asset copying needed** - icons are bundled with the JavaScript
- ✅ **Works out of the box** - no path configuration required
- ✅ **Cross-platform** - works in all environments (browser, webpack, vite, etc.)

```javascript
// Icons work automatically - no configuration needed!
const chart = new WheelChart({
    container: '#chart-container',
    planets: { sun: { lon: 85.83 } }
});
```

### Using Custom External Icons

If you want to use your own custom icons, you can disable inline mode:

```javascript
import { IconProvider } from '@eaprelsky/nocturna-wheel';

// Create IconProvider with external icons
const iconProvider = new IconProvider({
    useInline: false,
    basePath: '/my-custom-icons/'
});

// Pass to ServiceRegistry
import { ServiceRegistry } from '@eaprelsky/nocturna-wheel';
ServiceRegistry.register('iconProvider', iconProvider);

// Now create your chart
const chart = new WheelChart({ /* ... */ });
```

### Accessing Bundled Icon Files

If you need direct access to the SVG files (e.g., for documentation or custom usage):

```javascript
// Using package.json exports
import sunIcon from '@eaprelsky/nocturna-wheel/icons/zodiac-planet-sun.svg';
```

Or copy them from `node_modules`:

```bash
cp -r node_modules/@eaprelsky/nocturna-wheel/dist/assets/svg ./public/
```

### Custom Icon Data URLs

You can also provide custom icons as data URLs:

```javascript
const customIcons = {
    planets: {
        sun: 'data:image/svg+xml,...',
        moon: 'data:image/svg+xml,...'
    }
};

const iconProvider = new IconProvider({
    customIcons: customIcons
});
```

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
