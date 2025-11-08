/**
 * ChartConfig.js
 * Configuration class for the natal chart rendering.
 */
import { HouseCalculator } from './HouseCalculator.js';

export class ChartConfig {
    /**
     * Creates a new configuration with default settings
     * @param {Object} customConfig - Custom configuration to merge with defaults
     */
    constructor(customConfig = {}) {
        // Astronomical data - pure positional data without styling
        this.astronomicalData = {
            ascendant: 0,       // Ascendant longitude in degrees
            mc: 90,             // Midheaven longitude in degrees
            latitude: 51.5,     // Default latitude (London)
            houseSystem: "Placidus", // Default house system
            planets: {
                // Default planet positions
                sun: 0,
                moon: 0,
                mercury: 0,
                venus: 0,
                mars: 0,
                jupiter: 0,
                saturn: 0,
                uranus: 0,
                neptune: 0,
                pluto: 0
            }
        };
        
        // Primary aspects (outer circle planets to outer circle planets)
        this.primaryAspectSettings = {
            enabled: true,
            orb: 6,
            types: {
                conjunction: { angle: 0, orb: 8, color: '#000000', enabled: true, lineStyle: 'none', strokeWidth: 1 },
                opposition: { angle: 180, orb: 6, color: '#E41B17', enabled: true, lineStyle: 'solid', strokeWidth: 1 },
                trine: { angle: 120, orb: 6, color: '#4CC417', enabled: true, lineStyle: 'solid', strokeWidth: 1 },
                square: { angle: 90, orb: 6, color: '#F62817', enabled: true, lineStyle: 'dashed', strokeWidth: 1 },
                sextile: { angle: 60, orb: 4, color: '#56A5EC', enabled: true, lineStyle: 'dashed', strokeWidth: 1 }
            }
        };
        
        // Secondary aspects (inner circle planets to inner circle planets)
        this.secondaryAspectSettings = {
            enabled: true,
            orb: 6,
            types: {
                conjunction: { angle: 0, orb: 8, color: '#AA00AA', enabled: true, lineStyle: 'none', strokeWidth: 1 },
                opposition: { angle: 180, orb: 6, color: '#FF6600', enabled: true, lineStyle: 'solid', strokeWidth: 1 },
                trine: { angle: 120, orb: 6, color: '#00AA00', enabled: true, lineStyle: 'solid', strokeWidth: 1 },
                square: { angle: 90, orb: 6, color: '#CC0066', enabled: true, lineStyle: 'dashed', strokeWidth: 1 },
                sextile: { angle: 60, orb: 4, color: '#0099CC', enabled: true, lineStyle: 'dashed', strokeWidth: 1 }
            }
        };
        
        // Synastry aspects (outer circle planets to inner circle planets)
        this.synastryAspectSettings = {
            enabled: true,
            orb: 6,
            types: {
                conjunction: { angle: 0, orb: 8, color: '#666666', enabled: true, lineStyle: 'none', strokeWidth: 1 },
                opposition: { angle: 180, orb: 6, color: '#9933CC', enabled: true, lineStyle: 'solid', strokeWidth: 0.5 },
                trine: { angle: 120, orb: 6, color: '#33AA55', enabled: true, lineStyle: 'solid', strokeWidth: 0.5 },
                square: { angle: 90, orb: 6, color: '#CC6633', enabled: true, lineStyle: 'dotted', strokeWidth: 0.5 },
                sextile: { angle: 60, orb: 4, color: '#5599DD', enabled: true, lineStyle: 'dotted', strokeWidth: 0.5 }
            }
        };
        
        // Legacy aspectSettings for backward compatibility
        // Will be mapped to primaryAspectSettings if used
        this.aspectSettings = {
            enabled: true,
            orb: 6,
            types: {
                conjunction: { angle: 0, orb: 8, color: '#000000', enabled: true, lineStyle: 'none', strokeWidth: 1 },
                opposition: { angle: 180, orb: 6, color: '#E41B17', enabled: true, lineStyle: 'solid', strokeWidth: 1 },
                trine: { angle: 120, orb: 6, color: '#4CC417', enabled: true, lineStyle: 'solid', strokeWidth: 1 },
                square: { angle: 90, orb: 6, color: '#F62817', enabled: true, lineStyle: 'dashed', strokeWidth: 1 },
                sextile: { angle: 60, orb: 4, color: '#56A5EC', enabled: true, lineStyle: 'dashed', strokeWidth: 1 }
            }
        };
        
        // Planet settings
        this.planetSettings = {
            enabled: true,
            primaryEnabled: true,     // Toggle for primary (inner circle) planets
            secondaryEnabled: true,   // Toggle for secondary (innermost circle) planets
            dotSize: 3,               // Size of the position dot
            iconSize: 24,             // Size of the planet icon
            orbs: {
                // Default orbs for each planet
                sun: 8,
                moon: 8,
                mercury: 6,
                venus: 6,
                mars: 6,
                jupiter: 6,
                saturn: 6,
                uranus: 4,
                neptune: 4,
                pluto: 4
            },
            colors: {
                // Default colors for each planet
                sun: "#ff9900",
                moon: "#aaaaaa",
                mercury: "#3399cc",
                venus: "#cc66cc",
                mars: "#cc3333",
                jupiter: "#9966cc",
                saturn: "#336633",
                uranus: "#33cccc",
                neptune: "#3366ff",
                pluto: "#663366"
            },
            visible: {
                // Default visibility for each planet
                sun: true,
                moon: true,
                mercury: true,
                venus: true,
                mars: true,
                jupiter: true,
                saturn: true,
                uranus: true,
                neptune: true,
                pluto: true
            }
        };
        
        // House settings - only UI related settings, no calculations
        this.houseSettings = {
            enabled: true,
            lineColor: "#666666",
            textColor: "#333333",
            fontSize: 10,
            rotationAngle: 0  // Custom rotation angle for house system
        };
        
        // Zodiac settings
        this.zodiacSettings = {
            enabled: true,
            colors: {
                aries: "#ff6666",
                taurus: "#66cc66",
                gemini: "#ffcc66",
                cancer: "#6699cc",
                leo: "#ff9900",
                virgo: "#996633",
                libra: "#6699ff",
                scorpio: "#cc3366",
                sagittarius: "#cc66ff",
                capricorn: "#339966",
                aquarius: "#3399ff",
                pisces: "#9966cc"
            },
            fontSize: 10
        };
        
        // Radii for different chart layers
        this.radius = {
            innermost: 90,       // Innermost circle (for dual charts, transits, synastry)
            zodiacInner: 120,    // Inner circle (aspect container)
            zodiacMiddle: 150,   // Middle circle (house boundaries)
            zodiacOuter: 180,    // Outer circle (zodiac ring)
            planet: 105,         // Default planet placement radius
            aspectInner: 20,     // Center space for aspects
            aspectOuter: 120,    // Outer boundary for aspects
            houseNumberRadius: 210 // Radius for house numbers
        };
        
        // SVG settings
        this.svg = {
            width: 460,
            height: 460,
            viewBox: "0 0 460 460",
            center: { x: 230, y: 230 }
        };
        
        // Assets settings
        this.assets = {
            basePath: "./assets/",
            zodiacIconPath: "svg/zodiac/",
            planetIconPath: "svg/zodiac/"
        };
        
        // Theme settings
        this.theme = {
            backgroundColor: "transparent",
            textColor: "#333333",
            lineColor: "#666666",
            lightLineColor: "#cccccc",
            fontFamily: "'Arial', sans-serif"
        };
        
        // House cusps cache - will be populated by HouseCalculator
        this.houseCusps = [];
        
        // Merge custom config with defaults (deep merge)
        this.mergeConfig(customConfig);
        
        // Initialize house cusps if we have enough data
        this._initializeHouseCusps();
    }

