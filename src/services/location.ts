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

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    accuracy: location.coords.accuracy ?? 0,
  };
}

export async function getLastKnownPosition(): Promise<{
  latitude: number;
  longitude: number;
  accuracy: number;
} | null> {
  const location = await Location.getLastKnownPositionAsync();
  if (!location) return null;

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    accuracy: location.coords.accuracy ?? 0,
  };
}
