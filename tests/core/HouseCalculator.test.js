import { HouseCalculator } from '../../src/core/HouseCalculator.js';

describe('HouseCalculator', () => {
  test('should initialize properly', () => {
    const calculator = new HouseCalculator();
    expect(calculator).toBeDefined();
  });

  let calculator;

  beforeEach(() => {
    calculator = new HouseCalculator();
  });

  // Helper function to check if a zodiacal angle is "greater" than another
  // Handles the wrap around 0°/360° correctly
  const isAngleGreater = (angle1, angle2) => {
    // If both angles are on the same side of the 0°/360° boundary
    if (Math.abs(angle1 - angle2) <= 180) {
      return angle1 > angle2;
    } 
    // If they're on opposite sides of the boundary
    return angle1 < angle2;
  };

  // Helper function to check if a zodiacal angle is "between" two others
  // Handles the wrap around 0°/360° correctly
  const isAngleBetween = (angle, start, end) => {
    // Normalize all angles to 0-360 range
    angle = ((angle % 360) + 360) % 360;
    start = ((start % 360) + 360) % 360;
    end = ((end % 360) + 360) % 360;

    // If start and end are on the same side of the 0°/360° boundary
    if (start <= end) {
      return angle >= start && angle <= end;
    }
    // If they span the 0°/360° boundary
    return angle >= start || angle <= end;
  };

  // Test that the angle is in the correct position in the sequence
  // even if it crosses the 0°/360° boundary
  const expectCorrectSequence = (cusps, idx1, idx2) => {
    const isSequenceValid = 
      isAngleGreater(cusps[idx2], cusps[idx1]) || 
      // Account for the case where the 2nd angle wraps around 0°
      (cusps[idx2] < 90 && cusps[idx1] > 270);
    
    expect(isSequenceValid).toBe(true, 
      `Expected cusp ${idx2} (${cusps[idx2]}°) to follow cusp ${idx1} (${cusps[idx1]}°) in the zodiac sequence`
    );
  };

  describe('General Interface', () => {
    test('should have all house systems available', () => {
      const systems = calculator.getAvailableHouseSystems();
      expect(systems).toEqual([
        "Placidus", "Koch", "Equal", "Whole Sign", 
        "Porphyry", "Regiomontanus", "Campanus", 
        "Morinus", "Topocentric"
      ]);
    });

    test('should throw error for invalid house system', () => {
      expect(() => {
        calculator.calculateHouseCusps(0, "Invalid System");
      }).toThrow("House system \"Invalid System\" is not supported");
    });

    test('should throw error for invalid ascendant value', () => {
      expect(() => {
        calculator.calculateHouseCusps(-10);
      }).toThrow("Ascendant must be a number between 0 and 360");
      
      expect(() => {
        calculator.calculateHouseCusps(400);
      }).toThrow("Ascendant must be a number between 0 and 360");

      expect(() => {
        calculator.calculateHouseCusps("0");
      }).toThrow("Ascendant must be a number between 0 and 360");
    });

    test('should correctly normalize angles', () => {
      expect(calculator.normalizeAngle(370)).toBe(10);
      expect(calculator.normalizeAngle(-10)).toBe(350);
      expect(calculator.normalizeAngle(0)).toBe(0);
      expect(calculator.normalizeAngle(359.999)).toBeCloseTo(359.999);
    });

    test('should correctly calculate arc between angles', () => {
      expect(calculator.calculateArc(0, 90)).toBe(90);
      expect(calculator.calculateArc(90, 0)).toBe(90);
      expect(calculator.calculateArc(350, 10)).toBe(20);
      expect(calculator.calculateArc(10, 350)).toBe(20);
    });

    test('helper functions for angle comparison should work correctly', () => {
      // Test isAngleGreater
      expect(isAngleGreater(10, 5)).toBe(true);
      expect(isAngleGreater(5, 10)).toBe(false);
      expect(isAngleGreater(10, 350)).toBe(true); // When crossing 0°
      expect(isAngleGreater(350, 10)).toBe(false);

      // Test isAngleBetween
      expect(isAngleBetween(20, 10, 30)).toBe(true);
      expect(isAngleBetween(5, 10, 30)).toBe(false);
      expect(isAngleBetween(20, 350, 30)).toBe(true); // When range crosses 0°
      expect(isAngleBetween(340, 350, 30)).toBe(true);
    });
  });

  describe('Equal House System', () => {
    test('should calculate equal house cusps correctly', () => {
      const ascendant = 45; // Leo ascendant at 45°
      const cusps = calculator.calculateHouseCusps(ascendant, "Equal");
      
      // In the Equal system, houses are exactly 30° apart
      for (let i = 0; i < 12; i++) {
        expect(cusps[i]).toBe((ascendant + i * 30) % 360);
      }
    });

    test('should handle edge case with ascendant near 360°', () => {
      const ascendant = 355;
      const cusps = calculator.calculateHouseCusps(ascendant, "Equal");
      
      expect(cusps[0]).toBe(355);
      expect(cusps[1]).toBe(25); // (355 + 30) % 360 = 25
    });
  });
  
  describe('Whole Sign System', () => {
    test('should calculate whole sign house cusps correctly', () => {
      // 75° is in Gemini (third sign, 60-90°)
      const ascendant = 75;
      const cusps = calculator.calculateHouseCusps(ascendant, "Whole Sign");
      
      // First house cusp should be at the beginning of Gemini (60°)
      expect(cusps[0]).toBe(60);
      
      // Each subsequent house should start at 30° intervals
      for (let i = 1; i < 12; i++) {
        expect(cusps[i]).toBe((60 + i * 30) % 360);
      }
    });
    
    test('should handle ascendant at 0° Aries', () => {
      const ascendant = 0;
      const cusps = calculator.calculateHouseCusps(ascendant, "Whole Sign");
      
      expect(cusps[0]).toBe(0);
      expect(cusps[1]).toBe(30);
      expect(cusps[11]).toBe(330);
    });
    
    test('should handle ascendant at sign boundary', () => {
      const ascendant = 30; // Exactly at Taurus cusp
      const cusps = calculator.calculateHouseCusps(ascendant, "Whole Sign");
      
      expect(cusps[0]).toBe(30); // Should start at Taurus (30°)
    });
  });
  
  describe('Porphyry System', () => {
    test('should require MC parameter', () => {
      expect(() => {
        calculator.calculateHouseCusps(0, "Porphyry", {});
      }).toThrow("Porphyry house system requires mc");
    });

    test('should calculate Porphyry house cusps correctly', () => {
      const ascendant = 45;
      const mc = 315;
      const cusps = calculator.calculateHouseCusps(ascendant, "Porphyry", { mc });
      
      // Check angular houses
      expect(cusps[0]).toBe(45);   // ASC
      expect(cusps[9]).toBe(315);  // MC
      expect(cusps[6]).toBe(225);  // DSC (ASC + 180)
      expect(cusps[3]).toBe(135);  // IC (MC + 180)
      
      // Check intermediate houses
      // Between MC and ASC
      const arc1 = calculator.calculateArc(315, 45);
      expect(cusps[10]).toBe(calculator.normalizeAngle(315 + arc1 / 3));
      expect(cusps[11]).toBe(calculator.normalizeAngle(315 + (2 * arc1 / 3)));
      
      // Between ASC and IC
      const arc2 = calculator.calculateArc(45, 135);
      expect(cusps[1]).toBe(calculator.normalizeAngle(45 + arc2 / 3));
      expect(cusps[2]).toBe(calculator.normalizeAngle(45 + (2 * arc2 / 3)));
      
      // Between IC and DSC
      const arc3 = calculator.calculateArc(135, 225);
      expect(cusps[4]).toBe(calculator.normalizeAngle(135 + arc3 / 3));
      expect(cusps[5]).toBe(calculator.normalizeAngle(135 + (2 * arc3 / 3)));
      
      // Between DSC and MC
      const arc4 = calculator.calculateArc(225, 315);
      expect(cusps[7]).toBe(calculator.normalizeAngle(225 + arc4 / 3));
      expect(cusps[8]).toBe(calculator.normalizeAngle(225 + (2 * arc4 / 3)));
    });
  });
  
  describe('Placidus System', () => {
    test('should require latitude and MC parameters', () => {
      expect(() => {
        calculator.calculateHouseCusps(0, "Placidus", {});
      }).toThrow("Placidus house system requires latitude and mc");
      
      expect(() => {
        calculator.calculateHouseCusps(0, "Placidus", { latitude: 45 });
      }).toThrow("Placidus house system requires latitude and mc");
      
      expect(() => {
        calculator.calculateHouseCusps(0, "Placidus", { mc: 315 });
      }).toThrow("Placidus house system requires latitude and mc");
    });

    test('should calculate Placidus house cusps correctly', () => {
      const ascendant = 45;
      const mc = 315;
      const latitude = 51.5; // London latitude
      const cusps = calculator.calculateHouseCusps(ascendant, "Placidus", { mc, latitude });
      
      // Check angular houses
      expect(cusps[0]).toBe(45);   // ASC
      expect(cusps[9]).toBe(315);  // MC
      expect(cusps[6]).toBe(225);  // DSC (ASC + 180)
      expect(cusps[3]).toBe(135);  // IC (MC + 180)
      
      // For intermediate houses, verify sequence around the zodiac
      // Houses 10-11-12-1 should be in zodiacal sequence
      expectCorrectSequence(cusps, 9, 10);
      expectCorrectSequence(cusps, 10, 11);
      expectCorrectSequence(cusps, 11, 0);
      
      // Houses 1-2-3-4 should be in zodiacal sequence
      expectCorrectSequence(cusps, 0, 1);
      expectCorrectSequence(cusps, 1, 2);
      expectCorrectSequence(cusps, 2, 3);
      
      // Houses 4-5-6-7 should be in zodiacal sequence
      expectCorrectSequence(cusps, 3, 4);
      expectCorrectSequence(cusps, 4, 5);
      expectCorrectSequence(cusps, 5, 6);
      
      // Houses 7-8-9-10 should be in zodiacal sequence
      expectCorrectSequence(cusps, 6, 7);
      expectCorrectSequence(cusps, 7, 8);
      expectCorrectSequence(cusps, 8, 9);
    });
  });
  
  describe('Koch System', () => {
    test('should require latitude and MC parameters', () => {
      expect(() => {
        calculator.calculateHouseCusps(0, "Koch", {});
      }).toThrow("Koch house system requires latitude and mc");
      
      expect(() => {
        calculator.calculateHouseCusps(0, "Koch", { latitude: 45 });
      }).toThrow("Koch house system requires latitude and mc");
      
      expect(() => {
        calculator.calculateHouseCusps(0, "Koch", { mc: 315 });
      }).toThrow("Koch house system requires latitude and mc");
    });

    test('should calculate Koch house cusps correctly', () => {
      const ascendant = 45;
      const mc = 315;
      const latitude = 51.5; // London latitude
      const cusps = calculator.calculateHouseCusps(ascendant, "Koch", { mc, latitude });
      
      // Check angular houses
      expect(cusps[0]).toBe(45);   // ASC
      expect(cusps[9]).toBe(315);  // MC
      expect(cusps[6]).toBe(225);  // DSC (ASC + 180)
      expect(cusps[3]).toBe(135);  // IC (MC + 180)
      
      // Verify sequence around the zodiac
      // Houses 10-11-12-1 should be in zodiacal sequence
      expectCorrectSequence(cusps, 9, 10);
      expectCorrectSequence(cusps, 10, 11);
      expectCorrectSequence(cusps, 11, 0);
      
      // Houses 1-2-3-4 should be in zodiacal sequence
      expectCorrectSequence(cusps, 0, 1);
      expectCorrectSequence(cusps, 1, 2);
      expectCorrectSequence(cusps, 2, 3);
      
      // Houses 4-5-6-7 should be in zodiacal sequence
      expectCorrectSequence(cusps, 3, 4);
      expectCorrectSequence(cusps, 4, 5);
      expectCorrectSequence(cusps, 5, 6);
      
      // Houses 7-8-9-10 should be in zodiacal sequence
      expectCorrectSequence(cusps, 6, 7);
      expectCorrectSequence(cusps, 7, 8);
      expectCorrectSequence(cusps, 8, 9);
    });
  });

  describe('Regiomontanus System', () => {
    test('should require latitude and MC parameters', () => {
      expect(() => {
        calculator.calculateHouseCusps(0, "Regiomontanus", {});
      }).toThrow("Regiomontanus house system requires latitude and mc");
    });
    
    test('should calculate Regiomontanus cusps correctly', () => {
      const ascendant = 45;
      const mc = 315;
      const latitude = 51.5; // London latitude
      const cusps = calculator.calculateHouseCusps(ascendant, "Regiomontanus", { latitude, mc });
      
      // Verify angular houses
      expect(cusps[0]).toBe(45);
      expect(cusps[9]).toBe(315);
      
      // Verify sequence of intermediate houses
      // Houses 10-11-12-1 should be in zodiacal sequence
      expectCorrectSequence(cusps, 9, 10);
      expectCorrectSequence(cusps, 10, 11);
      expectCorrectSequence(cusps, 11, 0);
      
      // Houses 1-2-3-4 should be in zodiacal sequence
      expectCorrectSequence(cusps, 0, 1);
      expectCorrectSequence(cusps, 1, 2);
      expectCorrectSequence(cusps, 2, 3);
    });
  });
  
  describe('Campanus System', () => {
    test('should require latitude and MC parameters', () => {
      expect(() => {
        calculator.calculateHouseCusps(0, "Campanus", {});
      }).toThrow("Campanus house system requires latitude and mc");
    });
    
    test('should calculate Campanus cusps correctly', () => {
      const ascendant = 45;
      const mc = 315;
      const latitude = 51.5; // London latitude
      const cusps = calculator.calculateHouseCusps(ascendant, "Campanus", { latitude, mc });
      
      // Verify angular houses
      expect(cusps[0]).toBe(45);
      expect(cusps[9]).toBe(315);
      
      // Verify sequence of intermediate houses
      // Houses 10-11-12-1 should be in zodiacal sequence
      expectCorrectSequence(cusps, 9, 10);
      expectCorrectSequence(cusps, 10, 11);
      expectCorrectSequence(cusps, 11, 0);
      
      // Houses 1-2-3-4 should be in zodiacal sequence
      expectCorrectSequence(cusps, 0, 1);
      expectCorrectSequence(cusps, 1, 2);
      expectCorrectSequence(cusps, 2, 3);
    });
  });
  
  describe('Morinus System', () => {
    test('should require MC parameter', () => {
      expect(() => {
        calculator.calculateHouseCusps(0, "Morinus", {});
      }).toThrow("Morinus house system requires mc");
    });
    
    test('should calculate Morinus cusps correctly', () => {
      const ascendant = 45;
      const mc = 315;
      const cusps = calculator.calculateHouseCusps(ascendant, "Morinus", { mc });
      
      // Verify angular houses
      expect(cusps[0]).toBe(45);
      expect(cusps[9]).toBe(315);
      
      // Verify sequence of intermediate houses
      // Houses 10-11-12-1 should be in zodiacal sequence
      expectCorrectSequence(cusps, 9, 10);
      expectCorrectSequence(cusps, 10, 11);
      expectCorrectSequence(cusps, 11, 0);
      
      // Houses 1-2-3-4 should be in zodiacal sequence
      expectCorrectSequence(cusps, 0, 1);
      expectCorrectSequence(cusps, 1, 2);
      expectCorrectSequence(cusps, 2, 3);
    });
  });
  
  describe('Topocentric System', () => {
    test('should require latitude and MC parameters', () => {
      expect(() => {
        calculator.calculateHouseCusps(0, "Topocentric", {});
      }).toThrow("Topocentric house system requires latitude and mc");
    });
    
    test('should calculate Topocentric cusps correctly', () => {
      const ascendant = 45;
      const mc = 315;
      const latitude = 51.5; // London latitude
      const cusps = calculator.calculateHouseCusps(ascendant, "Topocentric", { latitude, mc });
      
      // Verify angular houses
      expect(cusps[0]).toBe(45);
      expect(cusps[9]).toBe(315);
      
      // Verify sequence of intermediate houses
      // Houses 10-11-12-1 should be in zodiacal sequence
      expectCorrectSequence(cusps, 9, 10);
      expectCorrectSequence(cusps, 10, 11);
      expectCorrectSequence(cusps, 11, 0);
      
      // Houses 1-2-3-4 should be in zodiacal sequence
      expectCorrectSequence(cusps, 0, 1);
      expectCorrectSequence(cusps, 1, 2);
      expectCorrectSequence(cusps, 2, 3);
    });
  });
}); 