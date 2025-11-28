import type { FeedbackLog } from "../types/inspection.types";

type Box = {
  n: [number, number, number, number];
  color?: string;
  idx?: number;
  klass?: string;
  conf?: number;
  aiDetected?: boolean;
  rejectedBy?: string | null;
  rejectedAt?: string | null;
  userAdded?: boolean;
};

export function buildExportPayload(
  transformerNo: string,
  inspectionNo: string,
  finalBoxes: Box[],
  feedbackLogs: FeedbackLog[],
  removedBoxes: Box[] = [],
  exportedBy = ""
) {
  const imageId = `${transformerNo}_${inspectionNo}`;
  const exportedAt = new Date().toISOString();

  // Gather model predictions from two sources:
  // 1) any aiDetected boxes still present in the finalBoxes (user didn't delete),
  // 2) any originalAIDetection entries present in feedbackLogs (covers deleted/modified detections).
  const fromFinal = (finalBoxes || [])
    .filter((b) => b.aiDetected)
    .map((b) => ({ box: b.n, class: b.klass, confidence: b.conf }));

  const fromLogs = (feedbackLogs || [])
    .filter((l: any) => (l as any).originalAIDetection)
    .map((l: any) => ({
      box: (l as any).originalAIDetection.box,
      class: (l as any).originalAIDetection.class,
      confidence: (l as any).originalAIDetection.confidence,
    }));

  // Merge unique by box JSON to avoid duplicates
  const seen = new Set<string>();
  const modelPredicted: Array<{ box: any; class: any; confidence: any }> = [];
  [...fromFinal, ...fromLogs].forEach((m) => {
    try {
      const key = JSON.stringify(m.box);
      if (!seen.has(key)) {
        seen.add(key);
        modelPredicted.push(m);
      }
    } catch (e) {
      // fallback: push if can't stringify
      modelPredicted.push(m);
    }
  });

  const finalAnnotations = (finalBoxes || []).map((b) => ({
    box: b.n,
    class: b.klass,
    manual: b.aiDetected === false,
    annotator: b.rejectedBy || (b.userAdded ? "User" : null),
  }));

  return {
    imageId,
    transformerNo,
    inspectionNo,
    exportedAt,
    exportedBy,
    modelPredictedAnomalies: modelPredicted,
    finalAcceptedAnnotations: finalAnnotations,
    feedbackLogs: feedbackLogs || [],
    removedAnomalies: (removedBoxes || []).map((b) => {
      // Determine source: AI vs User
      const source = b.aiDetected ? "AI" : "User";
      // Try to find matching feedback log for more details
      const matchingLog = (feedbackLogs || []).find((lg: any) =>
        lg.originalAIDetection && Array.isArray(lg.originalAIDetection.box)
          ? JSON.stringify(lg.originalAIDetection.box) === JSON.stringify(b.n)
          : lg.userAddition && Array.isArray(lg.userAddition.box)
          ? JSON.stringify(lg.userAddition.box) === JSON.stringify(b.n)
          : false
      );

      return {
        box: b.n,
        class: b.klass,
        source,
        removedBy: b.rejectedBy || (matchingLog && matchingLog.userModification ? matchingLog.userModification.modifiedBy : null) || null,
        removedAt: b.rejectedAt || (matchingLog && matchingLog.userModification ? matchingLog.userModification.modifiedAt : null) || null,
        feedbackLog: matchingLog || null,
      };
    }),
  };
}

function safeString(v: any) {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  try {
    return JSON.stringify(v);
  } catch (e) {
    return String(v);
  }
}

