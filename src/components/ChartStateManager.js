/**
 * ChartStateManager.js
 * Manages the state and configuration settings for the chart
 */

export class ChartStateManager {
    /**
     * Constructor
     * @param {Object} options - Configuration options
     * @param {Object} options.config - Chart configuration
     * @param {Object} options.svgManager - SVG manager instance
     */
    constructor(options) {
        this.config = options.config;
        this.svgManager = options.svgManager;
    }
    
    /**
     * Updates chart configuration
     * @param {Object} configUpdate - Configuration updates
     * @returns {boolean} Success indicator
     */
    updateConfig(configUpdate) {
        this.config.mergeConfig(configUpdate);
        
        // Update aspect settings specifically if provided
        if (configUpdate.aspectSettings) {
            this.config.updateAspectSettings(configUpdate.aspectSettings);
        }
        
        console.log("ChartStateManager: Updated configuration");
        return true;
    }
    
    /**
     * Toggles the visibility of a planet
     * @param {string} planetName - Name of the planet to toggle
     * @param {boolean} visible - Visibility state
     * @returns {boolean} Success indicator
     */
    togglePlanetVisibility(planetName, visible) {
        this.config.togglePlanetVisibility(planetName, visible);
        return true;
    }
    
    /**
     * Toggles the visibility of houses
     * @param {boolean} visible - Visibility state
     * @returns {boolean} Success indicator
     */
    toggleHousesVisibility(visible) {
        this.config.toggleHousesVisibility(visible);
        return true;
    }
    
    /**
     * Toggles the visibility of aspects
     * @param {boolean} visible - Visibility state
     * @returns {boolean} Success indicator
     */
    toggleAspectsVisibility(visible) {
        this.config.toggleAspectsVisibility(visible);
        return true;
    }
    
    /**
     * Sets the house system rotation angle
     * @param {number} angle - Rotation angle in degrees
     * @returns {boolean} Success indicator
     */
    setHouseRotation(angle) {
        this.config.houseSettings.rotationAngle = angle;
        return true;
    }
    
    /**
     * Sets the house system
     * @param {string} systemName - Name of the house system to use
     * @returns {boolean} Success indicator
     */
    setHouseSystem(systemName) {
        return this.config.setHouseSystem(systemName);
    }
    
    /**
     * Gets the available house systems
     * @returns {Array} Array of available house system names
     */
    getAvailableHouseSystems() {
        return this.config.getAvailableHouseSystems();
    }
    
    /**
     * Gets the current house system
     * @returns {string} Current house system name
     */
    getCurrentHouseSystem() {
        return this.config.getHouseSystem();
    }
    
    /**
     * Toggles the visibility of primary planets (inner circle)
     * @param {boolean} visible - Visibility state
     * @returns {boolean} Success indicator
     */
    togglePrimaryPlanets(visible) {
        // Update the config settings
        this.config.togglePrimaryPlanetsVisibility(visible);
        
        // Update the group visibility in the DOM if svgManager is available
        if (this.svgManager) {
            const primaryGroup = this.svgManager.getGroup('primaryPlanets');
            if (primaryGroup) {
                primaryGroup.style.display = visible ? 'block' : 'none';
            }
        }
        
        console.log(`ChartStateManager: Primary planets ${visible ? 'enabled' : 'disabled'}`);
        return true;
    }
    
    /**
     * Toggles the visibility of secondary planets (innermost circle)
     * @param {boolean} visible - Visibility state
     * @returns {boolean} Success indicator
     */
    toggleSecondaryPlanets(visible) {
        // Update the config settings
        this.config.toggleSecondaryPlanetsVisibility(visible);
        
        // Update the group visibility in the DOM if svgManager is available
        if (this.svgManager) {
            const secondaryGroup = this.svgManager.getGroup('secondaryPlanets');
            if (secondaryGroup) {
                secondaryGroup.style.display = visible ? 'block' : 'none';
            }
            
            // Update the innermost circle visibility
            const innermostCircle = document.querySelector('.chart-innermost-circle');
            if (innermostCircle) {
                innermostCircle.style.display = visible ? 'block' : 'none';
            }
        }
        
        console.log(`ChartStateManager: Secondary planets ${visible ? 'enabled' : 'disabled'}`);
        return true;
    }
} 