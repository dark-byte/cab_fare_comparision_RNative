export const calculateDistance = (
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(destination.lat - origin.lat);
  const dLon = toRad(destination.lng - origin.lng);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(origin.lat)) * Math.cos(toRad(destination.lat)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  // Estimate time (assuming average speed of 30 km/h)
  const estimatedTime = (distance / 30) * 60; // in minutes
  
  return {
    distance: Number(distance.toFixed(2)),
    estimatedTime: Math.round(estimatedTime)
  };
};

const toRad = (value: number) => {
  return value * Math.PI / 180;
}; 