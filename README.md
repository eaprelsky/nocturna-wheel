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
<script src="path/to/nocturna-wheel.min.js"></script>
```

### NPM Installation

```bash
npm install @eaprelsky/nocturna-wheel
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

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
