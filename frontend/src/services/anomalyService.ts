import type { Box, FeedbackLog } from "../types/inspection.types";
import { updateAnomalies as updateAnomaliesAPI } from "../api/detectionApi";

/**
 * Internal helper to update anomalies via API
 */
async function updateAnomalies(
  transformerNo: string,
  inspectionNo: string,
  anomalies: Array<{
    box: number[];
    class: string;
    manual?: boolean;
    user?: string;
    confidence?: number;
  }>,
  logs?: FeedbackLog | null
): Promise<void> {
  await updateAnomaliesAPI({
    transformerNo,
    inspectionNo,
    type: "Thermal",
    detectionJson: JSON.stringify(anomalies),
    logs: logs ? JSON.stringify(logs) : undefined,
  });
}

/**
 * Delete an anomaly and save feedback log
 */
export async function deleteAnomaly(
  transformerNo: string,
  inspectionNo: string,
  boxToDelete: Box,
  remainingBoxes: Box[]
): Promise<FeedbackLog | null> {
  const userName = localStorage.getItem("username") || "User";

  let logData: FeedbackLog | null = null;
  if (boxToDelete.aiDetected) {
    logData = {
      imageId: `${transformerNo}_${inspectionNo}`,
      originalAIDetection: {
        box: boxToDelete.n,
        class: boxToDelete.klass,
        confidence: boxToDelete.conf,
      },
      userModification: {
        action: "deleted" as const,
        modifiedAt: new Date().toLocaleString("en-US", {
          timeZone: "Asia/Colombo",
        }),
        modifiedBy: userName,
      },
    };
  }

  const remainingAnomalies = remainingBoxes.map((b) => ({
    box: b.n.map((v) => parseFloat(v.toFixed(6))),
    class: b.klass,
    manual: !b.aiDetected,
    user: !b.aiDetected ? b.rejectedBy || userName : undefined,
    confidence: b.conf,
  }));

  await updateAnomalies(
    transformerNo,
    inspectionNo,
    remainingAnomalies,
    logData
  );

  return logData;
}

/**
 * Edit an anomaly coordinates and save feedback log
 */
export async function editAnomaly(
  transformerNo: string,
  inspectionNo: string,
  boxToEdit: Box,
  newCoords: [number, number, number, number],
  allBoxes: Box[]
): Promise<FeedbackLog | null> {
  const userName = localStorage.getItem("username") || "User";

  let logData: FeedbackLog | null = null;
  if (boxToEdit.aiDetected) {
    logData = {
      imageId: `${transformerNo}_${inspectionNo}`,
      originalAIDetection: {
        box: boxToEdit.n,
        class: boxToEdit.klass,
        confidence: boxToEdit.conf,
      },
      userModification: {
        action: "modified" as const,
        finalBox: newCoords,
        finalClass: boxToEdit.klass,
        modifiedAt: new Date().toLocaleString("en-US", {
          timeZone: "Asia/Colombo",
        }),
        modifiedBy: userName,
      },
    };
  }

  const allAnomalies = allBoxes.map((b) => ({
    box: b.idx === boxToEdit.idx ? newCoords : b.n,
    class: b.klass,
    manual: b.idx === boxToEdit.idx ? true : !b.aiDetected,
    user:
      b.idx === boxToEdit.idx
        ? userName
        : !b.aiDetected
        ? b.rejectedBy || userName
        : undefined,
    confidence: b.idx === boxToEdit.idx ? null : b.conf,
  }));

  await updateAnomalies(
    transformerNo,
    inspectionNo,
    allAnomalies.map((a) => ({
      box: a.box.map((v) => parseFloat(v.toFixed(6))),
      class: a.class,
      manual: a.manual,
      user: a.user,
      confidence: a.confidence ?? undefined,
    })),
    logData
  );

  return logData;
}

/**
 * Add a new anomaly manually and save feedback log
 */
export async function addAnomaly(
  transformerNo: string,
  inspectionNo: string,
  newCoords: [number, number, number, number],
  anomalyClass: string,
  allBoxes: Box[]
): Promise<FeedbackLog> {
  const userName = localStorage.getItem("username") || "User";

  const newAnomalyData = {
    box: newCoords.map((v) => parseFloat(v.toFixed(6))),
    class: anomalyClass,
    manual: true,
    user: userName,
  };

  const logData: FeedbackLog = {
    imageId: `${transformerNo}_${inspectionNo}`,
    userAddition: {
      box: newCoords.map((v) => parseFloat(v.toFixed(6))),
      class: anomalyClass,
      addedAt: new Date().toLocaleString("en-US", {
        timeZone: "Asia/Colombo",
      }),
      addedBy: userName,
    },
  };

  const allAnomalies = [
    ...allBoxes.map((b) => ({
      box: b.n.map((v) => parseFloat(v.toFixed(6))),
      class: b.klass,
      manual: b.aiDetected === false,
      user:
        b.aiDetected === false ? b.rejectedBy || userName : undefined,
      confidence: b.conf,
    })),
    newAnomalyData,
  ];

  await updateAnomalies(transformerNo, inspectionNo, allAnomalies, logData);

  return logData;
}
