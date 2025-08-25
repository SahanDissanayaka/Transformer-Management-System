import client from "./client";

const BASE_PATH = "/transformer-thermal-inspection/image-data";

// Upload (create new) image
export async function uploadImage(
  transformerNo: string,
  inspectionNo: string,
  file: File,
  type: "Baseline" | "Thermal"
) {
  const formData = new FormData();
  formData.append("transformerNo", transformerNo);
  formData.append("inspectionNo", inspectionNo);
  formData.append("photo", file);
  formData.append("type", type);

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

// View image (returns base64 string)
export async function viewImage(transformerNo: string, inspectionNo: string) {
  try {
    const { data } = await client.get(
      `${BASE_PATH}/view?transformerNo=${transformerNo}&inspectionNo=${inspectionNo}`
    );
    return data;
  } catch (error) {
    console.error("❌ Failed to fetch image:", error);
    return null;
  }
}

// Update existing image
export async function updateImage(
  transformerNo: string,
  inspectionNo: string,
  file: File,
  type?: "Baseline" | "Thermal"
) {
  const formData = new FormData();
  formData.append("photo", file);
  if (type) formData.append("type", type);

  try {
    const { data } = await client.put(
      `${BASE_PATH}/update?transformerNo=${transformerNo}&inspectionNo=${inspectionNo}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  } catch (error) {
    console.error("❌ Failed to update image:", error);
    throw error;
  }
}

// Delete image
export async function deleteImage(transformerNo: string, inspectionNo: string) {
  try {
    const { data } = await client.delete(
      `${BASE_PATH}/delete?transformerNo=${transformerNo}&inspectionNo=${inspectionNo}`
    );
    return data;
  } catch (error) {
    console.error("❌ Failed to delete image:", error);
    throw error;
  }
}
