/**
 * AstrologyUtils.js
 * Utility class for astrological calculations
 */
class AstrologyUtils {
    /**
     * Capitalizes the first letter of a string
     * @param {string} string - Input string
     * @returns {string} String with capitalized first letter
     */
    static capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    /**
     * Determines the house based on position and rotation angle
     * @param {number} position - Position in degrees (0-359)
     * @param {number} rotationAngle - Rotation angle of the house system
     * @returns {number} House number (1-12)
     */
    static getHouseFromPosition(position, rotationAngle = 0) {
        // Adjust position relative to house system rotation
        const adjustedPosition = (position - rotationAngle + 360) % 360;
        // Determine house
        return Math.floor(adjustedPosition / 30) + 1;
    }

    /**
     * Returns the list of zodiac sign names
     * @returns {Array} Array of zodiac sign names
     */
    static getZodiacSigns() {
        return [
            "aries", "taurus", "gemini", "cancer", "leo", "virgo", 
            "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
        ];
    }

    /**
     * Returns the available house systems with descriptions
     * @returns {Object} Object mapping house system names to their descriptions
     */
    static getHouseSystems() {
        return {
            "Placidus": "Most commonly used house system in Western astrology, based on time of day",
            "Koch": "Developed by Walter Koch, a time-based system similar to Placidus",
            "Campanus": "Medieval system dividing the prime vertical into equal parts",
            "Regiomontanus": "Similar to Campanus, but using the celestial equator instead of prime vertical",
            "Equal": "Divides the ecliptic into 12 equal segments of 30° each from the Ascendant",
            "Whole Sign": "Assigns the entire rising sign to the 1st house, with subsequent signs as houses",
            "Porphyry": "Simple system that divides each quadrant into three equal parts",
            "Topocentric": "Modern system similar to Placidus but more accurate for extreme latitudes"
        };
    }

    /**
     * Returns the list of planets
     * @returns {Array} Array of planet names
     */
    static getPlanets() {
        return [
            "sun", "moon", "mercury", "venus", "mars", 
            "jupiter", "saturn", "uranus", "neptune", "pluto"
        ];
    }

    /**
     * Converts a house number to a Roman numeral
     * @param {number} house - House number (1-12)
     * @returns {string} Roman numeral
     */
    static houseToRoman(house) {
        const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
        return romanNumerals[house - 1] || '';
    }

    /**
     * Returns the full name of a planet in the specified language
     * @param {string} planetCode - Planet code (sun, moon, etc.)
     * @param {string} language - Language code (default: 'en')
     * @returns {string} Full planet name
     */
    static getPlanetFullName(planetCode, language = 'en') {
        const planetNames = {
            en: {
                "sun": "Sun",
                "moon": "Moon",
                "mercury": "Mercury",
                "venus": "Venus",
                "mars": "Mars",
                "jupiter": "Jupiter",
                "saturn": "Saturn",
                "uranus": "Uranus",
                "neptune": "Neptune",
                "pluto": "Pluto"
            },
            ru: {
                "sun": "Солнце",
                "moon": "Луна",
                "mercury": "Меркурий",
                "venus": "Венера",
                "mars": "Марс",
                "jupiter": "Юпитер",
                "saturn": "Сатурн",
                "uranus": "Уран",
                "neptune": "Нептун",
                "pluto": "Плутон"
            }
        };
        
        const names = planetNames[language] || planetNames.en;
        return names[planetCode.toLowerCase()] || this.capitalizeFirstLetter(planetCode);
    }

    /**
     * Returns the full name of a zodiac sign in the specified language
     * @param {string} signCode - Zodiac sign code (aries, taurus, etc.)
     * @param {string} language - Language code (default: 'en')
     * @returns {string} Full zodiac sign name
     */
    static getZodiacSignFullName(signCode, language = 'en') {
        const signNames = {
            en: {
                "aries": "Aries",
                "taurus": "Taurus",
                "gemini": "Gemini",
                "cancer": "Cancer",
                "leo": "Leo",
                "virgo": "Virgo",
                "libra": "Libra",
                "scorpio": "Scorpio",
                "sagittarius": "Sagittarius",
                "capricorn": "Capricorn",
                "aquarius": "Aquarius",
                "pisces": "Pisces"
            },
            ru: {
                "aries": "Овен",
                "taurus": "Телец",
                "gemini": "Близнецы",
                "cancer": "Рак",
                "leo": "Лев",
                "virgo": "Дева",
                "libra": "Весы",
                "scorpio": "Скорпион",
                "sagittarius": "Стрелец",
                "capricorn": "Козерог",
                "aquarius": "Водолей",
                "pisces": "Рыбы"
            }
        };
        
        const names = signNames[language] || signNames.en;
        return names[signCode.toLowerCase()] || this.capitalizeFirstLetter(signCode);
    }

    /**
     * Returns the astrological symbol (glyph) for a planet
     * @param {string} planetCode - Planet code (sun, moon, etc.)
     * @returns {string} Unicode character representing the planet symbol
     */
    static getPlanetSymbol(planetCode) {
        const planetSymbols = {
            "sun": "☉",
            "moon": "☽",
            "mercury": "☿",
            "venus": "♀",
            "mars": "♂",
            "jupiter": "♃",
            "saturn": "♄",
            "uranus": "♅",
            "neptune": "♆",
            "pluto": "♇"
        };
        
        return planetSymbols[planetCode.toLowerCase()] || null;
    }
} 