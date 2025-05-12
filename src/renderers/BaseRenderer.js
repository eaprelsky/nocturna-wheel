/**
 * BaseRenderer.js
 * Self-contained base class for all renderers.
 * This version has all dependencies inlined to avoid import issues.
 */

// Define a completely self-contained renderer base class
export class BaseRenderer {
    /**
     * Constructor
     * @param {Object} options - Renderer options.
     * @param {string} options.svgNS - SVG namespace.
     * @param {Object} options.config - Chart configuration object.
     * @param {Object} options.svgUtils - SVG utility service.
     */
    constructor(options) {
        if (!options || !options.svgNS || !options.config) {
            throw new Error(`${this.constructor.name}: Missing required options (svgNS, config)`);
        }
        
        // Store base options
        this.svgNS = options.svgNS;
        this.config = options.config;
        this.options = options;
        
        // Use the provided svgUtils or create minimal internal SVG utilities
        this.svgUtils = options.svgUtils || {
            // Store SVG namespace
            svgNS: this.svgNS,
            
            // Create SVG element
            createSVGElement: (tagName, attributes = {}) => {
                const element = document.createElementNS(this.svgNS, tagName);
                for (const [key, value] of Object.entries(attributes)) {
                    element.setAttribute(key, value);
                }
                return element;
            },
            
            // Add tooltip to element
            addTooltip: (element, text) => {
                const title = document.createElementNS(this.svgNS, "title");
                title.textContent = text;
                element.appendChild(title);
                return element;
            },
            
            // Calculate point on circle
            pointOnCircle: (centerX, centerY, radius, angle) => {
                const radians = (angle - 90) * (Math.PI / 180);
                return {
                    x: centerX + radius * Math.cos(radians),
                    y: centerY + radius * Math.sin(radians)
                };
            }
        };
        
        // Get dimensions from config
        this.centerX = this.config.svg.center.x;
        this.centerY = this.config.svg.center.y;
        this.innerRadius = this.config.radius.zodiacInner;
        this.middleRadius = this.config.radius.zodiacMiddle;
        this.outerRadius = this.config.radius.zodiacOuter;
    }

    /**
     * Clears all child nodes of the given parent SVG group.
     * @param {Element} parentGroup - The SVG group to clear.
     */
    clearGroup(parentGroup) {
        if (parentGroup) {
            parentGroup.innerHTML = '';
        }
    }

    /**
     * Abstract render method to be implemented by subclasses.
     * @param {Element} parentGroup - The parent SVG group element.
     * @returns {Array} Array of rendered SVG elements.
     */
    render(parentGroup) {
        throw new Error(`${this.constructor.name}: render() not implemented.`);
    }
} 