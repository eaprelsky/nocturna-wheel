import { BaseRenderer } from './BaseRenderer.js';
import { AstrologyUtils } from '../utils/AstrologyUtils.js';

/**
 * ClientSideAspectRenderer.js
 * Renders aspects based on client-side calculations using planet coordinates.
 */
export class ClientSideAspectRenderer extends BaseRenderer { // No longer extends IAspectRenderer
    /**
     * Constructor
     * @param {Object} options - Renderer options.
     * @param {string} options.svgNS - SVG namespace.
     * @param {ChartConfig} options.config - Chart configuration object. Contains aspect settings like orb.
     * @param {string} options.assetBasePath - Base path for assets (unused here but standard).
     * @param {IconProvider} [options.iconProvider] - Icon provider service.
     */
    constructor(options) {
        super(options);
        this.astrologyUtils = AstrologyUtils; // Assuming AstrologyUtils is available
        this.renderedAspects = []; // Store calculated aspects
        this._aspectCacheKey = null; // Cache key for aspect calculations
        this._aspectCache = [];      // Cached aspect results
        this.assetBasePath = options.assetBasePath || ''; // Store asset base path
        this.iconProvider = options.iconProvider; // Store the icon provider
        
        // Define major aspects and their angles (can be overridden/extended by config)
        this.defaultAspectDefinitions = {
            'conjunction': { angle: 0, orb: 8, color: '#FF4500', abbr: 'CON' }, // OrangeRed
            'opposition': { angle: 180, orb: 6, color: '#DC143C', abbr: 'OPP' }, // Crimson
            'trine': { angle: 120, orb: 6, color: '#2E8B57', abbr: 'TRI' }, // SeaGreen
            'square': { angle: 90, orb: 6, color: '#FF0000', abbr: 'SQR' }, // Red
            'sextile': { angle: 60, orb: 4, color: '#4682B4', abbr: 'SEX' }, // SteelBlue
             // Add minors if needed
             // 'semisextile': { angle: 30, orb: 2, color: '#90EE90', abbr: 'SSX' }, // LightGreen
             // 'quincunx': { angle: 150, orb: 2, color: '#DAA520', abbr: 'QCX' }  // Goldenrod
        };
    }

    /**
     * Calculates the angular distance between two positions (0-180 degrees).
     * @param {number} pos1 - Position 1 (degrees).
     * @param {number} pos2 - Position 2 (degrees).
     * @returns {number} The smallest angle between pos1 and pos2 (0-180).
     */
    _angularDistance(pos1, pos2) {
        const diff = Math.abs(pos1 - pos2) % 360;
        return Math.min(diff, 360 - diff);
    }

    /**
     * Calculates aspects between planets based on their positions.
     * @param {Array} planets - Array of planet objects MUST include `position` property.
     * @returns {Array} Array of calculated aspect objects.
     */
    calculateAspects(planets) {
        const aspects = [];
        if (!planets || planets.length < 2) {
            return aspects;
        }

        // Generate a cache key based on aspectSettings and planet positions
        const settingsString = JSON.stringify(this.config.aspectSettings);
        const planetKey = planets.map(p => `${p.name}:${p.position}`).join('|');
        const cacheKey = `${settingsString}|${planetKey}`;
        if (cacheKey === this._aspectCacheKey) {
            console.log(`ClientSideAspectRenderer: Using cached aspects (${this._aspectCache.length})`);
            return this._aspectCache;
        }

        // Get aspect types and orbs from config, falling back to defaults
        const aspectSettings = this.config.aspectSettings || {};
        const calculationOrb = aspectSettings.orb || 6; // Default orb if not specified per aspect
        const aspectTypes = aspectSettings.types || this.defaultAspectDefinitions;

        // Iterate through all unique pairs of planets
        for (let i = 0; i < planets.length; i++) {
            for (let j = i + 1; j < planets.length; j++) {
                const p1 = planets[i];
                const p2 = planets[j];

                const angleDiff = this._angularDistance(p1.position, p2.position);

                // Check against each defined aspect type
                for (const aspectName in aspectTypes) {
                    const aspectDef = aspectTypes[aspectName];
                    const targetAngle = aspectDef.angle;
                    const orb = aspectDef.orb !== undefined ? aspectDef.orb : calculationOrb; // Use specific orb or default

                    if (Math.abs(angleDiff - targetAngle) <= orb) {
                        // Aspect found!
                        aspects.push({
                            planet1: p1.name,
                            planet2: p2.name,
                            type: aspectName,
                            angle: targetAngle, // The ideal angle of the aspect type
                            angleDiff: angleDiff, // The actual angle difference between planets
                            orb: Math.abs(angleDiff - targetAngle), // How exact the aspect is
                            // Include planet objects for coordinate lookup during rendering
                            p1: p1,
                            p2: p2,
                            // Add default color/style from definition
                            color: aspectDef.color || '#888', // Default color
                            lineStyle: aspectDef.lineStyle, // e.g., 'dashed', 'dotted' (used later in styling)
                            abbr: aspectDef.abbr || aspectName.substring(0, 3).toUpperCase() // Use abbreviation from definition or default
                        });
                    }
                }
            }
        }
        console.log(`ClientSideAspectRenderer: Calculated ${aspects.length} aspects.`);
        // Cache results and key
        this._aspectCacheKey = cacheKey;
        this._aspectCache = aspects;
        return aspects;
    }


