/**
 * WheelChart.js
 * Component class for rendering astrological wheel chart with customizable circles
 */
class WheelChart {
    /**
     * Constructor
     * @param {Object} options - Configuration options
     * @param {string|Element} options.container - Container element or selector
     * @param {Object} options.planets - Planet positions data
     * @param {Array} options.houses - House cusps data (optional)
     * @param {Object} options.aspectSettings - Aspect calculation settings (optional)
     * @param {Object} options.config - Additional configuration (optional)
     */
    constructor(options) {
        if (!options || !options.container) {
            throw new Error("WheelChart: Container element or selector is required");
        }

        this.options = options;
        
        // Initialize configuration with additional inner circle
        const config = options.config || {};
        
        // Add innermost circle radius if not already defined
        if (!config.radius) {
            config.radius = {};
        }
        
        // Set the innermost circle radius (smaller than zodiacInner)
        config.radius.innermost = config.radius?.innermost || 90;
        
        // Create the NocturnaWheel instance
        this.chart = new NocturnaWheel({
            ...options,
            config: config
        });
        
        // Create the renderer
        this.renderer = new ChartRenderer(this.chart, options);
        
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
        this.renderer.renderInnerElements();
        
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