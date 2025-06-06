/**
 * ChartRenderer.js
 * Responsible for rendering chart elements
 */
import { SvgUtils } from '../utils/SvgUtils';

export class ChartRenderer {
    /**
     * Constructor
     * @param {WheelChart} wheelChart - WheelChart instance
     * @param {Object} options - Chart options
     */
    constructor(wheelChart, options = {}) {
        this.wheelChart = wheelChart;  // Store reference to WheelChart instance
        this.chart = wheelChart.chart; // Store direct reference to underlying NocturnaWheel instance
        this.options = options;
        this.svgUtils = new SvgUtils();
        console.log("ChartRenderer: Initialized with chart", this.chart);
    }
    
    /**
     * Renders inner circle and planets
     */
    renderInnerElements() {
        // Make sure we have a valid NocturnaWheel instance with svgManager
        if (!this.chart || !this.chart.svgManager) {
            console.error("ChartRenderer: Invalid chart or missing svgManager");
            return;
        }
        
        const svg = this.chart.svgManager.getSVG();
        if (!svg) {
            console.error("ChartRenderer: SVG not found");
            return;
        }
        
        const zodiacGroup = this.chart.svgManager.getGroup('zodiac');
        if (!zodiacGroup) {
            console.error("ChartRenderer: Zodiac group not found");
            return;
        }
        
        // Remove only the previous innermost circle if it exists
        const prevCircle = zodiacGroup.querySelector('.chart-innermost-circle');
        if (prevCircle) {
            zodiacGroup.removeChild(prevCircle);
        }

        const centerX = this.chart.config.svg.center.x;
        const centerY = this.chart.config.svg.center.y;
        const c3Radius = this.chart.config.radius.innermost;     // C3
        
        // Only draw the innermost circle if secondary planets are enabled
        if (this.chart.config.planetSettings.secondaryEnabled !== false) {
            this.drawInnermostCircle(zodiacGroup, this.svgUtils, centerX, centerY, c3Radius);
        }
        
        // Note: Planet rendering is now fully handled by NocturnaWheel.js
        // using the PlanetRenderer.renderAllPlanetTypes method
        console.log('ChartRenderer: Innermost circle rendered (if enabled). Planet rendering is now handled by NocturnaWheel.');
    }
    
    /**
     * Draws the innermost circle
     * @param {SVGElement} zodiacGroup - SVG group for zodiac elements
     * @param {SvgUtils} svgUtils - SVG utilities
     * @param {number} centerX - X coordinate of center
     * @param {number} centerY - Y coordinate of center
     * @param {number} radius - Radius of circle
     */
    drawInnermostCircle(zodiacGroup, svgUtils, centerX, centerY, radius) {
        const innermostCircle = svgUtils.createSVGElement('circle', {
            cx: centerX,
            cy: centerY,
            r: radius,
            class: 'zodiac-element chart-innermost-circle'
        });
        zodiacGroup.appendChild(innermostCircle);
    }
    
    /**
     * @deprecated Planet rendering is now fully handled by NocturnaWheel
     */
    renderPlanets(centerX, centerY, dotRadius, iconRadius) {
        console.warn('ChartRenderer: renderPlanets is deprecated. Planet rendering is now handled by NocturnaWheel.');
        return [];
    }
    
    /**
     * @deprecated Use renderPlanets instead
     */
    drawPlanetsAndIcons(svgUtils, centerX, centerY, dotRadius, iconRadius) {
        console.warn('ChartRenderer: drawPlanetsAndIcons is deprecated, use renderPlanets instead');
        return this.renderPlanets(centerX, centerY, dotRadius, iconRadius);
    }
    
    /**
     * @deprecated 
     */
    drawPlanetDot(svgUtils, planetGroup, x, y, name, color) {
        console.warn('ChartRenderer: drawPlanetDot is deprecated');
        // No implementation - method kept for backward compatibility
    }
    
    /**
     * @deprecated 
     */
    drawPlanetIcon(svgUtils, planetGroup, x, y, name) {
        console.warn('ChartRenderer: drawPlanetIcon is deprecated');
        // No implementation - method kept for backward compatibility
    }
    
    /**
     * @deprecated 
     */
    drawConnector(svgUtils, planetGroup, x1, y1, x2, y2, name, color) {
        console.warn('ChartRenderer: drawConnector is deprecated');
        // No implementation - method kept for backward compatibility
    }
} 