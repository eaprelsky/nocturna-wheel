// src/nocturna-entry.js

// Import all your script files in the correct order for their side effects.
// These scripts will execute and set up their functions/classes/globals
// as they did when loaded via <script> tags.

// Utilities
import './utils/SvgUtils.js';
import './utils/AstrologyUtils.js';
import './utils/PlanetPositionCalculator.js';

// Core calculation classes
import './core/HouseCalculator.js';

// Core configuration
import { ChartConfig } from './core/ChartConfig.js';

// Managers
import { SVGManager } from './managers/SVGManager.js';

// Renderers (base class first, then implementations)
import { BaseRenderer } from './renderers/BaseRenderer.js';
import { ZodiacRenderer } from './renderers/ZodiacRenderer.js';
import { HouseRenderer } from './renderers/HouseRenderer.js';
import { PlanetRenderer } from './renderers/PlanetRenderer.js';
import { ClientSideAspectRenderer } from './renderers/ClientSideAspectRenderer.js';

// Main application logic/classes
import { NocturnaWheel } from './NocturnaWheel.js';
import { ChartRenderer } from './components/ChartRenderer.js';
import { WheelChart } from './components/WheelChart.js';

// Export the main classes that users will interact with.
// Vite will use these to create the UMD global object.
export {
    NocturnaWheel,
    WheelChart,
    ChartConfig // Ensure ChartConfig is part of the main export for the library
}; 