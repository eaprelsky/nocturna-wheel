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
            position_in_sign: p.position % 30 // Calculate position within sign
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
        if (totalArc < 0) totalArc += 360;
        
        // If planets already span enough arc, keep their positions
        if (totalArc >= (n-1) * minAngularDistance) {
            planets.forEach(planet => {
                this._setExactPosition(planet, planet.position, radius);
            });
            return;
        }
        
        // Calculate average position for centering
        let sumX = 0, sumY = 0;
        planets.forEach(p => {
            const rad = (p.position * Math.PI) / 180;
            sumX += Math.cos(rad);
            sumY += Math.sin(rad);
        });
        const avgAngle = ((Math.atan2(sumY, sumX) * 180 / Math.PI) + 360) % 360;
        
        // Calculate needed arc span with a small buffer
        const neededArc = minAngularDistance * (n - 1) * 1.1; // 10% buffer
        const actualArc = Math.min(30, neededArc); // Cap at 30 degrees max spread
        
        // Distribute planets evenly across the arc
        const startAngle = avgAngle - (actualArc / 2);
        
        // Place planets with even angular spacing
        planets.forEach((planet, i) => {
            let angle;
            if (n > 1) {
                angle = startAngle + (i * (actualArc / (n - 1)));
            } else {
                angle = planet.position; // Single planet case
            }
            
            // Normalize angle to 0-360
            angle = (angle + 360) % 360;
            
            // Set planet position at the exact radius with adjusted angle
            this._setExactPosition(planet, angle, radius);
        });
    }
    
    /**
     * Set a planet's position at an exact angle and radius
     * @private
     * @param {Object} planet - The planet object
     * @param {number} angle - The angle in degrees
     * @param {number} radius - The exact radius
     */
    _setExactPosition(planet, angle, radius) {
        const radians = (angle - 90) * (Math.PI / 180);
        planet.adjustedIconX = this.centerX + radius * Math.cos(radians);
        planet.adjustedIconY = this.centerY + radius * Math.sin(radians);
    }

    /**
     * Draws the planets onto the SVG group.
     * @param {Element} parentGroup - Parent SVG group.
     * @param {Array} planets - Array of planets with calculated coordinates.
     */
    drawPlanets(parentGroup, planets) {
        console.log('PlanetRenderer: Starting drawPlanets for count:', planets.length);
        const iconWidth = 24;
        const iconHeight = 24;

        planets.forEach((planet, index) => {
            console.log(`PlanetRenderer: Drawing planet ${index}:`, JSON.stringify(planet)); 
            const planetSettings = this.config.getPlanetSettings(planet.name);
            if (!planetSettings.visible) {
                console.log(`PlanetRenderer: Planet ${planet.name} is not visible, skipping.`);
                return; // Skip non-visible planets
            }

            const commonClass = `planet-element planet-${planet.name.toLowerCase()}`;
            
            // Draw the dot at the base position
            const dot = this.svgUtils.createSVGElement("circle", {
                cx: planet.x,
                cy: planet.y,
                r: 3, // Small dot
                class: `${commonClass} planet-dot`,
                // Use color from planet data if available, otherwise default to black
                fill: planet.color || "#000000"
            });
            
            parentGroup.appendChild(dot);
            
            // Calculate if the planet icon has been moved away from its dot
            const distX = planet.adjustedIconX - planet.x;
            const distY = planet.adjustedIconY - planet.y;
            const distance = Math.sqrt(distX * distX + distY * distY);
            
            // If the icon is significantly moved from the dot, draw a connection line
            // Since we're only adjusting angle, the line will always be an arc segment
            if (distance > iconWidth * 0.3) {
                // Create a thin connection line from the dot to the icon center
                const connector = this.svgUtils.createSVGElement("line", {
                    x1: planet.x,
                    y1: planet.y,
                    x2: planet.adjustedIconX,
                    y2: planet.adjustedIconY,
                    class: `${commonClass} planet-connector`,
                    stroke: planet.color || "#000000",
                    "stroke-width": 0.75,
                    "stroke-opacity": 0.5
                });
                
                parentGroup.appendChild(connector);
            }
            
            // Add the planet icon at the adjusted position
            const iconSize = 24; // Icon size
            const iconX = planet.adjustedIconX - iconSize / 2;
            const iconY = planet.adjustedIconY - iconSize / 2;
            
            // Using the correct path format: svg/zodiac/zodiac-planet-{name}.svg
            const iconPath = `${this.options.assetBasePath}svg/zodiac/zodiac-planet-${planet.name.toLowerCase()}.svg`;
            
            console.log(`PlanetRenderer: Adding icon for ${planet.name} at (${iconX}, ${iconY})`);
            const icon = this.svgUtils.createSVGElement("image", {
                x: iconX,
                y: iconY,
                width: iconSize,
                height: iconSize,
                class: `${commonClass} planet-icon`,
                href: iconPath
            });
            
            parentGroup.appendChild(icon);
        });
    }
}
