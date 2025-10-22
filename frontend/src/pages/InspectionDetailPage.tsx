import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  uploadImage,
  viewImage,
  type ImgType,
  type Weather,
} from "../api/imageApi";
import AnnotationCanvas from "../components/AnnotationCanvas";

type Box = {
  n: [number, number, number, number];
  color: string;
  idx: number;
  klass: string;
  conf: number;
  aiDetected?: boolean;
  rejectedBy?: string;
  rejectedAt?: string;
  userAdded?: boolean; // true if user added new, false if user modified AI detection
};
type ImgMeta = { dateTime?: string; weather?: Weather | null };
type ThermalMeta = ImgMeta & { boxes?: Box[] };

const CLASS_COLORS: Record<string, string> = {
  "Loose Joint Faulty": "#ef4444",
  "Loose Joint Potentially Faulty": "#f59e0b",
  "Point Overload Faulty": "#8b5cf6",
  "Point Overload Potentially Faulty": "#06b6d4",
  "Full Wire Overload (Potentially Faulty)": "#10b981",
  default: "#3b82f6",
};

function normalizeWeather(w: unknown): Weather | null {
  if (!w || typeof w !== "string") return null;
  const u = w.trim().toUpperCase();
  return u === "SUNNY" || u === "CLOUDY" || u === "RAINY"
    ? (u as Weather)
    : null;
}

