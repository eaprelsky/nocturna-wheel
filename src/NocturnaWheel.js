/**
 * NocturnaWheel.js
 * Main class for the nocturna-wheel.js library.
 * Serves as the facade for all chart rendering operations.
 */
import { ChartConfig } from './core/ChartConfig.js';
import { SVGManager } from './managers/SVGManager.js';
import { ServiceRegistry } from './services/ServiceRegistry.js';
import { RendererFactory } from './factories/RendererFactory.js';

export class NocturnaWheel {
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
     */
    constructor(options) {
        if (!options || !options.container) {
            throw new Error("NocturnaWheel: Container element or selector is required");
        }

        this.options = options;
        this.container = typeof options.container === 'string' 
            ? document.querySelector(options.container)
            : options.container;
            
        if (!this.container) {
            throw new Error(`NocturnaWheel: Container not found: ${options.container}`);
        }

        // Initialize configuration
        this.config = new ChartConfig(options.config || {});
        
        // Set data - primary planets (outer circle)
        this.planets = options.planets || {};
        
        // Set secondary planets (inner circle) - independent data
        // If not provided, initialize as empty object (user must explicitly set)
        this.secondaryPlanets = options.secondaryPlanets || {};
        
        this.houses = options.houses || [];
        
        // Override aspect settings if provided (legacy support)
        if (options.aspectSettings) {
            this.config.updateAspectSettings(options.aspectSettings);
        }
        
        // Override specific aspect settings if provided
        if (options.primaryAspectSettings) {
            this.config.updatePrimaryAspectSettings(options.primaryAspectSettings);
        }
        if (options.secondaryAspectSettings) {
            this.config.updateSecondaryAspectSettings(options.secondaryAspectSettings);
        }
        if (options.synastryAspectSettings) {
            this.config.updateSynastryAspectSettings(options.synastryAspectSettings);
        }
        
        // Initialize services
        ServiceRegistry.initializeServices();
        
        // Initialize SVG manager with shared svgUtils instance
        const svgUtils = ServiceRegistry.getSvgUtils();
        this.svgManager = new SVGManager({ svgUtils });
        
        // Initialize renderers dictionary
        this.renderers = {};
        
        console.log("NocturnaWheel: Initialized");
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
        
        // Initialize renderers
        this._initializeRenderers();
    }

    /**
     * Initializes all renderers using the factory
     * @private
     */
    _initializeRenderers() {
        // Create renderer factory
        this.rendererFactory = new RendererFactory(
            this.config, 
            this.svgManager.svgNS
        );
        
        // Initialize zodiac renderer
        this.renderers.zodiac = this.rendererFactory.createZodiacRenderer({
            assetBasePath: this.config.assets.basePath
        });
        
        // Initialize house renderer with house data
        const houseCusps = this.config.getHouseCusps();
        const houseData = (houseCusps && houseCusps.length > 0) 
            ? houseCusps 
            : this.houses;
        
        this.renderers.house = this.rendererFactory.createHouseRenderer({
            houseData: houseData
        });
        
        // Initialize planet renderer
        this.renderers.planet = this.rendererFactory.createPlanetRenderer({
            assetBasePath: this.config.assets.basePath
        });
        
        // Initialize aspect renderer
        this.renderers.aspect = this.rendererFactory.createAspectRenderer({
            assetBasePath: this.config.assets.basePath
        });
    }

