import { useCallback, useState } from "react";
import { getCurrentPosition } from "../services/location";

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export function useLocation() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const captureLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const pos = await getCurrentPosition();
      if (pos) {
        setLocation(pos);
      } else {
        setError("Location permission denied");
      }
      return pos;
    } catch (e: any) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { location, loading, error, captureLocation };
}
