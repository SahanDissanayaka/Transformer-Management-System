import client from "./client";

const BASE_PATH = "/transformer-thermal-inspection/inspection-data";

export async function getInspectionsForTransformer(
  transformerNo: string,
  offset = 0,
  limit = 10
) {
  const { data } = await client.post(`${BASE_PATH}/filter`, {
    offset,
    limit,
    filterValues: [
      {
        columnName: "transformerNo",
        value: [transformerNo],
        operation: "Equal",
      },
    ],
  });
  return data.responseData || [];
}

export async function createInspection(body: any) {
  const { data } = await client.post(`${BASE_PATH}/create`, body);
  return data;
}

export async function deleteInspection(id: number) {
  const { data } = await client.delete(`${BASE_PATH}/delete/${id}`);
  return data;
}

export async function updateInspection(inspectionData: any) {
  const { data } = await client.put(`${BASE_PATH}/update`, inspectionData);
  return data;
}

export async function getInspectionById(id: number) {
  const { data } = await client.get(`${BASE_PATH}/view/${id}`);
  return data.responseData || null;
}