// Expandable Anomaly Card Component
function AnomalyCard({
  box,
  onReject,
  onDelete,
  onEdit,
  isEditing,
  onSave,
}: {
  box: Box;
  onReject?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  isEditing?: boolean;
  onSave?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [action, setAction] = useState<"Approved" | "Pending" | "Rejected">(
    "Pending"
  );
  const [note, setNote] = useState("");
  const [notesList, setNotesList] = useState<
    Array<{ text: string; by: string; at: string }>
  >([]);
  const bboxHistory: Array<{
    n: [number, number, number, number];
    changedBy: string;
    changedAt: string;
  }> = [];
  const [changedBy, setChangedBy] = useState<string>(
    box.aiDetected === false ? "User" : "AI-YOLOv8"
  );
  const [changedAt, setChangedAt] = useState<string>(
    new Date().toLocaleString()
  );
  const [userName] = useState<string>(
    () => localStorage.getItem("userName") || "User"
  );
  const [x1, y1, x2, y2] = box.n;

  return (
    <div
      style={{
        border: `2px solid ${expanded ? box.color : "#e5e7eb"}`,
        borderRadius: 12,
        overflow: "hidden",
        transition: "all 0.2s ease",
        boxShadow: expanded
          ? "0 4px 12px rgba(0,0,0,0.1)"
          : "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      {/* Collapsed Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          background: expanded ? "#ffffff" : "#f8fafc",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: box.color,
            color: "#fff",
            display: "grid",
            placeItems: "center",
            fontWeight: 700,
            fontSize: 14,
            flexShrink: 0,
          }}
        >
          {box.idx}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>
            {box.klass}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: "#64748b",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <span>
                {box.aiDetected === false ? "Not AI Detected" : "AI Detection"}
              </span>
            </span>
            {box.aiDetected === false ? <span>•</span> : <span>•</span>}
            {box.aiDetected === false ? (
              <span>User</span>
            ) : (
              <span>{(box.conf * 100).toFixed(0)}% confidence</span>
            )}
          </div>
        </div>

        {/* Status badges in collapsed view */}
        {!expanded && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                padding: "3px 8px",
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600,
                background: "#e0e7ff",
                color: "#4338ca",
              }}
            >
              v1
            </div>
            <div
              style={{
                padding: "3px 10px",
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 600,
                background:
                  action === "Approved"
                    ? "#d1fae5"
                    : action === "Rejected"
                    ? "#fee2e2"
                    : "#fef3c7",
                color:
                  action === "Approved"
                    ? "#065f46"
                    : action === "Rejected"
                    ? "#991b1b"
                    : "#92400e",
              }}
            >
              {action}
            </div>
          </div>
        )}

        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            background: expanded ? "#f1f5f9" : "transparent",
            display: "grid",
            placeItems: "center",
            fontSize: 16,
            transition: "all 0.2s ease",
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            flexShrink: 0,
          }}
        >
          ▼
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div style={{ padding: "0 20px 20px 20px", background: "#ffffff" }}>
          <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 16 }}>
            {/* Badge */}
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 8,
                  background: "#f0f9ff",
                  border: "1px solid #bae6fd",
                }}
              >
                <span
                  style={{ fontSize: 13, fontWeight: 600, color: "#0369a1" }}
                >
                  {box.aiDetected
                    ? "AI Detected"
                    : box.userAdded
                    ? "User Added"
                    : "User Updated"}
                </span>
              </div>
            </div>

            {/* Details */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}>
                BBox: ({x1.toFixed(3)}, {y1.toFixed(3)}) — ({x2.toFixed(3)},{" "}
                {y2.toFixed(3)})
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gap: "8px 16px",
                  fontSize: 14,
                  marginTop: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span>👤</span>
                  <span style={{ fontWeight: 600, color: "#475569" }}>
                    Changed by:
                  </span>
                </div>
                <div style={{ textAlign: "right", fontWeight: 600 }}>
                  {changedBy}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span>🕐</span>
                  <span style={{ fontWeight: 600, color: "#475569" }}>
                    Changed at:
                  </span>
                </div>
                <div style={{ textAlign: "right" }}>{changedAt}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontWeight: 600, color: "#475569" }}>
                    ◆ Action:
                  </span>
                </div>
                <div
                  style={{
                    textAlign: "right",
                    fontWeight: 600,
                    color:
                      action === "Approved"
                        ? "#059669"
                        : action === "Rejected"
                        ? "#dc2626"
                        : "#6366f1",
                  }}
                >
                  {action}
                </div>
              </div>
            </div>

            {/* Edit Bounding Box functionality removed */}

            {/* Bounding Box History */}
            {bboxHistory.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 13,
                    color: "#64748b",
                    marginBottom: 6,
                  }}
                >
                  Previous Bounding Boxes:
                </div>
                <div style={{ display: "grid", gap: 4 }}>
                  {bboxHistory.map((h, i) => (
                    <div
                      key={i}
                      style={{
                        fontSize: 13,
                        color: "#475569",
                        background: "#f8fafc",
                        borderRadius: 6,
                        padding: "4px 8px",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span>
                        BBox: ({h.n[0].toFixed(3)}, {h.n[1].toFixed(3)}) — (
                        {h.n[2].toFixed(3)}, {h.n[3].toFixed(3)})
                      </span>
                      <span style={{ color: "#64748b", fontSize: 12 }}>
                        | Changed by: {h.changedBy}
                      </span>
                      <span style={{ color: "#64748b", fontSize: 12 }}>
                        | Changed at: {h.changedAt}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              {!isEditing ? (
                <button
                  onClick={onEdit}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    borderRadius: 8,
                    border: "2px solid #6366f1",
                    background: "#fff",
                    color: "#4f46e5",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  ✏️ Edit Box
                </button>
              ) : (
                <button
                  onClick={onSave}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    borderRadius: 8,
                    border: "2px solid #10b981",
                    background: "#fff",
                    color: "#047857",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  💾 Save Box
                </button>
              )}
              <button
                onClick={() => setAction("Approved")}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: 8,
                  border:
                    action === "Approved"
                      ? "2px solid #059669"
                      : "1px solid #d1fae5",
                  background: action === "Approved" ? "#d1fae5" : "#ffffff",
                  color: "#065f46",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                ✓ Approved
              </button>
              {onDelete && (
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to delete this anomaly?"
                      )
                    ) {
                      onDelete();
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    borderRadius: 8,
                    border: "2px solid #ef4444",
                    background: "#fecaca",
                    color: "#b91c1c",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  🗑 Delete
                </button>
              )}
              <button
                onClick={() => setAction("Pending")}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: 8,
                  border:
                    action === "Pending"
                      ? "2px solid #6366f1"
                      : "1px solid #e0e7ff",
                  background: action === "Pending" ? "#e0e7ff" : "#ffffff",
                  color: "#3730a3",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                ⏱ Pending
              </button>
              <button
                onClick={() => {
                  setAction("Rejected");
                  if (onReject) {
                    onReject();
                  }
                }}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: 8,
                  border:
                    action === "Rejected"
                      ? "2px solid #dc2626"
                      : "1px solid #fee2e2",
                  background: action === "Rejected" ? "#fee2e2" : "#ffffff",
                  color: "#991b1b",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                ✕ Rejected
              </button>
            </div>

            {/* Add Note Section - multiple notes support */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: 16 }}>📝</span>
                <span
                  style={{ fontSize: 14, fontWeight: 600, color: "#475569" }}
                >
                  Notes
                </span>
              </div>

              {/* Display saved notes */}
              {notesList.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  {notesList.map((savedNote, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 8,
                        border: "1px solid #e5e7eb",
                        background: "#f8fafc",
                        fontSize: 13,
                      }}
                    >
                      <div style={{ marginBottom: 6, color: "#475569" }}>
                        {savedNote.text}
                      </div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>
                        By {savedNote.by} • {savedNote.at}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new note */}
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Type your note here..."
                style={{
                  width: "100%",
                  minHeight: 60,
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  fontSize: 13,
                  fontFamily: "inherit",
                  resize: "vertical",
                  marginBottom: 10,
                }}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => {
                    if (note.trim()) {
                      setNotesList([
                        ...notesList,
                        {
                          text: note,
                          by: userName,
                          at: new Date().toLocaleString(),
                        },
                      ]);
                      setNote("");
                    }
                  }}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 8,
                    border: "none",
                    background: "#6366f1",
                    color: "#ffffff",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  Confirm
                </button>
                <button
                  onClick={() => setNote("")}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                    background: "#ffffff",
                    color: "#64748b",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// List of Anomalies
function AnomaliesList({
  boxes,
  onReject,
  onDelete,
  onEdit,
  editingBoxId,
  onSave,
}: {
  boxes: Box[];
  onReject: (anomalyIdx: number) => void;
  onDelete?: (anomalyIdx: number) => void;
  onEdit?: (anomalyIdx: number) => void;
  editingBoxId?: number | null;
  onSave?: (anomalyIdx: number) => void;
}) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {boxes.map((box) => (
        <AnomalyCard
          key={box.idx}
          box={box}
          onReject={() => onReject(box.idx)}
          onDelete={onDelete ? () => onDelete(box.idx) : undefined}
          onEdit={onEdit ? () => onEdit(box.idx) : undefined}
          isEditing={editingBoxId === box.idx}
          onSave={onSave ? () => onSave(box.idx) : undefined}
        />
      ))}
    </div>
  );
}

export default function InspectionDetailPage() {
  const navigate = useNavigate();
  const { transformerNo, inspectionNo } = useParams<{
    transformerNo: string;
    inspectionNo: string;
  }>();

  const [baseline, setBaseline] = useState<string | null>(null);
  const [thermal, setThermal] = useState<string | null>(null);
  const [, setBaselineMeta] = useState<ImgMeta>({});
  const [thermalMeta, setThermalMeta] = useState<ThermalMeta>({});
  const [removedAnomalies, setRemovedAnomalies] = useState<Box[]>([]);

  // Feedback log for AI model improvement
  const [feedbackLog, setFeedbackLog] = useState<
    Array<
      | {
          imageId: string;
          originalAIDetection: {
            box: [number, number, number, number];
            class: string;
            confidence: number;
          };
          userModification: {
            action: "modified" | "deleted";
            finalBox?: [number, number, number, number];
            finalClass?: string;
            modifiedAt: string;
            modifiedBy: string;
          };
        }
      | {
          imageId: string;
          userAddition: {
            box: number[];
            class: string;
            addedAt: string;
            addedBy: string;
          };
        }
    >
  >([]);

  // Add-anomaly state (user can draw a new box on thermal image)
  const [addDrawingActive, setAddDrawingActive] = useState<boolean>(false);
  // overlay preview handled inside AnnotationCanvas
  const firstClass =
    Object.keys(CLASS_COLORS).filter((k) => k !== "default")[0] ||
    "Loose Joint Faulty";
  const [newAnomalyClass, setNewAnomalyClass] = useState<string>(firstClass);
  const [newAnomalyCoords, setNewAnomalyCoords] = useState<
    [number, number, number, number] | null
  >(null);

  const [weatherBaseline, setWeatherBaseline] = useState<Weather>("SUNNY");
  const [weatherThermal, setWeatherThermal] = useState<Weather>("SUNNY");

  const [baselineFile, setBaselineFile] = useState<File | null>(null);
  const [thermalFile, setThermalFile] = useState<File | null>(null);

  const [submittingBaseline, setSubmittingBaseline] = useState(false);
  const [submittingThermal, setSubmittingThermal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [tempThreshold, setTempThreshold] = useState<string>("20%");
  const [rule2Enabled, setRule2Enabled] = useState<boolean>(true);
  const [rule3Enabled, setRule3Enabled] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [notesList, setNotesList] = useState<
    Array<{ text: string; by: string; at: string }>
  >([]);
  // Track whether anomaly detection has been run for this inspection's thermal image.
  // We only show the green "No detected errors." message when this is true and there are zero anomalies.
  const [detectionRan, setDetectionRan] = useState(false);

  const SCALE_STEP = 0.15;
  const [scaleB, setScaleB] = useState(2),
    [offXB, setOffXB] = useState(0),
    [offYB, setOffYB] = useState(0),
    [rotB, setRotB] = useState(0);
  const [scaleT, setScaleT] = useState(2),
    [offXT, setOffXT] = useState(0),
    [offYT, setOffYT] = useState(0),
    [rotT, setRotT] = useState(0);

  const onPointerDown =
    (which: "baseline" | "thermal") => (e: React.PointerEvent) => {
      if (e.button && e.button !== 0) return;
      const sx = e.clientX,
        sy = e.clientY;
      const orig =
        which === "baseline" ? { x: offXB, y: offYB } : { x: offXT, y: offYT };
      const move = (ev: PointerEvent) => {
        const dx = ev.clientX - sx,
          dy = ev.clientY - sy;
        if (which === "baseline") {
          setOffXB(Math.round(orig.x + dx));
          setOffYB(Math.round(orig.y + dy));
        } else {
          setOffXT(Math.round(orig.x + dx));
          setOffYT(Math.round(orig.y + dy));
        }
      };
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      e.preventDefault();
    };

  const resetView = (which: "baseline" | "thermal") => {
    if (which === "baseline") {
      setScaleB(1);
      setOffXB(0);
      setOffYB(0);
      setRotB(0);
    } else {
      setScaleT(1);
      setOffXT(0);
      setOffYT(0);
      setRotT(0);
    }
  };

  // State for box editing
  const [editingBoxId, setEditingBoxId] = useState<number | null>(null);
  const [newBoxCoords, setNewBoxCoords] = useState<
    [number, number, number, number] | null
  >(null);

  // Function to load feedback logs
  async function loadFeedbackLogs() {
    try {
      const response = await fetch(
        `http://localhost:8080/transformer-thermal-inspection/image-data/view?transformerNo=${transformerNo}&inspectionNo=${inspectionNo}&type=Thermal`
      );
      if (!response.ok) {
        console.error("Failed to load feedback logs");
        return;
      }
      const data = await response.json();
      if (data?.responseCode === "2000" && data.responseData?.logs) {
        // Parse the stringified logs if needed
        const logs =
          typeof data.responseData.logs === "string"
            ? JSON.parse(data.responseData.logs)
            : data.responseData.logs;

        // If logs is a single item, wrap it in an array
        setFeedbackLog(Array.isArray(logs) ? logs : [logs]);
      }
    } catch (error) {
      console.error("Error loading feedback logs:", error);
    }
  }

  useEffect(() => {
    async function load(kind: ImgType) {
      try {
        const r = await viewImage(transformerNo!, inspectionNo!, kind);
        if (r?.responseCode === "2000" && r.responseData) {
          const src = r.responseData.photoBase64
            ? `data:image/png;base64,${r.responseData.photoBase64}`
            : null;
          if (kind === "Baseline") {
            setBaseline(src);
            setBaselineMeta({
              dateTime: r.responseData.dateTime,
              weather: normalizeWeather(r.responseData.weather),
            });
          } else {
            setThermal(src);
            const anomalies: any[] =
              r.responseData?.anomaliesResponse?.anomalies || [];
            // If the backend returned an anomaliesResponse field (even an empty array),
            // consider that detection has been run for this stored image.
            if (typeof r.responseData?.anomaliesResponse !== "undefined") {
              setDetectionRan(true);
            }
            // clear any previous error state when load succeeds
            setErrorMsg(null);
            const boxes: Box[] = anomalies.map((a: any, i: number) => {
              const n = Array.isArray(a.box) ? a.box : [0, 0, 0, 0];
              const klass = typeof a.class === "string" ? a.class : "Unknown";
              const color = CLASS_COLORS[klass] || CLASS_COLORS.default;
              // Accept either 'confidence' or 'conf' for score
              const conf =
                typeof a.confidence === "number"
                  ? a.confidence
                  : typeof a.conf === "number"
                  ? a.conf
                  : 0;
              // If 'manual' is true, it's user-added; otherwise, AI-detected
              const aiDetected = a.manual === true ? false : true;
              // Optionally include user info for manual anomalies
              const rejectedBy = a.rejectedBy || undefined;
              const rejectedAt = a.rejectedAt || undefined;
              return {
                n: [n[0], n[1], n[2], n[3]],
                color,
                idx: i + 1,
                klass,
                conf,
                aiDetected,
                rejectedBy,
                rejectedAt,
              };
            });
            setThermalMeta({
              dateTime: r.responseData.dateTime,
              weather: normalizeWeather(r.responseData.weather),
              boxes,
            });

            // Update feedback logs if they exist in the response
            if (r.responseData.logs) {
              // Parse the stringified logs if needed
              const logs =
                typeof r.responseData.logs === "string"
                  ? JSON.parse(r.responseData.logs)
                  : r.responseData.logs;

              // If logs is a single item, wrap it in an array
              setFeedbackLog(Array.isArray(logs) ? logs : [logs]);
            }
          }
        }
      } catch {}
    }
    if (transformerNo && inspectionNo) {
      load("Baseline");
      load("Thermal");
      loadFeedbackLogs(); // Load feedback logs when component mounts or transformerNo/inspectionNo changes
    }
  }, [transformerNo, inspectionNo]);

  async function handleSubmit(which: ImgType) {
    setErrorMsg(null);
    if (!transformerNo || !inspectionNo) {
      setErrorMsg("Missing transformer/inspection id.");
      return;
    }
    const file = which === "Baseline" ? baselineFile : thermalFile;
    const weather = which === "Baseline" ? weatherBaseline : weatherThermal;
    if (!file) {
      setErrorMsg(`Please choose a ${which.toLowerCase()} image first.`);
      return;
    }
    which === "Baseline"
      ? setSubmittingBaseline(true)
      : setSubmittingThermal(true);
    try {
      const res = await uploadImage(
        transformerNo,
        inspectionNo,
        file,
        which,
        weather
      );
      if (res?.responseCode !== "2000")
        throw new Error(res?.responseDescription || "Upload failed");

      // If the upload endpoint returned the stored image + anomalies directly
      // (some backends return responseData immediately), use it. Otherwise
      // fall back to fetching the stored image via viewImage.
      const view = res?.responseData
        ? res
        : await viewImage(transformerNo, inspectionNo, which);
      if (!(view?.responseCode === "2000" && view.responseData))
        throw new Error(
          view?.responseDescription || "Cannot fetch stored image"
        );
      const src = view.responseData.photoBase64
        ? `data:image/png;base64,${view.responseData.photoBase64}`
        : null;
      if (which === "Baseline") {
        setBaseline(src);
        setBaselineMeta({
          dateTime: view.responseData.dateTime,
          weather: normalizeWeather(view.responseData.weather),
        });
        setBaselineFile(null);
      } else {
        setThermal(src);
        const anomalies: any[] =
          view.responseData?.anomaliesResponse?.anomalies || [];
        // clear any previous error state when upload & detection succeed
        setErrorMsg(null);
        // After an upload we attempted detection; mark that detection has been run (even if it returned zero anomalies)
        setDetectionRan(true);
        const boxes: Box[] = anomalies.map((a: any, i: number) => {
          const n = Array.isArray(a.box) ? a.box : [0, 0, 0, 0];
          const klass = typeof a.class === "string" ? a.class : "Unknown";
          const color = CLASS_COLORS[klass] || CLASS_COLORS.default;
          // Accept either 'confidence' or 'conf' for score
          const conf =
            typeof a.confidence === "number"
              ? a.confidence
              : typeof a.conf === "number"
              ? a.conf
              : 0;
          // If 'manual' is true, it's user-added; otherwise, AI-detected
          const aiDetected = a.manual === true ? false : true;
          // Optionally include user info for manual anomalies
          const rejectedBy = a.rejectedBy || undefined;
          const rejectedAt = a.rejectedAt || undefined;
          return {
            n: [n[0], n[1], n[2], n[3]],
            color,
            idx: i + 1,
            klass,
            conf,
            aiDetected,
            rejectedBy,
            rejectedAt,
          };
        });
        setThermalMeta({
          dateTime: view.responseData.dateTime,
          weather: normalizeWeather(view.responseData.weather),
          boxes,
        });
        setThermalFile(null);
      }
    } catch (e: any) {
      setErrorMsg(
        e?.response?.data?.responseDescription ||
          e?.message ||
          "Upload/view failed"
      );
    } finally {
      which === "Baseline"
        ? setSubmittingBaseline(false)
        : setSubmittingThermal(false);
    }
  }

  const ImagePanel = ({
    title,
    src,
    which,
    boxes,
  }: {
    title: string;
    src: string | null;
    which: "baseline" | "thermal";
    boxes?: Box[];
  }) => {
    const isB = which === "baseline";
    const scale = isB ? scaleB : scaleT;
    const offX = isB ? offXB : offXT;
    const offY = isB ? offYB : offYT;
    const rot = isB ? rotB : rotT;

    return (
      <div>
        <h4>{title}</h4>
        <div
          style={{
            position: "relative",
            width: "100%",
            height: 360,
            borderRadius: 8,
            background: "#f8fafc",
            border: "1px solid #e5e7eb",
            overflow: "hidden",
          }}
          onPointerDown={
            which === "thermal" && addDrawingActive
              ? undefined
              : onPointerDown(which)
          }
        >
          {src ? (
            <>
              <div
                style={{
                  position: "absolute",
                  left: `calc(50% + ${offX}px)`,
                  top: `calc(50% + ${offY}px)`,
                  transform: `translate(-50%, -50%) scale(${scale}) rotate(${rot}deg)`,
                  transformOrigin: "center center",
                }}
              >
                <img
                  src={src}
                  alt={title}
                  style={{
                    display: "block",
                    maxWidth: "100%",
                    maxHeight: 600,
                    objectFit: "contain",
                    pointerEvents: "none",
                  }}
                  id={which === "thermal" ? "thermal-image" : undefined}
                />
                {boxes && boxes.length > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      pointerEvents: "none",
                    }}
                  >
                    {boxes.map((b) => {
                      const [x1, y1, x2, y2] = b.n;
                      const left = `${Math.min(x1, x2) * 100}%`;
                      const top = `${Math.min(y1, y2) * 100}%`;
                      const width = `${Math.abs(x2 - x1) * 100}%`;
                      const height = `${Math.abs(y2 - y1) * 100}%`;
                      return (
                        <div
                          key={b.idx}
                          style={{
                            position: "absolute",
                            left,
                            top,
                            width,
                            height,
                            border: `0.5px solid ${b.color}`,
                            boxSizing: "border-box",
                            borderRadius: 0,
                          }}
                        >
                          {/* combined pill: confidence (dark) + index (color) - hide confidence for user-added */}
                          <div
                            style={{
                              position: "absolute",
                              left: "50%",
                              top: -12,
                              transform: "translateX(-50%)",
                              display: "flex",
                              alignItems: "center",
                              borderRadius: 999,
                              overflow: "hidden",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
                            }}
                          >
                            {b.aiDetected !== false && (
                              <div
                                style={{
                                  background: "rgba(0,0,0,0.6)",
                                  color: "#fff",
                                  padding: "1px 6px",
                                  fontSize: 5,
                                  lineHeight: 1,
                                }}
                              >
                                {(b.conf * 100).toFixed(0)}%
                              </div>
                            )}
                            <div
                              style={{
                                background: b.color,
                                color: "#fff",
                                padding: "1px 6px",
                                fontSize: 5,
                                lineHeight: 1,
                                fontWeight: 700,
                              }}
                            >
                              #{b.idx}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "grid",
                placeItems: "center",
                color: "#64748b",
              }}
            >
              No {which} image uploaded yet
            </div>
          )}
          {/* Add-mode drawing overlay for thermal image */}
          {which === "thermal" && addDrawingActive && (
            <AnnotationCanvas
              active={addDrawingActive}
              targetImgId="thermal-image"
              drawShape="bbox"
              selectedClass={newAnomalyClass}
              stroke={CLASS_COLORS[newAnomalyClass] || "#63666f"}
              onAnnotationCreate={(coords) => {
                if (editingBoxId !== null) {
                  setNewBoxCoords(coords);
                } else {
                  setNewAnomalyCoords(coords);
                }
              }}
            />
          )}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button
            className="btn"
            onClick={() =>
              isB
                ? setScaleB((s) => Math.min(8, s + SCALE_STEP))
                : setScaleT((s) => Math.min(8, s + SCALE_STEP))
            }
          >
            Zoom in
          </button>
          <button
            className="btn"
            onClick={() =>
              isB
                ? setScaleB((s) => Math.max(0.2, s - SCALE_STEP))
                : setScaleT((s) => Math.max(0.2, s - SCALE_STEP))
            }
          >
            Zoom out
          </button>
          <button
            className="btn"
            onClick={() =>
              isB ? setRotB((r) => r - 90) : setRotT((r) => r - 90)
            }
          >
            Rotate ⟲
          </button>
          <button
            className="btn"
            onClick={() =>
              isB ? setRotB((r) => r + 90) : setRotT((r) => r + 90)
            }
          >
            Rotate ⟳
          </button>
          <button className="btn" onClick={() => resetView(which)}>
            Reset
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="container">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <button className="btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h2 style={{ margin: 0 }}>Inspection: {inspectionNo}</h2>
        <div style={{ marginLeft: "auto", opacity: 0.75 }}>
          Transformer: <strong>{transformerNo}</strong>
        </div>
      </div>

      {errorMsg && (
        <div
          style={{
            padding: 12,
            background: "#FEF2F2",
            color: "#991B1B",
            border: "1px solid #FCA5A5",
            borderRadius: 8,
            marginBottom: 12,
          }}
        >
          {errorMsg}
        </div>
      )}

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>Upload Images</h3>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          <div style={{ display: "grid", gap: 8, minWidth: 280 }}>
            <label>
              <strong>Baseline</strong>
            </label>
            <label>Weather</label>
            <select
              className="input"
              value={weatherBaseline}
              onChange={(e) => setWeatherBaseline(e.target.value as Weather)}
            >
              <option value="SUNNY">Sunny</option>
              <option value="CLOUDY">Cloudy</option>
              <option value="RAINY">Rainy</option>
            </select>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setBaselineFile(f);
              }}
            />
            {baselineFile && (
              <div style={{ fontSize: 12, opacity: 0.8 }}>
                Selected: <em>{baselineFile.name}</em>
              </div>
            )}
            <button
              className="btn primary"
              onClick={() => handleSubmit("Baseline")}
              disabled={submittingBaseline}
            >
              {submittingBaseline ? "Uploading…" : "Submit Baseline"}
            </button>
          </div>
          <div style={{ display: "grid", gap: 8, minWidth: 280 }}>
            <label>
              <strong>Maintenance</strong>
            </label>
            <label>Weather</label>
            <select
              className="input"
              value={weatherThermal}
              onChange={(e) => setWeatherThermal(e.target.value as Weather)}
            >
              <option value="SUNNY">Sunny</option>
              <option value="CLOUDY">Cloudy</option>
              <option value="RAINY">Rainy</option>
            </select>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setThermalFile(f);
              }}
            />
            {thermalFile && (
              <div style={{ fontSize: 12, opacity: 0.8 }}>
                Selected: <em>{thermalFile.name}</em>
              </div>
            )}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button
                className="btn primary"
                onClick={() => handleSubmit("Thermal")}
                disabled={submittingThermal}
              >
                {submittingThermal
                  ? "Uploading & Detecting"
                  : "Submit Maintenance"}
              </button>
              <button
                className="btn"
                onClick={() => setShowRulesModal(true)}
                aria-haspopup="dialog"
              >
                Rules
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          maxWidth: "1800px",
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        <ImagePanel title="Baseline Image" src={baseline} which="baseline" />
        <ImagePanel
          title="Maintenance Image"
          src={thermal}
          which="thermal"
          boxes={thermalMeta.boxes?.filter((b) => b.idx !== editingBoxId)}
        />
      </div>

      {/* Fault Type Legend - Above the Detected Anomalies card */}
      {thermalMeta.boxes && thermalMeta.boxes.length > 0 && (
        <div
          style={{
            marginTop: 16,
            padding: "20px 24px",
            background: "#ffffff",
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#1e293b",
              marginBottom: 14,
            }}
          >
            Fault Type Legend
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {Object.entries(CLASS_COLORS)
              .filter(([k]) => k !== "default")
              .map(([name, color]) => (
                <div
                  key={name}
                  style={{ display: "flex", alignItems: "center", gap: 10 }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 4,
                      background: color,
                      flexShrink: 0,
                    }}
                  ></div>
                  <span style={{ color: "#475569", fontSize: 14 }}>{name}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <h3 style={{ margin: 0 }}>Detected Anomalies</h3>
          {feedbackLog.length > 0 && (
            <button
              onClick={() => {
                const feedbackData = {
                  exportedAt: new Date().toLocaleString("en-US", {
                    timeZone: "Asia/Colombo",
                  }),
                  imageData: {
                    transformerNo,
                    inspectionNo,
                  },
                  feedback: feedbackLog.map((log) => {
                    // For each log entry, make sure it's properly structured
                    if (typeof log === "string") {
                      return JSON.parse(log);
                    }
                    return log;
                  }),
                };
                // Format the JSON with proper spacing
                const formattedJson = JSON.stringify(feedbackData, null, 2);
                const blob = new Blob([formattedJson], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `feedback_log_${transformerNo}_${inspectionNo}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              style={{
                padding: "7px 14px",
                borderRadius: 8,
                border: "none",
                background: "#6366f1",
                color: "#ffffff",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              📥 Export Feedback Log
            </button>
          )}
        </div>

        {thermalMeta.boxes && thermalMeta.boxes.length > 0 ? (
          <AnomaliesList
            boxes={thermalMeta.boxes}
            editingBoxId={editingBoxId}
            onEdit={(anomalyIdx) => {
              // Start editing mode and hide the current box
              setEditingBoxId(anomalyIdx);
              setAddDrawingActive(true);
            }}
            onSave={async (anomalyIdx) => {
              if (!newBoxCoords) {
                alert("Please draw a new bounding box first");
                return;
              }

              const editedBox = thermalMeta.boxes?.find(
                (b) => b.idx === anomalyIdx
              );
              if (!editedBox) return;

              // Create log data for AI-detected anomalies being modified
              let logData = null;
              if (editedBox.aiDetected) {
                logData = {
                  imageId: `${transformerNo}_${inspectionNo}`,
                  originalAIDetection: {
                    box: editedBox.n,
                    class: editedBox.klass,
                    confidence: editedBox.conf,
                  },
                  userModification: {
                    action: "modified" as const,
                    finalBox: newBoxCoords,
                    finalClass: editedBox.klass,
                    modifiedAt: new Date().toLocaleString("en-US", {
                      timeZone: "Asia/Colombo",
                    }),
                    modifiedBy: localStorage.getItem("userName") || "User",
                  },
                };
              }

              // Update the box with new coordinates and metadata
              const updatedBoxes =
                thermalMeta.boxes?.map((b) =>
                  b.idx === anomalyIdx
                    ? {
                        ...b,
                        n: newBoxCoords,
                        aiDetected: false, // Changed to manual since user edited
                        userAdded: b.aiDetected ? false : b.userAdded, // Keep userAdded true if it was user-added, false if it was AI-detected
                      }
                    : b
                ) || [];

              // Update the backend
              try {
                const allAnomalies = updatedBoxes.map((b) => ({
                  box: b.n.map((v) => parseFloat(v.toFixed(6))),
                  class: b.klass,
                  manual: b.idx === anomalyIdx ? true : !b.aiDetected, // Set manual=true for edited box
                  user:
                    b.idx === anomalyIdx
                      ? "User"
                      : !b.aiDetected
                      ? b.rejectedBy || "User"
                      : undefined,
                  confidence: b.idx === anomalyIdx ? null : b.conf, // Set confidence=null for edited box
                }));

                const url = `http://localhost:8080/transformer-thermal-inspection/image-data/update?transformerNo=${transformerNo}&inspectionNo=${inspectionNo}`;
                const formData = new FormData();
                formData.append("type", "Thermal");
                formData.append("detectionJson", JSON.stringify(allAnomalies));
                if (logData) {
                  formData.append("logs", JSON.stringify(logData));
                }

                const res = await fetch(url, {
                  method: "PUT",
                  body: formData,
                });

                if (!res.ok) {
                  const errorText = await res.text();
                  console.error("Failed to update anomaly:", errorText);
                  alert("Failed to update anomaly");
                  return;
                }

                // Update local state
                setThermalMeta((prev) => ({
                  ...prev,
                  boxes: updatedBoxes,
                }));

                // Only update feedback log if it was an AI-detected anomaly
                if (logData) {
                  setFeedbackLog((prev) => [...prev, logData]);
                }

                // Reset editing state
                setEditingBoxId(null);
                setNewBoxCoords(null);
                setAddDrawingActive(false);
              } catch (err) {
                console.error(err);
                alert("Error updating anomaly");
              }
            }}
            onReject={(anomalyIdx) => {
              const userName = localStorage.getItem("userName") || "User";
              const rejectedBox = thermalMeta.boxes?.find(
                (b) => b.idx === anomalyIdx
              );
              if (rejectedBox) {
                const updatedBox = {
                  ...rejectedBox,
                  rejectedBy: userName,
                  rejectedAt: new Date().toLocaleString(),
                };
                setRemovedAnomalies((prev) => [...prev, updatedBox]);
                setThermalMeta((prev) => ({
                  ...prev,
                  boxes: prev.boxes?.filter((b) => b.idx !== anomalyIdx),
                }));
              }
            }}
            onDelete={async (anomalyIdx) => {
              const boxToDelete = thermalMeta.boxes?.find(
                (b) => b.idx === anomalyIdx
              );
              if (!boxToDelete) return;

              // Remove from main list immediately (optimistic update)
              setThermalMeta((prev) => ({
                ...prev,
                boxes: prev.boxes?.filter((b) => b.idx !== anomalyIdx),
              }));

              // Create log data for AI-detected anomalies
              let logData = null;
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
                    modifiedBy: localStorage.getItem("userName") || "User",
                  },
                };
              }

              // Prepare remaining anomalies for backend update
              const remainingAnomalies =
                thermalMeta.boxes
                  ?.filter((b) => b.idx !== anomalyIdx)
                  .map((b) => ({
                    box: b.n.map((v) => parseFloat(v.toFixed(6))),
                    class: b.klass,
                    manual: !b.aiDetected,
                    user: !b.aiDetected
                      ? b.rejectedBy ||
                        localStorage.getItem("userName") ||
                        "User"
                      : undefined,
                    confidence: b.conf,
                  })) || [];

              try {
                const url = `http://localhost:8080/transformer-thermal-inspection/image-data/update?transformerNo=${transformerNo}&inspectionNo=${inspectionNo}`;
                const formData = new FormData();
                formData.append("type", "Thermal");
                formData.append(
                  "detectionJson",
                  JSON.stringify(remainingAnomalies)
                );
                if (logData) {
                  formData.append("logs", JSON.stringify(logData));
                }

                const res = await fetch(url, {
                  method: "PUT",
                  body: formData,
                });

                if (!res.ok) {
                  const errorText = await res.text();
                  console.error("Failed to delete anomaly:", errorText);
                  alert("Failed to delete anomaly");
                  // Revert the UI change if backend update fails
                  setThermalMeta((prev) => ({
                    ...prev,
                    boxes: [...(prev.boxes || []), boxToDelete],
                  }));
                  return;
                }

                // Only update feedback log if it was an AI-detected anomaly
                if (logData) {
                  setFeedbackLog((prev) => [...prev, logData]);
                }
              } catch (err) {
                console.error(err);
                alert("Error deleting anomaly");
                // Revert the UI change if backend update fails
                setThermalMeta((prev) => ({
                  ...prev,
                  boxes: [...(prev.boxes || []), boxToDelete],
                }));
              }
            }}
          />
        ) : // Only show "No detected errors" after detection has actually run and returned no anomalies.
        detectionRan ? (
          <div
            style={{
              padding: 12,
              background: "#ECFDF5",
              color: "#065F46",
              border: "1px solid #A7F3D0",
              borderRadius: 8,
            }}
          >
            No detected errors.
          </div>
        ) : (
          // Detection has not run yet for this thermal image; show a subtle placeholder instead of the green message.
          <div style={{ padding: 12, color: "#64748b" }}>
            No detection run yet for this inspection.
          </div>
        )}
      </div>

      {/* Add New Anomaly section */}
      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Add New Anomaly</h3>
        {!addDrawingActive ? (
          <button
            onClick={() => {
              setAddDrawingActive(true);
              setNewAnomalyCoords(null);
            }}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              background: "#f8fafc",
              color: "#111827",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Start Drawing
          </button>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <label style={{ fontWeight: 600 }}>Error type:</label>
              <select
                value={newAnomalyClass}
                onChange={(e) => setNewAnomalyClass(e.target.value)}
                style={{
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                }}
              >
                {Object.keys(CLASS_COLORS)
                  .filter((k) => k !== "default")
                  .map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
              </select>
              <span style={{ color: "#64748b", fontSize: 13 }}>
                {newAnomalyCoords
                  ? `(${newAnomalyCoords.map((v) => v.toFixed(3)).join(", ")})`
                  : "Draw a rectangle on the thermal image"}
              </span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                disabled={!newAnomalyCoords}
                onClick={async () => {
                  if (!newAnomalyCoords) return;

                  const userName = localStorage.getItem("userName") || "User";
                  const newAnomalyData = {
                    box: newAnomalyCoords.map((v) => parseFloat(v.toFixed(6))),
                    class: newAnomalyClass,
                    manual: true,
                    user: userName,
                  };

                  // Create log data for user-added anomaly
                  const logData = {
                    imageId: `${transformerNo}_${inspectionNo}`,
                    userAddition: {
                      box: newAnomalyCoords.map((v) =>
                        parseFloat(v.toFixed(6))
                      ),
                      class: newAnomalyClass,
                      addedAt: new Date().toLocaleString("en-US", {
                        timeZone: "Asia/Colombo",
                      }),
                      addedBy: userName,
                    },
                  };

                  // Gather all current anomalies (AI + user-added, not rejected)
                  const allAnomalies = [
                    ...(thermalMeta.boxes ?? []).map((b) => ({
                      box: b.n.map((v) => parseFloat(v.toFixed(6))),
                      class: b.klass,
                      manual: b.aiDetected === false,
                      user:
                        b.aiDetected === false
                          ? b.rejectedBy || userName
                          : undefined,
                      confidence: b.conf,
                    })),
                    newAnomalyData,
                  ];

                  // Update local state (UI)
                  const nextIdx =
                    (thermalMeta.boxes?.reduce(
                      (m, b) => Math.max(m, b.idx),
                      0
                    ) ?? 0) + 1;
                  const color =
                    CLASS_COLORS[newAnomalyClass] || CLASS_COLORS.default;
                  const newBox: Box = {
                    idx: nextIdx,
                    n: newAnomalyCoords,
                    klass: newAnomalyClass,
                    color,
                    conf: 0,
                    aiDetected: false,
                    userAdded: true, // This is a user-added anomaly
                  };

                  setThermalMeta((prev) => ({
                    ...prev,
                    boxes: [...(prev.boxes ?? []), newBox],
                  }));

                  // Reset drawing mode
                  setAddDrawingActive(false);
                  setNewAnomalyCoords(null);

                  try {
                    const url = `http://localhost:8080/transformer-thermal-inspection/image-data/update?transformerNo=${transformerNo}&inspectionNo=${inspectionNo}`;
                    const formData = new FormData();
                    formData.append("type", "Thermal");
                    formData.append(
                      "detectionJson",
                      JSON.stringify(allAnomalies)
                    );
                    formData.append("logs", JSON.stringify(logData));

                    const res = await fetch(url, {
                      method: "PUT",
                      body: formData,
                    });

                    if (!res.ok) {
                      const errorText = await res.text();
                      console.error("Failed to save anomaly:", errorText);
                      alert("Failed to save anomaly");
                    } else {
                      console.log("Anomalies updated successfully");
                      // Add the log to the feedback log state
                      setFeedbackLog((prev) => [...prev, logData]);
                    }
                  } catch (err) {
                    console.error(err);
                    alert("Error saving anomaly");
                  }
                }}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "none",
                  background: "#10b981",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: newAnomalyCoords ? "pointer" : "not-allowed",
                }}
              >
                Save
              </button>

              <button
                onClick={() => {
                  setAddDrawingActive(false);
                  setNewAnomalyCoords(null);
                }}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                  color: "#64748b",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
            <div style={{ color: "#64748b", fontSize: 13 }}>
              Tip: With drawing active, pan/zoom is disabled on the thermal
              image. Click and drag to draw the box.
            </div>
          </div>
        )}
      </div>

      {/* Removed Anomalies section */}
      {removedAnomalies.length > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3 style={{ marginTop: 0 }}>Removed Anomalies</h3>
          <div style={{ display: "grid", gap: 8 }}>
            {removedAnomalies.map((box) => (
              <div
                key={box.idx}
                style={{
                  border: `2px solid #e5e7eb`,
                  borderRadius: 12,
                  padding: "14px 20px",
                  background: "#f9fafb",
                  opacity: 0.85,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: box.color,
                      display: "grid",
                      placeItems: "center",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 14,
                      flexShrink: 0,
                    }}
                  >
                    {box.idx}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}
                    >
                      {box.klass}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 12,
                        color: "#64748b",
                      }}
                    >
                      <span>
                        {box.aiDetected === false
                          ? "Not AI Detected"
                          : "AI Detection"}
                      </span>
                      {box.aiDetected === false ? null : <span>•</span>}
                      {box.aiDetected === false ? null : (
                        <span>{(box.conf * 100).toFixed(0)}% confidence</span>
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "3px 10px",
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: 600,
                      background: "#fee2e2",
                      color: "#991b1b",
                    }}
                  >
                    Rejected
                  </div>
                </div>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 8 }}>
                  <div>
                    BBox: ({box.n[0].toFixed(3)}, {box.n[1].toFixed(3)}) — (
                    {box.n[2].toFixed(3)}, {box.n[3].toFixed(3)})
                  </div>
                  <div style={{ marginTop: 4 }}>
                    Rejected by: <strong>{box.rejectedBy}</strong>
                  </div>
                  <div style={{ marginTop: 2 }}>
                    Rejected at: <strong>{box.rejectedAt}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rules modal (client-side only) */}
      {showRulesModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            display: "grid",
            placeItems: "center",
            background: "rgba(0,0,0,0.3)",
            zIndex: 50,
          }}
        >
          <div
            style={{
              width: 900,
              maxWidth: "95%",
              background: "#fff",
              borderRadius: 14,
              padding: 28,
              boxShadow: "0 20px 40px rgba(2,6,23,0.12)",
              position: "relative",
            }}
          >
            {/* close button top-right */}
            <button
              onClick={() => setShowRulesModal(false)}
              aria-label="Close"
              style={{
                position: "absolute",
                right: 20,
                top: 18,
                width: 48,
                height: 48,
                borderRadius: 12,
                border: "none",
                background: "#f3f4f6",
                display: "grid",
                placeItems: "center",
                boxShadow: "0 6px 18px rgba(2,6,23,0.06)",
                cursor: "pointer",
              }}
            >
              ×
            </button>

            <h1 style={{ margin: 0, fontSize: 36, fontWeight: 700 }}>
              Error Ruleset
            </h1>
            <div
              style={{
                marginTop: 20,
                display: "grid",
                gridTemplateColumns: "1fr 220px",
                gap: 24,
                alignItems: "start",
              }}
            >
              <div>
                <h2 style={{ margin: "0 0 8px 0", fontSize: 24 }}>
                  Temperature Dereference
                </h2>
                <div
                  style={{ color: "#6b7280", fontSize: 16, marginBottom: 18 }}
                >
                  Temperature deference between baseline and maintenance images.
                </div>

                <div style={{ marginTop: 8, display: "grid", gap: 18 }}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 18 }}>Rule 2</div>
                    <div style={{ marginLeft: "auto" }}>
                      <div
                        onClick={() => setRule2Enabled((r) => !r)}
                        role="switch"
                        aria-checked={rule2Enabled}
                        style={{
                          width: 46,
                          height: 26,
                          borderRadius: 20,
                          background: rule2Enabled ? "#5b21b6" : "#e6e7ea",
                          position: "relative",
                          cursor: "pointer",
                        }}
                      >
                        <div
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 12,
                            background: "#fff",
                            position: "absolute",
                            top: 3,
                            left: rule2Enabled ? 22 : 4,
                            transition: "left 120ms linear",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div style={{ color: "#9CA3AF" }}>Rule Description</div>

                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 18 }}>Rule 3</div>
                    <div style={{ marginLeft: "auto" }}>
                      <div
                        onClick={() => setRule3Enabled((r) => !r)}
                        role="switch"
                        aria-checked={rule3Enabled}
                        style={{
                          width: 46,
                          height: 26,
                          borderRadius: 20,
                          background: rule3Enabled ? "#5b21b6" : "#e6e7ea",
                          position: "relative",
                          cursor: "pointer",
                        }}
                      >
                        <div
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 12,
                            background: "#fff",
                            position: "absolute",
                            top: 3,
                            left: rule3Enabled ? 22 : 4,
                            transition: "left 120ms linear",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div style={{ color: "#9CA3AF" }}>Rule Description</div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 18,
                }}
              >
                <div
                  style={{
                    width: "100%",
                    background: "#fff",
                    borderRadius: 16,
                    padding: 18,
                    boxShadow: "0 6px 18px rgba(2,6,23,0.04)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <select
                    value={tempThreshold}
                    onChange={(e) => setTempThreshold(e.target.value)}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 12,
                      border: "1px solid #eef2f7",
                      fontSize: 16,
                    }}
                  >
                    <option>10%</option>
                    <option>15%</option>
                    <option>20%</option>
                    <option>25%</option>
                  </select>
                </div>

                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                    gap: 12,
                  }}
                >
                  <button
                    className="btn primary"
                    onClick={() => setShowRulesModal(false)}
                    style={{
                      padding: "10px 18px",
                      borderRadius: 12,
                      boxShadow: "0 8px 24px rgba(99,102,241,0.18)",
                    }}
                  >
                    Save
                  </button>
                  <button
                    className="btn"
                    onClick={() => setShowRulesModal(false)}
                    style={{
                      padding: "10px 18px",
                      borderRadius: 12,
                      background: "#f8fafc",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Notes</h3>

        {/* List of saved notes */}
        {notesList.length > 0 && (
          <div style={{ marginBottom: 16, display: "grid", gap: 8 }}>
            {notesList.map((n, i) => (
              <div
                key={i}
                style={{
                  padding: "12px 16px",
                  background: "#f8fafc",
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                }}
              >
                <div
                  style={{ fontSize: 14, color: "#1e293b", marginBottom: 6 }}
                >
                  {n.text}
                </div>
                <div style={{ fontSize: 12, color: "#64748b" }}>
                  <span>
                    By: <strong>{n.by}</strong>
                  </span>
                  <span style={{ marginLeft: 12 }}>
                    At: <strong>{n.at}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add new note */}
        <textarea
          className="input"
          placeholder="Type here to add notes…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
        />
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <button
            className="btn primary"
            onClick={() => {
              if (notes.trim()) {
                const userName = localStorage.getItem("userName") || "User";
                setNotesList((prev) => [
                  ...prev,
                  {
                    text: notes,
                    by: userName,
                    at: new Date().toLocaleString(),
                  },
                ]);
                setNotes("");
              }
            }}
          >
            Confirm
          </button>
          <button className="btn" onClick={() => setNotes("")}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
