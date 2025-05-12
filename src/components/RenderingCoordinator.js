/**
 * RenderingCoordinator.js
 * Coordinates all rendering operations for the chart
 */
import { RendererFactory } from '../factories/RendererFactory.js';

export class RenderingCoordinator {
    /**
     * Constructor
     * @param {Object} options - Configuration options
     * @param {Object} options.config - Chart configuration
     * @param {Object} options.svgManager - SVG manager instance
     * @param {Object} options.planets - Planet data
     * @param {Array} options.houses - House data
     */
    constructor(options) {
        this.config = options.config;
        this.svgManager = options.svgManager;
        this.planets = options.planets || {};
        this.houses = options.houses || [];
        
        // Initialize renderers dictionary
        this.renderers = {};
        
        // Initialize renderers if SVG manager is available
        if (this.svgManager && this.svgManager.getSVG()) {
            this._initializeRenderers();
        }
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
     * Updates planet data
     * @param {Object} planets - New planet data
     */
    updatePlanets(planets) {
        this.planets = planets;
    }
    
    /**
     * Updates house data
     * @param {Array} houses - New house data
     */
    updateHouses(houses) {
        this.houses = houses;
        if (this.renderers.house) {
            this.renderers.house.houseData = this.houses;
        }
    }
    
    /**
     * Renders all chart elements
     */
    renderAll() {
        if (!this.svgManager.getSVG()) {
            return;
        }
        
        // Clear all groups
        Object.values(this.svgManager.getAllGroups()).forEach(group => {
            group.innerHTML = '';
        });
        
        this.renderZodiac();
        this.renderHouses();
        const planetsWithCoords = this.renderPlanets();
        this.renderAspects(planetsWithCoords);
        
        console.log("RenderingCoordinator: Chart rendered");
    }
    
    /**
     * Renders the zodiac ring
     * @returns {boolean} Success indicator
     */
    renderZodiac() {
        if (!this.config.zodiacSettings.enabled || !this.renderers.zodiac) {
            return false;
        }
        
        this.renderers.zodiac.render(this.svgManager.getGroup('zodiac'));
        return true;
    }
    
    /**
     * Renders the houses
     * @returns {boolean} Success indicator
     */
    renderHouses() {
        if (!this.config.houseSettings.enabled || !this.renderers.house) {
            return false;
        }
        
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
        
        return true;
    }
    
    /**
     * Renders the planets
     * @returns {Array} Array of rendered planets with coordinates for aspect calculation
     */
    renderPlanets() {
        if (!this.config.planetSettings.enabled || !this.renderers.planet) {
            return [];
        }
        
        // Get the enabled states for primary and secondary planets
        const primaryEnabled = this.config.planetSettings.primaryEnabled !== false;
        const secondaryEnabled = this.config.planetSettings.secondaryEnabled !== false;
        
        // Use the consolidated renderAllPlanetTypes method
        const renderedPlanets = this.renderers.planet.renderAllPlanetTypes({
            svgManager: this.svgManager,
            planetsData: this.planets,
            config: this.config,
            primaryEnabled: primaryEnabled,
            secondaryEnabled: secondaryEnabled
        });
        
        console.log(`RenderingCoordinator: Rendered ${renderedPlanets.primary.length} primary planets and ${renderedPlanets.secondary.length} secondary planets`);
        
        // For aspect rendering, use primary planets by default
        return renderedPlanets.primary;
    }
    
    /**
     * Renders the aspects between planets
     * @param {Array} planetsWithCoords - Array of planets with coordinates
     * @returns {boolean} Success indicator
     */
    renderAspects(planetsWithCoords) {
        if (!this.config.aspectSettings.enabled || !this.renderers.aspect) {
            return false;
        }
        
        this.renderers.aspect.render(this.svgManager.getGroup('aspects'), planetsWithCoords);
        return true;
    }
} 