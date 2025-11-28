import type { Weather } from "../api/imageDataApi";
import type { Box, AnomalyResponse } from "../types/inspection.types";
import { CLASS_COLORS } from "../constants/inspection.constants";

/**
 * Normalize weather string to standard format
 */
export function normalizeWeather(w: unknown): Weather | null {
  if (!w || typeof w !== "string") return null;
  const normalized = w.trim().toUpperCase();
  return normalized === "SUNNY" || normalized === "CLOUDY" || normalized === "RAINY"
    ? (normalized as Weather)
    : null;
}

/**
 * Convert API anomaly responses to internal Box format
 */
export function mapAnomaliestoBoxes(anomalies: AnomalyResponse[]): Box[] {
  return anomalies.map((anomaly, index) => {
    const coordinates = Array.isArray(anomaly.box) ? anomaly.box : [0, 0, 0, 0];
    const className = anomaly.class || "Unknown";
    const color = CLASS_COLORS[className] || CLASS_COLORS.default;
    const confidence = anomaly.confidence ?? anomaly.conf ?? 0;
    const isAiDetected = anomaly.manual !== true;

    return {
      n: [coordinates[0], coordinates[1], coordinates[2], coordinates[3]],
      color,
      idx: index + 1,
      klass: className,
      conf: confidence,
      aiDetected: isAiDetected,
      rejectedBy: anomaly.rejectedBy,
      rejectedAt: anomaly.rejectedAt,
    };
  });
}

/**
 * Compare two bounding boxes approximately to account for floating point
 * differences. Returns true when all coordinate differences are within
 * the specified epsilon.
 */
export function boxesApproximatelyEqual(a: number[], b: number[], eps = 1e-3): boolean {
  if (!a || !b || a.length < 4 || b.length < 4) return false;
  for (let i = 0; i < 4; i++) {
    if (Math.abs(Number(a[i]) - Number(b[i])) > eps) return false;
  }
  return true;
}
