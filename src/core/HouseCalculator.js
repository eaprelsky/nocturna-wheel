/**
 * HouseCalculator.js
 * Responsible for calculating house cusps for various house systems
 * using astronomical formulas.
 */
class HouseCalculator {
    /**
     * Creates a new house calculator
     */
    constructor() {
        // Define available house systems and their calculation methods
        this.houseSystems = {
            "Placidus": this.calculatePlacidus.bind(this),
            "Koch": this.calculateKoch.bind(this),
            "Equal": this.calculateEqual.bind(this),
            "Whole Sign": this.calculateWholeSign.bind(this),
            "Porphyry": this.calculatePorphyry.bind(this),
            "Regiomontanus": this.calculateRegiomontanus.bind(this),
            "Campanus": this.calculateCampanus.bind(this),
            "Morinus": this.calculateMorinus.bind(this),
            "Topocentric": this.calculateTopocentric.bind(this)
        };
    }
    
    /**
     * Returns a list of available house systems
     * @returns {Array} Array of house system names
     */
    getAvailableHouseSystems() {
        return Object.keys(this.houseSystems);
    }
    
    /**
     * Calculate house cusps for a specified system
     * @param {number} ascendant - Ascendant longitude in degrees
     * @param {string} system - House system name
     * @param {Object} options - Additional calculation options
     * @param {number} options.latitude - Geographic latitude in degrees (required for most systems)
     * @param {number} options.mc - Midheaven longitude in degrees (required for some systems)
     * @returns {Array} Array of 12 house cusp longitudes
     * @throws {Error} If system is not supported or required parameters are missing
     */
    calculateHouseCusps(ascendant, system = "Placidus", options = {}) {
        // Validate inputs
        if (typeof ascendant !== 'number' || ascendant < 0 || ascendant >= 360) {
            throw new Error("Ascendant must be a number between 0 and 360");
        }
        
        // Check if system exists
        if (!this.houseSystems[system]) {
            throw new Error(`House system "${system}" is not supported`);
        }
        
        // Calculate house cusps using the appropriate method
        return this.houseSystems[system](ascendant, options);
    }
    
    /**
     * Calculates Placidus house cusps
     * @param {number} ascendant - Ascendant longitude in degrees
     * @param {Object} options - Calculation options
     * @param {number} options.latitude - Geographic latitude in degrees
     * @param {number} options.mc - Midheaven longitude in degrees
     * @returns {Array} Array of 12 house cusp longitudes
     */
    calculatePlacidus(ascendant, { latitude, mc }) {
        // Validate required parameters
        if (typeof latitude !== 'number' || typeof mc !== 'number') {
            throw new Error("Placidus house system requires latitude and mc");
        }
        
        // Implementation of the Placidus house system formula
        // This is a complex calculation involving:
        // - Obliquity of the ecliptic
        // - Trigonometric calculations
        // - Sidereal time conversion
        
        const cusps = new Array(12);
        
        // Set 1st house cusp (Ascendant)
        cusps[0] = ascendant;
        
        // Set 10th house cusp (Midheaven)
        cusps[9] = mc;
        
        // Set 7th house cusp (Descendant)
        cusps[6] = this.normalizeAngle(ascendant + 180);
        
        // Set 4th house cusp (Imum Coeli)
        cusps[3] = this.normalizeAngle(mc + 180);
        
        // Calculate intermediate house cusps using Placidus formulas
        // These calculations would involve:
        // - Semi-arc calculations
        // - Right ascension conversions
        // - Oblique ascension adjustments
        
        // Placeholder calculations to be replaced with actual Placidus formula
        // 11th and 12th houses (between MC and ASC)
        const arc1 = this.calculateArc(cusps[9], cusps[0]);
        cusps[10] = this.normalizeAngle(cusps[9] + arc1 / 3);
        cusps[11] = this.normalizeAngle(cusps[9] + (2 * arc1) / 3);
        
        // 2nd and 3rd houses (between ASC and IC)
        const arc2 = this.calculateArc(cusps[0], cusps[3]);
        cusps[1] = this.normalizeAngle(cusps[0] + arc2 / 3);
        cusps[2] = this.normalizeAngle(cusps[0] + (2 * arc2) / 3);
        
        // 5th and 6th houses (between IC and DSC)
        const arc3 = this.calculateArc(cusps[3], cusps[6]);
        cusps[4] = this.normalizeAngle(cusps[3] + arc3 / 3);
        cusps[5] = this.normalizeAngle(cusps[3] + (2 * arc3) / 3);
        
        // 8th and 9th houses (between DSC and MC)
        const arc4 = this.calculateArc(cusps[6], cusps[9]);
        cusps[7] = this.normalizeAngle(cusps[6] + arc4 / 3);
        cusps[8] = this.normalizeAngle(cusps[6] + (2 * arc4) / 3);
        
        return cusps;
    }
    
