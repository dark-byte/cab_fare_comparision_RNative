export const FARE_PARAMETERS = {
  UBER: {
    basePrice: 50,
    perKmRate: 12,
    perMinuteRate: 1.5,
    minimumFare: 60,
    surgeMultiplier: 1.0, // Can be adjusted based on demand
  },
  OLA: {
    basePrice: 48,
    perKmRate: 11.5,
    perMinuteRate: 1.25,
    minimumFare: 55,
    surgeMultiplier: 1.0,
  },
  RAPIDO: {
    basePrice: 30,
    perKmRate: 10,
    perMinuteRate: 1,
    minimumFare: 40,
    surgeMultiplier: 1.0,
  },
  NAMMA_YATRI: {
    basePrice: 45,
    perKmRate: 11,
    perMinuteRate: 1,
    minimumFare: 50,
    surgeMultiplier: 1.0,
  },
}; 