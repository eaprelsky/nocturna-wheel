import { BasePlanetRenderer } from './BasePlanetRenderer.js';
import { PlanetPositionCalculator } from '../utils/PlanetPositionCalculator.js';

/**
 * SecondaryPlanetRenderer.js
 * Class for rendering secondary planets on the innermost circle of the chart.
 */
export class SecondaryPlanetRenderer extends BasePlanetRenderer {
    /**
     * Constructor
     * @param {Object} options - Renderer options.
     * @param {PlanetSymbolRenderer} options.symbolRenderer - The symbol renderer to use.
     */
    constructor(options) {
        super(options);
        
        this.symbolRenderer = options.symbolRenderer;
        
        // Define the circle configuration for secondary planets
        this.circleConfig = {
            circle: 'innermost'
        };
    }
    
    /**
     * Calculates actual radius values based on circle configuration and chart dimensions
     * @param {Object} config - Chart configuration with radius values
     * @returns {Object} Object with calculated dotRadius and iconRadius
     */
    calculateRadii(config = null) {
        const baseRadius = config?.radius?.innermost || (this.innerRadius * 0.5); // Fallback
        const nextRadius = config?.radius?.zodiacInner || this.innerRadius;
        
        // Fixed relationship between circle and dots/icons
        // - Dots are placed exactly on the circle
        // - Icons are placed halfway between this circle and the next
        const dotRadius = baseRadius;
        const iconRadius = baseRadius + (nextRadius - baseRadius) / 2;
        
        return { dotRadius, iconRadius };
    }
    
    /**
     * Adjusts the positions of overlapping planets.
     * @param {Array} planets - Array of planet objects.
     */
    adjustOverlappingPlanets(planets) {
        if (planets.length <= 1) return; // Nothing to adjust with 0 or 1 planets
        
        // Define parameters for collision detection and distribution
        const iconSize = 18; // Smaller size for secondary planets
        const baseRadius = planets[0].iconRadius; // Use the iconRadius from the first planet
        const minDistance = iconSize * 1.1; // Slightly tighter packing
        
        // Prepare planets array in format expected by PlanetPositionCalculator
        const positions = planets.map((planet, index) => ({
            x: planet.iconX,
            y: planet.iconY,
            iconX: planet.iconX,
            iconY: planet.iconY,
            iconCenterX: planet.iconX,
            iconCenterY: planet.iconY,
            longitude: planet.position,
            radius: baseRadius,
            originalIndex: index,
            name: planet.name
        }));
        
        // Use the PlanetPositionCalculator for overlap adjustment
        const adjustedPositions = PlanetPositionCalculator.adjustOverlaps(positions, {
            minDistance: minDistance,
            centerX: this.centerX,
            centerY: this.centerY,
            baseRadius: baseRadius,
            iconSize: iconSize
        });
        
        // Apply the adjusted positions back to the planets
        adjustedPositions.forEach((pos, idx) => {
            const planet = planets[idx];
            
            // Set the adjusted icon position
            planet.adjustedIconX = pos.iconCenterX;
            planet.adjustedIconY = pos.iconCenterY;
            
            // If there was an adjustment, store it
            if (pos.adjustedLongitude !== undefined) {
                planet.adjustedPosition = pos.adjustedLongitude;
            }
        });
    }
    
    /**
     * Renders secondary planets on the chart.
     * @param {Element} parentGroup - The parent SVG group element.
     * @param {Array} planetsData - Array of planet objects { name: string, position: number }.
     * @param {number} houseRotationAngle - House system rotation angle.
     * @param {Object} options - Additional rendering options.
     * @returns {Array} Array of planet objects with added coordinates.
     */
    render(parentGroup, planetsData, houseRotationAngle = 0, options = {}) {
        if (!parentGroup) {
            console.error("SecondaryPlanetRenderer: parentGroup is null or undefined.");
            return [];
        }
        
        // Calculate radii based on circle configuration
        const { dotRadius, iconRadius } = options.dotRadius && options.iconRadius 
            ? { dotRadius: options.dotRadius, iconRadius: options.iconRadius } 
            : this.calculateRadii(options.config || this.config);
        
        if (!dotRadius || !iconRadius) {
            console.error("SecondaryPlanetRenderer: Could not determine radius values");
            return [];
        }
        
        // Clear the group before rendering new planets
        this.clearGroup(parentGroup);
        
        // Prepare planets with additional properties
        const planets = this.preparePlanetData(planetsData, 'secondary', dotRadius, iconRadius);
        
        // Sort planets by position for overlap calculations
        planets.sort((a, b) => a.position - b.position);
        
        // Calculate base positions (dot and icon)
        this.calculateBasePositions(planets, dotRadius, iconRadius);
        
        // Calculate adjustments for overlapping planets
        this.adjustOverlappingPlanets(planets);
        
        // Draw the planets onto the SVG group
        this.drawPlanets(parentGroup, planets);
        
        // Return the planets array with calculated coordinates
        return planets;
    }
    
    /**
     * Draw the planets on the SVG group with their dots and icons.
     * @param {Element} parentGroup - The parent SVG group.
     * @param {Array} planets - Array of planet objects with calculated positions.
     */
    drawPlanets(parentGroup, planets) {
        const iconSize = 18; // Smaller icon size for secondary planets
        
        planets.forEach(planet => {
            // Create group for this planet (contains dot, symbol, and connector)
            const planetGroup = this.svgUtils.createSVGElement("g", {
                'data-planet': planet.name,
                'data-type': planet.type,
                class: `planet-element planet-${planet.name} planet-secondary`,
                transform: `translate(0,0)`
            });
            
            // Render planet dot with smaller size
            const dot = this.symbolRenderer.renderPlanetDot(planetGroup, planet, 2);
            planetGroup.appendChild(dot);
            
            // Render planet symbol with smaller size
            const icon = this.symbolRenderer.renderPlanetSymbol(planetGroup, planet, iconSize);
            planetGroup.appendChild(icon);
            
            // Add tooltip
            this.symbolRenderer.addPlanetTooltip(planetGroup, planet);
            
            // Render connector if needed
            const connector = this.symbolRenderer.renderConnector(planetGroup, planet, iconSize);
            if (connector) {
                planetGroup.appendChild(connector);
            }
            
            // Add to parent group
            parentGroup.appendChild(planetGroup);
        });
    }
} 