import { BaseRenderer } from './BaseRenderer.js';
import { AstrologyUtils } from '../utils/AstrologyUtils.js';
import { PlanetPositionCalculator } from '../utils/PlanetPositionCalculator.js';

/**
 * PlanetRenderer.js
 * Class for rendering planets on the natal chart wheel.
 */
export class PlanetRenderer extends BaseRenderer {
    /**
     * Constructor
     * @param {Object} options - Renderer options.
     * @param {string} options.svgNS - SVG namespace.
     * @param {ChartConfig} options.config - Chart configuration object.
     * @param {string} options.assetBasePath - Base path for assets.
     * @param {IconProvider} [options.iconProvider] - Icon provider service.
     */
    constructor(options) {
        super(options);
        if (!options.assetBasePath) {
            throw new Error("PlanetRenderer: Missing required option assetBasePath");
        }
        
        // Store the icon provider
        this.iconProvider = options.iconProvider;
        
        // Define the default circle configurations - which circle each planet type should be placed on
        this.circleConfigs = {
            // Primary planets placed on inner circle
            primary: {
                circle: 'inner'
            },
            // Secondary planets placed on innermost circle
            secondary: {
                circle: 'innermost'
            }
            // Can easily add more planet types here, e.g.:
            // transit: { circle: 'outer' }
        };
        
        // Define layers for overlap adjustments
        this.iconRadiusLayers = [
            this.innerRadius + 5,
            (this.innerRadius + this.middleRadius) / 2,
            this.middleRadius - 5
        ].sort((a, b) => a - b);
    }

    /**
     * Calculates actual radius values based on circle configuration and chart dimensions
     * @param {string} planetType - Type of planet (primary, secondary, etc.)
     * @param {Object} config - Chart configuration with radius values
     * @returns {Object} Object with calculated dotRadius and iconRadius
     */
    calculateRadii(planetType, config = null) {
        const circleConfig = this.circleConfigs[planetType];
        if (!circleConfig) {
            console.error(`PlanetRenderer: No circle configuration found for planet type: ${planetType}`);
            return { dotRadius: null, iconRadius: null };
        }
        
        let baseRadius, nextRadius;
        
        // Determine which circle to use and its dimensions
        switch (circleConfig.circle) {
            case 'inner':
                baseRadius = config?.radius?.inner || this.innerRadius;
                nextRadius = config?.radius?.middle || this.middleRadius;
                break;
            case 'innermost':
                baseRadius = config?.radius?.innermost || (this.innerRadius * 0.5); // Fallback
                nextRadius = config?.radius?.zodiacInner || this.innerRadius;
                break;
            // Can add more circle types as needed:
            // case 'outer':
            //     baseRadius = config?.radius?.outer || this.outerRadius;
            //     nextRadius = some other reference radius;
            //     break;
            default:
                console.error(`PlanetRenderer: Unknown circle type: ${circleConfig.circle}`);
                return { dotRadius: null, iconRadius: null };
        }
        
        // Fixed relationship between circle and dots/icons
        // - Dots are placed exactly on the circle
        // - Icons are placed halfway between this circle and the next
        const dotRadius = baseRadius;
        const iconRadius = baseRadius + (nextRadius - baseRadius) / 2;
        
        return { dotRadius, iconRadius };
    }