    /**
     * Renders aspect lines based on planet coordinates.
     * @param {Element} parentGroup - The parent SVG group for aspect lines.
     * @param {Array} planetsWithCoords - Array of planet objects returned by PlanetRenderer, MUST include `x`, `y`, `name`, and `position`.
     * @returns {Array<Element>} Array containing the created line elements.
     */
    render(parentGroup, planetsWithCoords) {
         if (!parentGroup) {
             console.error("ClientSideAspectRenderer.render: parentGroup is null or undefined.");
             return [];
         }
         this.clearGroup(parentGroup); // Clear previous aspects
         const renderedElements = [];

         if (!planetsWithCoords || planetsWithCoords.length < 2) {
             console.warn("ClientSideAspectRenderer: Not enough planet data with coordinates to render aspects.");
             this.renderedAspects = [];
             return [];
         }

        // Calculate aspects based on planet positions
        const aspects = this.calculateAspects(planetsWithCoords);
        this.renderedAspects = aspects; // Store the calculated aspects

        console.log(`ClientSideAspectRenderer: Rendering ${aspects.length} aspects.`);

        // Get enabled aspect types from config
        const aspectSettings = this.config.aspectSettings || {};
        const aspectTypesConfig = aspectSettings.types || {};

        // Map planets by name for quick coordinate lookup
        const planetCoords = {};
        planetsWithCoords.forEach(p => {
            planetCoords[p.name] = { x: p.x, y: p.y }; // Use the dot coordinates (p.x, p.y)
        });

        aspects.forEach(aspect => {
            const coords1 = planetCoords[aspect.planet1];
            const coords2 = planetCoords[aspect.planet2];

            // Check if aspect type is enabled in config (and handle default case)
            const aspectDef = aspectTypesConfig[aspect.type];
            const isEnabled = aspectDef ? (aspectDef.enabled !== false) : true; // Default to true if not specified
            const lineStyle = aspectDef ? aspectDef.lineStyle : 'solid'; // Get style from config or default to solid

            if (!isEnabled || lineStyle === 'none') {
                // If aspect type is disabled or style is none, don't render line or icon
                return;
            }

            if (!coords1 || !coords2) {
                console.warn(`ClientSideAspectRenderer: Could not find coordinates for aspect: ${aspect.planet1} ${aspect.type} ${aspect.planet2}`);
                return; // Skip this aspect if coordinates are missing
            }

            // Sanitize planet names for CSS classes
            const p1SafeName = (aspect.planet1 || '').toLowerCase().replace(/[^a-z0-9]/g, '-');
            const p2SafeName = (aspect.planet2 || '').toLowerCase().replace(/[^a-z0-9]/g, '-');

            // Define stroke dash array based on lineStyle
            let strokeDasharray = 'none';
            if (lineStyle === 'dashed') {
                strokeDasharray = '5, 5';
            } else if (lineStyle === 'dotted') {
                strokeDasharray = '1, 3';
            }

            const line = this.svgUtils.createSVGElement("line", {
                x1: coords1.x,
                y1: coords1.y,
                x2: coords2.x,
                y2: coords2.y,
                class: `aspect-element aspect-line aspect-${aspect.type} aspect-planet-${p1SafeName} aspect-planet-${p2SafeName}`, // Add classes for type and involved planets
                stroke: aspect.color || '#888888', // Apply color from definition or default
                'stroke-dasharray': strokeDasharray // Apply calculated dash style
            });

            // Add tooltip with details
            const tooltipText = `${this.astrologyUtils.capitalizeFirstLetter(aspect.planet1)} ${aspect.type} ${this.astrologyUtils.capitalizeFirstLetter(aspect.planet2)} (${aspect.angleDiff.toFixed(1)}°, orb ${aspect.orb.toFixed(1)}°)`;
            this.svgUtils.addTooltip(line, tooltipText);

            parentGroup.appendChild(line);
            renderedElements.push(line);

            // Optionally add aspect glyphs at the midpoint
             this._addAspectIcon(parentGroup, aspect, coords1, coords2, tooltipText);
        });
        
        return renderedElements;
    }

