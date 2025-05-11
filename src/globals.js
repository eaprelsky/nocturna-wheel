/**
 * globals.js
 * Defines global stubs for all classes needed by NocturnaWheel
 * These stubs will be replaced by the actual implementations in the bundle
 * but they ensure the constructors and methods exist in the global scope
 */

// More complete ChartConfig stub including all methods used in NocturnaWheel
window.ChartConfig = class ChartConfig {
    constructor(customConfig = {}) {
        console.log("Using stubbed ChartConfig");
        
        // Basic properties needed by NocturnaWheel
        this.aspectSettings = { enabled: true, orb: 6, types: {} };
        this.zodiacSettings = { enabled: true };
        this.planetSettings = { enabled: true, primaryEnabled: true, secondaryEnabled: true };
        this.houseSettings = { enabled: true, rotationAngle: 0 };
        this.svg = { width: 460, height: 460, viewBox: "0 0 460 460", center: { x: 230, y: 230 } };
        this.assets = { basePath: "./assets/" };
        this.radius = { 
            innermost: 90, 
            zodiacInner: 120, 
            zodiacMiddle: 150,
            zodiacOuter: 180
        };
        
        // Internal state for house system
        this._houseSystem = "placidus";
        this._houseCusps = [];
        
        // Deep merge with custom config if provided
        if (customConfig && typeof customConfig === 'object') {
            this.mergeConfig(customConfig);
        }
        
        // Initialize house cusps
        this._initializeHouseCusps();
    }
    
    // Initialize house cusps based on selected house system
    _initializeHouseCusps() {
        try {
            // Create new HouseCalculator
            const calculator = new HouseCalculator();
            
            // Get house cusps based on selected system
            this._houseCusps = calculator.calculateHouseCusps();
            console.log("ChartConfig: House cusps initialized:", this._houseCusps.length);
        } catch (error) {
            console.error("Failed to calculate house cusps:", error);
            // Fallback to default even spacing
            this._houseCusps = Array.from({ length: 12 }, (_, i) => ({
                lon: i * 30
            }));
        }
    }
    
    // Methods used by NocturnaWheel
    updateAspectSettings(settings) {
        if (settings && typeof settings === 'object') {
            this.aspectSettings = { ...this.aspectSettings, ...settings };
        }
    }
    
    mergeConfig(customConfig) {
        // Simple shallow merge for stub
        for (const key in customConfig) {
            if (Object.prototype.hasOwnProperty.call(customConfig, key)) {
                this[key] = customConfig[key];
            }
        }
    }
    
    getHouseCusps() {
        return this._houseCusps;
    }
    
    togglePlanetVisibility(planetName, visible) {
        console.log(`ChartConfig: Toggling planet ${planetName} visibility to ${visible}`);
        return true;
    }
    
    toggleHousesVisibility(visible) {
        console.log(`ChartConfig: Toggling houses visibility to ${visible}`);
        this.houseSettings.enabled = visible !== false;
        return true;
    }
    
    toggleAspectsVisibility(visible) {
        console.log(`ChartConfig: Toggling aspects visibility to ${visible}`);
        this.aspectSettings.enabled = visible !== false;
        return true;
    }
    
    togglePrimaryPlanetsVisibility(visible) {
        console.log(`ChartConfig: Toggling primary planets visibility to ${visible}`);
        this.planetSettings.primaryEnabled = visible !== false;
        return true;
    }
    
    toggleSecondaryPlanetsVisibility(visible) {
        console.log(`ChartConfig: Toggling secondary planets visibility to ${visible}`);
        this.planetSettings.secondaryEnabled = visible !== false;
        return true;
    }
    
    setHouseSystem(systemName) {
        console.log(`ChartConfig: Setting house system to ${systemName}`);
        this._houseSystem = systemName || "placidus";
        this._initializeHouseCusps();
        return true;
    }
    
    getAvailableHouseSystems() {
        // Get systems from AstrologyUtils
        if (window.AstrologyUtils && typeof window.AstrologyUtils.getHouseSystems === 'function') {
            return window.AstrologyUtils.getHouseSystems();
        }
        
        // Fallback if AstrologyUtils not available
        return {
            "placidus": "Placidus (Most common)",
            "koch": "Koch",
            "equal": "Equal",
            "whole-sign": "Whole Sign",
            "regiomontanus": "Regiomontanus",
            "campanus": "Campanus",
            "porphyry": "Porphyry"
        };
    }
    
    getHouseSystem() { 
        return this._houseSystem || "placidus"; 
    }
    
    getCurrentHouseSystem() {
        return this.getHouseSystem();
    }
    
    setHouseRotation(angle) {
        console.log(`ChartConfig: Setting house rotation to ${angle}°`);
        this.houseSettings.rotationAngle = angle;
        return true;
    }
};

