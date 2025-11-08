/**
 * WheelChart.js
 * Component class for rendering astrological wheel chart with customizable circles
 */
import { NocturnaWheel } from '../NocturnaWheel';
import { ChartRenderer } from './ChartRenderer';

export class WheelChart {
    /**
     * Constructor
     * @param {Object} options - Configuration options
     * @param {string|Element} options.container - Container element or selector
     * @param {Object} options.planets - Primary planet positions data (outer circle)
     * @param {Object} options.secondaryPlanets - Secondary planet positions data (inner circle, optional)
     * @param {Array} options.houses - House cusps data (optional)
     * @param {Object} options.aspectSettings - Aspect calculation settings (optional, legacy)
     * @param {Object} options.primaryAspectSettings - Primary aspect settings (optional)
     * @param {Object} options.secondaryAspectSettings - Secondary aspect settings (optional)
     * @param {Object} options.synastryAspectSettings - Synastry aspect settings (optional)
     * @param {Object} options.config - Additional configuration (optional)
     * @param {Function} [chartFactory=null] - Factory function to create the chart instance
     *                                        Function signature: (options) => ChartInstance
     */
    constructor(options, chartFactory = null) {
        if (!options || !options.container) {
            throw new Error("WheelChart: Container element or selector is required");
        }

        this.options = options;
        
        // Initialize configuration
        const config = options.config || {};
        
        // Use the factory function if provided
        if (typeof chartFactory === 'function') {
            console.log("WheelChart: Using provided chart factory function");
            this.chart = chartFactory(options);
        } else {
            // Fallback to the original behavior for backward compatibility
            console.log("WheelChart: Using default chart creation");
            
            // Create a new NocturnaWheel instance directly using the imported class
            this.chart = new NocturnaWheel({
                ...options,
                config: config
            });
        }
        
        // Validate the created chart instance has required methods
        if (!this.chart || typeof this.chart.render !== 'function') {
            throw new Error("WheelChart: Invalid chart instance created. Missing required methods.");
        }
        
        // Create the renderer
        this.renderer = new ChartRenderer(this, options);
        
        console.log("WheelChart: Initialized");
    }
    
    /**
     * Renders the chart
     * @returns {WheelChart} - Instance for chaining
     */
    render() {
        // First render the base chart
        this.chart.render();
        
        // Add the innermost circle after rendering the main chart
        // Wrap in setTimeout to ensure the chart rendering has completed
        setTimeout(() => {
            try {
                console.log("WheelChart: Rendering inner elements");
                this.renderer.renderInnerElements();
            } catch (error) {
                console.error("WheelChart: Error rendering inner elements:", error);
            }
        }, 0);
        
        console.log("WheelChart: Chart rendered with inner circle");
        return this;
    }
    
    /**
     * Updates chart configuration
     * @param {Object} config - New configuration
     * @returns {WheelChart} - Instance for chaining
     */
    update(config) {
        this.chart.update(config);
        
        // Redraw the innermost circle
        this.renderer.renderInnerElements();
        
        return this;
    }
    
    /**
     * Delegates method calls to the NocturnaWheel instance
     * @param {string} method - Method name
     * @param {Array} args - Method arguments
     * @returns {*} - Return value from the method
     */
    _delegateToChart(method, ...args) {
        if (typeof this.chart[method] === 'function') {
            return this.chart[method](...args);
        }
        throw new Error(`WheelChart: Method ${method} not found in NocturnaWheel`);
    }
    
    /**
     * Delegates method calls and redraws inner circle
     * @param {string} method - Method name
     * @param {Array} args - Method arguments
     * @returns {*} - Return value from the method
     * @private
     */
    _delegateAndRedraw(method, ...args) {
        const result = this._delegateToChart(method, ...args);
        this.renderer.renderInnerElements();
        return result;
    }
    
    // Delegate common methods to the NocturnaWheel instance
    togglePlanet(planetName, visible) {
        return this._delegateAndRedraw('togglePlanet', planetName, visible);
    }
    
    toggleHouses(visible) {
        return this._delegateAndRedraw('toggleHouses', visible);
    }
    
    toggleAspects(visible) {
        return this._delegateAndRedraw('toggleAspects', visible);
    }
    
    togglePrimaryAspects(visible) {
        return this._delegateAndRedraw('togglePrimaryAspects', visible);
    }
    
    toggleSecondaryAspects(visible) {
        return this._delegateAndRedraw('toggleSecondaryAspects', visible);
    }
    
    toggleSynastryAspects(visible) {
        return this._delegateAndRedraw('toggleSynastryAspects', visible);
    }
    
    /**
     * Toggles the visibility of primary planets (inner circle)
     * @param {boolean} visible - Visibility state
     * @returns {WheelChart} - Instance for chaining
     */
    togglePrimaryPlanets(visible) {
        return this._delegateAndRedraw('togglePrimaryPlanets', visible);
    }
    
    /**
     * Toggles the visibility of secondary planets (innermost circle)
     * @param {boolean} visible - Visibility state
     * @returns {WheelChart} - Instance for chaining
     */
    toggleSecondaryPlanets(visible) {
        // First delegate to NocturnaWheel instance
        const result = this._delegateToChart('toggleSecondaryPlanets', visible);
        
        // Explicitly handle innermost circle visibility
        try {
            const container = typeof this.options.container === 'string' ?
                document.querySelector(this.options.container) :
                this.options.container;
                
            if (container) {
                const innermostCircle = container.querySelector('.chart-innermost-circle');
                if (innermostCircle) {
                    console.log(`WheelChart: Setting innermost circle display to ${visible ? 'block' : 'none'}`);
                    innermostCircle.style.display = visible ? 'block' : 'none';
                } else {
                    console.log('WheelChart: No innermost circle found to toggle visibility');
                }
            }
        } catch (error) {
            console.error('WheelChart: Error toggling innermost circle visibility:', error);
        }
        
        // Also redraw inner elements to ensure everything is in sync
        this.renderer.renderInnerElements();
        
        return result;
    }
    
    setHouseRotation(angle) {
        return this._delegateAndRedraw('setHouseRotation', angle);
    }
    
    destroy() {
        return this._delegateToChart('destroy');
    }
    
    setHouseSystem(systemName) {
        return this._delegateAndRedraw('setHouseSystem', systemName);
    }
    
    // Add direct access to the chart's config for convenience
    get config() {
        return this.chart.config;
    }
    
    // Add direct access to updateData method
    updateData(data) {
        return this._delegateAndRedraw('updateData', data);
    }
    
    // Add direct access to getCurrentHouseSystem method
    getCurrentHouseSystem() {
        return this.chart.getCurrentHouseSystem();
    }
} 