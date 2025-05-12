import { BaseRenderer } from './BaseRenderer.js';
import { AstrologyUtils } from '../utils/AstrologyUtils.js';

/**
 * HouseRenderer.js
 * Class for rendering astrological houses in a natal chart.
 */
export class HouseRenderer extends BaseRenderer {
    /**
     * Constructor
     * @param {Object} options - Renderer options.
     * @param {string} options.svgNS - SVG namespace.
     * @param {ChartConfig} options.config - Chart configuration object.
     * @param {Object} options.houseData - House cusps data (optional).
     */
    constructor(options) {
        super(options);
        this.houseData = options.houseData || [];
        // Specific radii for house renderer
        this.extendedRadius = this.outerRadius + 25;
        this.numberRadius = this.outerRadius + 30;
    }

    /**
     * Renders the house components.
     * @param {Element} parentGroup - The parent SVG group element.
     * @param {number} rotationAngle - Rotation angle for the house system (default: 0).
     * @returns {Array} Array of rendered SVG elements.
     */
    render(parentGroup, rotationAngle = 0) {
        if (!parentGroup) {
            console.error("HouseRenderer: parentGroup is null or undefined.");
            return [];
        }
        // Clear the group before rendering
        this.clearGroup(parentGroup);
        
        const renderedElements = [];
        
        renderedElements.push(...this.renderDivisions(parentGroup, rotationAngle));
        renderedElements.push(...this.renderNumbers(parentGroup, rotationAngle));
        
        console.log("HouseRenderer: Rendering complete.");
        return renderedElements;
    }

    /**
     * Renders the house division lines.
     * @param {Element} parentGroup - The parent SVG group.
     * @param {number} rotationAngle - Rotation angle for the house system.
     * @returns {Array<Element>} Array containing the created line elements.
     */
    renderDivisions(parentGroup, rotationAngle) {
        const elements = [];
        let ascendantAlignmentOffset = 0;
        
        // Log house data for debugging
        console.log("HouseRenderer: House data for divisions:", this.houseData);
        
        // Calculate offset only if house data is present
        if (this.houseData && this.houseData.length >= 12) {
            // Handle both legacy format { lon: value } and new format [value1, value2, ...]
            const ascendantLon = this.getHouseLongitude(this.houseData[0]);
            // Offset needed to place Ascendant (house 1 cusp) at 0 degrees (top side)
            ascendantAlignmentOffset = (360 - ascendantLon) % 360;
        }
        
        // Add division lines for 12 houses with rotation
        for (let i = 0; i < 12; i++) {
            // Use custom house positions if available, otherwise evenly distribute
            let baseAngle;
            if (this.houseData && this.houseData.length >= 12) {
                baseAngle = this.getHouseLongitude(this.houseData[i]);
            } else {
                baseAngle = i * 30; // Default if no data
            }
            // Apply alignment offset and user rotation
            const angle = (baseAngle + ascendantAlignmentOffset + rotationAngle) % 360;
            
            // Determine the house type/class for styling
            let axisClass = '';
            if (i === 0) axisClass = 'axis asc'; // ASC - Ascendant (1st house cusp)
            else if (i === 3) axisClass = 'axis ic'; // IC - Imum Coeli (4th house cusp)
            else if (i === 6) axisClass = 'axis dsc'; // DSC - Descendant (7th house cusp)
            else if (i === 9) axisClass = 'axis mc'; // MC - Medium Coeli (10th house cusp)
            
            // Calculate points for inner to middle circle lines
            const innerPoint = this.svgUtils.pointOnCircle(this.centerX, this.centerY, this.innerRadius, angle);
            const middlePoint = this.svgUtils.pointOnCircle(this.centerX, this.centerY, this.middleRadius, angle);
            
            // Create line from inner to middle circle
            const innerLine = this.svgUtils.createSVGElement("line", {
                x1: innerPoint.x,
                y1: innerPoint.y,
                x2: middlePoint.x,
                y2: middlePoint.y,
                class: `house-element house-division-line ${axisClass}`
            });
            
            // Ensure cardinal points render above zodiac lines
            if (axisClass.includes('axis')) {
                innerLine.style.zIndex = 10;
            }
            
            parentGroup.appendChild(innerLine);
            elements.push(innerLine);
            
            // Calculate points for middle to outer circle lines
            const outerPoint = this.svgUtils.pointOnCircle(this.centerX, this.centerY, this.outerRadius, angle);
            
            // We don't render the middle segment anymore (between middle and outer circles)
            // to avoid overlapping with zodiac signs
            
            // Calculate point for extended line outside of the outer circle
            const extendedPoint = this.svgUtils.pointOnCircle(this.centerX, this.centerY, this.extendedRadius, angle);
            
            // Create line from outer circle to extended point
            const outerLine = this.svgUtils.createSVGElement("line", {
                x1: outerPoint.x,
                y1: outerPoint.y,
                x2: extendedPoint.x,
                y2: extendedPoint.y,
                class: `house-element house-division-line outer ${axisClass}`
            });
            
            // Ensure cardinal points render above zodiac lines
            if (axisClass.includes('axis')) {
                outerLine.style.zIndex = 10;
            }
            
            parentGroup.appendChild(outerLine);
            elements.push(outerLine);
        }
        
        return elements;
    }

