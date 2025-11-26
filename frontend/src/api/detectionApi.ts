import client from "./client";

const BASE_PATH = "/transformer-thermal-inspection/image-data";

export interface AnomalyUpdatePayload {
  transformerNo: string;
  inspectionNo: string;
  type: "Thermal" | "Baseline";
  detectionJson: string;
  logs?: string;
}

export async function updateAnomalies(payload: AnomalyUpdatePayload) {
  const params = new URLSearchParams({
    transformerNo: payload.transformerNo,
    inspectionNo: payload.inspectionNo,
  });
  const formData = new FormData();
  formData.append("type", payload.type);
  formData.append("detectionJson", payload.detectionJson);
  if (payload.logs) {
    formData.append("logs", payload.logs);
  }

  const { data } = await client.put(`${BASE_PATH}/update?${params}`, formData);
  return data;
}

export async function loadFeedbackLogs(
  transformerNo: string,
  inspectionNo: string
) {
  const params = new URLSearchParams({
    transformerNo,
    inspectionNo,
    type: "Thermal",
  });
  const { data } = await client.get(`${BASE_PATH}/view?${params}`);
  return data;
}

export async function runDetection(
  transformerNo: string,
  inspectionNo: string
) {
  const params = new URLSearchParams({ transformerNo, inspectionNo });
  const { data } = await client.post(`${BASE_PATH}/detect?${params}`);
  return data;
}
