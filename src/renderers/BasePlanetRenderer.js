import { BaseRenderer } from './BaseRenderer.js';
import { AstrologyUtils } from '../utils/AstrologyUtils.js';

/**
 * BasePlanetRenderer.js
 * Base class for all planet renderers, extending BaseRenderer.
 * Contains common functionality used by specialized planet renderers.
 */
export class BasePlanetRenderer extends BaseRenderer {
    /**
     * Constructor
     * @param {Object} options - Renderer options.
     * @param {string} options.svgNS - SVG namespace.
     * @param {ChartConfig} options.config - Chart configuration object.
     * @param {string} options.assetBasePath - Base path for assets.
     * @param {IconProvider} [options.iconProvider] - Icon provider service.
     */
    constructor(options) {
        super(options);
        
        // Store the icon provider
        this.iconProvider = options.iconProvider;
        
        // assetBasePath is required only if IconProvider is not available
        if (!options.assetBasePath && !this.iconProvider) {
            throw new Error(`${this.constructor.name}: Missing required option assetBasePath or iconProvider`);
        }
        
        // Set default assetBasePath if not provided (for backward compatibility)
        this.assetBasePath = options.assetBasePath || './assets/';
    }

    /**
     * Calculate base positions (dot and icon) for planets.
     * @param {Array} planets - Array of planet objects.
     * @param {number} dotRadius - Radius for planet dots
     * @param {number} iconRadius - Radius for planet icons
     */
    calculateBasePositions(planets, dotRadius, iconRadius) {
        planets.forEach(planet => {
            // Convert position to radians (0 degrees = East, anti-clockwise)
            // Subtract 90 to make 0 degrees = North (top)
            const radians = (planet.position - 90) * (Math.PI / 180);
            planet.radians = radians;

            // Calculate position on the dot radius circle
            const point = this.svgUtils.pointOnCircle(this.centerX, this.centerY, dotRadius, planet.position);
            planet.x = point.x;
            planet.y = point.y;

            // Calculate base position for the planet icon
            const iconPoint = this.svgUtils.pointOnCircle(this.centerX, this.centerY, iconRadius, planet.position);
            planet.iconX = iconPoint.x;
            planet.iconY = iconPoint.y;

            // Initialize adjusted coordinates to base coordinates
            planet.adjustedIconX = planet.iconX;
            planet.adjustedIconY = planet.iconY;
        });
    }

    /**
     * Prepare planet data with common properties.
     * @param {Array} planetsData - Raw planet data
     * @param {string} planetType - Type of planet ('primary' or 'secondary')
     * @param {number} dotRadius - Radius for planet dots
     * @param {number} iconRadius - Radius for planet icons
     * @returns {Array} - Prepared planet data with calculated properties
     */
    preparePlanetData(planetsData, planetType, dotRadius, iconRadius) {
        return planetsData.map(p => ({
            ...p,
            name: p.name || 'unknown',
            position: p.position !== undefined ? p.position : 0,
            // Fields to be calculated:
            x: 0, y: 0, // Dot coordinates
            iconX: 0, iconY: 0, // Base icon coordinates
            adjustedIconX: 0, adjustedIconY: 0, // Icon coordinates after overlap adjustment
            radians: 0,
            // Calculate sign index and get name from AstrologyUtils
            zodiacSign: AstrologyUtils.getZodiacSigns()[Math.floor(p.position / 30) % 12],
            position_in_sign: p.position % 30, // Calculate position within sign
            isPrimary: planetType === 'primary',
            type: planetType,
            color: p.color || '#000000',
            // Retrograde flag - whether the planet is retrograde
            retrograde: p.retrograde === true,
            // Track which radius this planet is being rendered at
            dotRadius: dotRadius,
            iconRadius: iconRadius
        }));
    }

    /**
     * Abstract method to be implemented by subclasses.
     * @param {Element} parentGroup - The parent SVG group element.
     * @param {Array} planetsData - Array of planet objects { name: string, position: number }.
     * @param {number} houseRotationAngle - House system rotation angle.
     * @param {Object} options - Additional rendering options.
     * @returns {Array} - Array of planet objects with added coordinates.
     */
    render(parentGroup, planetsData, houseRotationAngle = 0, options = {}) {
        throw new Error(`${this.constructor.name}: render() not implemented.`);
    }
} 