import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { uploadImage, viewImage, type ImgType, type Weather } from "../api/imageDataApi";
import { loadFeedbackLogs as loadFeedbackLogsAPI } from "../api/detectionApi";
import { AnomaliesList } from "../components/inspection/AnomaliesList";
import { ImagePanel } from "../components/inspection/ImagePanel";
import { RulesModal } from "../components/inspection/RulesModalComponent";
import { useImageTransform } from "../hooks/useImageTransform";
import {
  deleteAnomaly,
  editAnomaly,
  addAnomaly,
} from "../services/anomalyService";
import { normalizeWeather, mapAnomaliestoBoxes } from "../utils/inspectionHelpers";
import { CLASS_COLORS } from "../constants/inspection.constants";
import type { Box, ThermalMeta, AnomalyResponse, FeedbackLog } from "../types/inspection.types";

export default function InspectionDetailPage() {
  const navigate = useNavigate();
  const { transformerNo, inspectionNo } = useParams<{
    transformerNo: string;
    inspectionNo: string;
  }>();

  // Images
  const [baseline, setBaseline] = useState<string | null>(null);
  const [thermal, setThermal] = useState<string | null>(null);
  const [thermalMeta, setThermalMeta] = useState<ThermalMeta>({});
  const [removedAnomalies, setRemovedAnomalies] = useState<Box[]>([]);

  // UI State
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [detectionRan, setDetectionRan] = useState(false);
  const [feedbackLog, setFeedbackLog] = useState<FeedbackLog[]>([]);

  // File uploads
  const [baselineFile, setBaselineFile] = useState<File | null>(null);
  const [thermalFile, setThermalFile] = useState<File | null>(null);
  const [submittingBaseline, setSubmittingBaseline] = useState(false);
  const [submittingThermal, setSubmittingThermal] = useState(false);

  // Weather
  const [weatherBaseline, setWeatherBaseline] = useState<Weather>("SUNNY");
  const [weatherThermal, setWeatherThermal] = useState<Weather>("SUNNY");

  // Rules Modal
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [tempThreshold, setTempThreshold] = useState<string>("20%");
  const [rule2Enabled, setRule2Enabled] = useState<boolean>(true);
  const [rule3Enabled, setRule3Enabled] = useState<boolean>(true);

  // Drawing & Editing
  const [addDrawingActive, setAddDrawingActive] = useState<boolean>(false);
  const [editingBoxId, setEditingBoxId] = useState<number | null>(null);
  const [newAnomalyCoords, setNewAnomalyCoords] = useState<
    [number, number, number, number] | null
  >(null);
  const [newBoxCoords, setNewBoxCoords] = useState<
    [number, number, number, number] | null
  >(null);
  const firstClass = Object.keys(CLASS_COLORS).filter(
    (k) => k !== "default"
  )[0] || "Loose Joint Faulty";
  const [newAnomalyClass, setNewAnomalyClass] = useState<string>(firstClass);

  // Image transforms
  const baseline_transform = useImageTransform(2);
  const thermal_transform = useImageTransform(2);

  // Notes
  const [notes, setNotes] = useState("");
  const [notesList, setNotesList] = useState<
    Array<{ text: string; by: string; at: string }>
  >([]);

  // Load images
  // Load feedback logs
  const loadFeedbackLogs = useCallback(async () => {
    try {
      const response = await loadFeedbackLogsAPI(transformerNo!, inspectionNo!);
      if (response?.responseCode === "2000" && response.responseData?.logs) {
        const logs =
          typeof response.responseData.logs === "string"
            ? JSON.parse(response.responseData.logs)
            : response.responseData.logs;
        setFeedbackLog(Array.isArray(logs) ? logs : [logs]);
      }
    } catch (error) {
      console.error("Error loading feedback logs:", error);
    }
  }, [transformerNo, inspectionNo]);

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
          } else {
            setThermal(src);
            const anomalies: AnomalyResponse[] =
              r.responseData?.anomaliesResponse?.anomalies || [];

            if (typeof r.responseData?.anomaliesResponse !== "undefined") {
              setDetectionRan(true);
            }
            setErrorMsg(null);

            const boxes = mapAnomaliestoBoxes(anomalies);
            setThermalMeta({
              dateTime: r.responseData.dateTime,
              weather: normalizeWeather(r.responseData.weather),
              boxes,
            });

            if (r.responseData.logs) {
              const logs =
                typeof r.responseData.logs === "string"
                  ? JSON.parse(r.responseData.logs)
                  : r.responseData.logs;
              setFeedbackLog(Array.isArray(logs) ? logs : [logs]);
            }
          }
        }
      } catch (error) {
        console.error("Error loading image:", error);
      }
    }
    if (transformerNo && inspectionNo) {
      void load("Baseline");
      void load("Thermal");
      void loadFeedbackLogs();
    }
  }, [transformerNo, inspectionNo, loadFeedbackLogs]);

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
    if (which === "Baseline") {
      setSubmittingBaseline(true);
    } else {
      setSubmittingThermal(true);
    }
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
        setBaselineFile(null);
      } else {
        setThermal(src);
        const anomalies: AnomalyResponse[] =
          view.responseData?.anomaliesResponse?.anomalies || [];
        setErrorMsg(null);
        setDetectionRan(true);

        const boxes = mapAnomaliestoBoxes(anomalies);
        setThermalMeta({
          dateTime: view.responseData.dateTime,
          weather: normalizeWeather(view.responseData.weather),
          boxes,
        });
        setThermalFile(null);
      }
    } catch (e) {
      const error = e as {
        response?: { data?: { responseDescription?: string } };
        message?: string;
      };
      setErrorMsg(
        error?.response?.data?.responseDescription ||
          error?.message ||
          "Upload/view failed"
      );
    } finally {
      if (which === "Baseline") {
        setSubmittingBaseline(false);
      } else {
        setSubmittingThermal(false);
      }
    }
  }

  return (
    <div className="container">
      {/* Header */}
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

      {/* Error Message */}
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

      {/* Upload Section */}
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
                {submittingThermal ? "Uploading & Detecting" : "Submit Maintenance"}
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

      {/* Image Panels */}
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
        <ImagePanel
          title="Baseline Image"
          src={baseline}
          which="baseline"
          scale={baseline_transform.scale}
          offX={baseline_transform.offX}
          offY={baseline_transform.offY}
          rot={baseline_transform.rot}
          onScaleChange={baseline_transform.setScale}
          onOffXChange={baseline_transform.setOffX}
          onOffYChange={baseline_transform.setOffY}
          onRotChange={baseline_transform.setRot}
          onResetView={baseline_transform.reset}
        />
        <ImagePanel
          title="Maintenance Image"
          src={thermal}
          which="thermal"
          boxes={thermalMeta.boxes?.filter((b) => b.idx !== editingBoxId)}
          scale={thermal_transform.scale}
          offX={thermal_transform.offX}
          offY={thermal_transform.offY}
          rot={thermal_transform.rot}
          onScaleChange={thermal_transform.setScale}
          onOffXChange={thermal_transform.setOffX}
          onOffYChange={thermal_transform.setOffY}
          onRotChange={thermal_transform.setRot}
          onResetView={thermal_transform.reset}
          addDrawingActive={addDrawingActive}
          newAnomalyClass={newAnomalyClass}
          onAnnotationCreate={(coords) => {
            if (editingBoxId !== null) {
              setNewBoxCoords(coords);
            } else {
              setNewAnomalyCoords(coords);
            }
          }}
        />
      </div>

      {/* Fault Type Legend */}
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
                  <span style={{ color: "#475569", fontSize: 14 }}>
                    {name}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Detected Anomalies */}
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
                  feedback: feedbackLog,
                };
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

              try {
                const logData = await editAnomaly(
                  transformerNo!,
                  inspectionNo!,
                  editedBox,
                  newBoxCoords,
                  thermalMeta.boxes || []
                );

                const updatedBoxes =
                  thermalMeta.boxes?.map((b) =>
                    b.idx === anomalyIdx
                      ? {
                          ...b,
                          n: newBoxCoords,
                          aiDetected: false,
                          userAdded: b.aiDetected ? false : b.userAdded,
                        }
                      : b
                  ) || [];

                setThermalMeta((prev) => ({
                  ...prev,
                  boxes: updatedBoxes,
                }));

                if (logData) {
                  setFeedbackLog((prev) => [...prev, logData]);
                }

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

              setThermalMeta((prev) => ({
                ...prev,
                boxes: prev.boxes?.filter((b) => b.idx !== anomalyIdx),
              }));

              try {
                const logData = await deleteAnomaly(
                  transformerNo!,
                  inspectionNo!,
                  boxToDelete,
                  thermalMeta.boxes?.filter((b) => b.idx !== anomalyIdx) || []
                );

                if (logData) {
                  setFeedbackLog((prev) => [...prev, logData]);
                }
              } catch (err) {
                console.error(err);
                alert("Error deleting anomaly");
                setThermalMeta((prev) => ({
                  ...prev,
                  boxes: [...(prev.boxes || []), boxToDelete],
                }));
              }
            }}
          />
        ) : detectionRan ? (
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
          <div style={{ padding: 12, color: "#64748b" }}>
            No detection run yet for this inspection.
          </div>
        )}
      </div>

      {/* Add New Anomaly */}
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
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
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

                  try {
                    const logData = await addAnomaly(
                      transformerNo!,
                      inspectionNo!,
                      newAnomalyCoords,
                      newAnomalyClass,
                      thermalMeta.boxes || []
                    );

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
                      userAdded: true,
                    };

                    setThermalMeta((prev) => ({
                      ...prev,
                      boxes: [...(prev.boxes ?? []), newBox],
                    }));

                    setAddDrawingActive(false);
                    setNewAnomalyCoords(null);
                    setFeedbackLog((prev) => [...prev, logData]);
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

      {/* Removed Anomalies */}
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
                      style={{
                        fontWeight: 600,
                        fontSize: 14,
                        marginBottom: 2,
                      }}
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

      {/* Rules Modal */}
      <RulesModal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
        tempThreshold={tempThreshold}
        onTempThresholdChange={setTempThreshold}
        rule2Enabled={rule2Enabled}
        onRule2Change={setRule2Enabled}
        rule3Enabled={rule3Enabled}
        onRule3Change={setRule3Enabled}
      />

      {/* Notes Section */}
      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Notes</h3>

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
