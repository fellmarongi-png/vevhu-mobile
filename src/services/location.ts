import * as Location from "expo-location";

export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === "granted";
}

export async function getCurrentPosition(): Promise<{
  latitude: number;
  longitude: number;
  accuracy: number;
} | null> {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) return null;

  try {
    // 10-second timeout for high-accuracy GPS fix before falling back to last known position
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 10_000));
    const locationPromise = Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const result = await Promise.race([locationPromise, timeoutPromise]);
    if (result && "coords" in result) {
      return {
        latitude: result.coords.latitude,
        longitude: result.coords.longitude,
        accuracy: result.coords.accuracy ?? 0,
      };
    }
  } catch (err) {
    console.warn(
      "[Location] High accuracy GPS fix failed/timed out, trying last known position:",
      err,
    );
  }

  // Fallback to last known position if active GPS fix times out
  return getLastKnownPosition();
}

export async function getLastKnownPosition(): Promise<{
  latitude: number;
  longitude: number;
  accuracy: number;
} | null> {
  try {
    const location = await Location.getLastKnownPositionAsync();
    if (!location) return null;

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy ?? 0,
    };
  } catch {
    return null;
  }
}
