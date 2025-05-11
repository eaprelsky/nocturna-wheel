/**
 * nocturna-fix.js
 * This script ensures NocturnaWheel is properly added to the global scope
 */

// Ensure window.NocturnaWheel is defined
// If the UMD bundle doesn't properly expose it, this will fix it
if (typeof window !== 'undefined') {
    if (typeof window.NocturnaWheel === 'undefined' && typeof NocturnaWheel !== 'undefined') {
        console.log("Fixing global NocturnaWheel variable");
        window.NocturnaWheel = NocturnaWheel;
    }

    // Log available global variables for debugging
    console.log("Global variables available:");
    console.log("- NocturnaWheel:", typeof window.NocturnaWheel);
    console.log("- ChartConfig:", typeof window.ChartConfig);
    console.log("- BaseRenderer:", typeof window.BaseRenderer);
    console.log("- ChartRenderer:", typeof window.ChartRenderer);
    console.log("- HouseCalculator:", typeof window.HouseCalculator);
    console.log("- SvgUtils:", typeof window.SvgUtils);
    console.log("- AstrologyUtils:", typeof window.AstrologyUtils);
} 