/**
 * IconProvider.js
 * Service to handle all SVG icon path management and fallback strategies.
 * This ensures consistent icon handling across the application.
 * 
 * Supports two modes:
 * 1. Inline mode (default): Uses bundled data URLs for icons
 * 2. External mode: Uses external file paths (for custom icons)
 */

export class IconProvider {
    /**
     * Constructor
     * @param {Object} options - Configuration options
     * @param {string} options.basePath - Base path for external SVG assets
     * @param {boolean} options.useInline - Whether to use inline data URLs (default: true)
     * @param {Object} options.customIcons - Custom icon data URLs (optional)
     */
    constructor(options = {}) {
        // Support legacy string argument for backwards compatibility
        if (typeof options === 'string') {
            options = { basePath: options, useInline: false };
        }
        
        this.basePath = options.basePath || './assets/svg/zodiac/';
        this.useInline = options.useInline !== false; // Default to true
        this.customIcons = options.customIcons || null;
        
        // Lazy-load IconData on first use
        this.inlineData = null;
        
        // Track if warning was already shown (to avoid spam)
        this._warnedAboutMissingData = false;
    }
    
    /**
     * Gets inline icon data reference
     * @private
     */
    _getInlineData() {
        return this.inlineData;
    }
    
    /**
     * Sets the inline icon data (for manual initialization)
     * @param {Object} iconData - Icon data object with planets, signs, aspects
     */
    setInlineData(iconData) {
        this.inlineData = iconData;
        console.log('IconProvider.setInlineData(): Data loaded successfully',
            'planets:', Object.keys(iconData?.planets || {}).length,
            'signs:', Object.keys(iconData?.signs || {}).length,
            'aspects:', Object.keys(iconData?.aspects || {}).length
        );
    }

    /**
     * Gets the path or data URL for a planet icon
     * @param {string} planetName - Name of the planet
     * @returns {string} Data URL or file path to the SVG icon
     */
    getPlanetIconPath(planetName) {
        const name = planetName.toLowerCase();
        
        // Check custom icons first
        if (this.customIcons?.planets?.[name]) {
            return this.customIcons.planets[name];
        }
        
        // Try inline data URLs
        if (this.useInline) {
            const inlineData = this._getInlineData();
            if (inlineData?.planets?.[name]) {
                return inlineData.planets[name];
            } else {
                // Debug: log when inline data is not available (only once)
                if (!this._warnedAboutMissingData) {
                    this._warnedAboutMissingData = true;
                    if (!inlineData) {
                        console.warn(`IconProvider: Inline data not loaded, falling back to external paths. Call setInlineData() to load inline icons.`);
                    } else if (!inlineData.planets) {
                        console.warn(`IconProvider: Inline data missing 'planets' category`);
                    }
                }
            }
        }
        
        // Fallback to external path
        return `${this.basePath}zodiac-planet-${name}.svg`;
    }
    
    /**
     * Gets the path or data URL for a zodiac sign icon
     * @param {string} signName - Name of the zodiac sign
     * @returns {string} Data URL or file path to the SVG icon
     */
    getZodiacIconPath(signName) {
        const name = signName.toLowerCase();
        
        // Check custom icons first
        if (this.customIcons?.signs?.[name]) {
            return this.customIcons.signs[name];
        }
        
        // Try inline data URLs
        if (this.useInline) {
            const inlineData = this._getInlineData();
            if (inlineData?.signs?.[name]) {
                return inlineData.signs[name];
            }
        }
        
        // Fallback to external path
        return `${this.basePath}zodiac-sign-${name}.svg`;
    }
    
    /**
     * Gets the path or data URL for an aspect icon
     * @param {string} aspectType - Type of the aspect
     * @returns {string} Data URL or file path to the SVG icon
     */
    getAspectIconPath(aspectType) {
        const name = aspectType.toLowerCase();
        
        // Check custom icons first
        if (this.customIcons?.aspects?.[name]) {
            return this.customIcons.aspects[name];
        }
        
        // Try inline data URLs
        if (this.useInline) {
            const inlineData = this._getInlineData();
            if (inlineData?.aspects?.[name]) {
                return inlineData.aspects[name];
            }
        }
        
        // Fallback to external path
        return `${this.basePath}zodiac-aspect-${name}.svg`;
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