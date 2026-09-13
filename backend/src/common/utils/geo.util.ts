export const haversineKm = (from: [number, number], to: [number, number]) => {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const [lng1, lat1] = from;
  const [lng2, lat2] = to;

  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const startLat = toRadians(lat1);
  const endLat = toRadians(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(startLat) *
      Math.cos(endLat) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Calculates real driving distance using Google Maps Distance Matrix API.
 * Falls back to haversine straight-line distance if API fails.
 */
export const calculateDrivingDistanceKm = async (from: [number, number], to: [number, number]): Promise<number> => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const fallbackDistance = haversineKm(from, to);

  if (!apiKey) {
    console.warn("GOOGLE_MAPS_API_KEY is not defined. Using haversine fallback.");
    return fallbackDistance;
  }

  const [originLng, originLat] = from;
  const [destLng, destLat] = to;

  try {
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originLat},${originLng}&destinations=${destLat},${destLng}&key=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`Distance API failed with status ${response.status}. Using haversine fallback.`);
      return fallbackDistance;
    }

    const data = await response.json();

    if (data.status === "OK" && data.rows?.[0]?.elements?.[0]?.status === "OK") {
      const distanceMeters = data.rows[0].elements[0].distance.value;
      return distanceMeters / 1000;
    } else {
      console.warn(`Distance API returned non-OK element status: ${data.rows?.[0]?.elements?.[0]?.status || data.status}. Using fallback.`);
      return fallbackDistance;
    }
  } catch (error) {
    console.error("Distance API error:", error);
    return fallbackDistance;
  }
};