    /**
     * Renders the chart
     */
    render() {
        if (!this.svgManager.getSVG()) {
            this._initialize();
        }
        
        // Clear all groups
        Object.values(this.svgManager.getAllGroups()).forEach(group => {
            group.innerHTML = '';
        });
        
        // Render zodiac if enabled
        if (this.config.zodiacSettings.enabled) {
            this.renderers.zodiac.render(this.svgManager.getGroup('zodiac'));
        }
        
        // Render houses if enabled
        if (this.config.houseSettings.enabled) {
            const houseGroup = this.svgManager.getGroup('houses');
            const houseDivisionsGroup = this.svgManager.getGroup('houseDivisions');
            
            // Get the current house cusps based on selected system
            const houseCusps = this.config.getHouseCusps();
            if (houseCusps && houseCusps.length > 0) {
                // Update house renderer with current house system cusps
                this.renderers.house.houseData = houseCusps;
            }
            
            // Render house divisions and numbers
            this.renderers.house.renderDivisions(houseDivisionsGroup, this.config.houseSettings.rotationAngle);
            this.renderers.house.renderNumbers(houseGroup, this.config.houseSettings.rotationAngle);
        }
        
        // Render planets using the consolidated approach
        let primaryPlanetsWithCoords = [];
        let secondaryPlanetsWithCoords = [];
        if (this.config.planetSettings.enabled) {
            // Get the enabled states for primary and secondary planets
            const primaryEnabled = this.config.planetSettings.primaryEnabled !== false;
            const secondaryEnabled = this.config.planetSettings.secondaryEnabled !== false;
            
            // Render primary planets (outer circle)
            if (primaryEnabled && Object.keys(this.planets).length > 0) {
                const primaryGroup = this.svgManager.getGroup('primaryPlanets');
                const primaryArray = Object.entries(this.planets)
                    .filter(([name, data]) => this.config.planetSettings.visible?.[name] !== false)
                    .map(([name, data]) => ({
                        name: name,
                        position: data.lon,
                        color: data.color || '#000000'
                    }));
                primaryPlanetsWithCoords = this.renderers.planet.primaryRenderer.render(primaryGroup, primaryArray, 0, {
                    config: this.config
                });
            }
            
            // Render secondary planets (inner circle) using SEPARATE data
            if (secondaryEnabled && Object.keys(this.secondaryPlanets).length > 0) {
                const secondaryGroup = this.svgManager.getGroup('secondaryPlanets');
                const secondaryArray = Object.entries(this.secondaryPlanets)
                    .filter(([name, data]) => this.config.planetSettings.visible?.[name] !== false)
                    .map(([name, data]) => ({
                        name: name,
                        position: data.lon,
                        color: data.color || '#000000'
                    }));
                secondaryPlanetsWithCoords = this.renderers.planet.secondaryRenderer.render(secondaryGroup, secondaryArray, 0, {
                    config: this.config
                });
            }
            
            console.log(`NocturnaWheel: Rendered ${primaryPlanetsWithCoords.length} primary planets and ${secondaryPlanetsWithCoords.length} secondary planets`);
        }
        
        // Render three independent aspect types
        
        // 1. Primary aspects (outer circle to outer circle)
        if (this.config.primaryAspectSettings.enabled && primaryPlanetsWithCoords.length >= 2) {
            const primaryAspectsGroup = this.svgManager.getGroup('primaryAspects');
            this.renderers.aspect.render(primaryAspectsGroup, primaryPlanetsWithCoords, this.config.primaryAspectSettings);
            console.log("NocturnaWheel: Rendered primary aspects");
        }
        
        // 2. Secondary aspects (inner circle to inner circle)
        if (this.config.secondaryAspectSettings.enabled && secondaryPlanetsWithCoords.length >= 2) {
            const secondaryAspectsGroup = this.svgManager.getGroup('secondaryAspects');
            this.renderers.aspect.render(secondaryAspectsGroup, secondaryPlanetsWithCoords, this.config.secondaryAspectSettings);
            console.log("NocturnaWheel: Rendered secondary aspects");
        }
        
        // 3. Synastry aspects (outer circle to inner circle)
        if (this.config.synastryAspectSettings.enabled && 
            primaryPlanetsWithCoords.length >= 1 && 
            secondaryPlanetsWithCoords.length >= 1) {
            const synastryAspectsGroup = this.svgManager.getGroup('synastryAspects');
            this.renderers.aspect.renderCrossAspects(
                synastryAspectsGroup, 
                primaryPlanetsWithCoords, 
                secondaryPlanetsWithCoords, 
                this.config.synastryAspectSettings
            );
            console.log("NocturnaWheel: Rendered synastry aspects");
        }
        
        // Legacy aspect rendering for backward compatibility
        if (this.config.aspectSettings.enabled && primaryPlanetsWithCoords.length >= 2) {
            this.renderers.aspect.render(this.svgManager.getGroup('aspects'), primaryPlanetsWithCoords, this.config.aspectSettings);
            console.log("NocturnaWheel: Rendered legacy aspects");
        }
        
        console.log("NocturnaWheel: Chart rendered");
        return this;
    }

