/**
 * ServiceRegistry.js
 * A simple service locator/registry with all dependencies inlined.
 */

// Self-contained implementation
export class ServiceRegistry {
    // Private map to store service instances
    static #instances = new Map();
    
    /**
     * Registers a service instance with the registry
     * @param {string} key - Service identifier
     * @param {Object} instance - Service instance
     */
    static register(key, instance) {
        this.#instances.set(key, instance);
    }
    
    /**
     * Retrieves a service instance from the registry
     * @param {string} key - Service identifier
     * @returns {Object|undefined} The service instance, or undefined if not found
     */
    static get(key) {
        return this.#instances.get(key);
    }
    
    /**
     * Checks if a service is registered
     * @param {string} key - Service identifier
     * @returns {boolean} True if the service is registered
     */
    static has(key) {
        return this.#instances.has(key);
    }
    
    /**
     * Clears all registered services
     * Useful for testing or reinitialization
     */
    static clear() {
        this.#instances.clear();
    }
    
    /**
     * Gets or creates a basic SvgUtils-compatible instance
     * @returns {Object} An object with SVG utility methods
     */
    static getSvgUtils() {
        if (!this.has('svgUtils')) {
            // Create a simple SVG utilities object
            const svgUtils = {
                svgNS: "http://www.w3.org/2000/svg",
                
                createSVGElement(tagName, attributes = {}) {
                    const element = document.createElementNS(this.svgNS, tagName);
                    for (const [key, value] of Object.entries(attributes)) {
                        element.setAttribute(key, value);
                    }
                    return element;
                },
                
                addTooltip(element, text) {
                    const title = document.createElementNS(this.svgNS, "title");
                    title.textContent = text;
                    element.appendChild(title);
                    return element;
                },
                
                pointOnCircle(centerX, centerY, radius, angle) {
                    const radians = (angle - 90) * (Math.PI / 180);
                    return {
                        x: centerX + radius * Math.cos(radians),
                        y: centerY + radius * Math.sin(radians)
                    };
                }
            };
            
            this.register('svgUtils', svgUtils);
        }
        return this.get('svgUtils');
    }
    
    /**
     * Gets the IconProvider instance
     * NOTE: IconProvider should be registered externally before use
     * This method only retrieves, does not create
     * @returns {Object|undefined} The IconProvider instance if registered
     */
    static getIconProvider() {
        if (!this.has('iconProvider')) {
            console.warn('ServiceRegistry: IconProvider not registered. Icons may not work correctly.');
            console.warn('ServiceRegistry: This should be initialized in main.js with inline IconData.');
            return null;
        }
        return this.get('iconProvider');
    }
    
    /**
     * Initializes all core services at once
     * @param {Object} options - Initialization options
     */
    static initializeServices(options = {}) {
        // Initialize SvgUtils
        this.getSvgUtils();
        
        // Note: IconProvider should be registered externally in main.js
        // with inline IconData before calling this method
        
        console.log("ServiceRegistry: Core services initialized");
    }
} 