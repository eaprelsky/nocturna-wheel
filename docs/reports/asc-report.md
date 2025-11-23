# Bug Report / Feature Request for Nocturna Wheel

**Issue:** Automatic Wheel Rotation based on House Cusps
**Severity:** Usability / UX
**Observed Version:** ~3.x

## Description

When initializing a `WheelChart` and providing the `houses` array (formatted as `[{ lon: number }, ...]`), the chart does **not** automatically orient the wheel to the Ascendant.

Instead, the chart renders with **0° Aries at the 9 o'clock position** (the standard Ascendant position in the SVG), regardless of the longitude specified in `houses[0]`.

While the house lines are drawn at the correct degrees on the circle, the Zodiac wheel itself is not rotated to match the Ascendant. This results in a visually incorrect chart where the Ascendant line points to Aries 0° instead of the actual Rising Sign.

## Expected Behavior

If the `houses` array is provided, the library should automatically detect the longitude of the 1st house (Ascendant) and call `setHouseRotation` (or equivalent internal logic) to orient the Zodiac ring correctly, placing the Ascendant degree at the 9 o'clock marker.

## Workaround

We had to manually extract the Ascendant longitude and explicitly call `setHouseRotation` after initialization:

```javascript
// Extract Ascendant from the first house cusp
const ascendant = houses[0].lon;

const chart = new WheelChart({
  container: '#chart-container',
  houses: houses,
  planets: planets
  // ...
});

// EXPLICITLY rotate the wheel
// Without this, the wheel stays at 0° Aries
if (typeof chart.setHouseRotation === 'function') {
    chart.setHouseRotation(ascendant);
}
```

## Recommendation

1.  **Auto-rotation:** Automatically trigger `setHouseRotation(houses[0].lon)` inside the `WheelChart` constructor if the `houses` array is present and valid.
2.  **Documentation:** If manual rotation is intended behavior, please explicitly state in the README that `setHouseRotation` MUST be called when passing raw house cusps, or that `astronomicalData.ascendant` is required for rotation.

