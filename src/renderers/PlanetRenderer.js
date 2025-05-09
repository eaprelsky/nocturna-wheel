/**
 * PlanetRenderer.js
 * Class for rendering planets on the natal chart wheel.
 */
class PlanetRenderer extends BaseRenderer {
    /**
     * Constructor
     * @param {Object} options - Renderer options.
     * @param {string} options.svgNS - SVG namespace.
     * @param {ChartConfig} options.config - Chart configuration object.
     * @param {string} options.assetBasePath - Base path for assets.
     */
    constructor(options) {
        super(options);
        if (!options.assetBasePath) {
            throw new Error("PlanetRenderer: Missing required option assetBasePath");
        }
        // Use config radii for positions
        this.iconBaseRadius = (this.innerRadius + this.middleRadius) / 2;
        this.dotRadius = this.innerRadius;
        // Define layers for overlap adjustments
        this.iconRadiusLayers = [
            this.innerRadius + 5,
            this.iconBaseRadius,
            this.middleRadius - 5
        ].sort((a, b) => a - b);
    }

    /**
     * Renders the provided planets on the chart.
     * @param {Element} parentGroup - The parent SVG group element.
     * @param {Array} planetsData - Array of planet objects { name: string, position: number }.
     * @param {number} houseRotationAngle - (currently unused, but kept for potential future use)
     * @returns {Array} Array of planet objects with added coordinates (x, y) and other calculated data.
     */
    render(parentGroup, planetsData, houseRotationAngle = 0) {
        if (!parentGroup) {
             console.error("PlanetRenderer: parentGroup is null or undefined.");
             return [];
        }
        console.log('PlanetRenderer: Rendering planets count:', planetsData.length);
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
            isPrimary: p.isPrimary || false,
            color: p.color || '#000000'
        }));

        // Sort planets by position for overlap calculations
        planets.sort((a, b) => a.position - b.position);

        // Calculate base positions (dot and icon)
        this.calculateBasePositions(planets);

        // Calculate adjustments for overlapping planets
        this.adjustOverlappingPlanets(planets);

        // Draw the planets onto the SVG group
        this.drawPlanets(parentGroup, planets);

        // Return the planets array with calculated coordinates
        return planets;
    }

    /**
     * Calculates base positions (dot and icon) for planets.
     * @param {Array} planets - Array of planet objects.
     */
    calculateBasePositions(planets) {
        planets.forEach(planet => {
            // Convert position to radians (0 degrees = East, anti-clockwise)
            // Subtract 90 to make 0 degrees = North (top)
            const radians = (planet.position - 90) * (Math.PI / 180);
            planet.radians = radians;

            // Calculate position on the dot radius circle
            // Use position directly with pointOnCircle which expects degrees
            const point = this.svgUtils.pointOnCircle(this.centerX, this.centerY, this.dotRadius, planet.position);
            console.log(`PlanetRenderer: Calculated dot position for ${planet.name}:`, JSON.stringify(point)); // Log the calculated point
            planet.x = point.x;
            planet.y = point.y;
            console.log(`PlanetRenderer: Assigned planet.x=${planet.x}, planet.y=${planet.y} for ${planet.name}`); // Log assigned values

            // Calculate base position for the planet icon
            const iconPoint = this.svgUtils.pointOnCircle(this.centerX, this.centerY, this.iconBaseRadius, planet.position);
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
        
        // Store original positions and ordering
        const originalOrder = planets.map((p, idx) => ({ planet: p, index: idx, position: p.position }));
        
        // Define parameters for collision detection and distribution
        const iconSize = 24;
        // The minimum angular distance needed to prevent overlap at base radius
        const baseRadius = this.iconBaseRadius; // Always use the middle of the band
        const minAngularDistance = (iconSize * 1.2 / baseRadius) * (180 / Math.PI);
        
        // Sort planets by position for overlap detection
        const sortedPlanets = [...planets].sort((a, b) => a.position - b.position);
        
        // Find clusters of overlapping planets (sequential planets too close angularly)
        const clusters = this._findOverlappingClusters(sortedPlanets, minAngularDistance);
        
        // Process each cluster to avoid overlaps
        clusters.forEach(cluster => {
            if (cluster.length <= 1) {
                // Single planet - just place at exact base radius with no angle change
                const planet = cluster[0];
                this._setExactPosition(planet, planet.position, baseRadius);
            } else {
                // Handle cluster with multiple planets - adjust angles only
                this._distributeClusterByAngle(cluster, baseRadius, minAngularDistance);
            }
        });
    }
    
    /**
     * Find clusters of planets that are too close angularly
     * @private
     * @param {Array} sortedPlanets - Planets sorted by position
     * @param {number} minAngularDistance - Minimum angular separation needed
     * @returns {Array} Array of arrays containing planets in each cluster
     */
    _findOverlappingClusters(sortedPlanets, minAngularDistance) {
        const clusters = [];
        let currentCluster = [sortedPlanets[0]];
        
        // Create clusters by checking consecutive planets
        for (let i = 1; i < sortedPlanets.length; i++) {
            const prevPlanet = sortedPlanets[i-1];
            const currPlanet = sortedPlanets[i];
            
            // Check angular distance, considering wrap-around at 360°
            let angleDiff = currPlanet.position - prevPlanet.position;
            if (angleDiff < 0) angleDiff += 360;
            
            if (angleDiff < minAngularDistance || (360 - angleDiff) < minAngularDistance) {
                // Too close - add to current cluster
                currentCluster.push(currPlanet);
            } else {
                // Far enough - finish current cluster and start a new one
                if (currentCluster.length > 0) {
                    clusters.push(currentCluster);
                }
                currentCluster = [currPlanet];
            }
        }
        
        // Add the final cluster if it exists
        if (currentCluster.length > 0) {
            clusters.push(currentCluster);
        }
        
        return clusters;
    }
    
    /**
     * Distribute planets in a cluster by adjusting only their angles
     * @private
     * @param {Array} planets - Array of planets in the cluster
     * @param {number} radius - The exact radius to place all planets
     * @param {number} minAngularDistance - Minimum angular distance needed
     */
    _distributeClusterByAngle(planets, radius, minAngularDistance) {
        const n = planets.length;
        
        // Sort planets by their original position to maintain order
        planets.sort((a, b) => a.position - b.position);
        
        // Calculate central angle and total span needed
        const firstPos = planets[0].position;
        const lastPos = planets[n-1].position;
        let totalArc = lastPos - firstPos;
        
        // Handle wrap-around case (e.g., planets at 350° and 10°)
        if (totalArc < 0 || totalArc > 180) {
            totalArc = (360 + lastPos - firstPos) % 360;
        }
        
        // Determine minimum arc needed for n planets with minimum spacing
        const minRequiredArc = (n - 1) * minAngularDistance;
        
        // If there's enough natural space, just distribute evenly in the existing arc
        if (totalArc >= minRequiredArc) {
            // Calculate even spacing
            const spacing = totalArc / (n - 1);
            
            // Distribute planets evenly
            for (let i = 0; i < n; i++) {
                const angle = (firstPos + i * spacing) % 360;
                this._setExactPosition(planets[i], angle, radius);
            }
        } else {
            // Not enough natural space, force minimum spacing
            for (let i = 0; i < n; i++) {
                const angle = (firstPos + i * minAngularDistance) % 360;
                this._setExactPosition(planets[i], angle, radius);
            }
        }
    }
    
    /**
     * Set a planet's exact position at the given angle and radius
     * @private
     * @param {Object} planet - The planet object to position
     * @param {number} angle - The angle in degrees (0-360)
     * @param {number} radius - The exact radius to place the planet
     */
    _setExactPosition(planet, angle, radius) {
        const point = this.svgUtils.pointOnCircle(this.centerX, this.centerY, radius, angle);
        planet.adjustedIconX = point.x;
        planet.adjustedIconY = point.y;
    }

    /**
     * Draw the planets on the SVG group with their dots and icons.
     * @param {Element} parentGroup - The parent SVG group.
     * @param {Array} planets - Array of planet objects with calculated positions.
     */
    drawPlanets(parentGroup, planets) {
        planets.forEach(planet => {
            // Create group for this planet (contains dot, symbol, and label)
            const planetGroup = this.svgUtils.createSVGElement("g", {
                'data-planet': planet.name,
                'data-primary': planet.isPrimary ? 'true' : 'false',
                class: `planet-element planet-${planet.name} ${planet.isPrimary ? 'primary' : 'secondary'}`,
                transform: `translate(0,0)` // No transforms for now, may be useful later for animations
            });
            
            // Draw the position dot (small circle at exact planet position)
            const dot = this.svgUtils.createSVGElement("circle", {
                cx: planet.x,
                cy: planet.y,
                r: 3, // Small fixed size for position indicator
                class: `planet-dot planet-${planet.name}-dot`,
                fill: planet.color || '#000000'
            });
            planetGroup.appendChild(dot);
            
            // Draw the planet icon using SVG image from zodiac folder
            const iconSize = 24;
            
            // Use the same path construction pattern as in ChartRenderer
            // this.config is available from BaseRenderer
            const iconPath = `${this.options.assetBasePath}svg/zodiac/zodiac-planet-${planet.name.toLowerCase()}.svg`;
            
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
                class: `planet-icon planet-${planet.name}-icon`
            });
            
            // Add error handling for missing icons
            icon.addEventListener('error', () => {
                console.warn(`Planet icon not found: ${iconPath}`);
                icon.setAttribute('href', ''); // Remove broken link
                
                // Add text fallback showing the first letter of planet name
                const textIcon = this.svgUtils.createSVGElement("text", {
                    x: planet.adjustedIconX,
                    y: planet.adjustedIconY,
                    'text-anchor': 'middle',
                    'dominant-baseline': 'middle',
                    'font-size': `${iconSize}px`,
                    class: `planet-symbol planet-${planet.name}-symbol`,
                    fill: planet.color || '#000000'
                });
                
                // Use planet symbol as fallback
                textIcon.textContent = AstrologyUtils.getPlanetSymbol(planet.name) || planet.name[0].toUpperCase();
                planetGroup.appendChild(textIcon);
            });
            
            planetGroup.appendChild(icon);
            
            // Add tooltip with full planet name and position
            const tooltipText = `${AstrologyUtils.getPlanetFullName(planet.name)}: ${planet.position.toFixed(1)}° ${planet.zodiacSign.toUpperCase()} (${planet.position_in_sign.toFixed(1)}°)`;
            this.svgUtils.addTooltip(planetGroup, tooltipText);
            
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
        
        // Try to use the assetBasePath from options, or fall back to a default
        const basePath = this.options.assetBasePath || (this.config?.assets?.basePath) || './assets/';
        console.log(`AspectRenderer: Using basePath: ${basePath}`);
        
        // Construct the icon path
        const iconPath = `${basePath}svg/zodiac/zodiac-aspect-${aspect.type.toLowerCase()}.svg`;
        console.log(`AspectRenderer: Constructed icon path: ${iconPath}`);
        
        try {
            // Create the aspect glyph/symbol as text first (fallback)
            const textSymbol = this.svgUtils.createSVGElement("text", {
                x: midX,
                y: midY,
                'text-anchor': 'middle',
                'dominant-baseline': 'middle',
                'font-size': '12px',
                'font-weight': 'bold',
                class: `aspect-element aspect-symbol aspect-${aspect.type}`,
                fill: aspect.color || '#888888'
            });
            
            // Set the symbol text
            textSymbol.textContent = aspect.symbol || '⚹'; // Default to sextile symbol if none provided
            
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