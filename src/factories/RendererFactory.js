/**
 * RendererFactory.js
 * Factory class for creating renderer instances with proper dependency injection.
 */
import { ServiceRegistry } from '../services/ServiceRegistry.js';
import { ZodiacRenderer } from '../renderers/ZodiacRenderer.js';
import { HouseRenderer } from '../renderers/HouseRenderer.js';
import { PlanetSymbolRenderer } from '../renderers/PlanetSymbolRenderer.js';
import { PrimaryPlanetRenderer } from '../renderers/PrimaryPlanetRenderer.js';
import { SecondaryPlanetRenderer } from '../renderers/SecondaryPlanetRenderer.js';
import { PlanetRendererCoordinator } from '../renderers/PlanetRendererCoordinator.js';
import { ClientSideAspectRenderer } from '../renderers/ClientSideAspectRenderer.js';

export class RendererFactory {
    /**
     * Constructor
     * @param {Object} config - Chart configuration
     * @param {string} svgNS - SVG namespace
     */
    constructor(config, svgNS) {
        this.config = config;
        this.svgNS = svgNS;
        this.svgUtils = ServiceRegistry.getSvgUtils();
        this.iconProvider = ServiceRegistry.getIconProvider(config.assets?.basePath);
    }
    
    /**
     * Creates a ZodiacRenderer instance
     * @param {Object} options - Additional options for the renderer
     * @returns {ZodiacRenderer} The ZodiacRenderer instance
     */
    createZodiacRenderer(options = {}) {
        return new ZodiacRenderer({
            svgNS: this.svgNS,
            config: this.config,
            svgUtils: this.svgUtils,
            iconProvider: this.iconProvider,
            ...options
        });
    }
    
    /**
     * Creates a HouseRenderer instance
     * @param {Object} options - Additional options for the renderer
     * @returns {HouseRenderer} The HouseRenderer instance
     */
    createHouseRenderer(options = {}) {
        return new HouseRenderer({
            svgNS: this.svgNS,
            config: this.config,
            svgUtils: this.svgUtils,
            iconProvider: this.iconProvider,
            ...options
        });
    }
    
    /**
     * Creates a PlanetRenderer instance
     * This now creates a PlanetRendererCoordinator with specialized renderers
     * @param {Object} options - Additional options for the renderer
     * @returns {PlanetRendererCoordinator} The PlanetRendererCoordinator instance
     */
    createPlanetRenderer(options = {}) {
        // First create the symbol renderer
        const symbolRenderer = new PlanetSymbolRenderer({
            svgNS: this.svgNS,
            config: this.config,
            svgUtils: this.svgUtils,
            iconProvider: this.iconProvider,
            assetBasePath: options.assetBasePath || this.config.assets?.basePath,
            ...options
        });
        
        // Create primary planet renderer
        const primaryRenderer = new PrimaryPlanetRenderer({
            svgNS: this.svgNS,
            config: this.config,
            svgUtils: this.svgUtils,
            iconProvider: this.iconProvider,
            symbolRenderer: symbolRenderer,
            assetBasePath: options.assetBasePath || this.config.assets?.basePath,
            ...options
        });
        
        // Create secondary planet renderer
        const secondaryRenderer = new SecondaryPlanetRenderer({
            svgNS: this.svgNS,
            config: this.config,
            svgUtils: this.svgUtils,
            iconProvider: this.iconProvider,
            symbolRenderer: symbolRenderer,
            assetBasePath: options.assetBasePath || this.config.assets?.basePath,
            ...options
        });
        
        // Create and return the coordinator
        return new PlanetRendererCoordinator({
            svgNS: this.svgNS,
            config: this.config,
            svgUtils: this.svgUtils,
            iconProvider: this.iconProvider,
            primaryRenderer: primaryRenderer,
            secondaryRenderer: secondaryRenderer,
            symbolRenderer: symbolRenderer,
            assetBasePath: options.assetBasePath || this.config.assets?.basePath,
            ...options
        });
    }
    
    /**
     * Creates a ClientSideAspectRenderer instance
     * @param {Object} options - Additional options for the renderer
     * @returns {ClientSideAspectRenderer} The ClientSideAspectRenderer instance
     */
    createAspectRenderer(options = {}) {
        return new ClientSideAspectRenderer({
            svgNS: this.svgNS,
            config: this.config,
            svgUtils: this.svgUtils,
            iconProvider: this.iconProvider,
            ...options
        });
    }
} 