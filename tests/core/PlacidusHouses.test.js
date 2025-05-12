import { HouseCalculator } from '../../src/core/HouseCalculator.js';

describe('Placidus House System', () => {
  let calculator;

  beforeEach(() => {
    calculator = new HouseCalculator();
  });
  
  // Helper to check if all cusps are within 0-360 range
  const expectValidCusps = (cusps) => {
    for (let i = 0; i < cusps.length; i++) {
      expect(cusps[i]).toBeGreaterThanOrEqual(0);
      expect(cusps[i]).toBeLessThan(360);
    }
  };
  
  // Helper for checking if angle2 follows angle1 in a zodiacal sequence
  // This properly handles the 0°/360° boundary
  const isSequential = (angle1, angle2) => {
    const normalized1 = ((angle1 % 360) + 360) % 360;
    const normalized2 = ((angle2 % 360) + 360) % 360;
    
    // If the two angles are on the same side of the 0°/360° boundary
    if (Math.abs(normalized2 - normalized1) <= 180) {
      return normalized2 > normalized1;
    }
    // If they cross the boundary
    return normalized1 > normalized2;
  };
  
  // Helper for zodiacal sequence check with more reliable logic
  const expectCorrectSequence = (cusps, i, j) => {
    expect(isSequential(cusps[i], cusps[j])).toBe(true,
      `Expected cusp ${j} (${cusps[j]}°) to follow cusp ${i} (${cusps[i]}°) in zodiacal sequence`
    );
  };

  test('should calculate Placidus house cusps for Northern Hemisphere', () => {
    const ascendant = 45;
    const mc = 315;
    const latitude = 51.5; // London
    
    const cusps = calculator.calculateHouseCusps(ascendant, "Placidus", { mc, latitude });
    
    // Check angular houses
    expect(cusps[0]).toBe(45);   // ASC
    expect(cusps[9]).toBe(315);  // MC
    expect(cusps[6]).toBe(225);  // DSC
    expect(cusps[3]).toBe(135);  // IC
    
    // Verify all cusps are valid
    expectValidCusps(cusps);
    
    // Check the direction from MC to ASC through houses 11 and 12
    // With our simplified implementation, 10-11-12-1 should be properly sequenced
    expectCorrectSequence(cusps, 9, 10);
    expectCorrectSequence(cusps, 10, 11);
    expectCorrectSequence(cusps, 11, 0);
    
    // Verify the zodiacal sequence of all houses
    // With current implementation houses should be in sequence along the wheel
    expectCorrectSequence(cusps, 0, 1);
    expectCorrectSequence(cusps, 1, 2);
    expectCorrectSequence(cusps, 2, 3);
    expectCorrectSequence(cusps, 3, 4);
    expectCorrectSequence(cusps, 4, 5);
    expectCorrectSequence(cusps, 5, 6);
    expectCorrectSequence(cusps, 6, 7);
    expectCorrectSequence(cusps, 7, 8);
    expectCorrectSequence(cusps, 8, 9);
  });
  
  test('should calculate Placidus house cusps for Southern Hemisphere', () => {
    const ascendant = 100;
    const mc = 10;
    const latitude = -33.9; // Sydney
    
    const cusps = calculator.calculateHouseCusps(ascendant, "Placidus", { mc, latitude });
    
    // Check angular houses
    expect(cusps[0]).toBe(100);   // ASC
    expect(cusps[9]).toBe(10);    // MC
    expect(cusps[6]).toBe(280);   // DSC
    expect(cusps[3]).toBe(190);   // IC
    
    // Verify all cusps are valid
    expectValidCusps(cusps);
    
    // Verify houses are in proper sequence
    expectCorrectSequence(cusps, 9, 10);
    expectCorrectSequence(cusps, 10, 11);
    expectCorrectSequence(cusps, 11, 0);
    
    expectCorrectSequence(cusps, 0, 1);
    expectCorrectSequence(cusps, 1, 2);
    expectCorrectSequence(cusps, 2, 3);
    
    expectCorrectSequence(cusps, 3, 4);
    expectCorrectSequence(cusps, 4, 5);
    expectCorrectSequence(cusps, 5, 6);
    
    expectCorrectSequence(cusps, 6, 7);
    expectCorrectSequence(cusps, 7, 8);
    expectCorrectSequence(cusps, 8, 9);
  });
  
  test('should handle edge case of ascendant near 0°', () => {
    const ascendant = 5;
    const mc = 275;
    const latitude = 40.7; // New York
    
    const cusps = calculator.calculateHouseCusps(ascendant, "Placidus", { mc, latitude });
    
    // Check angular houses
    expect(cusps[0]).toBe(5);
    expect(cusps[9]).toBe(275);
    
    // Verify all cusps are valid
    expectValidCusps(cusps);
    
    // Verify houses are in proper sequence
    expectCorrectSequence(cusps, 9, 10);
    expectCorrectSequence(cusps, 10, 11);
    expectCorrectSequence(cusps, 11, 0);
    
    expectCorrectSequence(cusps, 0, 1);
    expectCorrectSequence(cusps, 1, 2);
    expectCorrectSequence(cusps, 2, 3);
    
    expectCorrectSequence(cusps, 3, 4);
    expectCorrectSequence(cusps, 4, 5);
    expectCorrectSequence(cusps, 5, 6);
    
    expectCorrectSequence(cusps, 6, 7);
    expectCorrectSequence(cusps, 7, 8);
    expectCorrectSequence(cusps, 8, 9);
  });
  
  test('should handle edge case of MC near 0°', () => {
    const ascendant = 90;
    const mc = 5;
    const latitude = 30;
    
    const cusps = calculator.calculateHouseCusps(ascendant, "Placidus", { mc, latitude });
    
    // Check angular houses
    expect(cusps[0]).toBe(90);
    expect(cusps[9]).toBe(5);
    
    // Verify all cusps are valid
    expectValidCusps(cusps);
    
    // Verify houses are in proper sequence
    expectCorrectSequence(cusps, 9, 10);
    expectCorrectSequence(cusps, 10, 11);
    expectCorrectSequence(cusps, 11, 0);
    
    expectCorrectSequence(cusps, 0, 1);
    expectCorrectSequence(cusps, 1, 2);
    expectCorrectSequence(cusps, 2, 3);
    
    expectCorrectSequence(cusps, 3, 4);
    expectCorrectSequence(cusps, 4, 5);
    expectCorrectSequence(cusps, 5, 6);
    
    expectCorrectSequence(cusps, 6, 7);
    expectCorrectSequence(cusps, 7, 8);
    expectCorrectSequence(cusps, 8, 9);
  });
  
  test('should handle extreme latitudes by using Porphyry', () => {
    const ascendant = 30;
    const mc = 330;
    const latitude = 75; // Far North
    
    // For high latitudes, should fall back to Porphyry
    const placidus = calculator.calculateHouseCusps(ascendant, "Placidus", { mc, latitude });
    const porphyry = calculator.calculateHouseCusps(ascendant, "Porphyry", { mc });
    
    // Results should be identical since we fall back to Porphyry
    for (let i = 0; i < 12; i++) {
      expect(placidus[i]).toBeCloseTo(porphyry[i], 6);
    }
  });
}); 