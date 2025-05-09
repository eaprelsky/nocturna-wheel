/**
 * PlanetPositionCalculator.js
 * Utility class for calculating planet positions on any circle
 */
class PlanetPositionCalculator {
    /**
     * Calculate position for a planet on a circle
     * @param {Object} params - Position parameters
     * @param {number} params.centerX - X coordinate of center
     * @param {number} params.centerY - Y coordinate of center
     * @param {number} params.radius - Circle radius 
     * @param {number} params.longitude - Planet longitude in degrees
     * @param {number} params.iconSize - Size of the icon (optional)
     * @returns {Object} Position data with dot and icon coordinates
     */
    static calculatePosition(params) {
        const { centerX, centerY, radius, longitude, iconSize = 24 } = params;
        const svgUtils = new SvgUtils();
        
        // Calculate point on circle
        const point = svgUtils.pointOnCircle(centerX, centerY, radius, longitude);
        
        // Calculate icon position (centered on the point)
        const iconX = point.x - (iconSize / 2);
        const iconY = point.y - (iconSize / 2);
        
        return {
            x: point.x,           // Dot center X
            y: point.y,           // Dot center Y
            iconX: iconX,         // Icon top-left X
            iconY: iconY,         // Icon top-left Y
            iconCenterX: point.x, // Icon center X
            iconCenterY: point.y, // Icon center Y
            longitude: longitude, // Original longitude
            radius: radius        // Original radius
        };
    }
    
    /**
     * Detects if planets are too close to each other
     * @param {Array} positions - Array of position objects
     * @param {number} minDistance - Minimum distance between planets
     * @returns {Array} Arrays of overlapping planet indices
     */
    static detectOverlaps(positions, minDistance = 24) {
        const clusters = [];
        const processed = new Set();
        
        // Check each pair of planets
        for (let i = 0; i < positions.length; i++) {
            if (processed.has(i)) continue;
            
            const cluster = [i];
            processed.add(i);
            
            for (let j = 0; j < positions.length; j++) {
                if (i === j || processed.has(j)) continue;
                
                const distance = Math.sqrt(
                    Math.pow(positions[i].x - positions[j].x, 2) + 
                    Math.pow(positions[i].y - positions[j].y, 2)
                );
                
                if (distance < minDistance) {
                    cluster.push(j);
                    processed.add(j);
                }
            }
            
            if (cluster.length > 1) {
                clusters.push(cluster);
            }
        }
        
        return clusters;
    }
    
