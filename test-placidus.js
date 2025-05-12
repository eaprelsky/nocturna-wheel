// Simple test script for Placidus house system (CommonJS format)

// Manually instantiate a HouseCalculator with the same code
function createHouseCalculator() {
  class HouseCalculator {
    constructor() {
      this.houseSystems = {
        "Placidus": this.calculatePlacidus.bind(this),
        "Porphyry": this.calculatePorphyry.bind(this)
      };
    }
    
    getAvailableHouseSystems() {
      return Object.keys(this.houseSystems);
    }
    
    calculateHouseCusps(ascendant, system = "Placidus", options = {}) {
      if (typeof ascendant !== 'number' || ascendant < 0 || ascendant >= 360) {
        throw new Error("Ascendant must be a number between 0 and 360");
      }
      
      if (!this.houseSystems[system]) {
        throw new Error(`House system "${system}" is not supported`);
      }
      
      return this.houseSystems[system](ascendant, options);
    }
    
    calculatePlacidus(ascendant, { latitude, mc }) {
      if (typeof latitude !== 'number' || typeof mc !== 'number') {
        throw new Error("Placidus house system requires latitude and mc");
      }
      
      if (Math.abs(latitude) >= 66.5) {
        return this.calculatePorphyry(ascendant, { mc });
      }
      
      const cusps = new Array(12);
      
      cusps[0] = ascendant;
      cusps[9] = mc;
      cusps[6] = this.normalizeAngle(ascendant + 180);
      cusps[3] = this.normalizeAngle(mc + 180);
      
      try {
        cusps[10] = this.calculatePlacidusIntermediateHouse(mc, ascendant, 1/3, latitude);
        cusps[11] = this.calculatePlacidusIntermediateHouse(mc, ascendant, 2/3, latitude);
        
        cusps[1] = this.calculatePlacidusIntermediateHouse(ascendant, cusps[3], 1/3, latitude);
        cusps[2] = this.calculatePlacidusIntermediateHouse(ascendant, cusps[3], 2/3, latitude);
        
        cusps[4] = this.calculatePlacidusIntermediateHouse(cusps[3], cusps[6], 1/3, latitude);
        cusps[5] = this.calculatePlacidusIntermediateHouse(cusps[3], cusps[6], 2/3, latitude);
        
        cusps[7] = this.calculatePlacidusIntermediateHouse(cusps[6], cusps[9], 1/3, latitude);
        cusps[8] = this.calculatePlacidusIntermediateHouse(cusps[6], cusps[9], 2/3, latitude);
      } catch (error) {
        console.warn(`Placidus calculation failed: ${error.message}. Falling back to Porphyry.`);
        return this.calculatePorphyry(ascendant, { mc });
      }
      
      return cusps;
    }
    
    calculatePlacidusIntermediateHouse(start, end, fraction, latitude) {
      const arc = this.calculateArc(start, end);
      return this.normalizeAngle(start + arc * fraction);
    }
    
    calculatePorphyry(ascendant, { mc }) {
      if (typeof mc !== 'number') {
        throw new Error("Porphyry house system requires mc");
      }
      
      const cusps = new Array(12);
      
      cusps[0] = ascendant;
      cusps[9] = mc;
      cusps[6] = this.normalizeAngle(ascendant + 180);
      cusps[3] = this.normalizeAngle(mc + 180);
      
      const arc1 = this.calculateArc(cusps[9], cusps[0]);
      cusps[10] = this.normalizeAngle(cusps[9] + arc1 / 3);
      cusps[11] = this.normalizeAngle(cusps[9] + (2 * arc1 / 3));
      
      const arc2 = this.calculateArc(cusps[0], cusps[3]);
      cusps[1] = this.normalizeAngle(cusps[0] + arc2 / 3);
      cusps[2] = this.normalizeAngle(cusps[0] + (2 * arc2 / 3));
      
      const arc3 = this.calculateArc(cusps[3], cusps[6]);
      cusps[4] = this.normalizeAngle(cusps[3] + arc3 / 3);
      cusps[5] = this.normalizeAngle(cusps[3] + (2 * arc3 / 3));
      
      const arc4 = this.calculateArc(cusps[6], cusps[9]);
      cusps[7] = this.normalizeAngle(cusps[6] + arc4 / 3);
      cusps[8] = this.normalizeAngle(cusps[6] + (2 * arc4 / 3));
      
      return cusps;
    }
    
    calculateArc(start, end) {
      const diff = this.normalizeAngle(end - start);
      return diff <= 180 ? diff : 360 - diff;
    }
    
    normalizeAngle(angle) {
      return ((angle % 360) + 360) % 360;
    }
  }
  
  return new HouseCalculator();
}

function testPlacidusHouses() {
  console.log("Testing Placidus House System");
  
  const calculator = createHouseCalculator();
  
  // Test cases
  const testCases = [
    {
      name: "London (Northern Hemisphere)",
      ascendant: 45,
      mc: 315,
      latitude: 51.5
    },
    {
      name: "Sydney (Southern Hemisphere)",
      ascendant: 100,
      mc: 10,
      latitude: -33.9
    },
    {
      name: "Ascendant near 0°",
      ascendant: 5,
      mc: 275,
      latitude: 40.7
    },
    {
      name: "MC near 0°",
      ascendant: 90,
      mc: 5,
      latitude: 30
    },
    {
      name: "Extreme latitude (Polar)",
      ascendant: 30,
      mc: 330,
      latitude: 75
    }
  ];
  
  // Run tests
  for (const test of testCases) {
    console.log(`\n== ${test.name} ==`);
    
    try {
      const cusps = calculator.calculateHouseCusps(
        test.ascendant, 
        "Placidus", 
        { mc: test.mc, latitude: test.latitude }
      );
      
      console.log("Angular houses:");
      console.log(`ASC (1st): ${cusps[0]}°`);
      console.log(`MC (10th): ${cusps[9]}°`);
      console.log(`DSC (7th): ${cusps[6]}°`);
      console.log(`IC (4th): ${cusps[3]}°`);
      
      console.log("\nIntermediate houses:");
      console.log(`11th: ${cusps[10]}°`);
      console.log(`12th: ${cusps[11]}°`);
      console.log(`2nd: ${cusps[1]}°`);
      console.log(`3rd: ${cusps[2]}°`);
      console.log(`5th: ${cusps[4]}°`);
      console.log(`6th: ${cusps[5]}°`);
      console.log(`8th: ${cusps[7]}°`);
      console.log(`9th: ${cusps[8]}°`);
      
      // Check house sequence
      console.log("\nHouse sequence checks:");
      for (let i = 0; i < 11; i++) {
        checkSequence(cusps, i, i+1);
      }
      checkSequence(cusps, 11, 0);
    } catch (error) {
      console.error(`Error calculating houses: ${error.message}`);
    }
  }
}

// Helper to check zodiacal sequence
function checkSequence(cusps, i, j) {
  const angle1 = cusps[i];
  const angle2 = cusps[j];
  
  let result;
  
  if (Math.abs(angle2 - angle1) <= 180) {
    result = angle2 > angle1;
  } else {
    result = angle1 > angle2;
  }
  
  console.log(`House ${i+1} (${cusps[i]}°) to House ${j+1} (${cusps[j]}°): ${result ? "VALID" : "INVALID"}`);
}

// Run the test
testPlacidusHouses(); 