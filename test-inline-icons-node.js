/**
 * Node.js test for inline icons functionality
 * Run: node test-inline-icons-node.js
 */

// Setup minimal DOM for testing
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><body><div id="chart"></div></body></html>');
global.document = dom.window.document;
global.window = dom.window;
global.SVGElement = dom.window.SVGElement;

// Import the library
import * as NocturnaWheel from './dist/nocturna-wheel.es.js';

console.log('=== Nocturna Wheel Inline Icons Test ===\n');

// Test 1: Library exports
console.log('1. Testing library exports...');
console.log('   Available exports:', Object.keys(NocturnaWheel));

if (!NocturnaWheel.IconData) {
    console.error('   ❌ FAIL: IconData not exported');
    process.exit(1);
}
if (!NocturnaWheel.IconProvider) {
    console.error('   ❌ FAIL: IconProvider not exported');
    process.exit(1);
}
console.log('   ✅ PASS: All required exports present\n');

// Test 2: IconData content
console.log('2. Testing IconData content...');
const { IconData } = NocturnaWheel;
const planetsCount = Object.keys(IconData.planets || {}).length;
const signsCount = Object.keys(IconData.signs || {}).length;
const aspectsCount = Object.keys(IconData.aspects || {}).length;

console.log(`   Planets: ${planetsCount}`);
console.log(`   Signs: ${signsCount}`);
console.log(`   Aspects: ${aspectsCount}`);

if (planetsCount !== 14) {
    console.error(`   ❌ FAIL: Expected 14 planets, got ${planetsCount}`);
    process.exit(1);
}
if (signsCount !== 12) {
    console.error(`   ❌ FAIL: Expected 12 signs, got ${signsCount}`);
    process.exit(1);
}
if (aspectsCount !== 9) {
    console.error(`   ❌ FAIL: Expected 9 aspects, got ${aspectsCount}`);
    process.exit(1);
}

// Check icon format
const sunIcon = IconData.planets.sun;
if (!sunIcon.startsWith('data:image/svg+xml')) {
    console.error(`   ❌ FAIL: Sun icon is not a data URL: ${sunIcon.substring(0, 50)}`);
    process.exit(1);
}

console.log(`   ✅ PASS: IconData contains all icons as data URLs\n`);

// Test 3: ServiceRegistry IconProvider
console.log('3. Testing ServiceRegistry IconProvider...');
const { ServiceRegistry } = NocturnaWheel;
const iconProvider = ServiceRegistry.getIconProvider();

if (!iconProvider) {
    console.error('   ❌ FAIL: IconProvider not registered in ServiceRegistry');
    process.exit(1);
}

console.log('   IconProvider properties:', Object.keys(iconProvider));
console.log('   useInline:', iconProvider.useInline);
console.log('   basePath:', iconProvider.basePath);

if (iconProvider.useInline !== true) {
    console.error(`   ❌ FAIL: IconProvider useInline should be true, got ${iconProvider.useInline}`);
    process.exit(1);
}

console.log('   ✅ PASS: IconProvider registered correctly\n');

// Test 4: Icon path resolution
console.log('4. Testing icon path resolution...');
const sunPath = iconProvider.getPlanetIconPath('sun');
const moonPath = iconProvider.getPlanetIconPath('moon');
const ariesPath = iconProvider.getZodiacIconPath('aries');
const trinePath = iconProvider.getAspectIconPath('trine');

console.log(`   Sun path: ${sunPath.substring(0, 80)}...`);
console.log(`   Moon path: ${moonPath.substring(0, 80)}...`);
console.log(`   Aries path: ${ariesPath.substring(0, 80)}...`);
console.log(`   Trine path: ${trinePath.substring(0, 80)}...`);

if (!sunPath.startsWith('data:image/svg+xml')) {
    console.error(`   ❌ FAIL: Sun path is not a data URL: ${sunPath}`);
    process.exit(1);
}
if (!moonPath.startsWith('data:image/svg+xml')) {
    console.error(`   ❌ FAIL: Moon path is not a data URL: ${moonPath}`);
    process.exit(1);
}
if (!ariesPath.startsWith('data:image/svg+xml')) {
    console.error(`   ❌ FAIL: Aries path is not a data URL: ${ariesPath}`);
    process.exit(1);
}
if (!trinePath.startsWith('data:image/svg+xml')) {
    console.error(`   ❌ FAIL: Trine path is not a data URL: ${trinePath}`);
    process.exit(1);
}

console.log('   ✅ PASS: All icon paths resolve to data URLs\n');

// Test 5: Chart creation
console.log('5. Testing chart creation...');
try {
    const { WheelChart } = NocturnaWheel;
    const chart = new WheelChart({
        container: '#chart',
        planets: {
            sun: { lon: 85.83 },
            moon: { lon: 133.21 }
        },
        houses: [
            { lon: 300.32 }, { lon: 330.15 }, { lon: 355.24 },
            { lon: 20.32 }, { lon: 45.15 }, { lon: 75.24 },
            { lon: 120.32 }, { lon: 150.15 }, { lon: 175.24 },
            { lon: 200.32 }, { lon: 225.15 }, { lon: 255.24 }
        ]
    });
    
    console.log('   Chart object created:', !!chart);
    console.log('   Chart has render method:', typeof chart.render === 'function');
    console.log('   ✅ PASS: Chart created successfully\n');
    
} catch (error) {
    console.error(`   ❌ FAIL: Chart creation failed: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
}

console.log('=== All Tests Passed! ===');
console.log('\n✅ Inline icons are working correctly in the ES module build.');
console.log('   The library is ready for use with npm install.\n');

