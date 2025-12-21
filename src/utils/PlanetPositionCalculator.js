/**
 * PlanetPositionCalculator.js
 * Utility class for calculating planet positions on any circle
 */
import { SvgUtils } from './SvgUtils.js';

class PlanetPositionCalculator {
    static _normalizeAngle(angle) {
        return ((angle % 360) + 360) % 360;
    }

    static _getAngle(position) {
        return position && position.adjustedLongitude !== undefined
            ? position.adjustedLongitude
            : position.longitude;
    }

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
            iconSize = 24,
            maxIterations = 5
        } = options;
        
        if (!positions || positions.length <= 1) {
            return positions; // Nothing to adjust with 0 or 1 planets
        }
        
        if (!centerX || !centerY || !baseRadius) {
            console.error("PlanetPositionCalculator: Missing required parameters (centerX, centerY, or baseRadius)");
            return positions; // Return original positions if missing required parameters
        }
        
        console.log(`PlanetPositionCalculator: Adjusting overlaps for ${positions.length} positions`);
        
        // Make a copy to not modify originals (also ensures we can add fields safely)
        const adjustedPositions = positions.map(p => ({ ...p }));
        
        // The minimum angular distance needed to prevent overlap at base radius
        // minDistance already includes the desired spacing (iconSize * 1.5)
        const minAngularDistance = (minDistance / baseRadius) * (180 / Math.PI);
        console.log(`PlanetPositionCalculator: Minimum angular distance: ${minAngularDistance.toFixed(2)}°`);

        // Initialize adjustedLongitude for all positions
        adjustedPositions.forEach(pos => {
            if (pos.adjustedLongitude === undefined) {
                pos.adjustedLongitude = pos.longitude;
            }
            this._setExactPosition(pos, this._getAngle(pos), baseRadius, centerX, centerY, iconSize);
        });

        // Iteratively resolve overlaps. This avoids "new overlaps" created after distributing a cluster.
        for (let iteration = 0; iteration < maxIterations; iteration++) {
            // Sort by current (possibly adjusted) angle for overlap detection
            const sortedPositions = [...adjustedPositions].sort(
                (a, b) => this._getAngle(a) - this._getAngle(b)
            );

            // Find clusters of planets that are too close angularly
            const clusters = this._findOverlappingClusters(sortedPositions, minAngularDistance);
            console.log(`PlanetPositionCalculator: Iteration ${iteration + 1}/${maxIterations}, clusters: ${clusters.length}`);

            // No overlaps -> done
            const hasRealClusters = clusters.some(c => c.length > 1);
            if (!hasRealClusters) {
                break;
            }

            // Process each cluster
            clusters.forEach(cluster => {
                if (cluster.length <= 1) {
                    const planet = cluster[0];
                    this._setExactPosition(planet, this._getAngle(planet), baseRadius, centerX, centerY, iconSize);
                    return;
                }

                this._distributeClusterByPush(cluster, baseRadius, minAngularDistance, centerX, centerY, iconSize);
            });
        }

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
            const prevAngle = this._getAngle(prevPosition);
            const currAngle = this._getAngle(currPosition);
            let angleDiff = currAngle - prevAngle;
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
        
        const lastAngle = this._getAngle(lastPlanet);
        const firstAngle = this._getAngle(firstPlanetOriginal);
        let wrapDiff = (firstAngle + 360) - lastAngle;
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
     * Distribute positions in a cluster using a "push-apart" algorithm.
     * This keeps adjustments as small as possible while ensuring minimum spacing.
     * @private
     * @param {Array} positions - Array of positions in the cluster
     * @param {number} radius - The exact radius to place all positions
     * @param {number} minAngularDistance - Minimum angular distance needed
     * @param {number} centerX - X coordinate of center
     * @param {number} centerY - Y coordinate of center
     * @param {number} iconSize - Size of the icon
     */
    static _distributeClusterByPush(positions, radius, minAngularDistance, centerX, centerY, iconSize) {
        const n = positions.length;
        if (n <= 1) {
            const p = positions[0];
            this._setExactPosition(p, this._getAngle(p), radius, centerX, centerY, iconSize);
            return;
        }

        // Unwrap angles if cluster spans the 0°/360° boundary
        const baseAngles = positions.map(p => this._getAngle(p));
        const min = Math.min(...baseAngles);
        const max = Math.max(...baseAngles);
        const unwrappedAngles = (max - min > 180)
            ? baseAngles.map(a => (a < 180 ? a + 360 : a))
            : baseAngles;

        // Sort by unwrapped angle
        const items = positions
            .map((p, idx) => ({ p, orig: unwrappedAngles[idx] }))
            .sort((a, b) => a.orig - b.orig);

        const origAngles = items.map(it => it.orig);
        let adjusted = [...origAngles];

        // Forward pass: enforce minimum distance
        for (let i = 1; i < n; i++) {
            const minAllowed = adjusted[i - 1] + minAngularDistance;
            if (adjusted[i] < minAllowed) {
                adjusted[i] = minAllowed;
            }
        }

        // Shift the whole cluster to keep it centered around the original mean angle
        const origCenter = origAngles.reduce((s, a) => s + a, 0) / n;
        const adjustedCenter = adjusted.reduce((s, a) => s + a, 0) / n;
        const shift = origCenter - adjustedCenter;
        adjusted = adjusted.map(a => a + shift);

        // Re-enforce constraints after shifting
        for (let i = 1; i < n; i++) {
            const minAllowed = adjusted[i - 1] + minAngularDistance;
            if (adjusted[i] < minAllowed) {
                adjusted[i] = minAllowed;
            }
        }
        for (let i = n - 2; i >= 0; i--) {
            const maxAllowed = adjusted[i + 1] - minAngularDistance;
            if (adjusted[i] > maxAllowed) {
                adjusted[i] = maxAllowed;
            }
        }

        // Apply results
        for (let i = 0; i < n; i++) {
            const angle = this._normalizeAngle(adjusted[i]);
            this._setExactPosition(items[i].p, angle, radius, centerX, centerY, iconSize);
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

export { PlanetPositionCalculator }; 