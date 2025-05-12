import { BasePlanetRenderer } from './BasePlanetRenderer.js';

/**
 * PlanetRendererCoordinator.js
 * Coordinator class that maintains the original PlanetRenderer API
 * but delegates rendering tasks to specialized renderers.
 */
export class PlanetRendererCoordinator extends BasePlanetRenderer {
    /**
     * Constructor
     * @param {Object} options - Renderer options.
     * @param {PrimaryPlanetRenderer} options.primaryRenderer - Primary planet renderer.
     * @param {SecondaryPlanetRenderer} options.secondaryRenderer - Secondary planet renderer.
     * @param {PlanetSymbolRenderer} options.symbolRenderer - Planet symbol renderer.
     */
    constructor(options) {
        super(options);
        
        this.primaryRenderer = options.primaryRenderer;
        this.secondaryRenderer = options.secondaryRenderer;
        this.symbolRenderer = options.symbolRenderer;
        
        // Define the circle configurations - which circle each planet type should be placed on
        this.circleConfigs = {
            // Primary planets placed on inner circle
            primary: {
                circle: 'inner'
            },
            // Secondary planets placed on innermost circle
            secondary: {
                circle: 'innermost'
            }
        };
    }
    
    /**
     * Calculates actual radius values based on circle configuration and chart dimensions
     * @param {string} planetType - Type of planet (primary, secondary, etc.)
     * @param {Object} config - Chart configuration with radius values
     * @returns {Object} Object with calculated dotRadius and iconRadius
     */
    calculateRadii(planetType, config = null) {
        const circleConfig = this.circleConfigs[planetType];
        if (!circleConfig) {
            console.error(`PlanetRendererCoordinator: No circle configuration found for planet type: ${planetType}`);
            return { dotRadius: null, iconRadius: null };
        }
        
        switch (planetType) {
            case 'primary':
                return this.primaryRenderer.calculateRadii(config);
            case 'secondary':
                return this.secondaryRenderer.calculateRadii(config);
            default:
                console.error(`PlanetRendererCoordinator: Unknown planet type: ${planetType}`);
                return { dotRadius: null, iconRadius: null };
        }
    }
    
    /**
     * Renders planets on the chart. Delegates to the appropriate specialized renderer.
     * @param {Element} parentGroup - The parent SVG group element.
     * @param {Array} planetsData - Array of planet objects { name: string, position: number }.
     * @param {number} houseRotationAngle - House system rotation angle.
     * @param {Object} options - Additional rendering options.
     * @returns {Array} Array of planet objects with added coordinates.
     */
    render(parentGroup, planetsData, houseRotationAngle = 0, options = {}) {
        // Determine planet type (primary or secondary)
        const planetType = options.type || 'primary';
        
        console.log(`PlanetRendererCoordinator: Rendering ${planetType} planets, count:`, planetsData.length);
        
        // Delegate to appropriate renderer based on planet type
        switch (planetType) {
            case 'primary':
                return this.primaryRenderer.render(parentGroup, planetsData, houseRotationAngle, options);
            case 'secondary':
                return this.secondaryRenderer.render(parentGroup, planetsData, houseRotationAngle, options);
            default:
                console.error(`PlanetRendererCoordinator: Unknown planet type: ${planetType}`);
                return [];
        }
    }
    
    /**
     * Renders both primary and secondary planets in one call.
     * This consolidated method handles rendering all planets.
     * 
     * @param {Object} params - Rendering parameters
     * @param {SVGManager} params.svgManager - SVG manager instance
     * @param {Object} params.planetsData - Planet data object
     * @param {Object} params.config - Chart configuration with radii
     * @param {boolean} params.primaryEnabled - Whether primary planets are enabled
     * @param {boolean} params.secondaryEnabled - Whether secondary planets are enabled
     * @returns {Object} Object containing both sets of rendered planets
     */
    renderAllPlanetTypes(params) {
        const { 
            svgManager, 
            planetsData, 
            config,
            enabledTypes = { primary: true, secondary: true }
        } = params;
        
        if (!svgManager || !planetsData || !config) {
            console.error("PlanetRendererCoordinator: Missing required parameters");
            return {};
        }
        
        // Convert planet data to array format, filtering by visibility
        const planetsArray = Object.entries(planetsData)
            .filter(([name, data]) => config.planetSettings.visible?.[name] !== false)
            .map(([name, data]) => ({
                name: name,
                position: data.lon,
                color: data.color || '#000000'
            }));
        
        const result = {};
        
        // Save and update center coordinates
        const originalCenterX = this.centerX;
        const originalCenterY = this.centerY;
        this.centerX = config.svg.center.x;
        this.centerY = config.svg.center.y;
        
        // Update center coordinates in specialized renderers too
        this.primaryRenderer.centerX = this.centerX;
        this.primaryRenderer.centerY = this.centerY;
        this.secondaryRenderer.centerX = this.centerX;
        this.secondaryRenderer.centerY = this.centerY;
        
        // Render primary planets if enabled
        if (enabledTypes.primary) {
            const primaryGroup = svgManager.getGroup('primaryPlanets');
            result.primary = this.primaryRenderer.render(primaryGroup, planetsArray, 0, {
                config: config
            });
            console.log(`PlanetRendererCoordinator: Rendered ${result.primary.length} primary planets`);
        } else {
            result.primary = [];
        }
        
        // Render secondary planets if enabled
        if (enabledTypes.secondary) {
            const secondaryGroup = svgManager.getGroup('secondaryPlanets');
            result.secondary = this.secondaryRenderer.render(secondaryGroup, planetsArray, 0, {
                config: config
            });
            console.log(`PlanetRendererCoordinator: Rendered ${result.secondary.length} secondary planets`);
        } else {
            result.secondary = [];
        }
        
        // Restore original center values
        this.centerX = originalCenterX;
        this.centerY = originalCenterY;
        this.primaryRenderer.centerX = originalCenterX;
        this.primaryRenderer.centerY = originalCenterY;
        this.secondaryRenderer.centerX = originalCenterX;
        this.secondaryRenderer.centerY = originalCenterY;
        
        return result;
    }
    
    /**
     * Legacy method - deprecated, use renderAllPlanetTypes instead
     */
    renderAllPlanets(params) {
        console.warn("PlanetRendererCoordinator: renderAllPlanets is deprecated, use renderAllPlanetTypes instead");
        return this.renderAllPlanetTypes(params);
    }
} 