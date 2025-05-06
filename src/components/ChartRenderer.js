/**
 * ChartRenderer.js
 * Responsible for rendering chart elements
 */
class ChartRenderer {
    /**
     * Constructor
     * @param {NocturnaWheel} chart - Chart instance
     * @param {Object} options - Chart options
     */
    constructor(chart, options) {
        this.chart = chart;
        this.options = options;
    }
    
    /**
     * Renders inner circle and planets
     */
    renderInnerElements() {
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
        
        const svgUtils = new SvgUtils();
        const centerX = this.chart.config.svg.center.x;
        const centerY = this.chart.config.svg.center.y;
        const c3Radius = this.chart.config.radius.innermost;     // C3
        const c4Radius = this.chart.config.radius.zodiacInner;   // C4
        const iconRadius = (c3Radius + c4Radius) / 2;            // midpoint
        
        // Draw innermost circle
        this.drawInnermostCircle(zodiacGroup, svgUtils, centerX, centerY, c3Radius);
        
        // Draw planets and their icons
        this.drawPlanetsAndIcons(svgUtils, centerX, centerY, c3Radius, iconRadius);
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
     * Draws planets and their icons
     * @param {SvgUtils} svgUtils - SVG utilities
     * @param {number} centerX - X coordinate of center
     * @param {number} centerY - Y coordinate of center
     * @param {number} dotRadius - Radius for planet dots
     * @param {number} iconRadius - Radius for planet icons
     */
    drawPlanetsAndIcons(svgUtils, centerX, centerY, dotRadius, iconRadius) {
        const planetGroup = this.chart.svgManager.getGroup('planets');
        const planetsData = this.options.planets || {};
        const iconSize = 24;
        
        // Convert planet data to format expected by PlanetPositionCalculator
        const planetPositions = [];
        
        Object.entries(planetsData).forEach(([name, data]) => {
            // Calculate dot position
            const dotPosition = PlanetPositionCalculator.calculatePosition({
                centerX, 
                centerY, 
                radius: dotRadius, 
                longitude: data.lon,
                iconSize
            });
            
            // Calculate icon position
            const iconPosition = PlanetPositionCalculator.calculatePosition({
                centerX, 
                centerY, 
                radius: iconRadius, 
                longitude: data.lon,
                iconSize
            });
            
            planetPositions.push({
                name,
                color: data.color || '#000000',
                longitude: data.lon,
                dotX: dotPosition.x,
                dotY: dotPosition.y,
                iconX: iconPosition.iconX,
                iconY: iconPosition.iconY
            });
        });
        
        // Check for overlaps and adjust if necessary
        const adjustedPositions = PlanetPositionCalculator.adjustOverlaps(
            planetPositions,
            {
                minDistance: iconSize * 1.2,
                centerX,
                centerY,
                baseRadius: iconRadius,
                iconSize
            }
        );
        
        // Render planets with adjusted positions
        adjustedPositions.forEach(planet => {
            // Draw planet dot
            this.drawPlanetDot(svgUtils, planetGroup, planet.dotX, planet.dotY, planet.name, planet.color);
            
            // Draw planet icon
            this.drawPlanetIcon(svgUtils, planetGroup, planet.iconX, planet.iconY, planet.name);
            
            // Draw connector line if the dot and icon are far enough apart
            const distX = planet.dotX - (planet.iconX + iconSize/2);
            const distY = planet.dotY - (planet.iconY + iconSize/2);
            const distance = Math.sqrt(distX * distX + distY * distY);
            
            if (distance > iconSize * 0.3) {
                this.drawConnector(svgUtils, planetGroup, planet.dotX, planet.dotY, 
                    planet.iconX + iconSize/2, planet.iconY + iconSize/2, planet.name, planet.color);
            }
        });
    }
    
    /**
     * Draws a planet dot
     * @param {SvgUtils} svgUtils - SVG utilities
     * @param {SVGElement} planetGroup - SVG group for planets
     * @param {number} x - X coordinate of dot
     * @param {number} y - Y coordinate of dot
     * @param {string} name - Planet name
     * @param {string} color - Dot color
     */
    drawPlanetDot(svgUtils, planetGroup, x, y, name, color) {
        const dot = svgUtils.createSVGElement('circle', {
            cx: x,
            cy: y,
            r: 3,
            class: `planet-element planet-${name.toLowerCase()} planet-dot`,
            fill: color
        });
        planetGroup.appendChild(dot);
    }
    
    /**
     * Draws a planet icon
     * @param {SvgUtils} svgUtils - SVG utilities
     * @param {SVGElement} planetGroup - SVG group for planets
     * @param {number} x - X coordinate of icon (top-left)
     * @param {number} y - Y coordinate of icon (top-left)
     * @param {string} name - Planet name
     */
    drawPlanetIcon(svgUtils, planetGroup, x, y, name) {
        const iconSize = 24;
        const iconPath = `${this.chart.config.assets.basePath}${this.chart.config.assets.planetIconPath}zodiac-planet-${name.toLowerCase()}.svg`;
        
        const icon = svgUtils.createSVGElement('image', {
            x: x,
            y: y,
            width: iconSize,
            height: iconSize,
            href: iconPath,
            class: `planet-element planet-${name.toLowerCase()} planet-icon`
        });
        planetGroup.appendChild(icon);
    }
    
    /**
     * Draws a connector line between dot and icon
     * @param {SvgUtils} svgUtils - SVG utilities
     * @param {SVGElement} planetGroup - SVG group for planets
     * @param {number} x1 - X coordinate of start point
     * @param {number} y1 - Y coordinate of start point
     * @param {number} x2 - X coordinate of end point
     * @param {number} y2 - Y coordinate of end point
     * @param {string} name - Planet name
     * @param {string} color - Line color
     */
    drawConnector(svgUtils, planetGroup, x1, y1, x2, y2, name, color) {
        const connector = svgUtils.createSVGElement('line', {
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2,
            class: `planet-element planet-${name.toLowerCase()} planet-connector`,
            stroke: color,
            'stroke-width': 0.75,
            'stroke-opacity': 0.5
        });
        planetGroup.appendChild(connector);
    }
} 