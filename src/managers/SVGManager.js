/**
 * SVGManager.js
 * Handles the creation, management, and querying of the main SVG element and its layer groups.
 */
import { ServiceRegistry } from '../services/ServiceRegistry.js';
import { SvgUtils } from '../utils/SvgUtils.js';

export class SVGManager {
    /**
     * Constructor
     * @param {Object} options - Manager options
     * @param {SvgUtils} [options.svgUtils] - SvgUtils instance (optional, will use from registry if not provided)
     */
    constructor(options = {}) {
        this.svgNS = "http://www.w3.org/2000/svg";
        this.svg = null; // Reference to the main SVG element
        this.groups = {}; // References to the layer groups (g elements)
        
        // Use injected svgUtils or get from registry
        this.svgUtils = options.svgUtils || ServiceRegistry.getSvgUtils();
        
        // Define standard group order (bottom to top)
        this.groupOrder = [
            'zodiac',
            'houseDivisions',
            'primaryAspects', // Aspects between primary (outer) planets
            'secondaryAspects', // Aspects between secondary (inner) planets
            'synastryAspects', // Aspects between primary and secondary planets
            'aspects', // Legacy aspect group (for backward compatibility)
            'primaryPlanets', // Outer circle planets
            'secondaryPlanets', // Inner circle planets
            'houses' // House numbers on top
            // Add other groups if needed, e.g., 'tooltips'
        ];
    }

    /**
     * Initializes the main SVG element within a container.
     * @param {string|Element} containerSelector - ID/CSS selector of the container element or the element itself.
     * @param {Object} options - SVG attributes (e.g., viewBox, width, height, class, preserveAspectRatio).
     * @returns {SVGElement | null} The created SVG element or null if container not found.
     */
    initialize(containerSelector, options = {}) {
        // Handle both string selectors and DOM elements
        let container;
        if (typeof containerSelector === 'string') {
            container = document.querySelector(containerSelector);
            if (!container) {
                console.error(`SVGManager: Container not found with selector: ${containerSelector}`);
                return null;
            }
        } else if (containerSelector instanceof Element || containerSelector instanceof HTMLElement) {
            container = containerSelector;
        } else {
            console.error(`SVGManager: Invalid container. Expected string selector or DOM element.`);
            return null;
        }

        // Clear container
        container.innerHTML = '';

        // Default options
        const defaultOptions = {
            width: "100%",
            height: "100%",
            viewBox: "0 0 460 460", // Default size, should match ChartConfig ideally
            preserveAspectRatio: "xMidYMid meet",
            class: "nocturna-wheel-svg" // Default class
        };

        const svgOptions = { ...defaultOptions, ...options };

        // Create SVG element
        this.svg = document.createElementNS(this.svgNS, "svg");

        // Set attributes
        for (const [key, value] of Object.entries(svgOptions)) {
            this.svg.setAttribute(key, value);
        }

        // Append to container
        container.appendChild(this.svg);
        console.log("SVGManager: SVG initialized");
        return this.svg;
    }

    /**
     * Creates the standard layer groups within the SVG in the predefined order.
     */
    createStandardGroups() {
        if (!this.svg) {
            console.error("SVGManager: Cannot create groups, SVG not initialized.");
            return;
        }

        // Clear existing groups before creating new ones (or check if they exist)
        this.groups = {};
        // Remove existing group elements from SVG if any
        this.svg.querySelectorAll('g').forEach(g => g.remove());

        console.log("SVGManager: Creating standard groups:", this.groupOrder);
        this.groupOrder.forEach(groupName => {
            this.createGroup(groupName);
        });
        
        // Create a legacy 'planets' group for backward compatibility
        // This will be deprecated in future versions
        this.createGroup('planets');
    }

    /**
     * Creates a named group (<g>) element and appends it to the SVG.
     * If the group already exists, it returns the existing group.
     * @param {string} name - The name (and ID) for the group.
     * @returns {SVGElement | null} The created or existing group element, or null if SVG not initialized.
     */
    createGroup(name) {
        if (!this.svg) {
            console.error(`SVGManager: Cannot create group '${name}', SVG not initialized.`);
            return null;
        }
        if (this.groups[name]) {
            return this.groups[name]; // Return existing group
        }

        const group = document.createElementNS(this.svgNS, "g");
        group.setAttribute("id", `group-${name}`); // Set ID for easy debugging/selection
        group.setAttribute("class", `svg-group svg-group-${name}`); // Add class

        this.svg.appendChild(group); // Append to SVG (order matters based on creation sequence)
        this.groups[name] = group;
        // console.log(`SVGManager: Created group '${name}'`);
        return group;
    }

    /**
     * Retrieves a previously created group element by name.
     * @param {string} name - The name of the group.
     * @returns {SVGElement | null} The group element or null if not found or not initialized.
     */
    getGroup(name) {
        if (!this.svg) {
             console.warn(`SVGManager: Cannot get group '${name}', SVG not initialized.`);
             return null;
        }
        
        // For backward compatibility, map 'planets' to 'primaryPlanets'
        if (name === 'planets') {
            console.warn('SVGManager: Using deprecated "planets" group. Use "primaryPlanets" or "secondaryPlanets" instead.');
            name = 'primaryPlanets';
        }
        
        if (!this.groups[name]) {
             console.warn(`SVGManager: Group '${name}' not found. Creating it.`);
             // Attempt to create if missing, might indicate an issue elsewhere
             return this.createGroup(name);
        }
        return this.groups[name];
    }

    /**
     * Retrieves all created group elements.
     * @returns {Object<string, SVGElement>} An object mapping group names to their SVGElement references.
     */
    getAllGroups() {
        return this.groups;
    }

    /**
     * Returns the main SVG element.
     * @returns {SVGElement | null} The main SVG element or null if not initialized.
     */
    getSVG() {
        return this.svg;
    }

} // End of SVGManager class 