    /**
     * Overrides the BaseRenderer clearGroup method to ensure custom cleanup.
     * @param {Element} parentGroup - The parent SVG group to clear.
     */
    clearGroup(parentGroup) {
        super.clearGroup(parentGroup);
        // Additional cleanup here if needed
    }

    /**
     * Gets the currently rendered aspects
     * @returns {Array} Array of aspect objects
     */
    getCurrentAspects() {
        return this.renderedAspects;
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
        // Calculate midpoint of the line
        const midX = (coords1.x + coords2.x) / 2;
        const midY = (coords1.y + coords2.y) / 2;
        
        // Calculate distance from center to place the icon correctly
        const dx = midX - this.centerX;
        const dy = midY - this.centerY;
        const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
        
        // Only add icon if not too close to center (to avoid clutter)
        if (distanceFromCenter < 20) {
            return; // Skip icon if too close to center
        }
        
        // Define the icon size
        const iconSize = 16;
        
        // Get icon path using IconProvider if available
        let iconPath;
        if (this.iconProvider) {
            iconPath = this.iconProvider.getAspectIconPath(aspect.type);
        } else {
            // Fallback to old path construction
            iconPath = `${this.assetBasePath}/svg/zodiac/zodiac-aspect-${aspect.type}.svg`;
        }
        
        // Create the aspect glyph/symbol image
        const symbol = this.svgUtils.createSVGElement("image", {
            x: midX - iconSize/2, // Offset by half the icon width
            y: midY - iconSize/2, // Offset by half the icon height
            width: iconSize,
            height: iconSize,
            href: iconPath,
            class: `aspect-element aspect-symbol aspect-${aspect.type}`
        });
        
        // Add error handling for image loading
        symbol.addEventListener('error', () => {
            console.warn(`Failed to load aspect icon for ${aspect.type} from path: ${iconPath}`);
            
            // Get the abbreviation for text fallback from aspect definition or default to first 3 letters
            const aspectDef = this.defaultAspectDefinitions[aspect.type];
            const fallbackText = aspectDef && aspectDef.abbr 
                ? aspectDef.abbr 
                : aspect.type.substring(0, 3).toUpperCase();
            
            // Use IconProvider's createTextFallback if available
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
                // Legacy fallback
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
            
            // Add tooltip
            this.svgUtils.addTooltip(textSymbol, tooltipText);
            
            // Add to parent group
            parentGroup.appendChild(textSymbol);
        });
        
        // Add tooltip
        this.svgUtils.addTooltip(symbol, tooltipText);
        
        parentGroup.appendChild(symbol);
    }
} 