export const addPinBlur = (latitude, longitude) => {
  const R = 6371000;
  
  const minOffset = 50;
  const maxOffset = 100;
  const distance = Math.random() * (maxOffset - minOffset) + minOffset;
  
  const angle = Math.random() * 2 * Math.PI;
  
  const deltaLat = (distance * Math.cos(angle)) / R;
  const deltaLng = (distance * Math.sin(angle)) / (R * Math.cos((latitude * Math.PI) / 180));
  
  return {
    latitude: latitude + (deltaLat * 180) / Math.PI,
    longitude: longitude + (deltaLng * 180) / Math.PI,
  };
};

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
      
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance; 
};