    /**
     * Updates chart configuration
     * @param {Object} config - New configuration
     * @returns {NocturnaWheel} - Instance for chaining
     */
    update(config) {
        if (config.planets) {
            this.planets = config.planets;
        }
        
        if (config.houses) {
            this.houses = config.houses;
            if (this.renderers.house) {
                this.renderers.house.houseData = this.houses;
            }
        }
        
        if (config.config) {
            this.config.mergeConfig(config.config);
        }
        
        // Re-render the chart
        this.render();
        
        return this;
    }

    /**
     * Toggles the visibility of a planet
     * @param {string} planetName - Name of the planet to toggle
     * @param {boolean} visible - Visibility state
     * @returns {NocturnaWheel} - Instance for chaining
     */
    togglePlanet(planetName, visible) {
        this.config.togglePlanetVisibility(planetName, visible);
        this.render();
        return this;
    }

    /**
     * Toggles the visibility of houses
     * @param {boolean} visible - Visibility state
     * @returns {NocturnaWheel} - Instance for chaining
     */
    toggleHouses(visible) {
        this.config.toggleHousesVisibility(visible);
        this.render();
        return this;
    }

    /**
     * Toggles the visibility of aspects (legacy - toggles all)
     * @param {boolean} visible - Visibility state
     * @returns {NocturnaWheel} - Instance for chaining
     * @deprecated Use togglePrimaryAspects, toggleSecondaryAspects, or toggleSynastryAspects instead
     */
    toggleAspects(visible) {
        this.config.toggleAspectsVisibility(visible);
        this.render();
        return this;
    }
    
    /**
     * Toggles the visibility of primary aspects (outer circle)
     * @param {boolean} visible - Visibility state
     * @returns {NocturnaWheel} - Instance for chaining
     */
    togglePrimaryAspects(visible) {
        this.config.togglePrimaryAspectsVisibility(visible);
        this.render();
        return this;
    }
    
    /**
     * Toggles the visibility of secondary aspects (inner circle)
     * @param {boolean} visible - Visibility state
     * @returns {NocturnaWheel} - Instance for chaining
     */
    toggleSecondaryAspects(visible) {
        this.config.toggleSecondaryAspectsVisibility(visible);
        this.render();
        return this;
    }
    
    /**
     * Toggles the visibility of synastry aspects (cross-circle)
     * @param {boolean} visible - Visibility state
     * @returns {NocturnaWheel} - Instance for chaining
     */
    toggleSynastryAspects(visible) {
        this.config.toggleSynastryAspectsVisibility(visible);
        this.render();
        return this;
    }

    /**
     * Sets the house system rotation angle
     * @param {number} angle - Rotation angle in degrees
     * @returns {NocturnaWheel} - Instance for chaining
     */
    setHouseRotation(angle) {
        this.config.houseSettings.rotationAngle = angle;
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
        this.renderers = {};
        this.planets = {};
        this.houses = [];
        
        console.log("NocturnaWheel: Destroyed");
    }

