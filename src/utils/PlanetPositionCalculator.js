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
     * Adjusts positions to resolve overlaps
     * @param {Array} positions - Array of position objects
     * @param {Object} options - Adjustment options
     * @returns {Array} Adjusted positions
     */
    static adjustOverlaps(positions, options = {}) {
        const { 
            minDistance = 24,
            centerX,
            centerY,
            baseRadius
        } = options;
        
        // Make a copy to not modify originals
        const adjustedPositions = [...positions];
        
        // Find clusters of overlapping planets
        const clusters = this.detectOverlaps(positions, minDistance);
        
        // Process each cluster
        clusters.forEach(cluster => {
            // Extract the cluster positions
            const clusterPositions = cluster.map(idx => ({
                ...adjustedPositions[idx],
                index: idx
            }));
            
            // Sort by longitude
            clusterPositions.sort((a, b) => a.longitude - b.longitude);
            
            // Calculate angular distance needed between planets
            const angularDistance = (minDistance / baseRadius) * (180 / Math.PI);
            
            // Distribute planets evenly
            clusterPositions.forEach((pos, idx) => {
                // Adjust longitude based on position in cluster
                const adjustment = idx * angularDistance;
                const newLongitude = clusterPositions[0].longitude + adjustment;
                
                // Calculate new position
                const newPoint = new SvgUtils().pointOnCircle(
                    centerX, 
                    centerY, 
                    pos.radius,
                    newLongitude
                );
                
                // Update the position
                const originalIndex = pos.index;
                adjustedPositions[originalIndex].x = newPoint.x;
                adjustedPositions[originalIndex].y = newPoint.y;
                adjustedPositions[originalIndex].iconX = newPoint.x - (options.iconSize || 24) / 2;
                adjustedPositions[originalIndex].iconY = newPoint.y - (options.iconSize || 24) / 2;
                adjustedPositions[originalIndex].iconCenterX = newPoint.x;
                adjustedPositions[originalIndex].iconCenterY = newPoint.y;
                adjustedPositions[originalIndex].adjustedLongitude = newLongitude;
            });
        });
        
        return adjustedPositions;
    }
} 