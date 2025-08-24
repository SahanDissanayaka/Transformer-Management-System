import client from "./client";

// Fetch inspections for a specific transformer using filter request
export async function getInspectionsForTransformer(
  transformerNo: string,
  offset = 0,
  limit = 10
) {
  const filterRequest = {
    offset,
    limit,
    filterValues: [
      {
        columnName: "transformerNo",
        value: [transformerNo],
        operation: "Equal",
      },
    ],
  };

  console.log("🔍 Sending filter request:", filterRequest);

  try {
    const { data } = await client.post(
      "/transformer-thermal-inspection/inspection-data/filter",
      filterRequest
    );

    console.log("✅ Response from filter:", data);

    return data.responseData || []; // Ensure fallback to empty list
  } catch (error) {
    console.error("❌ Error fetching inspections:", error);
    return []; // Fallback to empty
  }
}

// Create a new inspection entry
export async function createInspection(body: any) {
  console.log("📤 Submitting inspection:", body);

  try {
    const { data } = await client.post(
      "/transformer-thermal-inspection/inspection-data/create",
      body
    );

    console.log("✅ Inspection created:", data);
    return data;
  } catch (error) {
    console.error("❌ Failed to create inspection:", error);
    throw error;
  }
}

export async function deleteInspection(id: number) {
  const { data } = await client.delete(
    `/transformer-thermal-inspection/inspection-data/delete/${id}`
  );
  return data;
}

// export async function updateInspection(inspection: any) {
//   const { data } = await client.put(
//     "/transformer-thermal-inspection/inspection-data/update",
//     inspection
//   );
//   return data;
// }

