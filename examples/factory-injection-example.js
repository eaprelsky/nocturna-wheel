/**
 * Factory Injection Example
 * 
 * This example demonstrates how to use Factory Injection with WheelChart
 */

// Import required components
import { NocturnaWheel } from '../src/NocturnaWheel';
import { WheelChart } from '../src/components/WheelChart';

// Sample chart data
const chartData = {
    planets: {
        sun: { lon: 85.83, color: '#F9A825' },
        moon: { lon: 133.21, color: '#CFD8DC' },
        // ... other planets
    },
    houses: [
        { lon: 300.32 },  // 1st house cusp
        { lon: 330.15 },  // 2nd house cusp
        // ... other houses
    ]
};

// Basic options for the chart
const chartOptions = {
    container: '#chart-container',
    planets: chartData.planets,
    houses: chartData.houses,
    config: {
        radius: { innermost: 90 },
        assets: { basePath: "/assets/" }
    }
};

// 1. Basic usage - without Factory Injection (legacy)
function createChartLegacyWay() {
    // This will use the default constructor which finds NocturnaWheel globally
    const chart = new WheelChart(chartOptions);
    chart.render();
    return chart;
}

// 2. Simple Factory Injection
function createChartWithFactoryInjection() {
    // Create a factory function that produces a NocturnaWheel instance
    const chartFactory = (options) => {
        console.log("Custom factory creating NocturnaWheel instance");
        return new NocturnaWheel(options);
    };
    
    // Use the factory when creating the WheelChart
    const chart = new WheelChart(chartOptions, chartFactory);
    chart.render();
    return chart;
}

// 3. Advanced Factory Injection - customizing the created instance
function createChartWithCustomizedFactory() {
    // Factory that creates a pre-configured chart
    const advancedFactory = (options) => {
        console.log("Advanced factory with customizations");
        
        // Create the base chart
        const chart = new NocturnaWheel(options);
        
        // Add custom event listeners
        chart.addEventListener = function(event, callback) {
            // Custom event handling implementation
            console.log(`Added listener for ${event}`);
            // Implementation details...
        };
        
        // Enhance with monitoring capabilities
        chart.logActivity = function(action) {
            console.log(`Chart activity: ${action}`);
        };
        
        // Return the enhanced chart
        return chart;
    };
    
    // Create WheelChart with the advanced factory
    const chart = new WheelChart(chartOptions, advancedFactory);
    chart.render();
    return chart;
}

// 4. Dynamic Factory based on runtime conditions
function createChartBasedOnConditions(useLightTheme = true) {
    // Factory that creates different implementations based on conditions
    const conditionalFactory = (options) => {
        if (useLightTheme) {
            console.log("Creating light theme chart");
            options.config.theme = 'light';
            // Set light theme colors
            options.config.colors = {
                background: '#FFFFFF',
                text: '#333333',
                // ... other colors
            };
        } else {
            console.log("Creating dark theme chart");
            options.config.theme = 'dark';
            // Set dark theme colors
            options.config.colors = {
                background: '#121212',
                text: '#FFFFFF',
                // ... other colors
            };
        }
        
        return new NocturnaWheel(options);
    };
    
    // Create chart with conditional factory
    const chart = new WheelChart(chartOptions, conditionalFactory);
    chart.render();
    return chart;
}

// 5. Testing with a Mock Factory
function testChartWithMockFactory() {
    // Create a mock chart for testing
    const mockChartFactory = (options) => {
        console.log("Creating mock chart for testing");
        
        // Return a minimal mock implementation
        return {
            render: () => console.log("Mock chart rendered"),
            update: (config) => console.log("Mock chart updated with", config),
            togglePlanet: (name, state) => console.log(`Mock toggled planet ${name} to ${state}`),
            toggleHouses: (state) => console.log(`Mock toggled houses to ${state}`),
            toggleAspects: (state) => console.log(`Mock toggled aspects to ${state}`),
            setHouseRotation: (angle) => console.log(`Mock set house rotation to ${angle}`),
            destroy: () => console.log("Mock chart destroyed"),
            config: { /* mock config */ }
        };
    };
    
    // Create chart with mock factory for testing
    const chart = new WheelChart(chartOptions, mockChartFactory);
    chart.render(); // Will log "Mock chart rendered"
    
    // Now we can run tests without creating actual DOM elements
    chart.togglePlanet('sun', false);
    chart.setHouseRotation(45);
    
    return chart;
}

// Export examples
export {
    createChartLegacyWay,
    createChartWithFactoryInjection,
    createChartWithCustomizedFactory,
    createChartBasedOnConditions,
    testChartWithMockFactory
}; 