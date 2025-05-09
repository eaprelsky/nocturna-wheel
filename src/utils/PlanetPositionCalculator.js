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
        
        // Make a copy to not modify originals
        const adjustedPositions = [...positions];
        
        // The minimum angular distance needed to prevent overlap at base radius
        const minAngularDistance = (minDistance / baseRadius) * (180 / Math.PI);
        
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
        
        // Process each cluster
        clusters.forEach(cluster => {
            if (cluster.length <= 1) {
                // Single planet - just place at exact base radius with no angle change
                const planet = cluster[0];
                this._setExactPosition(planet, planet.longitude, baseRadius, centerX, centerY, iconSize);
            } else {
                // Handle cluster with multiple planets - distribute by angle
                this._distributeClusterByAngle(cluster, baseRadius, minAngularDistance, centerX, centerY, iconSize);
            }
        });
        
        // Copy adjusted positions back to the original array order
        sortedPositions.forEach(pos => {
            const origIndex = pos.originalIndex;
            
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
        const clusters = [];
        let currentCluster = [sortedPositions[0]];
        
        // Create clusters by checking consecutive positions
        for (let i = 1; i < sortedPositions.length; i++) {
            const prevPosition = sortedPositions[i-1];
            const currPosition = sortedPositions[i];
            
            // Check angular distance, considering wrap-around at 360°
            let angleDiff = currPosition.longitude - prevPosition.longitude;
            if (angleDiff < 0) angleDiff += 360;
            
            if (angleDiff < minAngularDistance || (360 - angleDiff) < minAngularDistance) {
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
        
        // Add the final cluster if it exists
        if (currentCluster.length > 0) {
            clusters.push(currentCluster);
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
        
        // Determine minimum arc needed for n positions with minimum spacing
        const minRequiredArc = (n - 1) * minAngularDistance;
        
        // If there's enough natural space, just distribute evenly in the existing arc
        if (totalArc >= minRequiredArc) {
            // Calculate even spacing
            const spacing = totalArc / (n - 1);
            
            // Distribute positions evenly
            for (let i = 0; i < n; i++) {
                const angle = (firstPos + i * spacing) % 360;
                this._setExactPosition(positions[i], angle, radius, centerX, centerY, iconSize);
            }
        } else {
            // Not enough natural space, force minimum spacing
            for (let i = 0; i < n; i++) {
                const angle = (firstPos + i * minAngularDistance) % 360;
                this._setExactPosition(positions[i], angle, radius, centerX, centerY, iconSize);
            }
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