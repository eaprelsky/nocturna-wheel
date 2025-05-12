/**
 * ChartManager.js
 * Main class for the nocturna-wheel.js library.
 * Serves as the facade for all chart rendering operations.
 */
import { ChartConfig } from '../core/ChartConfig.js';
import { SVGManager } from '../managers/SVGManager.js';
import { ServiceRegistry } from '../services/ServiceRegistry.js';
import { RenderingCoordinator } from './RenderingCoordinator.js';
import { ChartStateManager } from './ChartStateManager.js';

export class ChartManager {
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
            throw new Error("ChartManager: Container element or selector is required");
        }

        this.options = options;
        this.container = typeof options.container === 'string' 
            ? document.querySelector(options.container)
            : options.container;
            
        if (!this.container) {
            throw new Error(`ChartManager: Container not found: ${options.container}`);
        }

        // Initialize configuration
        this.config = new ChartConfig(options.config || {});
        
        // Set data
        this.planets = options.planets || {};
        this.houses = options.houses || [];
        
        // Override aspect settings if provided
        if (options.aspectSettings) {
            this.config.updateAspectSettings(options.aspectSettings);
        }
        
        // Initialize services
        ServiceRegistry.initializeServices();
        
        // Initialize SVG manager with shared svgUtils instance
        const svgUtils = ServiceRegistry.getSvgUtils();
        this.svgManager = new SVGManager({ svgUtils });
        
        // Initialize component classes
        this.renderingCoordinator = new RenderingCoordinator({
            config: this.config,
            svgManager: this.svgManager,
            planets: this.planets,
            houses: this.houses
        });
        
        this.stateManager = new ChartStateManager({
            config: this.config,
            svgManager: this.svgManager
        });
        
        console.log("ChartManager: Initialized");
    }

    /**
     * Initializes and sets up the chart
     * @private
     */
    _initialize() {
        const svgOptions = {
            width: this.config.svg.width,
            height: this.config.svg.height,
            viewBox: this.config.svg.viewBox
        };
        
        // Create SVG element
        this.svgManager.initialize(this.container, svgOptions);
        
        // Create standard layer groups
        this.svgManager.createStandardGroups();
    }

    /**
     * Renders the chart
     * @returns {ChartManager} - Instance for chaining
     */
    render() {
        if (!this.svgManager.getSVG()) {
            this._initialize();
        }
        
        // Delegate to rendering coordinator
        this.renderingCoordinator.renderAll();
        
        console.log("ChartManager: Chart rendered");
        return this;
    }

    /**
     * Updates chart configuration
     * @param {Object} config - New configuration
     * @returns {ChartManager} - Instance for chaining
     */
    update(config) {
        if (config.planets) {
            this.planets = config.planets;
            this.renderingCoordinator.updatePlanets(this.planets);
        }
        
        if (config.houses) {
            this.houses = config.houses;
            this.renderingCoordinator.updateHouses(this.houses);
        }
        
        if (config.config) {
            this.stateManager.updateConfig(config.config);
        }
        
        // Re-render the chart
        this.render();
        
        return this;
    }

    /**
     * Toggles the visibility of a planet
     * @param {string} planetName - Name of the planet to toggle
     * @param {boolean} visible - Visibility state
     * @returns {ChartManager} - Instance for chaining
     */
    togglePlanet(planetName, visible) {
        this.stateManager.togglePlanetVisibility(planetName, visible);
        this.render();
        return this;
    }

    /**
     * Toggles the visibility of houses
     * @param {boolean} visible - Visibility state
     * @returns {ChartManager} - Instance for chaining
     */
    toggleHouses(visible) {
        this.stateManager.toggleHousesVisibility(visible);
        this.render();
        return this;
    }

    /**
     * Toggles the visibility of aspects
     * @param {boolean} visible - Visibility state
     * @returns {ChartManager} - Instance for chaining
     */
    toggleAspects(visible) {
        this.stateManager.toggleAspectsVisibility(visible);
        this.render();
        return this;
    }

    /**
     * Sets the house system rotation angle
     * @param {number} angle - Rotation angle in degrees
     * @returns {ChartManager} - Instance for chaining
     */
    setHouseRotation(angle) {
        this.stateManager.setHouseRotation(angle);
        this.render();
        return this;
    }

    /**
     * Destroys the chart and cleans up resources
     */
    destroy() {
        // Remove the SVG element
        if (this.svgManager.getSVG()) {
            this.svgManager.getSVG().remove();
        }
        
        // Clear references
        this.renderingCoordinator = null;
        this.stateManager = null;
        this.planets = {};
        this.houses = [];
        
        console.log("ChartManager: Destroyed");
    }

    /**
     * Updates chart data (planets, houses)
     * @param {Object} data - Object containing new data, e.g., { planets: {...}, houses: [...] }
     * @returns {ChartManager} - Instance for chaining
     */
    updateData(data) {
        if (data.planets) {
            // Update internal planets data
            // Ensure it matches the format expected internally (object)
            if (typeof data.planets === 'object' && !Array.isArray(data.planets)) {
                this.planets = { ...this.planets, ...data.planets };
                this.renderingCoordinator.updatePlanets(this.planets);
                console.log("ChartManager: Updated planets data.");
            } else {
                console.warn("ChartManager.updateData: Invalid planets data format. Expected object.");
            }
        }
        if (data.houses) {
             // Update internal houses data
             if (Array.isArray(data.houses)) {
                 this.houses = data.houses;
                 this.renderingCoordinator.updateHouses(this.houses);
                 console.log("ChartManager: Updated houses data.");
             } else {
                 console.warn("ChartManager.updateData: Invalid houses data format. Expected array.");
             }
        }
        // Re-render the chart with updated data
        this.render();
        return this;
    }

    /**
     * Updates chart configuration (aspects, assets, etc.)
     * @param {Object} configUpdate - Object containing configuration updates
     * @returns {ChartManager} - Instance for chaining
     */
    updateConfig(configUpdate) {
        this.stateManager.updateConfig(configUpdate);
        
        console.log("ChartManager: Updated configuration.");
        // Re-render the chart with updated configuration
        this.render();
        return this;
    }

    /**
     * Sets the house system
     * @param {string} systemName - Name of the house system to use
     * @returns {ChartManager} - Instance for chaining
     */
    setHouseSystem(systemName) {
        this.stateManager.setHouseSystem(systemName);
        this.render();
        return this;
    }
    
    /**
     * Gets the available house systems
     * @returns {Array} - Array of available house system names
     */
    getAvailableHouseSystems() {
        return this.stateManager.getAvailableHouseSystems();
    }
    
    /**
     * Gets the current house system
     * @returns {string} - Current house system name
     */
    getCurrentHouseSystem() {
        return this.stateManager.getCurrentHouseSystem();
    }

    /**
     * Toggles the visibility of primary planets (inner circle)
     * @param {boolean} visible - Visibility state
     * @returns {ChartManager} - Instance for chaining
     */
    togglePrimaryPlanets(visible) {
        this.stateManager.togglePrimaryPlanets(visible);
        this.render();
        return this;
    }
    
    /**
     * Toggles the visibility of secondary planets (innermost circle)
     * @param {boolean} visible - Visibility state
     * @returns {ChartManager} - Instance for chaining
     */
    toggleSecondaryPlanets(visible) {
        this.stateManager.toggleSecondaryPlanets(visible);
        this.render();
        return this;
    }
} 