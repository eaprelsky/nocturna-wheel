/**
 * RendererFactory.js
 * Factory class for creating renderer instances with proper dependency injection.
 */
import { ServiceRegistry } from '../services/ServiceRegistry.js';
import { ZodiacRenderer } from '../renderers/ZodiacRenderer.js';
import { HouseRenderer } from '../renderers/HouseRenderer.js';
import { PlanetRenderer } from '../renderers/PlanetRenderer.js';
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
     * @param {Object} options - Additional options for the renderer
     * @returns {PlanetRenderer} The PlanetRenderer instance
     */
    createPlanetRenderer(options = {}) {
        return new PlanetRenderer({
            svgNS: this.svgNS,
            config: this.config,
            svgUtils: this.svgUtils,
            iconProvider: this.iconProvider,
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