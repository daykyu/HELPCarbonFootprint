// backend/src/utils/emissionFactors.js
const EMISSION_FACTORS = {
  transportation: {
    car: 0.1707,        // kg CO2/km
    bus: 0.0965,       // kg CO2/km
    motorcycle: 0.11337, // kg CO2/km
    bicycle: 0,      // kg CO2/km
    walking: 0       // kg CO2/km
  },
  energy: {
    coal: 0.9,       // kg CO2/kWh
    natural_gas: 0.5, // kg CO2/kWh
    solar: 0.05,     // kg CO2/kWh
    wind: 0.02       // kg CO2/kWh
  },
  dietary: {
    meat_heavy: 7.2, // kg CO2/day
    balanced: 4.7,   // kg CO2/day
    vegetarian: 3.3, // kg CO2/day
    vegan: 2.9       // kg CO2/day
  }
};

// Fungsi helper untuk konversi unit
const convertUnits = {
  kgToTons: (kg) => kg / 1000,
  tonsToKg: (tons) => tons * 1000,
  dailyToAnnual: (daily) => daily * 365,
  annualToDaily: (annual) => annual / 365
};

module.exports = { 
  EMISSION_FACTORS,
  convertUnits 
};