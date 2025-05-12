describe('Simple Test', () => {
  test('true is true', () => {
    expect(true).toBe(true);
  });
});

// Import HouseCalculator for testing
import { HouseCalculator } from '../src/core/HouseCalculator.js';

describe('Placidus Simple Test', () => {
  test('should calculate basic Placidus houses', () => {
    const calculator = new HouseCalculator();
    const ascendant = 45;
    const mc = 315;
    const latitude = 51.5; // London
    
    const cusps = calculator.calculateHouseCusps(ascendant, "Placidus", { mc, latitude });
    console.log("Cusps:", cusps);
    
    // Check if the cusps are valid
    for (let i = 0; i < 12; i++) {
      expect(cusps[i]).toBeGreaterThanOrEqual(0);
      expect(cusps[i]).toBeLessThan(360);
    }
    
    // Check if they match expectations
    expect(cusps[0]).toBe(45);   // ASC
    expect(cusps[9]).toBe(315);  // MC
  });
}); 