    /**
     * Renders the house numbers.
     * @param {Element} parentGroup - The parent SVG group.
     * @param {number} rotationAngle - Rotation angle for the house system.
     * @returns {Array<Element>} Array containing the created text elements.
     */
    renderNumbers(parentGroup, rotationAngle) {
        const elements = [];
        let ascendantAlignmentOffset = 0;
        
        // Log house data for debugging
        console.log("HouseRenderer: House data for numbers:", this.houseData);
        
        // Calculate offset only if house data is present
        if (this.houseData && this.houseData.length >= 12) {
            const ascendantLon = this.getHouseLongitude(this.houseData[0]);
            // Offset needed to place Ascendant (house 1 cusp) at 0 degrees (top side)
            ascendantAlignmentOffset = (360 - ascendantLon) % 360;
        }
        
        // Add Roman numerals for house numbers
        for (let i = 0; i < 12; i++) {
            // Get house angle with rotation
            let baseHouseAngle;
            if (this.houseData && this.houseData.length >= 12) {
                baseHouseAngle = this.getHouseLongitude(this.houseData[i]);
            } else {
                baseHouseAngle = i * 30; // Default if no data
            }
             // Apply alignment offset and user rotation
            const houseAngle = (baseHouseAngle + ascendantAlignmentOffset + rotationAngle) % 360;
            
            // Offset text from house line clockwise
            const angle = (houseAngle + 15) % 360; // Place in middle of house segment, apply modulo
            
            // Calculate position for house number
            const point = this.svgUtils.pointOnCircle(this.centerX, this.centerY, this.numberRadius, angle);
            
            // Create text element for house number
            const text = this.svgUtils.createSVGElement("text", {
                x: point.x,
                y: point.y,
                class: "house-element house-number"
            });
            
            // Set text alignment based on position
            if ((angle >= 315 || angle < 45)) {
                text.setAttribute("text-anchor", "middle");
                text.setAttribute("dominant-baseline", "auto");
            }
            // For right side (houses on right)
            else if (angle >= 45 && angle < 135) {
                text.setAttribute("text-anchor", "start");
                text.setAttribute("dominant-baseline", "middle");
            }
            // For bottom half (houses at bottom)
            else if (angle >= 135 && angle < 225) {
                text.setAttribute("text-anchor", "middle");
                text.setAttribute("dominant-baseline", "hanging");
            }
            // For left side (houses on left)
            else {
                text.setAttribute("text-anchor", "end");
                text.setAttribute("dominant-baseline", "middle");
            }
            
            // Set house number as text (Roman numeral)
            text.textContent = AstrologyUtils.houseToRoman(i + 1);
            
            // Add tooltip with house information
            this.svgUtils.addTooltip(text, `House ${i + 1}`);
            
            parentGroup.appendChild(text);
            elements.push(text);
        }
        
        return elements;
    }
    
    /**
     * Helper method to get the longitude from various house data formats
     * @param {Object|number} houseData - House cusp data (can be object with lon property or direct number)
     * @returns {number} The house cusp longitude in degrees
     */
    getHouseLongitude(houseData) {
        // Handle different data formats
        if (houseData === null || houseData === undefined) {
            console.warn("HouseRenderer: Null or undefined house data");
            return 0;
        }
        
        // If it's an object with a lon property (legacy format)
        if (typeof houseData === 'object' && houseData !== null && 'lon' in houseData) {
            return houseData.lon;
        }
        
        // If it's a direct number (new format from HouseCalculator)
        if (typeof houseData === 'number') {
            return houseData;
        }
        
        // If it's some other format we don't recognize
        console.warn("HouseRenderer: Unrecognized house data format", houseData);
        return 0;
    }
} 