    /**
     * Adjusts positions to resolve overlaps using improved clustering algorithm
     * @param {Array} positions - Array of position objects
     * @param {Object} options - Adjustment options
     * @returns {Array} Adjusted positions
     */
    static adjustOverlaps(positions, options = {}) {
        const { 
            minDistance = 24,
            centerX,
            centerY,
            baseRadius,
            iconSize = 24
        } = options;
        
        if (!positions || positions.length <= 1) {
            return positions; // Nothing to adjust with 0 or 1 planets
        }
        
        if (!centerX || !centerY || !baseRadius) {
            console.error("PlanetPositionCalculator: Missing required parameters (centerX, centerY, or baseRadius)");
            return positions; // Return original positions if missing required parameters
        }
        
        console.log(`PlanetPositionCalculator: Adjusting overlaps for ${positions.length} positions`);
        
        // Make a copy to not modify originals
        const adjustedPositions = [...positions];
        
        // The minimum angular distance needed to prevent overlap at base radius
        const minAngularDistance = (minDistance / baseRadius) * (180 / Math.PI);
        console.log(`PlanetPositionCalculator: Minimum angular distance: ${minAngularDistance.toFixed(2)}°`);
        
        // Sort positions by longitude for overlap detection
        const sortedPositionIndices = adjustedPositions
            .map((pos, idx) => ({ pos, idx }))
            .sort((a, b) => a.pos.longitude - b.pos.longitude);
        
        const sortedPositions = sortedPositionIndices.map(item => ({
            ...adjustedPositions[item.idx],
            originalIndex: item.idx
        }));
        
        // Find clusters of planets that are too close angularly
        const clusters = this._findOverlappingClusters(sortedPositions, minAngularDistance);
        console.log(`PlanetPositionCalculator: Found ${clusters.length} clusters of overlapping positions`);
        clusters.forEach((cluster, i) => {
            console.log(`PlanetPositionCalculator: Cluster ${i+1} has ${cluster.length} positions`);
        });
        
        // Process each cluster
        clusters.forEach((cluster, clusterIndex) => {
            console.log(`PlanetPositionCalculator: Processing cluster ${clusterIndex+1}`);
            
            if (cluster.length <= 1) {
                // Single planet - just place at exact base radius with no angle change
                const planet = cluster[0];
                console.log(`PlanetPositionCalculator: Single position in cluster, keeping at original longitude ${planet.longitude.toFixed(2)}°`);
                this._setExactPosition(planet, planet.longitude, baseRadius, centerX, centerY, iconSize);
            } else {
                // Handle cluster with multiple planets - distribute by angle
                console.log(`PlanetPositionCalculator: Distributing ${cluster.length} positions in cluster`);
                this._distributeClusterByAngle(cluster, baseRadius, minAngularDistance, centerX, centerY, iconSize);
                
                // Log the distributions
                cluster.forEach((pos, i) => {
                    console.log(`PlanetPositionCalculator: Position ${i+1} in cluster ${clusterIndex+1} adjusted from ${pos.longitude.toFixed(2)}° to ${pos.adjustedLongitude.toFixed(2)}°`);
                });
            }
        });
        
        // Copy adjusted positions back to the original array order
        sortedPositions.forEach(pos => {
            const origIndex = pos.originalIndex;
            
            // Only copy if we have valid data
            if (origIndex !== undefined && origIndex >= 0 && origIndex < adjustedPositions.length) {
                adjustedPositions[origIndex].x = pos.x;
                adjustedPositions[origIndex].y = pos.y;
                adjustedPositions[origIndex].iconX = pos.iconX;
                adjustedPositions[origIndex].iconY = pos.iconY;
                adjustedPositions[origIndex].iconCenterX = pos.iconCenterX;
                adjustedPositions[origIndex].iconCenterY = pos.iconCenterY;
                
                // Also add any adjusted longitude for reference
                if (pos.adjustedLongitude !== undefined) {
                    adjustedPositions[origIndex].adjustedLongitude = pos.adjustedLongitude;
                }
            }
        });
        
        return adjustedPositions;
    }
    
    /**
     * Find clusters of positions that are too close angularly
     * @private
     * @param {Array} sortedPositions - Positions sorted by longitude
     * @param {number} minAngularDistance - Minimum angular separation needed
     * @returns {Array} Array of arrays containing positions in each cluster
     */
    static _findOverlappingClusters(sortedPositions, minAngularDistance) {
        if (!sortedPositions.length) return [];
        if (sortedPositions.length === 1) return [sortedPositions];
        
        const clusters = [];
        let currentCluster = [sortedPositions[0]];
        const posCount = sortedPositions.length;
        
        // Check for wrap-around at the edges (e.g., planet at 359° and another at 1°)
        // Add the first planet to the end of the array for checking wraparound
        const wrappedCheck = [...sortedPositions];
        const firstPlanet = {...sortedPositions[0], longitude: sortedPositions[0].longitude + 360};
        wrappedCheck.push(firstPlanet);
        
        // First identify standard clusters within the 0-360° range
        for (let i = 1; i < posCount; i++) {
            const prevPosition = sortedPositions[i-1];
            const currPosition = sortedPositions[i];
            
            // Check angular distance, considering wrap-around at 360°
            let angleDiff = currPosition.longitude - prevPosition.longitude;
            if (angleDiff < 0) angleDiff += 360;
            
            if (angleDiff < minAngularDistance) {
                // Too close - add to current cluster
                currentCluster.push(currPosition);
            } else {
                // Far enough - finish current cluster and start a new one
                if (currentCluster.length > 0) {
                    clusters.push(currentCluster);
                }
                currentCluster = [currPosition];
            }
        }
        
        // Add the final regular cluster if it exists
        if (currentCluster.length > 0) {
            clusters.push(currentCluster);
        }
        
        // Check for a wrap-around cluster (where last and first planets are close)
        const lastPlanet = sortedPositions[posCount - 1];
        const firstPlanetOriginal = sortedPositions[0];
        
        let wrapDiff = (firstPlanetOriginal.longitude + 360) - lastPlanet.longitude;
        if (wrapDiff < 0) wrapDiff += 360;
        
        if (wrapDiff < minAngularDistance) {
            // We have a wraparound cluster
            // If first and last clusters both exist, merge them
            if (clusters.length >= 2) {
                const firstCluster = clusters[0];
                const lastCluster = clusters[clusters.length - 1];
                
                // If first element is in first cluster and last element is in last cluster
                if (firstCluster.includes(firstPlanetOriginal) && lastCluster.includes(lastPlanet)) {
                    // Merge the first and last clusters
                    const mergedCluster = [...lastCluster, ...firstCluster];
                    clusters.pop(); // Remove last cluster
                    clusters[0] = mergedCluster; // Replace first cluster with merged
                }
            }
        }
        
        return clusters;
    }
    
