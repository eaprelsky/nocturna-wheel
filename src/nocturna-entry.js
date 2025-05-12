/**
 * nocturna-entry.js
 * Alternative entry point for the Nocturna Wheel library.
 * This version is optimized for direct browser use with compatibility fixes.
 */

// Import all necessary modules and re-export them
import { NocturnaWheel } from './NocturnaWheel.js';
import { WheelChart } from './components/WheelChart.js';
import { ChartConfig } from './core/ChartConfig.js';
import { SvgUtils } from './utils/SvgUtils.js';
import { AstrologyUtils } from './utils/AstrologyUtils.js';
import { ServiceRegistry } from './services/ServiceRegistry.js';

// Initialize core services immediately on load
ServiceRegistry.initializeServices();

// Version information
const VERSION = '0.2.0';

// Create a namespace object with all exports
const NocturnaNamespace = {
    // Core components
    NocturnaWheel,
    WheelChart,
    ChartConfig,
    
    // Utilities
    SvgUtils,
    AstrologyUtils,
    
    // Services
    ServiceRegistry,
    
    // Version info
    VERSION
};

// Export everything in named exports 
export {
    NocturnaWheel,
    WheelChart,
    ChartConfig,
    SvgUtils,
    AstrologyUtils,
    ServiceRegistry,
    VERSION
};

// Default export for simpler imports
export default NocturnaNamespace;

// Also expose to global scope when in browser environment - temporary bridge solution
if (typeof window !== 'undefined') {
    // Expose the namespace as NocturnaWheel global
    window.NocturnaWheel = NocturnaNamespace;
    
    // Notify about initialization
    console.log('NocturnaWheel library initialized via ES modules.');
} 