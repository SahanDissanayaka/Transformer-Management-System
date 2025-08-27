// src/api/imageApi.ts
import client from "./client";

const BASE_PATH = "/transformer-thermal-inspection/image-data";

export type ImgType = "Baseline" | "Thermal";
export type Weather = "SUNNY" | "CLOUDY" | "RAINY";

/**
 * Upload (create) image with weather tag
 * Backend must accept multipart fields:
 *  - transformerNo, inspectionNo, photo, type, weather
 */
export async function uploadImage(
  transformerNo: string,
  inspectionNo: string,
  file: File,
  type: ImgType,
  weather: Weather
) {
  const formData = new FormData();
  formData.append("transformerNo", transformerNo);
  formData.append("inspectionNo", inspectionNo);
  formData.append("photo", file);
  formData.append("type", type);
  formData.append("weather", weather); // NEW

  try {
    const { data } = await client.post(`${BASE_PATH}/create`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (error) {
    console.error("❌ Failed to upload image:", error);
    throw error;
  }
}

/**
 * View image (returns base64 string in responseData.photoBase64)
 * You’re already passing type in query; keeping that behavior.
 */
export async function viewImage(
  transformerNo: string,
  inspectionNo: string,
  type: ImgType | string
) {
  try {
    const { data } = await client.get(
      `${BASE_PATH}/view?transformerNo=${encodeURIComponent(
        transformerNo
      )}&inspectionNo=${encodeURIComponent(inspectionNo)}&type=${encodeURIComponent(type)}`
    );
    return data;
  } catch (error) {
    console.error("❌ Failed to fetch image:", error);
    return null;
  }
}

/**
 * Update existing image (optionally change type and/or weather)
 * Backend must accept:
 *  - query: transformerNo, inspectionNo
 *  - body (multipart): photo, (optional) type, (optional) weather
 */
export async function updateImage(
  transformerNo: string,
  inspectionNo: string,
  file: File,
  type?: ImgType,
  weather?: Weather // NEW (optional)
) {
  const formData = new FormData();
  formData.append("photo", file);
  if (type) formData.append("type", type);
  if (weather) formData.append("weather", weather); // NEW

  try {
    const { data } = await client.put(
      `${BASE_PATH}/update?transformerNo=${encodeURIComponent(
        transformerNo
      )}&inspectionNo=${encodeURIComponent(inspectionNo)}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  } catch (error) {
    console.error("❌ Failed to update image:", error);
    throw error;
  }
}

/**
 * Delete image
 */
export async function deleteImage(transformerNo: string, inspectionNo: string) {
  try {
    const { data } = await client.delete(
      `${BASE_PATH}/delete?transformerNo=${encodeURIComponent(
        transformerNo
      )}&inspectionNo=${encodeURIComponent(inspectionNo)}`
    );
    return data;
  } catch (error) {
    console.error("❌ Failed to delete image:", error);
    throw error;
  }
}

/** Optional helpers for UI */
export const WEATHER_OPTIONS: Weather[] = ["SUNNY", "CLOUDY", "RAINY"];
export const TYPE_OPTIONS: ImgType[] = ["Baseline", "Thermal"];
