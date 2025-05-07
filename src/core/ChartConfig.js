/**
 * ChartConfig.js
 * Configuration class for the natal chart rendering.
 */
class ChartConfig {
    /**
     * Creates a new configuration with default settings
     * @param {Object} customConfig - Custom configuration to merge with defaults
     */
    constructor(customConfig = {}) {
        // Aspect settings
        this.aspectSettings = {
            enabled: true,
            orb: 6, // Default orb for aspects
            types: {
                conjunction: { angle: 0, orb: 8, color: "#ff0000", enabled: true },
                opposition: { angle: 180, orb: 8, color: "#0000ff", enabled: true },
                trine: { angle: 120, orb: 6, color: "#00ff00", enabled: true },
                square: { angle: 90, orb: 6, color: "#ff00ff", enabled: true },
                sextile: { angle: 60, orb: 4, color: "#00ffff", enabled: true }
                // Other aspects can be added here
            }
        };
        
        // Planet settings
        this.planetSettings = {
            size: 12,
            enabled: true,
            colors: {
                sun: "#ffcc00",
                moon: "#cccccc",
                mercury: "#9999ff",
                venus: "#ff66cc",
                mars: "#ff0000",
                jupiter: "#ffcc66",
                saturn: "#333333",
                uranus: "#99ccff",
                neptune: "#6666ff",
                pluto: "#996699"
            },
            // Individual planet visibility
            visibility: {
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
        
        // House settings
        this.houseSettings = {
            enabled: true,
            system: "Placidus", // Default house system
            lineColor: "#666666",
            textColor: "#333333",
            fontSize: 10,
            rotationAngle: 0, // Custom rotation angle for house system
            houseSystems: {
                currentSystem: "Placidus", // Default house system
                // House systems data will be populated during initialization
                systems: {}
            }
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
        
        // Merge custom config with defaults (deep merge)
        this.mergeConfig(customConfig);
        
        // Initialize house systems data after merging config
        this._initializeHouseSystems();
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
     * Initializes available house systems with default house cusps
     * @private
     */
    _initializeHouseSystems() {
        // Get available house systems from AstrologyUtils
        const availableSystems = AstrologyUtils.getHouseSystems();
        const systems = {};
        
        // For each house system, create default house cusps
        // In a real implementation, these would be calculated based on the birth data and house system formula
        Object.keys(availableSystems).forEach(system => {
            // For demo purposes, we'll use slightly different house cusps for each system
            switch(system) {
                case "Placidus":
                    systems[system] = [
                        { lon: 300.32 },  // 1st house cusp
                        { lon: 330.15 },  // 2nd house cusp
                        { lon: 355.24 },  // 3rd house cusp
                        { lon: 20.32 },   // 4th house cusp
                        { lon: 45.15 },   // 5th house cusp
                        { lon: 75.24 },   // 6th house cusp
                        { lon: 120.32 },  // 7th house cusp
                        { lon: 150.15 },  // 8th house cusp
                        { lon: 175.24 },  // 9th house cusp
                        { lon: 200.32 },  // 10th house cusp
                        { lon: 225.15 },  // 11th house cusp
                        { lon: 255.24 }   // 12th house cusp
                    ];
                    break;
                case "Koch":
                    systems[system] = [
                        { lon: 300.32 },
                        { lon: 325.48 },
                        { lon: 352.76 },
                        { lon: 22.45 },
                        { lon: 48.26 },
                        { lon: 77.65 },
                        { lon: 120.32 },
                        { lon: 145.48 },
                        { lon: 172.76 },
                        { lon: 202.45 },
                        { lon: 228.26 },
                        { lon: 257.65 }
                    ];
                    break;
                case "Equal":
                    // Equal house system has cusps exactly 30° apart
                    const cusps = [];
                    for (let i = 0; i < 12; i++) {
                        cusps.push({ lon: (300 + i * 30) % 360 });
                    }
                    systems[system] = cusps;
                    break;
                case "Whole Sign":
                    // Whole Sign has cusps at the beginning of each sign
                    const wholeSignCusps = [];
                    // Assuming ASC is at 300.32° (in Aquarius)
                    const ascSign = Math.floor(300.32 / 30);
                    for (let i = 0; i < 12; i++) {
                        wholeSignCusps.push({ lon: ((ascSign + i) % 12) * 30 });
                    }
                    systems[system] = wholeSignCusps;
                    break;
                case "Porphyry":
                    systems[system] = [
                        { lon: 300.32 },
                        { lon: 320.21 },
                        { lon: 340.1 },
                        { lon: 20.32 },
                        { lon: 53.77 },
                        { lon: 87.22 },
                        { lon: 120.32 },
                        { lon: 140.21 },
                        { lon: 160.1 },
                        { lon: 200.32 },
                        { lon: 233.77 },
                        { lon: 267.22 }
                    ];
                    break;
                // Add other systems with different house cusp values for demo purposes
                default:
                    // For other systems, use Placidus values with a slight variation
                    systems[system] = [
                        { lon: (300.32 + (system.length * 2)) % 360 },
                        { lon: (330.15 + (system.length * 2)) % 360 },
                        { lon: (355.24 + (system.length * 2)) % 360 },
                        { lon: (20.32 + (system.length * 2)) % 360 },
                        { lon: (45.15 + (system.length * 2)) % 360 },
                        { lon: (75.24 + (system.length * 2)) % 360 },
                        { lon: (120.32 + (system.length * 2)) % 360 },
                        { lon: (150.15 + (system.length * 2)) % 360 },
                        { lon: (175.24 + (system.length * 2)) % 360 },
                        { lon: (200.32 + (system.length * 2)) % 360 },
                        { lon: (225.15 + (system.length * 2)) % 360 },
                        { lon: (255.24 + (system.length * 2)) % 360 }
                    ];
            }
        });
        
        // Store house systems in configuration
        this.houseSettings.houseSystems.systems = systems;
        
        // Set current system to default if not already set
        if (!this.houseSettings.houseSystems.currentSystem || 
            !systems[this.houseSettings.houseSystems.currentSystem]) {
            this.houseSettings.houseSystems.currentSystem = "Placidus";
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
            visible: this.planetSettings.visibility[planetLower] !== false
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
     * Updates aspect settings
     * @param {Object} settings - New aspect settings
     */
    updateAspectSettings(settings) {
        this.aspectSettings = { ...this.aspectSettings, ...settings };
    }

    /**
     * Updates planet settings
     * @param {Object} settings - New planet settings
     */
    updatePlanetSettings(settings) {
        this.planetSettings = { ...this.planetSettings, ...settings };
    }

    /**
     * Updates house settings
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
     * Toggles visibility of a specific planet
     * @param {string} planetName - Name of the planet
     * @param {boolean} visible - Visibility state
     */
    togglePlanetVisibility(planetName, visible) {
        const planetLower = planetName.toLowerCase();
        if (Object.prototype.hasOwnProperty.call(this.planetSettings.visibility, planetLower)) {
            this.planetSettings.visibility[planetLower] = visible;
        }
    }

    /**
     * Toggles visibility of all houses
     * @param {boolean} visible - Visibility state
     */
    toggleHousesVisibility(visible) {
        this.houseSettings.enabled = visible;
    }

    /**
     * Toggles visibility of aspects
     * @param {boolean} visible - Visibility state
     */
    toggleAspectsVisibility(visible) {
        this.aspectSettings.enabled = visible;
    }

    /**
     * Sets the current house system
     * @param {string} systemName - Name of the house system to use
     * @returns {boolean} - Success status
     */
    setHouseSystem(systemName) {
        if (this.houseSettings.houseSystems.systems[systemName]) {
            this.houseSettings.houseSystems.currentSystem = systemName;
            this.houseSettings.system = systemName; // For backward compatibility
            return true;
        }
        return false;
    }
    
    /**
     * Gets the house cusps for the current house system
     * @returns {Array} - Array of house cusps
     */
    getCurrentHouseCusps() {
        const currentSystem = this.houseSettings.houseSystems.currentSystem;
        return this.houseSettings.houseSystems.systems[currentSystem] || [];
    }
    
    /**
     * Gets the available house systems
     * @returns {Object} - Object with available house systems
     */
    getAvailableHouseSystems() {
        return Object.keys(this.houseSettings.houseSystems.systems);
    }
} 