    /**
     * Renders the provided planets on the chart.
     * @param {Element} parentGroup - The parent SVG group element.
     * @param {Array} planetsData - Array of planet objects { name: string, position: number }.
     * @param {number} houseRotationAngle - (currently unused, but kept for potential future use)
     * @param {Object} options - Additional rendering options
     * @param {number} options.dotRadius - Custom radius for planet dots (optional)
     * @param {number} options.iconRadius - Custom radius for planet icons (optional)
     * @param {string} options.type - Type of planets: 'primary' or 'secondary' (optional, default: 'primary')
     * @returns {Array} Array of planet objects with added coordinates (x, y) and other calculated data.
     */
    render(parentGroup, planetsData, houseRotationAngle = 0, options = {}) {
        if (!parentGroup) {
             console.error("PlanetRenderer: parentGroup is null or undefined.");
             return [];
        }
        
        // Determine planet type (primary or secondary)
        const planetType = options.type || 'primary';
        
        console.log(`PlanetRenderer: Rendering ${planetType} planets, count:`, planetsData.length);

        // Calculate radii based on circle configuration
        let dotRadius, iconRadius;
        
        // If explicit radii are provided, use those
        if (options.dotRadius && options.iconRadius) {
            dotRadius = options.dotRadius;
            iconRadius = options.iconRadius;
        } else {
            // Otherwise calculate from circle configuration
            const radii = this.calculateRadii(planetType, options.config || this.config);
            dotRadius = radii.dotRadius;
            iconRadius = radii.iconRadius;
        }
        
        if (!dotRadius || !iconRadius) {
            console.error(`PlanetRenderer: Could not determine radius values for ${planetType} planets`);
            return [];
        }
        
        console.log(`PlanetRenderer: Using dotRadius: ${dotRadius}, iconRadius: ${iconRadius} for ${planetType} planets`);
        
        // Clear the group before rendering new planets
        this.clearGroup(parentGroup);

        // Create internal representation with space for calculated values
        const planets = planetsData.map(p => ({
            ...p,
            name: p.name || 'unknown',
            position: p.position !== undefined ? p.position : 0,
            // Fields to be calculated:
            x: 0, y: 0, // Dot coordinates
            iconX: 0, iconY: 0, // Base icon coordinates
            adjustedIconX: 0, adjustedIconY: 0, // Icon coordinates after overlap adjustment
            radians: 0,
            // Calculate sign index and get name from AstrologyUtils
            zodiacSign: AstrologyUtils.getZodiacSigns()[Math.floor(p.position / 30) % 12],
            position_in_sign: p.position % 30, // Calculate position within sign
            isPrimary: planetType === 'primary',
            type: planetType,
            color: p.color || '#000000',
            // Track which radius this planet is being rendered at
            dotRadius: dotRadius,
            iconRadius: iconRadius
        }));

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
     * Renders both primary and secondary planets in one call.
     * This consolidated method handles rendering all planets.
     * 
     * @param {Object} params - Rendering parameters
     * @param {SVGManager} params.svgManager - SVG manager instance
     * @param {Object} params.planetsData - Planet data object
     * @param {Object} params.config - Chart configuration with radii
     * @param {boolean} params.primaryEnabled - Whether primary planets are enabled
     * @param {boolean} params.secondaryEnabled - Whether secondary planets are enabled
     * @returns {Object} Object containing both sets of rendered planets
     */
    renderAllPlanetTypes(params) {
        const { 
            svgManager, 
            planetsData, 
            config,
            planetTypes = ['primary', 'secondary'],
            enabledTypes = { primary: true, secondary: true }
        } = params;
        
        if (!svgManager || !planetsData || !config) {
            console.error("PlanetRenderer: Missing required parameters");
            return {};
        }
        
        // Convert planet data to array format, filtering by visibility
        const planetsArray = Object.entries(planetsData)
            .filter(([name, data]) => config.planetSettings.visible?.[name] !== false)
            .map(([name, data]) => ({
                name: name,
                position: data.lon,
                color: data.color || '#000000'
            }));
        
        const result = {};
        
        // Save and update center coordinates
        const originalCenterX = this.centerX;
        const originalCenterY = this.centerY;
        this.centerX = config.svg.center.x;
        this.centerY = config.svg.center.y;
        
        // Render each enabled planet type
        Object.keys(enabledTypes).forEach(type => {
            if (enabledTypes[type] && planetTypes.includes(type)) {
                const typeGroup = svgManager.getGroup(`${type}Planets`);
                
                // Let the renderer calculate radii based on circle configuration
                result[type] = this.render(typeGroup, planetsArray, 0, {
                    type: type,
                    config: config // Pass the config for radius calculations
                });
                
                console.log(`PlanetRenderer: Rendered ${result[type].length} ${type} planets`);
            }
        });
        
        // Restore original center values
        this.centerX = originalCenterX;
        this.centerY = originalCenterY;
        
        return result;
    }

    // Legacy method - deprecated, use renderAllPlanetTypes instead
    renderAllPlanets(params) {
        console.warn("PlanetRenderer: renderAllPlanets is deprecated, use renderAllPlanetTypes instead");
        return this.renderAllPlanetTypes(params);
    }

    /**
     * Calculates base positions (dot and icon) for planets.
     * @param {Array} planets - Array of planet objects.
     * @param {number} dotRadius - Radius for planet dots
     * @param {number} iconRadius - Radius for planet icons
     */
    calculateBasePositions(planets, dotRadius, iconRadius) {
        planets.forEach(planet => {
            // Convert position to radians (0 degrees = East, anti-clockwise)
            // Subtract 90 to make 0 degrees = North (top)
            const radians = (planet.position - 90) * (Math.PI / 180);
            planet.radians = radians;

            // Calculate position on the dot radius circle
            // Use position directly with pointOnCircle which expects degrees
            const point = this.svgUtils.pointOnCircle(this.centerX, this.centerY, dotRadius, planet.position);
            console.log(`PlanetRenderer: Calculated dot position for ${planet.name}:`, JSON.stringify(point)); // Log the calculated point
            planet.x = point.x;
            planet.y = point.y;
            console.log(`PlanetRenderer: Assigned planet.x=${planet.x}, planet.y=${planet.y} for ${planet.name}`); // Log assigned values

            // Calculate base position for the planet icon
            const iconPoint = this.svgUtils.pointOnCircle(this.centerX, this.centerY, iconRadius, planet.position);
            // Store base icon coordinates (center of icon)
            console.log(`PlanetRenderer: Calculated icon position for ${planet.name}:`, JSON.stringify(iconPoint)); // Log the calculated icon point
            planet.iconX = iconPoint.x;
            planet.iconY = iconPoint.y;
            console.log(`PlanetRenderer: Assigned planet.iconX=${planet.iconX}, planet.iconY=${planet.iconY} for ${planet.name}`); // Log assigned icon values

            // Initialize adjusted coordinates to base coordinates
            planet.adjustedIconX = planet.iconX;
            planet.adjustedIconY = planet.iconY;
        });
    }

    /**
     * Adjusts the positions of overlapping planets.
     * @param {Array} planets - Array of planet objects.
     */
    adjustOverlappingPlanets(planets) {
        if (planets.length <= 1) return; // Nothing to adjust with 0 or 1 planets
        
        const planetType = planets[0].type || 'primary';
        console.log(`PlanetRenderer: Adjusting overlapping ${planetType} planets, count: ${planets.length}`);
        
        // Define parameters for collision detection and distribution
        const iconSize = 24;
        // Use the iconRadius from the first planet (they should all be the same)
        const baseRadius = planets[0].iconRadius; 
        const minDistance = iconSize * 1.2;
        
        console.log(`PlanetRenderer: Using baseRadius: ${baseRadius}, minDistance: ${minDistance}`);
        
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
            name: planet.name // Include name for better logging
        }));
        
        // Use the consolidated PlanetPositionCalculator for overlap adjustment
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
            const originalPos = planet.position;
            
            // Set the adjusted icon position
            planet.adjustedIconX = pos.iconCenterX;
            planet.adjustedIconY = pos.iconCenterY;
            
            // If there was an adjustment, store it
            if (pos.adjustedLongitude !== undefined) {
                planet.adjustedPosition = pos.adjustedLongitude;
                
                // Log significant adjustments
                const adjustment = Math.abs(originalPos - pos.adjustedLongitude);
                if (adjustment > 0.1) { // Only log if adjustment is significant
                    console.log(`PlanetRenderer: ${planetType} planet ${planet.name} adjusted from ${originalPos.toFixed(2)}° to ${pos.adjustedLongitude.toFixed(2)}° (shift: ${adjustment.toFixed(2)}°)`);
                }
            }
        });
        
        console.log(`PlanetRenderer: ${planetType} planet overlap adjustment complete`);
    }

    /**
     * Draw the planets on the SVG group with their dots and icons.
     * @param {Element} parentGroup - The parent SVG group.
     * @param {Array} planets - Array of planet objects with calculated positions.
     */
    drawPlanets(parentGroup, planets) {
        planets.forEach(planet => {
            // Get planet type for CSS classes
            const typeClass = planet.isPrimary ? 'primary' : 'secondary';
            
            // Create group for this planet (contains dot, symbol, and label)
            const planetGroup = this.svgUtils.createSVGElement("g", {
                'data-planet': planet.name,
                'data-type': planet.type,
                class: `planet-element planet-${planet.name} planet-${typeClass}`,
                transform: `translate(0,0)` // No transforms for now, may be useful later for animations
            });
            
            // Draw the position dot (small circle at exact planet position)
            const dot = this.svgUtils.createSVGElement("circle", {
                cx: planet.x,
                cy: planet.y,
                r: 3, // Small fixed size for position indicator
                class: `planet-dot planet-${planet.name}-dot planet-${typeClass}-dot`,
                fill: planet.color || '#000000'
            });
            planetGroup.appendChild(dot);
            
            // Draw the planet icon using SVG image from zodiac folder
            const iconSize = 24;
            
            // Get the icon path using IconProvider if available
            let iconPath;
            if (this.iconProvider) {
                iconPath = this.iconProvider.getPlanetIconPath(planet.name);
            } else {
                // Fallback to old path construction if IconProvider is not available
                iconPath = `${this.options.assetBasePath}svg/zodiac/zodiac-planet-${planet.name.toLowerCase()}.svg`;
            }
            
            console.log(`PlanetRenderer: Loading planet icon: ${iconPath}`);
            
            // Calculate top-left position of the icon (centered on the calculated point)
            const iconX = planet.adjustedIconX - iconSize/2;
            const iconY = planet.adjustedIconY - iconSize/2;
            
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
                
                planetGroup.appendChild(textIcon);
            });
            
            planetGroup.appendChild(icon);
            
            // Add tooltip with full planet name and position
            const typeLabel = planet.isPrimary ? "Primary" : "Secondary";
            const tooltipText = `${typeLabel} ${AstrologyUtils.getPlanetFullName(planet.name)}: ${planet.position.toFixed(1)}° ${planet.zodiacSign.toUpperCase()} (${planet.position_in_sign.toFixed(1)}°)`;
            this.svgUtils.addTooltip(planetGroup, tooltipText);
            
            // Draw connector line if the dot and icon are far enough apart
            const distX = planet.x - planet.adjustedIconX;
            const distY = planet.y - planet.adjustedIconY;
            const distance = Math.sqrt(distX * distX + distY * distY);
            
            if (distance > iconSize * 0.3) {
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
                planetGroup.appendChild(connector);
            }
            
            // Add to parent group
            parentGroup.appendChild(planetGroup);
        });
    }

    /**
     * Adds an aspect icon at the midpoint of the aspect line
     * @private
     * @param {Element} parentGroup - The SVG group for aspect lines
     * @param {Object} aspect - The aspect object
     * @param {Object} coords1 - Coordinates of first planet
     * @param {Object} coords2 - Coordinates of second planet
     * @param {string} tooltipText - Tooltip text
     */
    _addAspectIcon(parentGroup, aspect, coords1, coords2, tooltipText) {
        console.log('AspectRenderer: _addAspectIcon method called');
        
        // Calculate midpoint of the line
        const midX = (coords1.x + coords2.x) / 2;
        const midY = (coords1.y + coords2.y) / 2;
        
        // Calculate distance from center to place the icon correctly
        const dx = midX - this.centerX;
        const dy = midY - this.centerY;
        const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
        
        // Only add icon if not too close to center (to avoid clutter)
        if (distanceFromCenter < 20) {
            console.log('AspectRenderer: Icon too close to center, skipping');
            return; // Skip icon if too close to center
        }
        
        // Define the icon size
        const iconSize = 14;
        
        // Directly check if options and assetBasePath exist
        if (!this.options) {
            console.error('AspectRenderer: this.options is undefined!');
            return;
        }
        
        if (!this.options.assetBasePath) {
            console.error('AspectRenderer: this.options.assetBasePath is undefined!');
            // Try to check if we can access it through other means
            console.log('AspectRenderer: Checking for alternatives...');
            console.log('AspectRenderer: this.config?.assets?.basePath =', this.config?.assets?.basePath);
        }
        
        // Get icon path using IconProvider if available
        let iconPath;
        if (this.iconProvider) {
            iconPath = this.iconProvider.getAspectIconPath(aspect.type);
        } else {
            // Fallback to old path construction
            const basePath = this.options.assetBasePath || (this.config?.assets?.basePath) || './assets/';
            iconPath = `${basePath}svg/zodiac/zodiac-aspect-${aspect.type.toLowerCase()}.svg`;
        }
        console.log(`AspectRenderer: Using icon path: ${iconPath}`);
        
        try {
            // Create text fallback for aspect
            const fallbackText = aspect.abbr || aspect.type.substring(0, 3).toUpperCase();
            
            // Create text fallback using IconProvider if available
            let textSymbol;
            if (this.iconProvider) {
                textSymbol = this.iconProvider.createTextFallback(
                    this.svgUtils,
                    {
                        x: midX,
                        y: midY,
                        size: '12px',
                        color: aspect.color || '#888888',
                        className: `aspect-element aspect-symbol aspect-${aspect.type}`
                    },
                    fallbackText
                );
            } else {
                // Legacy fallback if IconProvider is unavailable
                textSymbol = this.svgUtils.createSVGElement("text", {
                    x: midX,
                    y: midY,
                    'text-anchor': 'middle',
                    'dominant-baseline': 'middle',
                    'font-size': '12px',
                    'font-weight': 'bold',
                    class: `aspect-element aspect-symbol aspect-${aspect.type}`,
                    fill: aspect.color || '#888888'
                });
                textSymbol.textContent = fallbackText;
            }
            
            // Add tooltip to text symbol
            this.svgUtils.addTooltip(textSymbol, tooltipText);
            
            // Add text symbol to the parent group (this ensures at least something appears)
            parentGroup.appendChild(textSymbol);
            
            console.log('AspectRenderer: Added text symbol as fallback');
            
            // Now try to create and add the image element
            const icon = this.svgUtils.createSVGElement("image", {
                x: midX - iconSize/2,
                y: midY - iconSize/2,
                width: iconSize,
                height: iconSize,
                href: iconPath,
                class: `aspect-element aspect-icon aspect-${aspect.type}`,
                opacity: 0.85 // Slightly transparent
            });
            
            // Add the image to the parent group
            parentGroup.appendChild(icon);
            
            console.log('AspectRenderer: Added image element with path:', iconPath);
        } catch (error) {
            console.error('AspectRenderer: Error creating aspect icon:', error);
        }
    }
} 