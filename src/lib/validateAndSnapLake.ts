export interface LakeValidationResult {
  lakeId: string;
  latitude: number;
  longitude: number;
}

/**
 * Validates whether a point lies inside a lake polygon or snaps it to the nearest
 * lake within a given distance on the backend.
 *
 * The backend is expected to perform logic similar to:
 *
 * - Validation:
 *   SELECT lake_id
 *   FROM lakes
 *   WHERE ST_Contains(
 *     geom,
 *     ST_SetSRID(ST_Point($lon,$lat),4326)
 *   );
 *
 * - Snapping:
 *   SELECT
 *     lake_id,
 *     ST_ClosestPoint(
 *       geom,
 *       ST_SetSRID(ST_Point($lon,$lat),4326)
 *     )
 *   FROM lakes
 *   WHERE ST_DWithin(
 *     geom,
 *     ST_SetSRID(ST_Point($lon,$lat),4326),
 *     50
 *   )
 *   ORDER BY geom <-> ST_SetSRID(ST_Point($lon,$lat),4326)
 *   LIMIT 1;
 *
 * The endpoint should return JSON like:
 * {
 *   "lakeId": "123",
 *   "latitude": 28.61,
 *   "longitude": 77.20
 * }
 */
export async function validateAndSnapLake(
  latitude: number,
  longitude: number
): Promise<LakeValidationResult | null> {
  // Call the Node.js backend directly (no Vite /api proxy).
  // Configure this base URL to the exact backend URL you provided.
  const baseUrl = (import.meta as any).env?.VITE_LAKE_SERVICE_URL as string | undefined;
  if (!baseUrl) {
    throw new Error(
      "VITE_LAKE_SERVICE_URL is not set. Please set it to your Node.js lake backend URL."
    );
  }

  const endpoint = `${baseUrl.replace(/\/$/, "")}/api/lakes/validate-or-snap`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ latitude, longitude }),
  });

  if (!response.ok) {
    throw new Error(
      `Lake validation failed: ${response.status} ${response.statusText}`
    );
  }

  const result = await response.json();

  const data = result?.data as Partial<LakeValidationResult> | undefined;

  if (!data || !data.lakeId) {
    return null;
  }

  return {
    lakeId: String(data.lakeId),
    latitude: typeof data.latitude === "number" ? data.latitude : latitude,
    longitude: typeof data.longitude === "number" ? data.longitude : longitude,
  };
}

