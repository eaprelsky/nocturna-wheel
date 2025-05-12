/**
 * SvgUtils.js
 * Utility class for working with SVG elements
 */
export class SvgUtils {
    constructor() {
        this.svgNS = "http://www.w3.org/2000/svg";
    }

    /**
     * Creates an SVG element with the specified tag
     * @param {string} tagName - Name of the SVG tag
     * @param {Object} attributes - Object with attributes to set
     * @returns {Element} Created SVG element
     */
    createSVGElement(tagName, attributes = {}) {
        const element = document.createElementNS(this.svgNS, tagName);
        
        for (const [key, value] of Object.entries(attributes)) {
            element.setAttribute(key, value);
        }
        
        return element;
    }

    /**
     * Adds a tooltip (title) to an SVG element
     * @param {Element} element - SVG element
     * @param {string} text - Tooltip text
     * @returns {Element} The element with tooltip
     */
    addTooltip(element, text) {
        const title = document.createElementNS(this.svgNS, "title");
        title.textContent = text;
        element.appendChild(title);
        return element;
    }

    /**
     * Calculates coordinates of a point on a circle
     * @param {number} centerX - X coordinate of the center
     * @param {number} centerY - Y coordinate of the center
     * @param {number} radius - Circle radius
     * @param {number} angle - Angle in degrees
     * @returns {Object} Object with x and y coordinates
     */
    pointOnCircle(centerX, centerY, radius, angle) {
        // Convert angle to radians (accounting for 0 starting at the top)
        const radians = (angle - 90) * (Math.PI / 180);
        
        return {
            x: centerX + radius * Math.cos(radians),
            y: centerY + radius * Math.sin(radians)
        };
    }
} 