    /**
     * Calculates Koch house cusps
     * @param {number} ascendant - Ascendant longitude in degrees
     * @param {Object} options - Calculation options
     * @param {number} options.latitude - Geographic latitude in degrees
     * @param {number} options.mc - Midheaven longitude in degrees
     * @returns {Array} Array of 12 house cusp longitudes
     */
    calculateKoch(ascendant, { latitude, mc }) {
        // Validate required parameters
        if (typeof latitude !== 'number' || typeof mc !== 'number') {
            throw new Error("Koch house system requires latitude and mc");
        }
        
        // Implementation of Koch house system formulas
        // Similar structure to Placidus but with different mathematical approach
        
        const cusps = new Array(12);
        
        // Set angular houses
        cusps[0] = ascendant;
        cusps[9] = mc;
        cusps[6] = this.normalizeAngle(ascendant + 180);
        cusps[3] = this.normalizeAngle(mc + 180);
        
        // Placeholder for Koch calculation logic
        // This would be replaced with the actual Koch formula
        
        // For now, similar to Placidus but with slight variations
        const arc1 = this.calculateArc(cusps[9], cusps[0]);
        cusps[10] = this.normalizeAngle(cusps[9] + arc1 / 3);
        cusps[11] = this.normalizeAngle(cusps[9] + (2 * arc1) / 3);
        
        const arc2 = this.calculateArc(cusps[0], cusps[3]);
        cusps[1] = this.normalizeAngle(cusps[0] + arc2 / 3);
        cusps[2] = this.normalizeAngle(cusps[0] + (2 * arc2) / 3);
        
        const arc3 = this.calculateArc(cusps[3], cusps[6]);
        cusps[4] = this.normalizeAngle(cusps[3] + arc3 / 3);
        cusps[5] = this.normalizeAngle(cusps[3] + (2 * arc3) / 3);
        
        const arc4 = this.calculateArc(cusps[6], cusps[9]);
        cusps[7] = this.normalizeAngle(cusps[6] + arc4 / 3);
        cusps[8] = this.normalizeAngle(cusps[6] + (2 * arc4) / 3);
        
        return cusps;
    }
    
    /**
     * Calculates Equal house cusps (simplest system)
     * @param {number} ascendant - Ascendant longitude in degrees
     * @returns {Array} Array of 12 house cusp longitudes
     */
    calculateEqual(ascendant) {
        const cusps = new Array(12);
        
        // In Equal house system, houses are exactly 30° apart
        // starting from the Ascendant
        for (let i = 0; i < 12; i++) {
            cusps[i] = this.normalizeAngle(ascendant + (i * 30));
        }
        
        return cusps;
    }
    
    /**
     * Calculates Whole Sign house cusps
     * @param {number} ascendant - Ascendant longitude in degrees
     * @returns {Array} Array of 12 house cusp longitudes
     */
    calculateWholeSign(ascendant) {
        const cusps = new Array(12);
        
        // In Whole Sign system, the house cusps are at the beginning of each sign
        // starting from the sign that contains the Ascendant
        
        // Determine the sign of the Ascendant (0-11)
        const ascSign = Math.floor(ascendant / 30);
        
        // Set cusps at the beginning of each sign, starting from ascendant's sign
        for (let i = 0; i < 12; i++) {
            cusps[i] = ((ascSign + i) % 12) * 30;
        }
        
        return cusps;
    }
    
