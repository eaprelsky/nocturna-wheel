# Nocturna Wheel JS Module Architecture

This document outlines the architectural approach for the Nocturna Wheel library, focusing on its module system.

## ES Module Architecture

The Nocturna Wheel library is built using modern ES modules to provide a clean, modular architecture with proper dependency injection. This approach offers several benefits:

- **Encapsulation**: Each module is self-contained with clear dependencies
- **Tree-shaking**: Unused code can be eliminated by bundlers
- **Explicit dependencies**: Dependencies are clearly stated at the top of each module
- **Testability**: Components can be tested in isolation

## Core Structure

The library is organized into the following directory structure:

```
src/
  ├── core/            - Core functionality and configurations
  ├── utils/           - Utility functions and classes
  ├── renderers/       - SVG rendering components
  ├── services/        - Service classes and registries
  ├── factories/       - Factory classes for component creation
  ├── managers/        - Managers for specific concerns (SVG, etc.)
  ├── components/      - Higher-level components
  └── main.js          - Main entry point for the library
```

## Key Components

### 1. Entry Points

- **main.js**: Primary entry point that exports the public API
- **nocturna-entry.js**: Alternative entry point for different bundling needs

### 2. Core Classes

- **NocturnaWheel**: Main class for creating and managing astrological charts
- **ChartConfig**: Configuration management for chart settings
- **WheelChart**: Enhanced chart with additional features

### 3. Renderers

- **BaseRenderer**: Abstract base class for all renderers
- **ZodiacRenderer**: Renders zodiac signs and degrees
- **HouseRenderer**: Renders house cusps and numbers
- **PlanetRenderer**: Renders planets and their symbols
- **ClientSideAspectRenderer**: Renders aspect lines between planets

### 4. Services

- **ServiceRegistry**: Central registry for service location
- Various utility services for calculations and rendering

## Dependency Management

Dependencies are managed through proper ES module imports/exports, eliminating the need for global variables:

```javascript
// Importing dependencies explicitly
import { SvgUtils } from '../utils/SvgUtils.js';
import { ServiceRegistry } from '../services/ServiceRegistry.js';

// Exporting for use in other modules
export class MyComponent {
  // Implementation
}
```

## Build System

The library uses Rollup to build different module formats:

- **UMD (Universal Module Definition)**: For direct browser use
- **ESM (ECMAScript Module)**: For modern bundlers and ES module imports

## Best Practices

1. **Explicit Dependencies**: All dependencies are explicitly imported
2. **No Global Variables**: The library avoids global variables completely
3. **Dependency Injection**: Dependencies are passed via constructors
4. **Factory Pattern**: Factory classes are used to create complex components

## Usage Examples

### Browser Usage (UMD)

```html
<script src="dist/nocturna-wheel.umd.js"></script>
<script>
  const chart = new NocturnaWheel.NocturnaWheel({
    container: '#chart-container',
    planets: { /* planet data */ },
    houses: [ /* house data */ ]
  });
  chart.render();
</script>
```

### ES Module Usage

```javascript
import { NocturnaWheel } from 'nocturna-wheel';

const chart = new NocturnaWheel({
  container: '#chart-container',
  planets: { /* planet data */ },
  houses: [ /* house data */ ]
});
chart.render();
```

## API Documentation

For detailed API documentation, please refer to the project README.md. 