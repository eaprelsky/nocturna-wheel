/**
 * BaseRenderer.js
 * Abstract base class for all renderers, providing common setup and utilities.
 */
export class BaseRenderer {
    /**
     * Constructor
     * @param {Object} options - Renderer options.
     * @param {string} options.svgNS - SVG namespace.
     * @param {ChartConfig} options.config - Chart configuration object.
     */
    constructor(options) {
        if (!options || !options.svgNS || !options.config) {
            throw new Error(`${this.constructor.name}: Missing required options (svgNS, config)`);
        }
        this.svgNS = options.svgNS;
        this.config = options.config;
        this.options = options;
        this.svgUtils = new SvgUtils();
        // Center and radii from config
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