    /**
     * Updates chart data (planets, secondaryPlanets, houses)
     * @param {Object} data - Object containing new data, e.g., { planets: {...}, secondaryPlanets: {...}, houses: [...] }
     * @returns {NocturnaWheel} - Instance for chaining
     */
    updateData(data) {
        if (data.planets) {
            // Update internal planets data
            // Ensure it matches the format expected internally (object)
            if (typeof data.planets === 'object' && !Array.isArray(data.planets)) {
                this.planets = { ...this.planets, ...data.planets };
                console.log("NocturnaWheel: Updated planets data.");
            } else {
                console.warn("NocturnaWheel.updateData: Invalid planets data format. Expected object.");
            }
        }
        if (data.secondaryPlanets) {
            // Update internal secondary planets data
            if (typeof data.secondaryPlanets === 'object' && !Array.isArray(data.secondaryPlanets)) {
                this.secondaryPlanets = { ...this.secondaryPlanets, ...data.secondaryPlanets };
                console.log("NocturnaWheel: Updated secondary planets data.");
            } else {
                console.warn("NocturnaWheel.updateData: Invalid secondaryPlanets data format. Expected object.");
            }
        }
        if (data.houses) {
             // Update internal houses data
             if (Array.isArray(data.houses)) {
                 this.houses = data.houses;
                 // Need to inform HouseRenderer if it holds its own copy
                 if (this.renderers.house) {
                     this.renderers.house.houseData = this.houses;
                 }
                 console.log("NocturnaWheel: Updated houses data.");
             } else {
                 console.warn("NocturnaWheel.updateData: Invalid houses data format. Expected array.");
             }
        }
        // Re-render the chart with updated data
        this.render();
        return this;
    }

    /**
     * Updates chart configuration (aspects, assets, etc.)
     * @param {Object} configUpdate - Object containing configuration updates
     * @returns {NocturnaWheel} - Instance for chaining
     */
    updateConfig(configUpdate) {
        this.config.mergeConfig(configUpdate); // Use the existing mergeConfig method
        
        // Update aspect settings specifically if provided
        if (configUpdate.aspectSettings) {
            this.config.updateAspectSettings(configUpdate.aspectSettings);
        }
        
        console.log("NocturnaWheel: Updated configuration.");
        // Re-render the chart with updated configuration
        this.render();
        return this;
    }

    /**
     * Sets the house system
     * @param {string} systemName - Name of the house system to use
     * @returns {NocturnaWheel} - Instance for chaining
     */
    setHouseSystem(systemName) {
        this.config.setHouseSystem(systemName);
        this.render();
        return this;
    }
    
    /**
     * Gets the available house systems
     * @returns {Array} - Array of available house system names
     */
    getAvailableHouseSystems() {
        return this.config.getAvailableHouseSystems();
    }
    
    /**
     * Gets the current house system
     * @returns {string} - Current house system name
     */
    getCurrentHouseSystem() {
        return this.config.getHouseSystem();
    }

    /**
     * Toggles the visibility of primary planets (inner circle)
     * @param {boolean} visible - Visibility state
     * @returns {NocturnaWheel} - Instance for chaining
     */
    togglePrimaryPlanets(visible) {
        // Use the config's method to update the settings
        this.config.togglePrimaryPlanetsVisibility(visible);
        
        // Update the group visibility in the DOM
        const primaryGroup = this.svgManager.getGroup('primaryPlanets');
        if (primaryGroup) {
            primaryGroup.style.display = visible ? 'block' : 'none';
        }
        
        console.log(`NocturnaWheel: Primary planets ${visible ? 'enabled' : 'disabled'}`);
        return this;
    }
    
    /**
     * Toggles the visibility of secondary planets (innermost circle)
     * @param {boolean} visible - Visibility state
     * @returns {NocturnaWheel} - Instance for chaining
     */
    toggleSecondaryPlanets(visible) {
        // Use the config's method to update the settings
        this.config.toggleSecondaryPlanetsVisibility(visible);
        
        // Update the group visibility in the DOM
        const secondaryGroup = this.svgManager.getGroup('secondaryPlanets');
        if (secondaryGroup) {
            secondaryGroup.style.display = visible ? 'block' : 'none';
        }

        // Update the innermost circle visibility
        const innermostCircle = document.querySelector('.chart-innermost-circle');
        if (innermostCircle) {
            innermostCircle.style.display = visible ? 'block' : 'none';
        }
        
        console.log(`NocturnaWheel: Secondary planets ${visible ? 'enabled' : 'disabled'}`);
        return this;
    }
}

// Export for module environments or expose globally for browser
// if (typeof module !== 'undefined' && module.exports) {
// module.exports = NocturnaWheel;
// } else {
// window.NocturnaWheel = NocturnaWheel;
// } 