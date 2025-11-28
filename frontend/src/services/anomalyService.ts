import type { Box, FeedbackLog } from "../types/inspection.types";
import { updateAnomalies as updateAnomaliesAPI, loadFeedbackLogs as loadFeedbackLogsAPI } from "../api/detectionApi";

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
  logs?: FeedbackLog | FeedbackLog[] | null
): Promise<void> {
  let logsToSend: string | undefined;

  if (logs) {
    // Ensure logs is an array
    const newLogs = Array.isArray(logs) ? logs : [logs];

    try {
      // Fetch existing logs from server and merge to avoid overwriting previous entries
      const existingResp = await loadFeedbackLogsAPI(transformerNo, inspectionNo);
      let existingLogs: FeedbackLog[] = [];
      if (
        existingResp &&
        (existingResp?.responseCode === "2000" || existingResp?.responseCode === 2000) &&
        existingResp.responseData
      ) {
        const raw = existingResp.responseData.logs;
        if (raw) {
          const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
          existingLogs = Array.isArray(parsed) ? parsed : [parsed];
        }
      }

      const merged = [...existingLogs, ...newLogs];
      logsToSend = JSON.stringify(merged);
    } catch (err) {
      // If fetching existing logs fails, fall back to sending only the new logs
      logsToSend = JSON.stringify(newLogs);
    }
  }

  await updateAnomaliesAPI({
    transformerNo,
    inspectionNo,
    type: "Thermal",
    detectionJson: JSON.stringify(anomalies),
    logs: logsToSend,
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
  // Always create a deletion log so removals persist, even for user-added anomalies.
  logData = {
    imageId: `${transformerNo}_${inspectionNo}`,
    originalAIDetection: {
      box: boxToDelete.n,
      class: boxToDelete.klass,
      confidence: boxToDelete.conf || 0,
    },
    userModification: {
      action: "deleted" as const,
      modifiedAt: new Date().toLocaleString("en-US", {
        timeZone: "Asia/Colombo",
      }),
      modifiedBy: userName,
    },
  };

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