// Improved SvgUtils class that creates actual SVG elements with more debugging
window.SvgUtils = class SvgUtils {
    constructor() {
        this.svgNS = "http://www.w3.org/2000/svg";
        console.log("SvgUtils: Created with SVG namespace:", this.svgNS);
    }
    
    createSVGElement(tagName, attributes = {}) { 
        try {
            console.log(`SvgUtils: Creating ${tagName} element with attributes:`, JSON.stringify(attributes));
            
            if (!tagName) {
                console.error("SvgUtils: Missing tagName parameter");
                return document.createElement('div'); // Fallback
            }
            
            // Create an actual SVG element using the proper namespace
            let element;
            
            // Special handling for circle elements which are problematic
            if (tagName === 'circle') {
                console.log("SvgUtils: Special handling for circle element");
                const svg = document.createElementNS(this.svgNS, 'svg');
                svg.innerHTML = `<circle 
                    cx="${attributes.cx || 0}" 
                    cy="${attributes.cy || 0}" 
                    r="${attributes.r || 10}" 
                    class="${attributes.class || ''}"
                />`;
                element = svg.firstChild;
                
                // Make sure we got a valid element
                if (!element || element.nodeType !== Node.ELEMENT_NODE) {
                    console.error("SvgUtils: Failed to create circle via innerHTML, falling back to direct creation");
                    element = document.createElementNS(this.svgNS, tagName);
                }
            } else {
                element = document.createElementNS(this.svgNS, tagName);
            }
            
            // Set all attributes
            for (const [key, value] of Object.entries(attributes)) {
                try {
                    element.setAttribute(key, value);
                } catch (attrError) {
                    console.error(`SvgUtils: Error setting attribute ${key}=${value}:`, attrError.message);
                }
            }
            
            console.log(`SvgUtils: Successfully created ${tagName} element`);
            return element;
        } catch (error) {
            console.error(`SvgUtils: Error creating SVG element ${tagName}:`, error.message);
            
            // Create a placeholder element to prevent null errors
            console.log("SvgUtils: Returning placeholder div instead");
            const div = document.createElement('div');
            div.setAttribute('data-svg-fallback', tagName);
            return div;
        }
    }
    
    pointOnCircle(centerX, centerY, radius, angleDegrees) {
        // Convert degrees to radians
        const angleRadians = (angleDegrees - 90) * Math.PI / 180;
        
        // Calculate coordinates
        const x = centerX + radius * Math.cos(angleRadians);
        const y = centerY + radius * Math.sin(angleRadians);
        
        return { x, y };
    }
    
    addTooltip(element, text) {
        // In a real implementation, this would add a title or tooltip
        if (element && typeof element.setAttribute === 'function') {
            element.setAttribute('title', text || '');
        }
    }
};

