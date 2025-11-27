# Bug Report: Incorrect House Numbering After Wheel Rotation

## Summary
House numbers are displayed in incorrect positions after automatic wheel rotation to align Ascendant. After house III, the sequence jumps to X, XI, XII, then continues with VII, VIII, IX, and finally IV, V, VI.

## Environment
- **Library**: @eaprelsky/nocturna-wheel
- **Version**: 4.0.0
- **Chart Type**: Transit chart (biwheel)
- **Integration**: nocturna-chart-service (Puppeteer-based rendering)

## Steps to Reproduce

1. Create a transit chart with the following house cusps:
```json
{
  "houses": [
    { "lon": 232.71940270607948 },  // House I (Ascendant)
    { "lon": 264.00105329729035 },  // House II
    { "lon": 306.85290145426967 },  // House III
    { "lon": 347.8340516761731 },   // House IV (IC)
    { "lon": 16.937817364183843 },  // House V
    { "lon": 37.29490584801573 },   // House VI
    { "lon": 52.71940270607945 },   // House VII (Descendant)
    { "lon": 84.00105329729035 },   // House VIII
    { "lon": 126.85290145426967 },  // House IX
    { "lon": 167.83405167617312 },  // House X (MC)
    { "lon": 196.93781736418381 },  // House XI
    { "lon": 217.29490584801573 }   // House XII
  ]
}
```

2. Render the chart using WheelChart with automatic Ascendant alignment enabled (default behavior in v4.0.0)

3. Observe the house numbers displayed on the outer ring

## Expected Behavior
House numbers should be displayed in sequential order (I through XII) following the counter-clockwise direction from the Ascendant position, regardless of the wheel rotation applied for Ascendant alignment.

The correct sequence should be:
- House I at ~232.72° (rotated to 9 o'clock position)
- House II, III, IV, V, VI continuing counter-clockwise
- House VII at opposite side of Ascendant
- House VIII, IX, X, XI, XII completing the circle

## Actual Behavior
House numbers are displayed in the following incorrect sequence:
- Houses I, II, III display correctly
- Then jump to X, XI, XII
- Then VII, VIII, IX
- Finally IV, V, VI

This suggests that the house numbering logic uses the array index directly without accounting for the visual rotation applied to align the Ascendant.

## Root Cause Analysis

Based on code inspection of `nocturna-wheel.bundle.js`:

### Location: `HouseRenderer.renderNumbers()` method (line ~2327-2388)

```javascript
// Add Roman numerals for house numbers
for (let i = 0; i < 12; i++) {
    // Get house angle with rotation
    let baseHouseAngle;
    if (this.houseData && this.houseData.length >= 12) {
        baseHouseAngle = this.getHouseLongitude(this.houseData[i]);
    } else {
        baseHouseAngle = i * 30; // Default if no data
    }
    // Apply alignment offset and user rotation
    const houseAngle = (baseHouseAngle + ascendantAlignmentOffset + rotationAngle) % 360;
    
    // ... position calculation ...
    
    // Set house number as text (Roman numeral)
    text.textContent = AstrologyUtils.houseToRoman(i + 1); // ← PROBLEM HERE
```

**The Issue**: 
The house number is determined by the array index `i` (line 2388), but the visual position is calculated using the rotated `houseAngle`. When the wheel is rotated to align the Ascendant, houses are reordered visually but retain their original array index for numbering.

**Example**:
- `houses[0]` (lon: 232.72°) → labeled as "I" ✓ correct
- `houses[3]` (lon: 347.83°) → labeled as "IV" ✗ should be at IC position but gets wrong number
- After rotation, visual positions don't match array indices

## Proposed Solution

The house numbering should be based on the **visual position after rotation**, not the array index. 

### Option 1: Sort houses by rotated angle before rendering
```javascript
// Create array of houses with their rotated angles and original indices
const housesWithAngles = this.houseData.map((house, index) => ({
    originalIndex: index,
    baseAngle: this.getHouseLongitude(house),
    rotatedAngle: (this.getHouseLongitude(house) + ascendantAlignmentOffset + rotationAngle) % 360
}));

// Sort by rotated angle to determine visual order
housesWithAngles.sort((a, b) => a.rotatedAngle - b.rotatedAngle);

// Find which house is now at position 0 (Ascendant after rotation)
const ascendantIndex = housesWithAngles.findIndex(h => h.originalIndex === 0);

// Render houses with correct numbering based on visual position
housesWithAngles.forEach((house, visualIndex) => {
    // Calculate house number based on position relative to Ascendant
    const houseNumber = ((visualIndex - ascendantIndex + 12) % 12) + 1;
    text.textContent = AstrologyUtils.houseToRoman(houseNumber);
});
```

### Option 2: Calculate house number based on angle relative to Ascendant
```javascript
// Calculate angle difference from Ascendant
const ascendantAngle = (this.getHouseLongitude(this.houseData[0]) + ascendantAlignmentOffset + rotationAngle) % 360;
const houseAngle = (baseHouseAngle + ascendantAlignmentOffset + rotationAngle) % 360;
const angleFromAscendant = (houseAngle - ascendantAngle + 360) % 360;

// Determine house number based on 30° segments from Ascendant
const houseNumber = Math.floor(angleFromAscendant / 30) + 1;
text.textContent = AstrologyUtils.houseToRoman(houseNumber);
```

## Impact
- **Severity**: High - renders charts with incorrect astrological information
- **Affected Charts**: All charts with house cusps that are not evenly distributed at 30° intervals
- **Workaround**: Currently none available without patching the library

## Additional Notes

This issue became apparent in v4.0.0 with the introduction of automatic Ascendant alignment. In earlier versions without auto-rotation, the issue may not have been visible if users manually positioned the Ascendant at the expected location.

The same logic issue likely affects `renderDivisions()` method, though division lines don't show visible labels, so the impact is less obvious.

## Test Data

Full test request that reproduces the issue is available in the nocturna-chart-service repository at:
`tests/fixtures/biwheel-chart-request.json`

Can also be reproduced with any natal chart where house cusps are calculated using a real house system (Placidus, Koch, etc.) rather than equal houses.

## Related Code References

- `HouseRenderer.renderNumbers()` - line ~2327
- `HouseRenderer.renderDivisions()` - line ~2206  
- `HouseRenderer.getHouseLongitude()` - line ~2405
- Auto-rotation logic in `ChartConfig._initializeHouseCusps()` - line ~1116-1147

---

**Reporter**: nocturna-chart-service integration team  
**Date**: 2025-11-27  
**Priority**: High  
**Component**: HouseRenderer

