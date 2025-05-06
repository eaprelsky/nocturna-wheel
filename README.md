# Nocturna Wheel.js

A JavaScript library for rendering astrological natal charts. The library provides a customizable and interactive SVG-based chart renderer for astrological data visualization.

## Features

- SVG-based rendering for crisp visuals at any scale
- Customizable appearance and themes
- Support for different house systems
- Interactive elements with events
- Responsive design
- Cross-browser compatibility
- No external dependencies

## Installation

### Using npm

```bash
npm install nocturna-wheel
```

### Direct script include

```html
<script src="https://unpkg.com/nocturna-wheel/dist/nocturna-wheel.min.js"></script>
```

## Usage

```html
<div id="chart-container" style="width: 500px; height: 500px;"></div>

<script>
  // Initialize chart with configuration
  const chart = new NocturnaWheel({
    container: 'chart-container',
    planets: {
      sun: { lon: 85.83 },
      moon: { lon: 133.21 },
      mercury: { lon: 70.18 },
      venus: { lon: 42.57 },
      mars: { lon: 112.56 },
      jupiter: { lon: 169.48 },
      saturn: { lon: 188.04 },
      uranus: { lon: 275.25 },
      neptune: { lon: 298.32 },
      pluto: { lon: 247.12 }
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
    ],
    aspectSettings: {
      calculateAspects: true,
      showAspects: true,
      orbs: {
        conjunction: 8,
        opposition: 8,
        trine: 6,
        square: 6,
        sextile: 4
      }
    }
  });
  
  // Render the chart
  chart.render();

  // Toggle planets visibility
  chart.togglePlanet('pluto', false);

  // Toggle houses visibility
  chart.toggleHouses(false);
</script>
```

## API Documentation

### Constructor

```javascript
const chart = new NocturnaWheel(config);
```

### Configuration

The configuration object accepts the following parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| container | string/Element | Element ID or DOM node to render into |
| width | number | Chart width in pixels (default: container width) |
| height | number | Chart height in pixels (default: container height) |
| planets | object | Planet positions (longitudes in degrees) |
| houses | array | House cusp positions (longitudes in degrees) |
| aspectSettings | object | Aspect calculation and rendering settings |
| theme | object | Chart appearance settings |

### Methods

- `render()` - Renders the chart
- `update(config)` - Updates chart with new configuration
- `togglePlanet(planet, visible)` - Shows/hides specific planet
- `toggleHouses(visible)` - Shows/hides house system
- `toggleAspects(visible)` - Shows/hides aspect lines
- `destroy()` - Removes the chart and cleans up resources

## Development

1. Clone the repository
   ```
   git clone https://github.com/eaprelsky/nocturna-wheel.git
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the development server
   ```
   npm run dev
   ```

4. Build for production
   ```
   npm run build
   ```

## License

MIT License 