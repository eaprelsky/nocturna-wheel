import { BasePlanetRenderer } from './BasePlanetRenderer.js';
import { AstrologyUtils } from '../utils/AstrologyUtils.js';

/**
 * PlanetSymbolRenderer.js
 * Class for rendering planet symbols and glyphs.
 */
export class PlanetSymbolRenderer extends BasePlanetRenderer {
    /**
     * Constructor
     * @param {Object} options - Renderer options.
     */
    constructor(options) {
        super(options);
    }
    
    /**
     * Renders a symbol for a planet
     * @param {Element} parentGroup - The parent SVG group
     * @param {Object} planet - Planet object with calculated positions
     * @param {number} iconSize - Size of the icon in pixels
     * @returns {Element} - The created symbol element
     */
    renderPlanetSymbol(parentGroup, planet, iconSize = 24) {
        // Get the icon path using IconProvider if available
        let iconPath;
        if (this.iconProvider) {
            iconPath = this.iconProvider.getPlanetIconPath(planet.name);
        } else {
            // Fallback to old path construction if IconProvider is not available
            const basePath = this.options.assetBasePath || this.assetBasePath || './assets/';
            iconPath = `${basePath}svg/zodiac/zodiac-planet-${planet.name.toLowerCase()}.svg`;
        }
        
        // Calculate top-left position of the icon (centered on the calculated point)
        const iconX = planet.adjustedIconX - iconSize/2;
        const iconY = planet.adjustedIconY - iconSize/2;
        
        // Get planet type for CSS classes
        const typeClass = planet.isPrimary ? 'primary' : 'secondary';
        
        const icon = this.svgUtils.createSVGElement("image", {
            x: iconX,
            y: iconY,
            width: iconSize,
            height: iconSize,
            href: iconPath,
            class: `planet-icon planet-${planet.name}-icon planet-${typeClass}-icon`
        });
        
        // Add error handling for missing icons
        icon.addEventListener('error', () => {
            console.warn(`Planet icon not found: ${iconPath}`);
            icon.setAttribute('href', ''); // Remove broken link
            
            // Create a text fallback with first letter
            const fallbackText = planet.name.charAt(0).toUpperCase();
            
            // Use IconProvider's createTextFallback if available
            let textIcon;
            if (this.iconProvider) {
                textIcon = this.iconProvider.createTextFallback(
                    this.svgUtils,
                    {
                        x: planet.adjustedIconX,
                        y: planet.adjustedIconY,
                        size: `${iconSize}px`,
                        color: planet.color || '#000000',
                        className: `planet-symbol planet-${planet.name}-symbol planet-${typeClass}-symbol`
                    },
                    fallbackText
                );
            } else {
                // Legacy fallback if IconProvider is not available
                textIcon = this.svgUtils.createSVGElement("text", {
                    x: planet.adjustedIconX,
                    y: planet.adjustedIconY,
                    'text-anchor': 'middle',
                    'dominant-baseline': 'middle',
                    'font-size': `${iconSize}px`,
                    class: `planet-symbol planet-${planet.name}-symbol planet-${typeClass}-symbol`,
                    fill: planet.color || '#000000'
                });
                textIcon.textContent = planet.name.charAt(0).toUpperCase();
            }
            
            parentGroup.appendChild(textIcon);
        });
        
        return icon;
    }
    
    /**
     * Renders a dot to mark the exact planet position
     * @param {Element} parentGroup - The parent SVG group
     * @param {Object} planet - Planet object with calculated positions
     * @param {number} dotSize - Size of the dot in pixels
     * @returns {Element} - The created dot element
     */
    renderPlanetDot(parentGroup, planet, dotSize = 3) {
        // Get planet type for CSS classes
        const typeClass = planet.isPrimary ? 'primary' : 'secondary';
        
        // Draw the position dot (small circle at exact planet position)
        const dot = this.svgUtils.createSVGElement("circle", {
            cx: planet.x,
            cy: planet.y,
            r: dotSize, // Small fixed size for position indicator
            class: `planet-dot planet-${planet.name}-dot planet-${typeClass}-dot`,
            fill: planet.color || '#000000'
        });
        
        return dot;
    }
    
    /**
     * Renders a connector line between the dot and symbol if they're far enough apart
     * @param {Element} parentGroup - The parent SVG group
     * @param {Object} planet - Planet object with calculated positions
     * @param {number} minDistance - Minimum distance required to draw a connector
     * @returns {Element|null} - The created connector element or null if not needed
     */
    renderConnector(parentGroup, planet, iconSize, minDistanceFactor = 0.3) {
        // Get planet type for CSS classes
        const typeClass = planet.isPrimary ? 'primary' : 'secondary';
        
        // Calculate distance between dot and adjusted icon position
        const distX = planet.x - planet.adjustedIconX;
        const distY = planet.y - planet.adjustedIconY;
        const distance = Math.sqrt(distX * distX + distY * distY);
        
        // Only draw connector if the distance is significant
        if (distance > iconSize * minDistanceFactor) {
            const connector = this.svgUtils.createSVGElement('line', {
                x1: planet.x,
                y1: planet.y,
                x2: planet.adjustedIconX,
                y2: planet.adjustedIconY,
                class: `planet-element planet-${planet.name.toLowerCase()} planet-connector planet-${typeClass}-connector`,
                stroke: planet.color || '#000000',
                'stroke-width': 0.75,
                'stroke-opacity': 0.5
            });
            
            return connector;
        }
        
        return null;
    }
    
    /**
     * Adds a tooltip to a planet element
     * @param {Element} element - Element to add tooltip to
     * @param {Object} planet - Planet object
     */
    addPlanetTooltip(element, planet) {
        const typeLabel = planet.isPrimary ? "Primary" : "Secondary";
        const tooltipText = `${typeLabel} ${AstrologyUtils.getPlanetFullName(planet.name)}: ${planet.position.toFixed(1)}° ${planet.zodiacSign.toUpperCase()} (${planet.position_in_sign.toFixed(1)}°)`;
        this.svgUtils.addTooltip(element, tooltipText);
    }
    
    /**
     * Render method implementation from BasePlanetRenderer
     * This should not be called directly in this class, but is needed to fulfill the interface
     */
    render(parentGroup, planetsData, houseRotationAngle = 0, options = {}) {
        throw new Error(`${this.constructor.name}: This is a utility renderer, use specific rendering methods instead.`);
    }
} 