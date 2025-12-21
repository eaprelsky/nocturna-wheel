# Bug Report: House Labels Offset When Using astronomicalData

**Component:** nocturna-wheel library  
**Severity:** High  
**Date:** 2025-12-21  
**Reporter:** Chart Service team

---

## Summary

When using `astronomicalData` configuration to enable proper Placidus house rendering (unequal house sizes), the house labels (Roman numerals I-XII) become offset and no longer align with their corresponding house sectors.

---

## Expected Behavior

When providing `astronomicalData` with house cusps:
1. Houses should be rendered with **correct unequal sizes** based on Placidus calculations
2. House labels (I, II, III, etc.) should be positioned **inside their corresponding sectors**
3. Labels should align with the visual boundaries of each house

---

## Actual Behavior

When `astronomicalData` is provided:
1. ✓ Houses are rendered with correct unequal sizes (Placidus)
2. ✗ House labels are **offset** and do not align with house sectors
3. ✗ Labels appear shifted, making the chart confusing and incorrect

When `astronomicalData` is NOT provided:
1. ✗ Houses are rendered as **equal 30° sectors** (incorrect for Placidus)
2. ✓ House labels align correctly with sectors
3. ✓ But house sizes are wrong

---

## Configuration Used

```javascript
const wheelConfig = {
  container: '#chart-container',
  planets: { /* ... */ },
  houses: [
    { lon: 91.30 },   // House I (ASC)
    { lon: 105.57 },  // House II
    { lon: 120.47 },  // House III
    { lon: 139.45 },  // House IV (IC)
    { lon: 168.78 },  // House V
    { lon: 219.22 },  // House VI
    { lon: 271.30 },  // House VII (DSC)
    { lon: 285.57 },  // House VIII
    { lon: 300.47 },  // House IX
    { lon: 319.45 },  // House X (MC)
    { lon: 348.78 },  // House XI
    { lon: 39.22 }    // House XII
  ],
  config: {
    astronomicalData: {
      ascendant: 91.30,
      mc: 319.45,
      latitude: 55.75,
      houseSystem: "Placidus"
    }
  }
};
```

---

## Test Case Data

**Parameters:**
- **Date:** 2025-12-21 15:55:36
- **Location:** Moscow (55.7558°N, 37.6173°E)
- **Timezone:** GMT+3 (Europe/Moscow)
- **House System:** Placidus

**Key angles:**
- ASC (House I): 91.30° (1° Cancer)
- MC (House X): 319.45° (19° Aquarius)

**House sizes (should be unequal):**
- House I-II: 14.27°
- House II-III: 14.90°
- House VI-VII: 52.08°
- House VII-VIII: 14.27°

---

## Visual Comparison

### Without astronomicalData (labels correct, sizes wrong)
- House labels align with sectors
- All houses rendered as equal 30° sectors
- **Incorrect house sizes**

### With astronomicalData (sizes correct, labels wrong)
- Houses rendered with correct unequal sizes
- House labels are offset from their sectors
- **Incorrect label positioning**

---

## Expected Fix

When `astronomicalData` is provided:
1. Calculate house sector boundaries from the `houses` array
2. Position each house label at the **center of its corresponding sector**
3. Label position should be: `(houses[i].lon + houses[(i+1) % 12].lon) / 2`

---

## Workaround Attempts

1. **Using only `houses` array without `astronomicalData`**: Labels correct, but houses are equal
2. **Using `setHouseRotation()` with `astronomicalData`**: Makes rotation worse, labels still offset
3. **No workaround found** that provides both correct house sizes AND correct labels

---

## Environment

- **nocturna-wheel version:** 4.0.1
- **Browser:** Chromium (Puppeteer)
- **Chart Service version:** Latest

---

## Related Issue

This bug was discovered while investigating chart orientation (MC at top). See: `chart-orientation-bug.md`

---

## Reproduction Steps

1. Create WheelChart with `houses` array containing Placidus cusps
2. Add `config.astronomicalData` with ascendant, mc, latitude, houseSystem
3. Call `chart.render()`
4. Observe that house labels do not align with house sectors

---

## Priority

**High** - This makes charts visually incorrect and confusing for astrologers. The library cannot currently render proper Placidus charts with correct labels.

---

## Suggested Investigation

Check how house labels are positioned in the library:
- Are labels positioned based on house index (0-11) assuming equal houses?
- Or are they positioned based on actual house cusp longitudes?

The bug suggests labels use **index-based positioning** while sectors use **longitude-based positioning** when `astronomicalData` is present.
