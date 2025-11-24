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
  form.append("type", type);
  form.append("weather", weather);
  form.append("photo", file);

  const { data } = await client.post(`${BASE_PATH}/create`, form);
  return data;
}

export async function viewImage(
  transformerNo: string,
  inspectionNo: string,
  type: ImgType
) {
  const params = new URLSearchParams({
    transformerNo,
    inspectionNo,
    type,
  });
  const { data } = await client.get(`${BASE_PATH}/view?${params}`);
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
  const params = new URLSearchParams({ transformerNo, inspectionNo });
  const { data } = await client.delete(`${BASE_PATH}/delete?${params}`);
  return data;
}

export async function viewTransformerBaseline(transformerNo: string) {
  return viewImage(transformerNo, "", "Baseline");
}

export async function runAnomalyDetection(
  transformerNo: string,
  inspectionNo: string
) {
  const params = new URLSearchParams({ transformerNo, inspectionNo });
  const { data } = await client.post(`${BASE_PATH}/detect?${params}`);
  return data;
}