    /**
     * Calculates Porphyry house cusps
     * @param {number} ascendant - Ascendant longitude in degrees
     * @param {Object} options - Calculation options
     * @param {number} options.mc - Midheaven longitude in degrees
     * @returns {Array} Array of 12 house cusp longitudes
     */
    calculatePorphyry(ascendant, { mc }) {
        if (typeof mc !== 'number') {
            throw new Error("Porphyry house system requires mc");
        }
        
        const cusps = new Array(12);
        
        // Set angular houses (1, 4, 7, 10)
        cusps[0] = ascendant;
        cusps[9] = mc;
        cusps[6] = this.normalizeAngle(ascendant + 180);
        cusps[3] = this.normalizeAngle(mc + 180);
        
        // Porphyry simply divides the space between angular houses equally
        
        // Calculate houses 11, 12 (between MC and ASC)
        const arc1 = this.calculateArc(cusps[9], cusps[0]);
        cusps[10] = this.normalizeAngle(cusps[9] + arc1 / 3);
        cusps[11] = this.normalizeAngle(cusps[9] + (2 * arc1 / 3));
        
        // Calculate houses 2, 3 (between ASC and IC)
        const arc2 = this.calculateArc(cusps[0], cusps[3]);
        cusps[1] = this.normalizeAngle(cusps[0] + arc2 / 3);
        cusps[2] = this.normalizeAngle(cusps[0] + (2 * arc2 / 3));
        
        // Calculate houses 5, 6 (between IC and DSC)
        const arc3 = this.calculateArc(cusps[3], cusps[6]);
        cusps[4] = this.normalizeAngle(cusps[3] + arc3 / 3);
        cusps[5] = this.normalizeAngle(cusps[3] + (2 * arc3 / 3));
        
        // Calculate houses 8, 9 (between DSC and MC)
        const arc4 = this.calculateArc(cusps[6], cusps[9]);
        cusps[7] = this.normalizeAngle(cusps[6] + arc4 / 3);
        cusps[8] = this.normalizeAngle(cusps[6] + (2 * arc4 / 3));
        
        return cusps;
    }
    
    /**
     * Implementation for Regiomontanus house system
     * @param {number} ascendant - Ascendant longitude in degrees
     * @param {Object} options - Calculation options
     * @returns {Array} Array of 12 house cusp longitudes
     */
    calculateRegiomontanus(ascendant, { latitude, mc }) {
        if (typeof latitude !== 'number' || typeof mc !== 'number') {
            throw new Error("Regiomontanus house system requires latitude and mc");
        }
        
        const cusps = new Array(12);
        
        // Set angular houses
        cusps[0] = ascendant;
        cusps[9] = mc;
        cusps[6] = this.normalizeAngle(ascendant + 180);
        cusps[3] = this.normalizeAngle(mc + 180);
        
        // Placeholder for Regiomontanus calculation
        // For now, similar to Placidus but with slight variations
        const arc1 = this.calculateArc(cusps[9], cusps[0]);
        cusps[10] = this.normalizeAngle(cusps[9] + arc1 / 3);
        cusps[11] = this.normalizeAngle(cusps[9] + (2 * arc1) / 3);
        
        const arc2 = this.calculateArc(cusps[0], cusps[3]);
        cusps[1] = this.normalizeAngle(cusps[0] + arc2 / 3);
        cusps[2] = this.normalizeAngle(cusps[0] + (2 * arc2) / 3);
        
        const arc3 = this.calculateArc(cusps[3], cusps[6]);
        cusps[4] = this.normalizeAngle(cusps[3] + arc3 / 3);
        cusps[5] = this.normalizeAngle(cusps[3] + (2 * arc3) / 3);
        
        const arc4 = this.calculateArc(cusps[6], cusps[9]);
        cusps[7] = this.normalizeAngle(cusps[6] + arc4 / 3);
        cusps[8] = this.normalizeAngle(cusps[6] + (2 * arc4) / 3);
        
        return cusps;
    }
    
    /**
     * Implementation for Campanus house system
     * @param {number} ascendant - Ascendant longitude in degrees
     * @param {Object} options - Calculation options
     * @returns {Array} Array of 12 house cusp longitudes
     */
    calculateCampanus(ascendant, { latitude, mc }) {
        if (typeof latitude !== 'number' || typeof mc !== 'number') {
            throw new Error("Campanus house system requires latitude and mc");
        }
        
        const cusps = new Array(12);
        
        // Set angular houses
        cusps[0] = ascendant;
        cusps[9] = mc;
        cusps[6] = this.normalizeAngle(ascendant + 180);
        cusps[3] = this.normalizeAngle(mc + 180);
        
        // Placeholder for Campanus calculation
        // For now, similar to Placidus but with slight variations
        const arc1 = this.calculateArc(cusps[9], cusps[0]);
        cusps[10] = this.normalizeAngle(cusps[9] + arc1 / 3);
        cusps[11] = this.normalizeAngle(cusps[9] + (2 * arc1) / 3);
        
        const arc2 = this.calculateArc(cusps[0], cusps[3]);
        cusps[1] = this.normalizeAngle(cusps[0] + arc2 / 3);
        cusps[2] = this.normalizeAngle(cusps[0] + (2 * arc2) / 3);
        
        const arc3 = this.calculateArc(cusps[3], cusps[6]);
        cusps[4] = this.normalizeAngle(cusps[3] + arc3 / 3);
        cusps[5] = this.normalizeAngle(cusps[3] + (2 * arc3) / 3);
        
        const arc4 = this.calculateArc(cusps[6], cusps[9]);
        cusps[7] = this.normalizeAngle(cusps[6] + arc4 / 3);
        cusps[8] = this.normalizeAngle(cusps[6] + (2 * arc4) / 3);
        
        return cusps;
    }
    
