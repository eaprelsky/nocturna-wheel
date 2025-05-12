/**
 * Nocturna Wheel JS - Main Entry Point
 * 
 * This file serves as the primary entry point for the Nocturna Wheel library.
 * It provides a clean public API with ES module exports.
 * 
 * Factory Injection Pattern:
 * The WheelChart supports Factory Injection for better decoupling:
 * 
 * ```javascript
 * // Example usage with factory injection
 * const chartFactory = (opts) => new CustomChart(opts);
 * const chart = new WheelChart(options, chartFactory);
 * ```
 * 
 * See examples/factory-injection-example.js for more advanced usage patterns.
 */

// Import core services
import { ServiceRegistry } from './services/ServiceRegistry.js';

// Initialize core services immediately
ServiceRegistry.initializeServices();

// Import main components for the public API
import { ChartManager, WheelChart } from './components/index.js';
import { ChartConfig } from './core/ChartConfig';
import { SvgUtils } from './utils/SvgUtils.js';
import { AstrologyUtils } from './utils/AstrologyUtils.js';

// Library version
const VERSION = '0.2.0';

// For backward compatibility (temporary)
import { NocturnaWheel } from './NocturnaWheel';

// Clean exports for ES modules
export {
    ChartManager,
    NocturnaWheel, // For backward compatibility
    WheelChart,
    ChartConfig,
    VERSION,
    ServiceRegistry,
    SvgUtils,
    AstrologyUtils
};

/**
 * Main entry point for the Nocturna Wheel development environment
 * This file sets up the chart and handles hot module replacement for Vite
 */

// Sample chart data - for development and testing
const chartData = {
  planets: {
    sun: { lon: 0, lat: 0, color: '#F9A825' },
    moon: { lon: 45, lat: 0, color: '#CFD8DC' },
    mercury: { lon: 15, lat: 0, color: '#7E57C2' },
    venus: { lon: 30, lat: 0, color: '#26A69A' },
    mars: { lon: 60, lat: 0, color: '#EF5350' },
    jupiter: { lon: 90, lat: 0, color: '#5C6BC0' },
    saturn: { lon: 120, lat: 0, color: '#455A64' },
    uranus: { lon: 150, lat: 0, color: '#42A5F5' },
    neptune: { lon: 180, lat: 0, color: '#29B6F6' },
    pluto: { lon: 210, lat: 0, color: '#8D6E63' }
  },
  houses: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
  config: {
    zodiacSettings: {
      enabled: true
    },
    houseSettings: {
      enabled: true,
      rotationAngle: 0
    },
    planetSettings: {
      enabled: true
    },
    aspectSettings: {
      enabled: true
    }
  }
};

// Chart instance
let chart;

/**
 * Initialize the chart
 */
function initChart() {
  // Get the container element
  const container = document.getElementById('chart-container');
  
  // Configuration for the chart
  const options = {
    container: container,
    planets: chartData.planets,
    houses: chartData.houses,
    config: chartData.config
  };
  
  // Initialize the chart with the new ChartManager
  chart = new ChartManager(options);
  
  // Render the chart
  chart.render();
  
  // Setup event listeners for controls
  setupEventListeners();
}

/**
 * Setup event listeners for various controls
 */
function setupEventListeners() {
  // Example: House system selector
  const houseSystemSelect = document.getElementById('house-system');
  if (houseSystemSelect) {
    houseSystemSelect.addEventListener('change', (e) => {
      chart.setHouseSystem(e.target.value);
    });
  }
  
  // Initialize secondary planets toggle to match current state (enabled)
  const secondaryPlanetsToggle = document.getElementById('toggle-secondary-planets');
  if (secondaryPlanetsToggle) {
    secondaryPlanetsToggle.checked = true;
  }
  
  // Add more event listeners for other controls as needed
}

/**
 * Clean up resources when the module is replaced (for Vite HMR)
 */
function cleanup() {
  if (chart) {
    chart.destroy();
    chart = null;
  }
}

// Initialize the chart when the DOM is ready
document.addEventListener('DOMContentLoaded', initChart);

// Handle hot module replacement for Vite
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    console.log('HMR update for main.js');
    cleanup();
    initChart();
  });
  
  // Cleanup when disposing
  import.meta.hot.dispose(() => {
    console.log('HMR dispose for main.js');
    cleanup();
  });
}

// Default export for easier imports
export default {
    ChartManager,
    NocturnaWheel, // For backward compatibility
    WheelChart,
    ChartConfig,
    ServiceRegistry,
    SvgUtils,
    AstrologyUtils
}; 