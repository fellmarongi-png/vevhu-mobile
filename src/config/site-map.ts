// ---------------------------------------------------------------------------
// Spitzkop Lot 14 & Lot 6 Site Map Configuration & Georeferencing Bounds
// ---------------------------------------------------------------------------

export interface GeoBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface StandCoordinate {
  stand_number: string;
  xPercent: number; // 0..100 relative to Lot 6 map image
  yPercent: number; // 0..100 relative to Lot 6 map image
  latitude?: number;
  longitude?: number;
}

/**
 * Georeferenced bounding box calibration for Spitzkop Lot 6 Triangle
 */
export const SPITZKOP_LOT6_BOUNDS: GeoBounds = {
  north: -17.845,
  south: -17.858,
  west: 30.985,
  east: 31.002,
};

/**
 * Preset stand coordinate locations mapped directly onto the Lot 6 survey drawing
 */
export const SPITZKOP_STANDS_PRESETS: StandCoordinate[] = [
  { stand_number: "1042", xPercent: 42.5, yPercent: 35.2 },
  { stand_number: "1042-B", xPercent: 44.1, yPercent: 36.8 },
  { stand_number: "1043", xPercent: 48.0, yPercent: 38.0 },
  { stand_number: "1044", xPercent: 52.3, yPercent: 40.5 },
  { stand_number: "1045", xPercent: 55.8, yPercent: 43.1 },
  { stand_number: "1046", xPercent: 60.2, yPercent: 46.4 },
  { stand_number: "1047", xPercent: 64.0, yPercent: 50.0 },
  { stand_number: "1048", xPercent: 68.5, yPercent: 53.2 },
];

/**
 * Calculates (X%, Y%) position on Lot 6 map drawing from live GPS coordinates
 */
export function gpsToMapPercent(
  lat: number,
  lng: number,
  bounds: GeoBounds = SPITZKOP_LOT6_BOUNDS,
): { xPercent: number; yPercent: number } {
  const xPercent = Math.max(
    0,
    Math.min(100, ((lng - bounds.west) / (bounds.east - bounds.west)) * 100),
  );
  const yPercent = Math.max(
    0,
    Math.min(100, ((bounds.north - lat) / (bounds.north - bounds.south)) * 100),
  );
  return { xPercent, yPercent };
}

/**
 * Calculates distance in meters between two GPS coordinates using Haversine formula
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371e3; // Earth radius in meters
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}