    /**
     * Distribute positions in a cluster by adjusting only their angles
     * @private
     * @param {Array} positions - Array of positions in the cluster
     * @param {number} radius - The exact radius to place all positions
     * @param {number} minAngularDistance - Minimum angular distance needed
     * @param {number} centerX - X coordinate of center
     * @param {number} centerY - Y coordinate of center
     * @param {number} iconSize - Size of the icon
     */
    static _distributeClusterByAngle(positions, radius, minAngularDistance, centerX, centerY, iconSize) {
        const n = positions.length;
        
        // Sort positions by their original longitude to maintain order
        positions.sort((a, b) => a.longitude - b.longitude);
        
        // Calculate central angle and total span needed
        const firstPos = positions[0].longitude;
        const lastPos = positions[n-1].longitude;
        let totalArc = lastPos - firstPos;
        
        // Handle wrap-around case (e.g., positions at 350° and 10°)
        if (totalArc < 0 || totalArc > 180) {
            totalArc = (360 + lastPos - firstPos) % 360;
        }
        
        // Calculate the center of the cluster
        let centerAngle = (firstPos + totalArc/2) % 360;
        
        // Determine minimum arc needed for n planets with minimum spacing
        const minRequiredArc = (n - 1) * minAngularDistance;
        
        // Calculate total span to use (either natural spacing or minimum required)
        const spanToUse = Math.max(totalArc, minRequiredArc);
        
        // Calculate start angle (center - half of span)
        const startAngle = (centerAngle - spanToUse/2 + 360) % 360;
        
        // Distribute planets evenly from the start angle
        for (let i = 0; i < n; i++) {
            // If only one planet, keep its original position
            if (n === 1) {
                this._setExactPosition(positions[i], positions[i].longitude, radius, centerX, centerY, iconSize);
                continue;
            }
            
            const angle = (startAngle + i * (spanToUse / (n-1))) % 360;
            this._setExactPosition(positions[i], angle, radius, centerX, centerY, iconSize);
        }
    }
    
    /**
     * Set a position's exact coordinates at the given angle and radius
     * @private
     * @param {Object} position - The position object to update
     * @param {number} angle - The angle in degrees (0-360)
     * @param {number} radius - The exact radius to place the position
     * @param {number} centerX - X coordinate of center
     * @param {number} centerY - Y coordinate of center
     * @param {number} iconSize - Size of the icon
     */
    static _setExactPosition(position, angle, radius, centerX, centerY, iconSize) {
        const svgUtils = new SvgUtils();
        const point = svgUtils.pointOnCircle(centerX, centerY, radius, angle);
        
        position.x = point.x;
        position.y = point.y;
        position.iconCenterX = point.x;
        position.iconCenterY = point.y;
        position.iconX = point.x - (iconSize / 2);
        position.iconY = point.y - (iconSize / 2);
        position.adjustedLongitude = angle;
    }
} 