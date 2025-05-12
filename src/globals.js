/**
 * globals.js
 * @deprecated This file is deprecated and will be removed in a future version.
 * Use ES module imports instead.
 * 
 * Example:
 * import { ChartConfig } from './core/ChartConfig';
 */

// Import and expose classes through the compatibility layer
import { exposeToGlobal } from './compatibility';

// Show deprecation message
console.warn(
  'globals.js is deprecated and will be removed in a future version.\n' +
  'Use ES module imports instead:\n' +
  'import { ChartConfig } from \'./core/ChartConfig\';'
);

// Expose all classes to global scope with deprecation warnings
exposeToGlobal(true, true);

// No other direct global assignments should be made here
// All globals are now managed through the compatibility layer 

/**
 * globals.js
 * 
 * Re-export all core modules for convenience.
 * This file provides a single import point for all components.
 */

// Core
export { ChartConfig } from './core/ChartConfig';

// Main components
export { NocturnaWheel } from './NocturnaWheel';
export { WheelChart } from './components/WheelChart';
export { ChartRenderer } from './components/ChartRenderer';

// Utils
export { SvgUtils } from './utils/SvgUtils';

// Add more exports as components are properly converted to modules 