    /**
     * Merges custom configuration with the default configuration
     * @param {Object} customConfig - Custom configuration object
     */
    mergeConfig(customConfig) {
        // Helper function for deep merge
        const deepMerge = (target, source) => {
            if (typeof source !== 'object' || source === null) {
                return source;
            }
            
            for (const key in source) {
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    if (typeof source[key] === 'object' && source[key] !== null && 
                        typeof target[key] === 'object' && target[key] !== null) {
                        // If both are objects, recurse
                        target[key] = deepMerge(target[key], source[key]);
                    } else {
                        // Otherwise just copy
                        target[key] = source[key];
                    }
                }
            }
            
            return target;
        };
        
        // Apply deep merge to all top-level properties
        for (const key in customConfig) {
            if (Object.prototype.hasOwnProperty.call(customConfig, key) && 
                Object.prototype.hasOwnProperty.call(this, key)) {
                this[key] = deepMerge(this[key], customConfig[key]);
            }
        }
    }

    /**
     * Initializes house cusps using the HouseCalculator
     * @private
     */
    _initializeHouseCusps() {
        // Only calculate if we have the necessary data
        if (typeof this.astronomicalData.ascendant === 'number' && 
            typeof this.astronomicalData.mc === 'number') {
            
            try {
                // Create calculator instance
                const houseCalculator = new HouseCalculator();
                
                // Calculate house cusps using the current house system
                this.houseCusps = houseCalculator.calculateHouseCusps(
                    this.astronomicalData.ascendant,
                    this.astronomicalData.houseSystem,
                    {
                        latitude: this.astronomicalData.latitude,
                        mc: this.astronomicalData.mc
                    }
                );
            } catch (error) {
                console.error("Failed to calculate house cusps:", error?.message || error);
                // Set empty cusps array if calculation fails
                this.houseCusps = [];
            }
        }
    }

    /**
     * Gets settings for a specific planet
     * @param {string} planetName - Name of the planet
     * @returns {Object} - Planet settings
     */
    getPlanetSettings(planetName) {
        const planetLower = planetName.toLowerCase();
        return {
            color: this.planetSettings.colors[planetLower] || "#000000",
            size: this.planetSettings.size,
            visible: this.planetSettings.visible[planetLower] !== false
        };
    }

    /**
     * Gets settings for a specific aspect
     * @param {string} aspectType - Type of aspect
     * @returns {Object} - Aspect settings
     */
    getAspectSettings(aspectType) {
        const aspectLower = aspectType.toLowerCase();
        return this.aspectSettings.types[aspectLower] || 
               { angle: 0, orb: this.aspectSettings.orb, color: "#999999", enabled: true };
    }

    /**
     * Gets settings for a specific zodiac sign
     * @param {string} signName - Name of the zodiac sign
     * @returns {Object} - Zodiac sign settings
     */
    getZodiacSettings(signName) {
        const signLower = signName.toLowerCase();
        return {
            color: this.zodiacSettings.colors[signLower] || "#666666",
            fontSize: this.zodiacSettings.fontSize
        };
    }

    /**
     * Updates aspect settings (legacy method - updates primaryAspectSettings)
     * @param {Object} settings - New aspect settings
     * @deprecated Use updatePrimaryAspectSettings, updateSecondaryAspectSettings, or updateSynastryAspectSettings instead
     */
    updateAspectSettings(settings) {
        this.aspectSettings = { ...this.aspectSettings, ...settings };
        // Also update primaryAspectSettings for backward compatibility
        this.primaryAspectSettings = { ...this.primaryAspectSettings, ...settings };
    }
    
    /**
     * Updates primary aspect settings (outer circle aspects)
     * @param {Object} settings - New aspect settings
     */
    updatePrimaryAspectSettings(settings) {
        this.primaryAspectSettings = { ...this.primaryAspectSettings, ...settings };
    }
    
    /**
     * Updates secondary aspect settings (inner circle aspects)
     * @param {Object} settings - New aspect settings
     */
    updateSecondaryAspectSettings(settings) {
        this.secondaryAspectSettings = { ...this.secondaryAspectSettings, ...settings };
    }
    
    /**
     * Updates synastry aspect settings (cross-circle aspects)
     * @param {Object} settings - New aspect settings
     */
    updateSynastryAspectSettings(settings) {
        this.synastryAspectSettings = { ...this.synastryAspectSettings, ...settings };
    }

    /**
     * Updates planet settings
     * @param {Object} settings - New planet settings
     */
    updatePlanetSettings(settings) {
        this.planetSettings = { ...this.planetSettings, ...settings };
    }

    /**
     * Updates house settings (visual settings only)
     * @param {Object} settings - New house settings
     */
    updateHouseSettings(settings) {
        this.houseSettings = { ...this.houseSettings, ...settings };
    }

    /**
     * Updates zodiac settings
     * @param {Object} settings - New zodiac settings
     */
    updateZodiacSettings(settings) {
        this.zodiacSettings = { ...this.zodiacSettings, ...settings };
    }

    /**
     * Sets radius for a specific layer
     * @param {string} layerName - Layer name
     * @param {number} value - Radius value
     */
    setRadius(layerName, value) {
        if (Object.prototype.hasOwnProperty.call(this.radius, layerName)) {
            this.radius[layerName] = value;
        }
    }

    /**
     * Toggles the visibility of a planet
     * @param {string} planetName - Name of the planet
     * @param {boolean} visible - Whether the planet should be visible
     */
    togglePlanetVisibility(planetName, visible) {
        if (this.planetSettings && this.planetSettings.visible) {
            this.planetSettings.visible[planetName] = visible;
        }
    }
    
    /**
     * Toggles the visibility of houses
     * @param {boolean} visible - Whether houses should be visible
     */
    toggleHousesVisibility(visible) {
        this.houseSettings.enabled = visible;
    }
    
    /**
     * Toggles the visibility of aspects (legacy - toggles all aspect types)
     * @param {boolean} visible - Whether aspects should be visible
     * @deprecated Use togglePrimaryAspectsVisibility, toggleSecondaryAspectsVisibility, or toggleSynastryAspectsVisibility instead
     */
    toggleAspectsVisibility(visible) {
        this.aspectSettings.enabled = visible;
        this.primaryAspectSettings.enabled = visible;
        this.secondaryAspectSettings.enabled = visible;
        this.synastryAspectSettings.enabled = visible;
    }
    
    /**
     * Toggles the visibility of primary aspects (outer circle)
     * @param {boolean} visible - Whether primary aspects should be visible
     */
    togglePrimaryAspectsVisibility(visible) {
        this.primaryAspectSettings.enabled = visible;
    }
    
    /**
     * Toggles the visibility of secondary aspects (inner circle)
     * @param {boolean} visible - Whether secondary aspects should be visible
     */
    toggleSecondaryAspectsVisibility(visible) {
        this.secondaryAspectSettings.enabled = visible;
    }
    
    /**
     * Toggles the visibility of synastry aspects (cross-circle)
     * @param {boolean} visible - Whether synastry aspects should be visible
     */
    toggleSynastryAspectsVisibility(visible) {
        this.synastryAspectSettings.enabled = visible;
    }
    
    /**
     * Toggles the visibility of primary planets (inner circle)
     * @param {boolean} visible - Whether primary planets should be visible
     */
    togglePrimaryPlanetsVisibility(visible) {
        this.planetSettings.primaryEnabled = visible;
    }
    
    /**
     * Toggles the visibility of secondary planets (innermost circle)
     * @param {boolean} visible - Whether secondary planets should be visible
     */
    toggleSecondaryPlanetsVisibility(visible) {
        this.planetSettings.secondaryEnabled = visible;
    }

    /**
     * Sets the current house system and recalculates house cusps
     * @param {string} systemName - Name of the house system to use
     * @returns {boolean} - Success status
     */
    setHouseSystem(systemName) {
        // Update the house system name
        this.astronomicalData.houseSystem = systemName;
        
        // Recalculate house cusps with new system
        this._initializeHouseCusps();
        
        return true;
    }
    
    /**
     * Gets the current house cusps
     * @returns {Array} - Array of house cusps
     */
    getHouseCusps() {
        // If we don't have house cusps data yet, calculate it
        if (!this.houseCusps || this.houseCusps.length === 0) {
            this._initializeHouseCusps();
        }
        
        // Ensure we're returning the correct format - convert to legacy format if needed
        if (this.houseCusps.length > 0 && typeof this.houseCusps[0] === 'number') {
            return this.houseCusps.map(longitude => ({ lon: longitude }));
        }
        
        return this.houseCusps;
    }
    
    /**
     * Sets the Ascendant position and recalculates house cusps
     * @param {number} ascendant - Ascendant longitude in degrees
     * @returns {boolean} - Success status
     */
    setAscendant(ascendant) {
        if (typeof ascendant !== 'number' || ascendant < 0 || ascendant >= 360) {
            return false;
        }
        
        this.astronomicalData.ascendant = ascendant;
        this._initializeHouseCusps();
        return true;
    }
    
    /**
     * Sets the Midheaven position and recalculates house cusps
     * @param {number} mc - Midheaven longitude in degrees
     * @returns {boolean} - Success status
     */
    setMidheaven(mc) {
        if (typeof mc !== 'number' || mc < 0 || mc >= 360) {
            return false;
        }
        
        this.astronomicalData.mc = mc;
        this._initializeHouseCusps();
        return true;
    }
    
    /**
     * Sets the geographic latitude and recalculates house cusps
     * @param {number} latitude - Geographic latitude in degrees
     * @returns {boolean} - Success status
     */
    setLatitude(latitude) {
        if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
            return false;
        }
        
        this.astronomicalData.latitude = latitude;
        this._initializeHouseCusps();
        return true;
    }
    
    /**
     * Sets a planet's position
     * @param {string} planetName - Name of the planet
     * @param {number} longitude - Longitude in degrees
     * @returns {boolean} - Success status
     */
    setPlanetPosition(planetName, longitude) {
        const planetLower = planetName.toLowerCase();
        
        if (typeof longitude !== 'number' || longitude < 0 || longitude >= 360) {
            return false;
        }
        
        if (this.astronomicalData.planets.hasOwnProperty(planetLower)) {
            this.astronomicalData.planets[planetLower] = longitude;
            return true;
        }
        
        return false;
    }
    
    /**
     * Gets a planet's position
     * @param {string} planetName - Name of the planet
     * @returns {number|null} - Planet longitude or null if not found
     */
    getPlanetPosition(planetName) {
        const planetLower = planetName.toLowerCase();
        
        if (this.astronomicalData.planets.hasOwnProperty(planetLower)) {
            return this.astronomicalData.planets[planetLower];
        }
        
        return null;
    }
    
    /**
     * Gets the current house system
     * @returns {string} - Name of the current house system
     */
    getHouseSystem() {
        return this.astronomicalData.houseSystem;
    }
    
    /**
     * Gets the available house systems by creating a temporary calculator
     * @returns {Array} - Array of available house system names
     */
    getAvailableHouseSystems() {
        const calculator = new HouseCalculator();
        return calculator.getAvailableHouseSystems();
    }
} 