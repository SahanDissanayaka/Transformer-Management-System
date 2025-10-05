// frontend/src/api/imageApi.ts
import client from "./client";

const BASE_PATH = "/transformer-thermal-inspection/image-data";

export type ImgType = "Baseline" | "Thermal";
export type Weather = "SUNNY" | "CLOUDY" | "RAINY";

export async function uploadImage(
  transformerNo: string,
  inspectionNo: string,
  file: File,
  type: ImgType,
  weather: Weather
) {
  const form = new FormData();
  form.append("transformerNo", transformerNo);
  form.append("inspectionNo", inspectionNo);

  // Send type exactly as provided ("Baseline" | "Thermal") so backend
  // can distinguish transformer-level baseline retrieval which checks
  // for the literal "Baseline" string.
  form.append("type", type);
  form.append("weather", weather);

  // SEND ONLY ONE FILE FIELD, NAMED EXACTLY WHAT THE CONTROLLER EXPECTS:
  form.append("photo", file); // <-- do not append "image" or "file"

  // Let axios set the correct multipart boundary header
  const { data } = await client.post(`${BASE_PATH}/create`, form);
  return data;
}

export async function viewImage(
  transformerNo: string,
  inspectionNo: string,
  type: ImgType
) {
  // Send the image type exactly as provided so backend's getImage can
  // treat "Baseline" specially (return transformer-level baseline).
  const { data } = await client.get(
    `${BASE_PATH}/view?transformerNo=${encodeURIComponent(
      transformerNo
    )}&inspectionNo=${encodeURIComponent(inspectionNo)}&type=${encodeURIComponent(type)}`
  );
  return data;
}

export async function updateImage(
  transformerNo: string,
  inspectionNo: string,
  file: File,
  type: ImgType,
  weather: Weather
) {
  const form = new FormData();
  form.append("transformerNo", transformerNo);
  form.append("inspectionNo", inspectionNo);
  form.append("type", type);
  form.append("weather", weather);
  form.append("photo", file);

  const { data } = await client.put(`${BASE_PATH}/update`, form);
  return data;
}

export async function deleteImage(transformerNo: string, inspectionNo: string) {
  const { data } = await client.delete(
    `${BASE_PATH}/delete?transformerNo=${encodeURIComponent(
      transformerNo
    )}&inspectionNo=${encodeURIComponent(inspectionNo)}`
  );
  return data;
}

// Helper to explicitly fetch the transformer-level Baseline image.
// The backend controller requires an inspectionNo parameter, but when
// type === "Baseline" the service ignores inspectionNo and returns the
// transformer-level baseline if present. We pass an empty string for
// inspectionNo here.
export async function viewTransformerBaseline(transformerNo: string) {
  return viewImage(transformerNo, "", "Baseline");
}

export async function runAnomalyDetection(transformerNo: string, inspectionNo: string) {
  const { data } = await client.post(
    `${BASE_PATH}/detect?transformerNo=${encodeURIComponent(transformerNo)}&inspectionNo=${encodeURIComponent(inspectionNo)}`
  );
  return data;
}