window.AstrologyUtils = {
    getZodiacSigns: () => ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"],
    getPlanetSymbol: () => "",
    getZodiacSignFullName: (sign) => sign ? sign.charAt(0).toUpperCase() + sign.slice(1) : "",
    getPlanetFullName: (planet) => planet ? planet.charAt(0).toUpperCase() + planet.slice(1) : "",
    capitalizeFirstLetter: (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : "",
    houseToRoman: (num) => ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"][num - 1] || "",
    getHouseSystems: () => {
        // Return common house systems
        return {
            "placidus": "Placidus (Most common)",
            "koch": "Koch",
            "equal": "Equal",
            "whole-sign": "Whole Sign",
            "regiomontanus": "Regiomontanus",
            "campanus": "Campanus",
            "porphyry": "Porphyry"
        };
    }
};

window.PlanetPositionCalculator = {
    adjustOverlaps: () => []
};

window.HouseCalculator = class HouseCalculator {
    calculateHouseCusps() { 
        // Return 12 sample house cusps (30 degrees apart) for placeholder implementation
        return [
            { lon: 0 },   // 1st house cusp (Ascendant)
            { lon: 30 },  // 2nd house cusp
            { lon: 60 },  // 3rd house cusp
            { lon: 90 },  // 4th house cusp (IC)
            { lon: 120 }, // 5th house cusp
            { lon: 150 }, // 6th house cusp
            { lon: 180 }, // 7th house cusp (Descendant)
            { lon: 210 }, // 8th house cusp
            { lon: 240 }, // 9th house cusp
            { lon: 270 }, // 10th house cusp (MC)
            { lon: 300 }, // 11th house cusp
            { lon: 330 }  // 12th house cusp
        ]; 
    }
    
    getAvailableHouseSystems() { 
        // Return common house systems
        return {
            "placidus": "Placidus (Most common)",
            "koch": "Koch",
            "equal": "Equal",
            "whole-sign": "Whole Sign",
            "regiomontanus": "Regiomontanus",
            "campanus": "Campanus",
            "porphyry": "Porphyry"
        }; 
    }
};

// These classes are already exported properly, but we define stubs just in case
window.BaseRenderer = class BaseRenderer {
    constructor(options) { 
        console.log("BaseRenderer: Initializing with options:", JSON.stringify(options || {}));
        this.options = options || {};
        this.svgUtils = new window.SvgUtils();
        this.centerX = 230;
        this.centerY = 230;
        this.outerRadius = 180;
        this.middleRadius = 150;
        this.innerRadius = 120;
    }
    clearGroup(group) {
        if (group && typeof group.innerHTML === 'string') {
            console.log("BaseRenderer: Clearing group");
            group.innerHTML = '';
        } else {
            console.warn("BaseRenderer: Cannot clear group, invalid element", group);
        }
    }
    render() { 
        console.log("BaseRenderer: Default render called");
        return []; 
    }
};

window.ZodiacRenderer = class ZodiacRenderer extends window.BaseRenderer {
    constructor(options) {
        super(options);
        console.log("ZodiacRenderer: Initialized");
    }
    
    // Override render method to provide simpler implementation
    render(parentGroup) {
        console.log("ZodiacRenderer: Render called with parentGroup:", parentGroup);
        if (!parentGroup) {
            console.error("ZodiacRenderer: parentGroup is null or undefined.");
            return [];
        }
        
        this.clearGroup(parentGroup);
        const renderedElements = [];
        
        try {
            // Create the three concentric circles
            console.log("ZodiacRenderer: Creating circles");
            
            // Outer circle (zodiac outer edge)
            const outerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            outerCircle.setAttribute("cx", this.centerX);
            outerCircle.setAttribute("cy", this.centerY);
            outerCircle.setAttribute("r", this.outerRadius);
            outerCircle.setAttribute("fill", "transparent"); 
            outerCircle.setAttribute("stroke", "#333");
            outerCircle.setAttribute("stroke-width", "1");
            outerCircle.setAttribute("class", "zodiac-element chart-outer-circle");
            parentGroup.appendChild(outerCircle);
            renderedElements.push(outerCircle);
            
            // Middle circle (zodiac inner edge)
            const middleCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            middleCircle.setAttribute("cx", this.centerX);
            middleCircle.setAttribute("cy", this.centerY);
            middleCircle.setAttribute("r", this.middleRadius);
            middleCircle.setAttribute("fill", "white");
            middleCircle.setAttribute("stroke", "#666");
            middleCircle.setAttribute("stroke-width", "1");
            middleCircle.setAttribute("class", "zodiac-element chart-middle-circle");
            parentGroup.appendChild(middleCircle);
            renderedElements.push(middleCircle);
            
            // Inner circle (house circle)
            const innerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            innerCircle.setAttribute("cx", this.centerX);
            innerCircle.setAttribute("cy", this.centerY);
            innerCircle.setAttribute("r", this.innerRadius);
            innerCircle.setAttribute("fill", "white");
            innerCircle.setAttribute("stroke", "#999");
            innerCircle.setAttribute("stroke-width", "0.5");
            innerCircle.setAttribute("class", "zodiac-element chart-inner-circle");
            parentGroup.appendChild(innerCircle);
            renderedElements.push(innerCircle);
            
            // Draw division lines for zodiac signs (12 lines)
            console.log("ZodiacRenderer: Drawing sign division lines");
            for (let i = 0; i < 12; i++) {
                const angle = i * 30; // 30 degrees per sign (360/12)
                
                // Calculate start and end points for the line
                const startPoint = this.pointOnCircle(this.centerX, this.centerY, this.middleRadius, angle);
                const endPoint = this.pointOnCircle(this.centerX, this.centerY, this.outerRadius, angle);
                
                // Create the line
                const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line.setAttribute("x1", startPoint.x);
                line.setAttribute("y1", startPoint.y);
                line.setAttribute("x2", endPoint.x);
                line.setAttribute("y2", endPoint.y);
                line.setAttribute("stroke", "#333");
                line.setAttribute("stroke-width", "1");
                line.setAttribute("class", "zodiac-element zodiac-division-line");
                
                parentGroup.appendChild(line);
                renderedElements.push(line);
            }
            
            console.log("ZodiacRenderer: Rendering complete with", renderedElements.length, "elements");
            return renderedElements;
        } catch (error) {
            console.error("ZodiacRenderer: Error rendering:", error.message);
            return renderedElements;
        }
    }
    
    // Helper method to calculate points on a circle
    pointOnCircle(centerX, centerY, radius, angleDegrees) {
        // Convert degrees to radians
        const angleRadians = (angleDegrees - 90) * Math.PI / 180;
        
        // Calculate coordinates
        const x = centerX + radius * Math.cos(angleRadians);
        const y = centerY + radius * Math.sin(angleRadians);
        
        return { x, y };
    }
};

window.HouseRenderer = class HouseRenderer extends window.BaseRenderer {
    constructor(options) {
        super(options);
        this.houseData = options && options.houseData || [];
        console.log("HouseRenderer: Initialized with house data length:", this.houseData.length);
    }
    
    renderDivisions(parentGroup, rotationAngle = 0) {
        console.log("HouseRenderer: Rendering divisions with rotation angle:", rotationAngle);
        if (!parentGroup) {
            console.error("HouseRenderer: parentGroup is null or undefined.");
            return [];
        }
        
        this.clearGroup(parentGroup);
        const renderedElements = [];
        
        try {
            // If no house data, return empty result
            if (!this.houseData || this.houseData.length < 12) {
                console.warn("HouseRenderer: Missing or incomplete house data");
                return renderedElements;
            }
            
            // Draw house division lines
            console.log("HouseRenderer: Drawing house division lines");
            
            // Get the center and radii from the options or use defaults
            const centerX = this.centerX || 230;
            const centerY = this.centerY || 230;
            const innerRadius = this.innerRadius || 120;
            const innermostRadius = 90; // Standard innermost radius
            
            // Draw divisions for all 12 houses
            for (let i = 0; i < 12; i++) {
                const houseCusp = this.houseData[i];
                if (!houseCusp || typeof houseCusp.lon !== 'number') continue;
                
                // Apply rotation angle to the house position
                const angle = houseCusp.lon + (rotationAngle || 0);
                
                // Calculate start and end points for the line
                const startPoint = this.pointOnCircle(centerX, centerY, innermostRadius, angle);
                const endPoint = this.pointOnCircle(centerX, centerY, innerRadius, angle);
                
                // Create the line
                const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line.setAttribute("x1", startPoint.x);
                line.setAttribute("y1", startPoint.y);
                line.setAttribute("x2", endPoint.x);
                line.setAttribute("y2", endPoint.y);
                line.setAttribute("stroke", "#666");
                line.setAttribute("stroke-width", "1");
                line.setAttribute("class", "house-element house-division-line");
                
                // Add special class for significant house cusps
                if (i === 0) line.classList.add("asc"); // Ascendant
                if (i === 3) line.classList.add("ic");  // IC
                if (i === 6) line.classList.add("dsc"); // Descendant
                if (i === 9) line.classList.add("mc");  // MC
                
                parentGroup.appendChild(line);
                renderedElements.push(line);
            }
            
            console.log("HouseRenderer: House divisions rendered with", renderedElements.length, "elements");
            return renderedElements;
        } catch (error) {
            console.error("HouseRenderer: Error rendering divisions:", error.message);
            return renderedElements;
        }
    }
    
    renderNumbers(parentGroup, rotationAngle = 0) {
        console.log("HouseRenderer: Rendering house numbers with rotation angle:", rotationAngle);
        if (!parentGroup) {
            console.error("HouseRenderer: parentGroup is null or undefined.");
            return [];
        }
        
        this.clearGroup(parentGroup);
        const renderedElements = [];
        
        try {
            // If no house data, return empty result
            if (!this.houseData || this.houseData.length < 12) {
                console.warn("HouseRenderer: Missing or incomplete house data");
                return renderedElements;
            }
            
            // Draw house numbers
            console.log("HouseRenderer: Drawing house numbers");
            
            // Get the center and radii from the options or use defaults
            const centerX = this.centerX || 230;
            const centerY = this.centerY || 230;
            const middleRadius = 105; // Position for house numbers
            
            // Draw numbers for all 12 houses
            for (let i = 0; i < 12; i++) {
                const houseNum = i + 1;
                const romanNum = this.houseToRoman(houseNum);
                
                // Use the position halfway between this cusp and the next
                const thisCusp = this.houseData[i];
                const nextCusp = this.houseData[(i + 1) % 12];
                
                if (!thisCusp || !nextCusp) continue;
                
                // Calculate the midpoint angle, adjusting for wrap-around
                let angle1 = thisCusp.lon + (rotationAngle || 0);
                let angle2 = nextCusp.lon + (rotationAngle || 0);
                
                // Ensure the angle is between 0 and 360
                angle1 = angle1 % 360;
                if (angle1 < 0) angle1 += 360;
                
                angle2 = angle2 % 360;
                if (angle2 < 0) angle2 += 360;
                
                // Handle wrap-around for house 12 to house 1
                if (i === 11 && angle2 < angle1) {
                    angle2 += 360;
                }
                
                // Calculate the midpoint angle
                let midAngle = (angle1 + angle2) / 2;
                if (Math.abs(angle2 - angle1) > 180) {
                    midAngle += 180; // Correct when crossing 0/360
                }
                
                // Calculate text position
                const textPos = this.pointOnCircle(centerX, centerY, middleRadius, midAngle);
                
                // Create the text element
                const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                text.setAttribute("x", textPos.x);
                text.setAttribute("y", textPos.y);
                text.setAttribute("text-anchor", "middle");
                text.setAttribute("dominant-baseline", "middle");
                text.setAttribute("fill", "#333333");
                text.setAttribute("font-size", "10px");
                text.setAttribute("font-weight", "bold");
                text.setAttribute("class", "house-element house-number");
                text.textContent = romanNum;
                
                parentGroup.appendChild(text);
                renderedElements.push(text);
            }
            
            console.log("HouseRenderer: House numbers rendered with", renderedElements.length, "elements");
            return renderedElements;
        } catch (error) {
            console.error("HouseRenderer: Error rendering house numbers:", error.message);
            return renderedElements;
        }
    }
    
    // Helper method to convert house number to Roman numerals
    houseToRoman(num) {
        const romans = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
        return romans[num - 1] || num.toString();
    }
    
    // Helper method to calculate points on a circle (reused from ZodiacRenderer)
    pointOnCircle(centerX, centerY, radius, angleDegrees) {
        // Convert degrees to radians
        const angleRadians = (angleDegrees - 90) * Math.PI / 180;
        
        // Calculate coordinates
        const x = centerX + radius * Math.cos(angleRadians);
        const y = centerY + radius * Math.sin(angleRadians);
        
        return { x, y };
    }
};

window.PlanetRenderer = class PlanetRenderer extends window.BaseRenderer {
    renderAllPlanetTypes() { return { primary: [], secondary: [] }; }
};

window.ClientSideAspectRenderer = class ClientSideAspectRenderer extends window.BaseRenderer {};

window.SVGManager = class SVGManager {
    constructor() { 
        this.svgNS = "http://www.w3.org/2000/svg";
        this.groups = {};
        this.svgElement = null;
        console.log("SVGManager: Constructed");
    }
    
    initialize(container, options = {}) { 
        try {
            console.log("SVGManager: Initializing with container:", container);
            
            // Create actual SVG element
            const svgElement = document.createElementNS(this.svgNS, "svg");
            
            // Set attributes
            svgElement.setAttribute("width", options.width || 460);
            svgElement.setAttribute("height", options.height || 460);
            svgElement.setAttribute("viewBox", options.viewBox || "0 0 460 460");
            svgElement.setAttribute("class", "nocturna-wheel-chart");
            
            // Add it to the container
            if (typeof container === 'string') {
                container = document.querySelector(container);
            }
            
            if (container && container.appendChild) {
                container.appendChild(svgElement);
                this.svgElement = svgElement;
                console.log("SVGManager: SVG element created and added to container");
            } else {
                console.error("SVGManager: Invalid container:", container);
            }
            
            return svgElement;
        } catch (error) {
            console.error("SVGManager: Failed to initialize SVG", error.message);
            return document.createElement('div');
        }
    }
    
    createStandardGroups() {
        console.log("SVGManager: Creating standard groups with svgElement:", this.svgElement);
        if (!this.svgElement) return;
        
        // Create standard groups for organization
        const groupNames = ["zodiac", "houses", "houseDivisions", "aspects", "primaryPlanets", "secondaryPlanets"];
        console.log("SVGManager: Group names:", groupNames);
        
        groupNames.forEach(name => {
            try {
                console.log(`SVGManager: Creating group '${name}'`);
                const group = document.createElementNS(this.svgNS, "g");
                group.setAttribute("class", name + "-group");
                this.svgElement.appendChild(group);
                this.groups[name] = group;
                console.log(`SVGManager: Group '${name}' created successfully`);
            } catch (error) {
                console.error(`SVGManager: Error creating group '${name}':`, error.message);
            }
        });
    }
    
    getGroup(name) { 
        const group = this.groups[name];
        if (!group) {
            console.warn(`SVGManager: Group '${name}' not found, returning placeholder`);
            return document.createElementNS(this.svgNS, "g");
        }
        return group;
    }
    
    getAllGroups() { 
        return this.groups; 
    }
    
    getSVG() { 
        return this.svgElement; 
    }
};

// ChartRenderer stub implementation
window.ChartRenderer = class ChartRenderer {
    constructor(chart, options = {}) {
        this.chart = chart;
        this.options = options;
        this.svgUtils = new window.SvgUtils();
        console.log("ChartRenderer: Initialized");
    }
    
    renderInnerElements() {
        console.log("ChartRenderer: renderInnerElements called");
        
        try {
            // Get SVG directly instead of trying to access through chart.chart.svgManager
            let svgElement = null;
            
            // First try getting from the chart container
            if (this.chart && this.chart.options && this.chart.options.container) {
                const container = typeof this.chart.options.container === 'string' ?
                    document.querySelector(this.chart.options.container) :
                    this.chart.options.container;
                
                if (container) {
                    svgElement = container.querySelector('svg');
                    console.log("ChartRenderer: Found SVG in container:", svgElement ? "yes" : "no");
                }
            }
            
            // If no SVG found, try getting from chart directly
            if (!svgElement && this.chart && this.chart.svgManager) {
                svgElement = this.chart.svgManager.getSVG();
                console.log("ChartRenderer: Found SVG from chart.svgManager:", svgElement ? "yes" : "no");
            }
            
            // If still no SVG, try from chart.chart
            if (!svgElement && this.chart && this.chart.chart && this.chart.chart.svgManager) {
                svgElement = this.chart.chart.svgManager.getSVG();
                console.log("ChartRenderer: Found SVG from chart.chart.svgManager:", svgElement ? "yes" : "no");
            }
            
            // Final fallback: directly from the document
            if (!svgElement) {
                const chartContainer = document.querySelector('#chart-container');
                if (chartContainer) {
                    svgElement = chartContainer.querySelector('svg');
                    console.log("ChartRenderer: Found SVG from #chart-container:", svgElement ? "yes" : "no");
                }
            }
            
            if (!svgElement) {
                console.error("ChartRenderer: No SVG element found anywhere");
                return;
            }
            
            // Draw the innermost circle
            this.drawInnermostCircle(svgElement);
            
            console.log("ChartRenderer: Inner elements rendered successfully");
        } catch (error) {
            console.error("ChartRenderer: Error rendering inner elements:", error);
        }
    }
    
    drawInnermostCircle(svg) {
        try {
            console.log("ChartRenderer: Drawing innermost circle on SVG:", svg);
            
            // Find existing innermost circle or create a new group for it
            let innermostGroup = svg.querySelector('.chart-innermost-circle-group');
            if (!innermostGroup) {
                innermostGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
                innermostGroup.setAttribute("class", "chart-innermost-circle-group");
                svg.appendChild(innermostGroup);
                console.log("ChartRenderer: Created new innermost circle group");
            } else {
                innermostGroup.innerHTML = ''; // Clear existing content
                console.log("ChartRenderer: Cleared existing innermost circle group");
            }
            
            // Create the innermost circle
            const innerRadius = 90; // Standard innermost radius
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", 230); // Center X
            circle.setAttribute("cy", 230); // Center Y
            circle.setAttribute("r", innerRadius);
            circle.setAttribute("fill", "white");
            circle.setAttribute("stroke", "#999");
            circle.setAttribute("stroke-width", "0.5");
            circle.setAttribute("class", "chart-innermost-circle");
            
            innermostGroup.appendChild(circle);
            
            console.log("ChartRenderer: Innermost circle drawn successfully with radius", innerRadius);
            return circle;
        } catch (error) {
            console.error("ChartRenderer: Error drawing innermost circle:", error);
            return null;
        }
    }
    
    renderPlanets() { return []; }
    drawPlanetsAndIcons() { return []; }
    drawPlanetDot() {}
    drawPlanetIcon() {}
    drawConnector() {}
};

console.log("Global stubs loaded successfully"); 