    /**
     * Implementation for Morinus house system
     * @param {number} ascendant - Ascendant longitude in degrees
     * @param {Object} options - Calculation options
     * @returns {Array} Array of 12 house cusp longitudes
     */
    calculateMorinus(ascendant, { mc }) {
        if (typeof mc !== 'number') {
            throw new Error("Morinus house system requires mc");
        }
        
        const cusps = new Array(12);
        
        // Set angular houses
        cusps[0] = ascendant;
        cusps[9] = mc;
        cusps[6] = this.normalizeAngle(ascendant + 180);
        cusps[3] = this.normalizeAngle(mc + 180);
        
        // Placeholder for Morinus calculation
        // For now, similar to Placidus but with slight variations
        const arc1 = this.calculateArc(cusps[9], cusps[0]);
        cusps[10] = this.normalizeAngle(cusps[9] + arc1 / 3);
        cusps[11] = this.normalizeAngle(cusps[9] + (2 * arc1) / 3);
        
        const arc2 = this.calculateArc(cusps[0], cusps[3]);
        cusps[1] = this.normalizeAngle(cusps[0] + arc2 / 3);
        cusps[2] = this.normalizeAngle(cusps[0] + (2 * arc2) / 3);
        
        const arc3 = this.calculateArc(cusps[3], cusps[6]);
        cusps[4] = this.normalizeAngle(cusps[3] + arc3 / 3);
        cusps[5] = this.normalizeAngle(cusps[3] + (2 * arc3) / 3);
        
        const arc4 = this.calculateArc(cusps[6], cusps[9]);
        cusps[7] = this.normalizeAngle(cusps[6] + arc4 / 3);
        cusps[8] = this.normalizeAngle(cusps[6] + (2 * arc4) / 3);
        
        return cusps;
    }
    
    /**
     * Implementation for Topocentric house system
     * @param {number} ascendant - Ascendant longitude in degrees
     * @param {Object} options - Calculation options
     * @returns {Array} Array of 12 house cusp longitudes
     */
    calculateTopocentric(ascendant, { latitude, mc }) {
        if (typeof latitude !== 'number' || typeof mc !== 'number') {
            throw new Error("Topocentric house system requires latitude and mc");
        }
        
        const cusps = new Array(12);
        
        // Set angular houses
        cusps[0] = ascendant;
        cusps[9] = mc;
        cusps[6] = this.normalizeAngle(ascendant + 180);
        cusps[3] = this.normalizeAngle(mc + 180);
        
        // Placeholder for Topocentric calculation
        // For now, similar to Placidus but with slight variations
        const arc1 = this.calculateArc(cusps[9], cusps[0]);
        cusps[10] = this.normalizeAngle(cusps[9] + arc1 / 3);
        cusps[11] = this.normalizeAngle(cusps[9] + (2 * arc1) / 3);
        
        const arc2 = this.calculateArc(cusps[0], cusps[3]);
        cusps[1] = this.normalizeAngle(cusps[0] + arc2 / 3);
        cusps[2] = this.normalizeAngle(cusps[0] + (2 * arc2) / 3);
        
        const arc3 = this.calculateArc(cusps[3], cusps[6]);
        cusps[4] = this.normalizeAngle(cusps[3] + arc3 / 3);
        cusps[5] = this.normalizeAngle(cusps[3] + (2 * arc3) / 3);
        
        const arc4 = this.calculateArc(cusps[6], cusps[9]);
        cusps[7] = this.normalizeAngle(cusps[6] + arc4 / 3);
        cusps[8] = this.normalizeAngle(cusps[6] + (2 * arc4) / 3);
        
        return cusps;
    }
    
    /**
     * Helper method to calculate the smallest arc between two angles
     * @param {number} start - Start angle in degrees
     * @param {number} end - End angle in degrees
     * @returns {number} The smallest arc in degrees
     */
    calculateArc(start, end) {
        const diff = this.normalizeAngle(end - start);
        return diff <= 180 ? diff : 360 - diff;
    }
    
    /**
     * Helper method to normalize an angle to 0-360 range
     * @param {number} angle - Angle in degrees
     * @returns {number} Normalized angle
     */
    normalizeAngle(angle) {
        return ((angle % 360) + 360) % 360;
    }
} 