type Coordinate = { latitude: number; longitude: number };

const EARTH_RADIUS_KM = 6371;

// TODO: better use haversine-distance package
export const calculateDistance = (a: Coordinate, b: Coordinate): number => {
  const toRadians = (value: number): number => (value * Math.PI) / 180;
  const dLatitude = toRadians(b.latitude - a.latitude);
  const dLongitude = toRadians(b.longitude - a.longitude);
  const aLatitude = toRadians(a.latitude);
  const bLatitude = toRadians(b.latitude);

  const value =
    Math.sin(dLatitude / 2) * Math.sin(dLatitude / 2) +
    Math.sin(dLongitude / 2) *
      Math.sin(dLongitude / 2) *
      Math.cos(aLatitude) *
      Math.cos(bLatitude);
  const distance =
    EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));

  return Number((Math.round(distance * 100) / 100).toFixed(2));
};
