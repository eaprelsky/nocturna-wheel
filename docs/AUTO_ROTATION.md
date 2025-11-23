# Automatic Wheel Rotation

## Overview

Starting from version 3.x, **Nocturna Wheel** automatically rotates the zodiac wheel to position the Ascendant (1st house cusp) at the 9 o'clock position when house data is provided.

## Behavior

### Before (Manual Rotation Required)

Previously, users had to manually call `setHouseRotation()` after chart initialization:

```javascript
const chart = new WheelChart({
    container: '#chart',
    houses: houses,
    planets: planets
});

// Manual rotation was required
chart.setHouseRotation(houses[0].lon);
```

### After (Automatic Rotation)

Now the wheel automatically rotates based on the provided house data:

```javascript
const chart = new WheelChart({
    container: '#chart',
    houses: houses,
    planets: planets
});
// Wheel automatically rotates to position Ascendant at 9 o'clock
```

## Supported Scenarios

### 1. Using `houses` Array

When you provide a `houses` array, the library automatically uses `houses[0].lon` (the Ascendant) as the rotation angle:

```javascript
const chart = new WheelChart({
    container: '#chart',
    planets: { /* ... */ },
    houses: [
        { lon: 300.32 },  // Ascendant - automatically used for rotation
        { lon: 330.15 },
        // ... other houses
    ]
});
```

### 2. Using `astronomicalData.ascendant`

When you provide astronomical data with an ascendant value, the library automatically uses it for rotation:

```javascript
const chart = new WheelChart({
    container: '#chart',
    planets: { /* ... */ },
    config: {
        astronomicalData: {
            ascendant: 120.5,      // Automatically used for rotation
            mc: 210.5,
            latitude: 55.75,
            houseSystem: "Placidus"
        }
    }
});
```

## Manual Override

If you need to override the automatic rotation, you can still manually call `setHouseRotation()` after initialization:

```javascript
const chart = new WheelChart({
    container: '#chart',
    houses: houses,
    planets: planets
});

// Override automatic rotation with custom angle
chart.setHouseRotation(90);  // Rotate to any custom angle
```

## Implementation Details

The automatic rotation is implemented in two places:

1. **NocturnaWheel constructor**: When a `houses` array is provided with a valid first element
2. **ChartConfig._initializeHouseCusps()**: When house cusps are calculated from `astronomicalData.ascendant`

The rotation angle is stored in `config.houseSettings.rotationAngle` and is automatically applied during rendering.

## Testing

A test file is available to verify the automatic rotation behavior:

```bash
# Open in browser
test-auto-rotation.html
```

This test file demonstrates three scenarios:
1. Chart with `houses` array (should auto-rotate)
2. Chart with `astronomicalData` (should auto-rotate)
3. Chart without houses (baseline - no rotation)

## Backward Compatibility

This change is **fully backward compatible**:
- Existing code that already calls `setHouseRotation()` will continue to work
- The automatic rotation only applies when house data is provided
- Charts without house data behave exactly as before

## Related Issues

- [Bug Report: Automatic Wheel Rotation](../docs/reports/asc-report.md)

