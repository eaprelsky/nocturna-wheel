/**
 * NocturnaWheel.js
 * Main class for the nocturna-wheel.js library.
 * Serves as the facade for all chart rendering operations.
 */
class NocturnaWheel {
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
        
        // Set data
        this.planets = options.planets || {};
        this.houses = options.houses || [];
        
        // Override aspect settings if provided
        if (options.aspectSettings) {
            this.config.updateAspectSettings(options.aspectSettings);
        }
        
        // Initialize SVG manager
        this.svgManager = new SVGManager();
        
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
     * Initializes all renderers
     * @private
     */
    _initializeRenderers() {
        const rendererOptions = {
            svgNS: this.svgManager.svgNS,
            config: this.config,
            assetBasePath: this.config.assets.basePath
        };
        
        // Initialize zodiac renderer
        this.renderers.zodiac = new ZodiacRenderer(rendererOptions);
        
        // Initialize house renderer with house data
        const currentHouseCusps = this.config.getCurrentHouseCusps();
        const houseData = (currentHouseCusps && currentHouseCusps.length > 0) 
            ? currentHouseCusps 
            : this.houses;
        
        this.renderers.house = new HouseRenderer({
            ...rendererOptions,
            houseData: houseData
        });
        
        // Initialize planet renderer with planet data
        this.renderers.planet = new PlanetRenderer({
            ...rendererOptions,
            planetData: this.planets
        });
        
        // Initialize aspect renderer
        this.renderers.aspect = new ClientSideAspectRenderer({
            ...rendererOptions,
            planetData: this.planets
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
            const currentHouseCusps = this.config.getCurrentHouseCusps();
            if (currentHouseCusps && currentHouseCusps.length > 0) {
                // Update house renderer with current house system cusps
                this.renderers.house.houseData = currentHouseCusps;
            }
            
            // Render house divisions and numbers
            this.renderers.house.renderDivisions(houseDivisionsGroup, this.config.houseSettings.rotationAngle);
            this.renderers.house.renderNumbers(houseGroup, this.config.houseSettings.rotationAngle);
        }
        
        // Render planets if enabled and get planets with coordinates
        let planetsWithCoords = [];
        if (this.config.planetSettings.enabled) {
            // Convert planets object to the array format expected by the renderer
            const planetsArray = Object.entries(this.planets).map(([name, data]) => ({
                name: name,
                position: data.lon, // Assuming position is stored in 'lon'
                color: data.color // Pass the color property too!
                // Include other relevant data from 'data' if needed by PlanetRenderer
            }));
            console.log('NocturnaWheel: Converted planets object to array:', JSON.stringify(planetsArray)); // Log the converted array
            console.log('NocturnaWheel: Passing planets to PlanetRenderer:', JSON.stringify(planetsArray)); // Use the converted array
            planetsWithCoords = this.renderers.planet.render(this.svgManager.getGroup('planets'), planetsArray);
            console.log('NocturnaWheel: Planets returned from PlanetRenderer:', JSON.stringify(planetsWithCoords)); 
        }
        
        // Render aspects if enabled, passing planets with coordinates
        if (this.config.aspectSettings.enabled) {
            this.renderers.aspect.render(this.svgManager.getGroup('aspects'), planetsWithCoords);
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
            // Removed incorrect call to non-existent updatePlanetData
            // if (this.renderers.planet) {
            //     this.renderers.planet.updatePlanetData(this.planets);
            // }
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
     * Toggles the visibility of aspects
     * @param {boolean} visible - Visibility state
     * @returns {NocturnaWheel} - Instance for chaining
     */
    toggleAspects(visible) {
        this.config.toggleAspectsVisibility(visible);
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
     * Updates chart data (planets, houses)
     * @param {Object} data - Object containing new data, e.g., { planets: {...}, houses: [...] }
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
     * @returns {string} - Name of the current house system
     */
    getCurrentHouseSystem() {
        return this.config.houseSettings.houseSystems.currentSystem;
    }
}

// Export for module environments or expose globally for browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NocturnaWheel;
} else {
    window.NocturnaWheel = NocturnaWheel;
} 