/**
 * compatibility.js
 * 
 * This file provides a bridge between the modern ES module architecture
 * and the legacy global variables approach. It imports all module classes
 * and conditionally exposes them to the global scope for backward compatibility.
 * 
 * Usage:
 * import { exposeToGlobal } from './compatibility';
 * exposeToGlobal(true); // Enable global variables
 */

// Core imports
import { ChartConfig } from './core/ChartConfig';

// Components
import { ChartRenderer } from './components/ChartRenderer';
import { WheelChart } from './components/WheelChart';

// Utils
import { SvgUtils } from './utils/SvgUtils';

// Main class
import { NocturnaWheel } from './NocturnaWheel';

/**
 * Conditionally exposes module classes to the global scope
 * @param {boolean} enableGlobals - Whether to expose classes as global variables
 * @param {boolean} showWarnings - Whether to show deprecation warnings when accessing globals
 */
export function exposeToGlobal(enableGlobals = false, showWarnings = true) {
    if (!enableGlobals || typeof window === 'undefined') {
        return;
    }
    
    // Helper function to add a global with optional warning
    const addGlobal = (name, value) => {
        if (showWarnings) {
            // Use getter with warning
            Object.defineProperty(window, name, {
                get() {
                    console.warn(`Accessing window.${name} is deprecated. Use ES module imports instead.`);
                    return value;
                },
                configurable: true
            });
        } else {
            // Direct assignment
            window[name] = value;
        }
    };
    
    // Add verified classes to global namespace
    addGlobal('ChartConfig', ChartConfig);
    addGlobal('ChartRenderer', ChartRenderer);
    addGlobal('SvgUtils', SvgUtils);
    addGlobal('WheelChart', WheelChart);
    addGlobal('NocturnaWheel', NocturnaWheel);
    
    console.log('Nocturna Wheel: Legacy global variables exposed for backward compatibility');
}

// Export key components for module use
export {
    ChartConfig,
    ChartRenderer,
    SvgUtils,
    WheelChart,
    NocturnaWheel
}; 