export function downloadJson(payload: any, filename = "feedback_log.json") {
  const formattedJson = JSON.stringify(payload, null, 2);
  const blob = new Blob([formattedJson], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadCsv(payload: any, filename = "feedback_log.csv") {
  // Build CSV rows. We'll include model predictions and final annotations and feedback logs in rows.
  const rows: string[][] = [];
  const headers = [
    "imageId",
    "transformerNo",
    "inspectionNo",
    "exportedAt",
    "exportedBy",
    "recordType",
    "model_box",
    "model_class",
    "model_confidence",
    "final_box",
    "final_class",
    "final_manual",
    "annotator",
    "annotator_time",
    "feedback_type",
    "feedback_details",
  ];
  rows.push(headers);

  const imageId = payload.imageId || "";

  // Map feedback logs by matching original detection boxes (if present)
  const logs = payload.feedbackLogs || [];

  // Emit model predicted anomalies rows
  (payload.modelPredictedAnomalies || []).forEach((m: any) => {
    // try find related feedback
    const related = logs.find((lg: any) =>
      lg.originalAIDetection && Array.isArray(lg.originalAIDetection.box)
        ? JSON.stringify(lg.originalAIDetection.box) === JSON.stringify(m.box)
        : false
    );

    const finalFromLog = related && related.userModification ? related.userModification.finalBox : null;
    const annotator = related && related.userModification ? related.userModification.modifiedBy : null;
    const annotator_time = related && related.userModification ? related.userModification.modifiedAt : null;

    rows.push([
      imageId,
      payload.transformerNo || "",
      payload.inspectionNo || "",
      payload.exportedAt || "",
      payload.exportedBy || "",
      "model_prediction",
      safeString(m.box),
      safeString(m.class),
      safeString(m.confidence),
      safeString(finalFromLog),
      "",
      "",
      safeString(annotator),
      safeString(annotator_time),
      related ? "user_modification" : "",
      related ? safeString(related) : "",
    ]);
  });

  // Emit final accepted annotations that were not model predictions (user additions)
  (payload.finalAcceptedAnnotations || []).forEach((f: any) => {
    // check if already emitted by matching with a model box
    const matchedModel = (payload.modelPredictedAnomalies || []).find((m: any) => JSON.stringify(m.box) === JSON.stringify(f.box));
    if (matchedModel) return; // already represented

    // attempt to find feedback log for this addition
    const related = logs.find((lg: any) => lg.userAddition && JSON.stringify(lg.userAddition.box) === JSON.stringify(f.box));

    rows.push([
      imageId,
      payload.transformerNo || "",
      payload.inspectionNo || "",
      payload.exportedAt || "",
      payload.exportedBy || "",
      "final_annotation",
      "",
      "",
      "",
      safeString(f.box),
      safeString(f.class),
      safeString(f.manual),
      related ? safeString(related.userAddition.addedBy) : "",
      related ? safeString(related.userAddition.addedAt) : "",
      related ? "user_addition" : "",
      related ? safeString(related) : "",
    ]);
  });

  // Also include any feedback logs that did not match above (edge cases)
  logs.forEach((lg: any) => {
    const isOriginal = !!lg.originalAIDetection;
    const isAddition = !!lg.userAddition;
    const alreadyCovered = isOriginal
      ? (payload.modelPredictedAnomalies || []).some((m: any) => JSON.stringify(m.box) === JSON.stringify(lg.originalAIDetection.box))
      : isAddition
      ? (payload.finalAcceptedAnnotations || []).some((f: any) => JSON.stringify(f.box) === JSON.stringify(lg.userAddition.box))
      : false;
    if (alreadyCovered) return;

    rows.push([
      imageId,
      payload.transformerNo || "",
      payload.inspectionNo || "",
      payload.exportedAt || "",
      payload.exportedBy || "",
      "feedback_log",
      safeString(lg.originalAIDetection?.box),
      safeString(lg.originalAIDetection?.class),
      safeString(lg.originalAIDetection?.confidence),
      safeString(lg.userModification?.finalBox || lg.userAddition?.box),
      safeString(lg.userModification?.finalClass || lg.userAddition?.class),
      safeString(lg.userModification ? true : lg.userAddition ? true : ""),
      safeString(lg.userModification?.modifiedBy || lg.userAddition?.addedBy),
      safeString(lg.userModification?.modifiedAt || lg.userAddition?.addedAt),
      "",
      safeString(lg),
    ]);
  });

  // Convert to CSV string (simple escaping for quotes)
  const csvContent = rows
    .map((r) =>
      r
        .map((cell) => {
          const s = String(cell ?? "");
          if (s.includes(",") || s.includes("\n") || s.includes('"')) {
            return '"' + s.replace(/"/g, '""') + '"';
          }
          return s;
        })
        .join(",")
    )
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// CommonJS compatibility for require() used in some parts of the code
// ESM exports are defined above. No CommonJS `module.exports` here to
// keep compatibility with the frontend bundler and TypeScript.
