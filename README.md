# Nocturna Wheel

A JavaScript library for rendering astrological natal charts.

## Features

- Responsive SVG-based chart rendering
- Zodiac sign display with customizable styling
- House system rendering with multiple system options
- Planet placement with customizable icons and colors
- Aspect calculation and visualization
- Interactive tooltips for celestial objects

## Installation

### Direct Script Include

```html
<!-- Include the Nocturna Wheel stylesheet -->
<link rel="stylesheet" href="path/to/nocturna-wheel.css">

<!-- Include the Nocturna Wheel library -->
<script src="path/to/nocturna-wheel.js"></script>
```

### NPM Installation

```bash
npm install nocturna-wheel
```

## Basic Usage

```html
<div id="chart-container"></div>

<script>
  const chart = new NocturnaWheel.WheelChart({
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
- `planets`: Object containing planet positions and properties
- `houses`: Array of house cusp positions
- `aspectSettings`: Object with aspect calculation settings
- `config`: Additional configuration options

```javascript
const chart = new NocturnaWheel.WheelChart({
  container: "#chart-container",
  planets: {
    sun: { lon: 85.83, color: "#ff0000" },
    moon: { lon: 133.21 }
  },
  houses: [{ lon: 300.32 }, ...],
  aspectSettings: {
    enabled: true,
    orb: 6,
    types: {
      conjunction: { angle: 0, orb: 8, color: "#000000", enabled: true }
    }
  },
  config: {
    zodiacSettings: { enabled: true },
    planetSettings: { enabled: true }
  }
});
```

#### Methods

- `render()`: Renders the chart
- `update(config)`: Updates chart configuration
- `togglePlanet(name, visible)`: Toggles visibility of a planet
- `toggleHouses(visible)`: Toggles visibility of houses
- `toggleAspects(visible)`: Toggles visibility of aspects
- `togglePrimaryPlanets(visible)`: Toggles primary planets
- `toggleSecondaryPlanets(visible)`: Toggles secondary planets
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
  
  // Aspect settings
  aspectSettings: {
    enabled: true,
    orb: 6,
    types: {
      conjunction: { angle: 0, orb: 8, color: "#ff0000", enabled: true },
      opposition: { angle: 180, orb: 8, color: "#0000ff", enabled: true }
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

## Bundled Library Integration

The Nocturna Wheel library is available as both UMD and ES modules bundles for easy integration into modern web applications.

### Using the UMD Bundle with Global Stubs

Due to the library's architecture, which was originally designed for direct script inclusion, we provide a "global stubs" approach for integrating the bundled version:

1. Include the global stubs file before loading the bundle:

```html
<!-- Load globals.js first to ensure all classes are defined -->
<script src="path/to/globals.js"></script>

<!-- Then load the Nocturna Wheel UMD bundle -->
<script src="path/to/nocturna-wheel.umd.js"></script>
```

2. Use the library with proper script loading practices:

```html
<script>
  // Use window.onload to ensure all scripts are fully loaded
  window.onload = function() {
    // Access NocturnaWheel from the window object for safety
    const { NocturnaWheel, WheelChart } = window.NocturnaWheel;
    
    // Create a chart instance
    const chart = new WheelChart({
        container: '#chart-container',
        planets: {
            sun: { lon: 85.83 },
            moon: { lon: 133.21 }
        },
        // ... other options
    });
    
    // Render the chart
    chart.render();
  };
</script>
```

Important notes:
- Always wait for scripts to fully load by using `window.onload` 
- Access the library through `window.NocturnaWheel` rather than directly using `NocturnaWheel`
- This ensures proper initialization order and prevents "Cannot access before initialization" errors

### Using the ES Module Bundle in Modern Applications

For modern web applications using build tools like Webpack, Rollup, or Vite:

```javascript
// Import the globals module first to ensure all classes are defined
import 'nocturna-wheel/globals.js';

// Then import the ES module
import { NocturnaWheel, WheelChart } from 'nocturna-wheel';

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

### Why Global Stubs?

The Nocturna Wheel library was originally designed to be loaded through direct `<script>` tags, where classes are defined in the global scope. The bundling process creates proper ES modules with encapsulated scope, but certain classes expect other classes to be available globally.

The "global stubs" approach provides minimal implementations of these classes in the global scope, ensuring compatibility with the bundled code while maintaining the benefits of module bundling.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 