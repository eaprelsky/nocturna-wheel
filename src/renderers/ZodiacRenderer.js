import { BaseRenderer } from './BaseRenderer.js';
import { AstrologyUtils } from '../utils/AstrologyUtils.js';

/**
 * ZodiacRenderer.js
 * Class for rendering the zodiac circle and signs.
 */
export class ZodiacRenderer extends BaseRenderer {
    /**
     * Constructor
     * @param {Object} options - Renderer options.
     * @param {string} options.svgNS - SVG namespace.
     * @param {ChartConfig} options.config - Chart configuration object.
     * @param {string} options.assetBasePath - Base path for assets.
     * @param {IconProvider} [options.iconProvider] - Icon provider service.
     */
    constructor(options) {
        super(options);
        if (!options.assetBasePath) {
            throw new Error("ZodiacRenderer: Missing required option assetBasePath");
        }

        this.iconProvider = options.iconProvider; // Store the icon provider
        this.signIconRadius = (this.outerRadius + this.middleRadius) / 2;
        this.signIconSize = 30;
    }

    /**
     * Renders the zodiac wheel components.
     * @param {Element} parentGroup - The parent SVG group element.
     * @returns {Array} Array of rendered SVG elements (or empty array).
     */
    render(parentGroup) {
        if (!parentGroup) {
            console.error("ZodiacRenderer: parentGroup is null or undefined.");
            return [];
        }
        this.clearGroup(parentGroup);

        const renderedElements = [];

        renderedElements.push(...this.renderBaseCircles(parentGroup));
        renderedElements.push(...this.renderDivisionLines(parentGroup));
        renderedElements.push(...this.renderZodiacSigns(parentGroup));

        console.log("ZodiacRenderer: Rendering complete.");
        return renderedElements;
    }

    /**
     * Renders the base circles for the chart layout.
     * @param {Element} parentGroup - The parent SVG group.
     * @returns {Array<Element>} Array containing the created circle elements.
     */
    renderBaseCircles(parentGroup) {
        const elements = [];
        const circles = [
            { r: this.outerRadius, class: "chart-outer-circle" },
            { r: this.middleRadius, class: "chart-middle-circle" },
            { r: this.innerRadius, class: "chart-inner-circle" }
        ];

        circles.forEach(circleData => {
            const circle = this.svgUtils.createSVGElement("circle", {
                cx: this.centerX,
                cy: this.centerY,
                r: circleData.r,
                class: `zodiac-element ${circleData.class}` // Add base class
            });
            parentGroup.appendChild(circle);
            elements.push(circle);
        });
        return elements;
    }

    /**
     * Renders the division lines between zodiac signs.
     * @param {Element} parentGroup - The parent SVG group.
     * @returns {Array<Element>} Array containing the created line elements.
     */
    renderDivisionLines(parentGroup) {
        const elements = [];
        for (let i = 0; i < 12; i++) {
            const angle = i * 30; // 30 degrees per sign

            // Lines span from the inner zodiac ring to the outer zodiac ring
            const point1 = this.svgUtils.pointOnCircle(this.centerX, this.centerY, this.middleRadius, angle);
            const point2 = this.svgUtils.pointOnCircle(this.centerX, this.centerY, this.outerRadius, angle);

            // Instead of skipping lines, use special classes for cardinal points
            let specialClass = "";
            if (angle === 0) specialClass = "aries-point"; // Aries point (0°)
            else if (angle === 90) specialClass = "cancer-point"; // Cancer point (90°)
            else if (angle === 180) specialClass = "libra-point"; // Libra point (180°)
            else if (angle === 270) specialClass = "capricorn-point"; // Capricorn point (270°)

            const line = this.svgUtils.createSVGElement("line", {
                x1: point1.x,
                y1: point1.y,
                x2: point2.x,
                y2: point2.y,
                class: `zodiac-element zodiac-division-line ${specialClass}`
            });

            parentGroup.appendChild(line);
            elements.push(line);
        }
        return elements;
    }

    /**
     * Renders the zodiac sign icons.
     * @param {Element} parentGroup - The parent SVG group.
     * @returns {Array<Element>} Array containing the created image elements.
     */
    renderZodiacSigns(parentGroup) {
        const elements = [];
        const zodiacSigns = AstrologyUtils.getZodiacSigns(); // Assumes AstrologyUtils is available

        for (let i = 0; i < 12; i++) {
            const signName = zodiacSigns[i];
            // Place icon in the middle of the sign's 30-degree sector
            const angle = i * 30 + 15;

            // Calculate position for the icon center
            const point = this.svgUtils.pointOnCircle(this.centerX, this.centerY, this.signIconRadius, angle);

            // Get icon path using IconProvider if available
            let iconHref;
            if (this.iconProvider) {
                iconHref = this.iconProvider.getZodiacIconPath(signName);
            } else {
                // Fallback to old path construction
                iconHref = `${this.options.assetBasePath}svg/zodiac/zodiac-sign-${signName}.svg`;
            }
            
            console.log(`Loading zodiac sign: ${iconHref}`);
            
            const icon = this.svgUtils.createSVGElement("image", {
                x: point.x - this.signIconSize / 2, // Offset to center the icon
                y: point.y - this.signIconSize / 2,
                width: this.signIconSize,
                height: this.signIconSize,
                href: iconHref,
                class: `zodiac-element zodiac-sign zodiac-sign-${signName}` // Add base and specific class
            });

            // Fallback for missing icons
             icon.addEventListener('error', () => {
                 console.warn(`Zodiac sign icon not found: ${iconHref}`);
                 icon.setAttribute('href', ''); // Remove broken link
                 
                 // Create a text fallback
                 const fallbackText = signName.substring(0, 3).toUpperCase();
                 
                 // Use IconProvider's createTextFallback if available
                 let textElement;
                 if (this.iconProvider) {
                     textElement = this.iconProvider.createTextFallback(
                         this.svgUtils,
                         {
                             x: point.x,
                             y: point.y,
                             size: '10px',
                             color: '#ccc',
                             className: `zodiac-element zodiac-sign zodiac-sign-${signName}`
                         },
                         fallbackText
                     );
                 } else {
                     // Legacy fallback
                     textElement = this.svgUtils.createSVGElement('text', {
                         x: point.x,
                         y: point.y,
                         'text-anchor': 'middle',
                         'dominant-baseline': 'central',
                         'font-size': '10px',
                         fill: '#ccc',
                         class: `zodiac-element zodiac-sign zodiac-sign-${signName}`
                     });
                     textElement.textContent = fallbackText;
                 }
                 
                 parentGroup.appendChild(textElement);
                 elements.push(textElement); // Add placeholder to rendered elements
             });


            // Add tooltip with the full sign name
            this.svgUtils.addTooltip(icon, AstrologyUtils.getZodiacSignFullName(signName));

            parentGroup.appendChild(icon);
            elements.push(icon);
        }
        return elements;
    }
} // End of ZodiacRenderer class