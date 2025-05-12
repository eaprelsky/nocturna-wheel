# ES Module Architecture

This document explains the ES module architecture that has been implemented in Nocturna Wheel to eliminate global variables and improve code organization.

## Changes Made

### 1. Eliminated Global Variables

Global variables were previously defined in `globals.js`, which exposed all classes to the window object. This made the code harder to maintain, test, and reason about.

The solution:
- Created a compatibility layer (`src/compatibility.js`) that manages global access
- Moved all classes to proper ES modules with explicit exports
- Implemented deprecation warnings for global variable usage

### 2. Clean Public API

The main entry point (`src/main.js`) now:
- Exports a well-defined public API
- Provides backward compatibility via a namespace object
- Allows disabling of legacy globals

```javascript
// ES Module pattern
import { NocturnaWheel, WheelChart } from 'nocturna-wheel';

// Namespace pattern (backward compatible)
const chart = new NocturnaWheel.WheelChart(options);

// Disable legacy globals
NocturnaWheel.config.disableLegacyGlobals();
```

### 3. Factory Injection Pattern

Added Factory Injection pattern for better component decoupling:

```javascript
// Create a factory function
const chartFactory = (options) => {
    // Custom chart creation logic
    return new NocturnaWheel(options);
};

// Use the factory when creating WheelChart
const chart = new WheelChart(options, chartFactory);
```

## Directory Structure

```
src/
├── components/      # Higher-level components
│   ├── ChartRenderer.js
│   └── WheelChart.js
├── core/            # Core classes
│   ├── ChartConfig.js
│   └── HouseCalculator.js
├── managers/        # Manager classes
│   └── SVGManager.js
├── renderers/       # Rendering components
│   ├── BaseRenderer.js
│   ├── ZodiacRenderer.js
│   ├── HouseRenderer.js
│   ├── PlanetRenderer.js
│   └── ClientSideAspectRenderer.js
├── utils/           # Utility classes
│   ├── SvgUtils.js
│   ├── AstrologyUtils.js
│   └── PlanetPositionCalculator.js
├── compatibility.js # Backward compatibility layer
├── globals.js       # Legacy file (now just imports compatibility)
├── main.js          # Main entry point
└── NocturnaWheel.js # Primary chart class
```

## Migration Guide

### For Library Users

1. **Preferred Approach (ES Modules)**:
   ```javascript
   import { NocturnaWheel, WheelChart } from 'nocturna-wheel';
   
   const chart = new WheelChart(options);
   ```

2. **Backward Compatible Approach**:
   ```javascript
   const chart = new NocturnaWheel.WheelChart(options);
   ```

3. **Legacy Global Approach (Deprecated)**:
   ```javascript
   const chart = new window.WheelChart(options);
   ```

### For Library Contributors

1. Always use ES module imports:
   ```javascript
   import { SvgUtils } from '../utils/SvgUtils';
   ```

2. Export classes properly:
   ```javascript
   export class MyComponent {
       // ...
   }
   ```

3. Add new components to the compatibility layer if needed.

## Benefits

1. **Improved organization**: Logical directory structure
2. **Better dependency management**: Explicit imports and exports
3. **Enhanced testability**: Components can be easily mocked
4. **Smaller bundle size**: Tree-shaking optimization possible
5. **Modern JavaScript**: Aligned with best practices 