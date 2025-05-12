/**
 * IconProvider.js
 * Service to handle all SVG icon path management and fallback strategies.
 * This ensures consistent icon handling across the application.
 */
export class IconProvider {
    /**
     * Constructor
     * @param {string} basePath - Base path for SVG assets
     */
    constructor(basePath = './assets/svg/zodiac/') {
        this.basePath = basePath;
    }

    /**
     * Gets the path to a planet icon
     * @param {string} planetName - Name of the planet
     * @returns {string} Full path to the SVG icon
     */
    getPlanetIconPath(planetName) {
        return `${this.basePath}zodiac-planet-${planetName.toLowerCase()}.svg`;
    }
    
    /**
     * Gets the path to a zodiac sign icon
     * @param {string} signName - Name of the zodiac sign
     * @returns {string} Full path to the SVG icon
     */
    getZodiacIconPath(signName) {
        return `${this.basePath}zodiac-sign-${signName.toLowerCase()}.svg`;
    }
    
    /**
     * Gets the path to an aspect icon
     * @param {string} aspectType - Type of the aspect
     * @returns {string} Full path to the SVG icon
     */
    getAspectIconPath(aspectType) {
        return `${this.basePath}zodiac-aspect-${aspectType.toLowerCase()}.svg`;
    }
    
    /**
     * Creates a text element as a fallback when SVG icons fail to load
     * @param {SvgUtils} svgUtils - The SvgUtils instance
     * @param {Object} options - Text element options
     * @param {number} options.x - X coordinate
     * @param {number} options.y - Y coordinate
     * @param {string} options.size - Font size (e.g., '16px')
     * @param {string} options.color - Text color
     * @param {string} options.className - CSS class name
     * @param {string} text - The text to display
     * @returns {Element} The created text element
     */
    createTextFallback(svgUtils, options, text) {
        const { x, y, size = '16px', color = '#000000', className = 'icon-fallback' } = options;
        
        const textElement = svgUtils.createSVGElement("text", {
            x: x,
            y: y,
            'text-anchor': 'middle',
            'dominant-baseline': 'middle',
            'font-size': size,
            'class': className,
            'fill': color
        });
        
        // Use the provided text
        textElement.textContent = text;
        return textElement;
    }
} 