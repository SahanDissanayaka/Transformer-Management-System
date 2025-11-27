import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import {
  uploadImage,
  viewImage,
  type ImgType,
  type Weather,
} from "../api/imageDataApi";
import { maintenanceApi } from "../api/maintenanceApi";
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
import {
  normalizeWeather,
  mapAnomaliestoBoxes,
} from "../utils/inspectionHelpers";
import { CLASS_COLORS } from "../constants/inspection.constants";
import type {
  Box,
  ThermalMeta,
  AnomalyResponse,
  FeedbackLog,
} from "../types/inspection.types";

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
  const firstClass =
    Object.keys(CLASS_COLORS).filter((k) => k !== "default")[0] ||
    "Loose Joint Faulty";
  const [newAnomalyClass, setNewAnomalyClass] = useState<string>(firstClass);

  // Image transforms
  const baseline_transform = useImageTransform(2);
  const thermal_transform = useImageTransform(2);

  // Notes
  const [notes, setNotes] = useState("");
  const [notesList, setNotesList] = useState<
    Array<{ text: string; by: string; at: string }>
  >([]);

  // Engineer inputs
  const [engineerInputs, setEngineerInputs] = useState({
    inspectorName: "",
    engineerStatus: "OK",
    voltage: "",
    current: "",
    recommendedAction: "",
    additionalRemarks: "",
  });

  // Maintenance records
  const [maintenanceRecordId, setMaintenanceRecordId] = useState<number | null>(
    null
  );
  const [maintenanceRecord, setMaintenanceRecord] = useState({
    // Infrared Readings
    irLeft: "",
    irRight: "",
    irFront: "",
    // Power Readings
    lastMonthKva: "",
    lastMonthDate: "",
    lastMonthTime: "",
    currentMonthKva: "",
    // Equipment Details
    serial: "",
    meterCtRatio: "",
    make: "",
    // Maintenance Personnel & Timings
    startTime: "",
    completionTime: "",
    supervisedBy: "",
    // Technicians & Helpers
    techI: "",
    techII: "",
    techIII: "",
    helpers: "",
    // Inspection Sign-offs
    inspectedBy: "",
    inspectedByDate: "",
    reflectedBy: "",
    reflectedByDate: "",
    reInspectedBy: "",
    reInspectedByDate: "",
    // CSS
    css: "",
    cssDate: "",
  });

  const [editingEngineer, setEditingEngineer] = useState(false);
  const [savingEngineer, setSavingEngineer] = useState(false);

  // inspection passed from navigation state (optional)
  const location = useLocation();
  const passedInspection: any =
    (location &&
      (location as any).state &&
      (location as any).state.inspection) ||
    null;

  // State to store fetched inspection from database
  const [currentInspection, setCurrentInspection] = useState<any>(null);
  const [transformer, setTransformer] = useState<any>(null);

  const { username, role, isAuthenticated } = useAuth();
  const canEditEngineer = isAuthenticated && role === "engineer";

  // Lock body scroll when modal is open
  useEffect(() => {
    if (editingEngineer) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "auto";
      };
    }
  }, [editingEngineer]);

  // Fetch inspection data from database if not passed via navigation
  useEffect(() => {
    const fetchData = async () => {
      // Fetch inspection
      if (!passedInspection && inspectionNo) {
        try {
          const { getInspectionById } = await import(
            "../api/inspectionDataApi"
          );
          const inspectionData = await getInspectionById(Number(inspectionNo));
          if (inspectionData) {
            // Normalize field names (handle both inspectionDate and inspectedDate)
            const normalizedInspection = {
              ...inspectionData,
              transformerNo: inspectionData.transformerNo || transformerNo,
              inspectionDate:
                inspectionData.inspectionDate || inspectionData.inspectedDate,
            };
            setCurrentInspection(normalizedInspection);
            console.log(
              "Fetched inspection from database:",
              normalizedInspection
            );
          }
        } catch (error) {
          console.error("Error fetching inspection:", error);
        }
      } else if (passedInspection) {
        const normalizedInspection = {
          ...passedInspection,
          transformerNo: passedInspection.transformerNo || transformerNo,
          inspectionDate:
            passedInspection.inspectionDate || passedInspection.inspectedDate,
        };
        setCurrentInspection(normalizedInspection);
      }

      // Fetch transformer data to get pole number
      if (transformerNo) {
        try {
          const { TransformerAPI } = await import("../api/transformerDataApi");
          // Use filter to find transformer by transformerNo
          const filters = [
            {
              columnName: "transformerNo",
              value: [transformerNo],
              operation: "Equal",
            },
          ];
          const transformerData = await TransformerAPI.filter(filters, 0, 1);
          if (transformerData && transformerData.length > 0) {
            setTransformer(transformerData[0]);
            console.log("Fetched transformer data:", transformerData[0]);
          }
        } catch (error) {
          console.error("Error fetching transformer:", error);
        }
      }
    };

    fetchData();
  }, [inspectionNo, transformerNo]);

  // Fetch maintenance record from database
  useEffect(() => {
    const fetchMaintenanceRecord = async () => {
      if (currentInspection?.id) {
        try {
          console.log(
            "Fetching maintenance record for inspection ID:",
            currentInspection.id
          );
          const response = await maintenanceApi.getByInspectionId(
            currentInspection.id
          );
          console.log("Maintenance record fetch response:", response);

          if (response.responseCode == 2000 && response.responseData) {
            const data = Array.isArray(response.responseData)
              ? response.responseData[0]
              : response.responseData;

            console.log("Maintenance data to load:", data);

            if (data) {
              // Store the maintenance record ID for updates
              if (data.id) {
                setMaintenanceRecordId(data.id);
                console.log("Stored maintenance record ID:", data.id);
              }
              setMaintenanceRecord({
                irLeft: data.irLeft || "",
                irRight: data.irRight || "",
                irFront: data.irFront || "",
                lastMonthKva: data.lastMonthKva || "",
                lastMonthDate: data.lastMonthDate || "",
                lastMonthTime: data.lastMonthTime || "",
                currentMonthKva: data.currentMonthKva || "",
                serial: data.serial || "",
                meterCtRatio: data.meterCtRatio || "",
                make: data.make || "",
                startTime: data.startTime || "",
                completionTime: data.completionTime || "",
                supervisedBy: data.supervisedBy || "",
                techI: data.techI || "",
                techII: data.techII || "",
                techIII: data.techIII || "",
                helpers: data.helpers || "",
                inspectedBy: data.inspectedBy || "",
                inspectedByDate: data.inspectedByDate || "",
                reflectedBy: data.reflectedBy || "",
                reflectedByDate: data.reflectedByDate || "",
                reInspectedBy: data.reInspectedBy || "",
                reInspectedByDate: data.reInspectedByDate || "",
                css: data.css || "",
                cssDate: data.cssDate || "",
              });
              console.log("Maintenance record loaded successfully!");
            }
          } else {
            console.log(
              "No maintenance data or wrong response code:",
              response.responseCode
            );
          }
        } catch (error) {
          console.log("No maintenance record found or error fetching:", error);
        }
      }
    };

    fetchMaintenanceRecord();
  }, [currentInspection?.id]);

  useEffect(() => {
    if (currentInspection) {
      // Prefill engineer inputs
      setEngineerInputs({
        inspectorName: currentInspection.inspectorName || "",
        engineerStatus: currentInspection.engineerStatus || "OK",
        voltage: currentInspection.voltage || "",
        current: currentInspection.current || "",
        recommendedAction: currentInspection.recommendedAction || "",
        additionalRemarks: currentInspection.additionalRemarks || "",
      });

      // Prefill maintenance record (if it exists in passed state)
      if (currentInspection.maintenanceRecord) {
        setMaintenanceRecord({
          irLeft: currentInspection.maintenanceRecord.irLeft || "",
          irRight: currentInspection.maintenanceRecord.irRight || "",
          irFront: currentInspection.maintenanceRecord.irFront || "",
          lastMonthKva: currentInspection.maintenanceRecord.lastMonthKva || "",
          lastMonthDate:
            currentInspection.maintenanceRecord.lastMonthDate || "",
          lastMonthTime:
            currentInspection.maintenanceRecord.lastMonthTime || "",
          currentMonthKva:
            currentInspection.maintenanceRecord.currentMonthKva || "",
          serial: currentInspection.maintenanceRecord.serial || "",
          meterCtRatio: currentInspection.maintenanceRecord.meterCtRatio || "",
          make: currentInspection.maintenanceRecord.make || "",
          startTime: currentInspection.maintenanceRecord.startTime || "",
          completionTime:
            currentInspection.maintenanceRecord.completionTime || "",
          supervisedBy: currentInspection.maintenanceRecord.supervisedBy || "",
          techI: currentInspection.maintenanceRecord.techI || "",
          techII: currentInspection.maintenanceRecord.techII || "",
          techIII: currentInspection.maintenanceRecord.techIII || "",
          helpers: currentInspection.maintenanceRecord.helpers || "",
          inspectedBy: currentInspection.maintenanceRecord.inspectedBy || "",
          inspectedByDate:
            currentInspection.maintenanceRecord.inspectedByDate || "",
          reflectedBy: currentInspection.maintenanceRecord.reflectedBy || "",
          reflectedByDate:
            currentInspection.maintenanceRecord.reflectedByDate || "",
          reInspectedBy:
            currentInspection.maintenanceRecord.reInspectedBy || "",
          reInspectedByDate:
            currentInspection.maintenanceRecord.reInspectedByDate || "",
          css: currentInspection.maintenanceRecord.css || "",
          cssDate: currentInspection.maintenanceRecord.cssDate || "",
        });
      }
    }
  }, [currentInspection]);

  // Note: boxes are displayed via HTML overlays now, rendered directly in JSX below

  const generatePDF = async () => {
    // Create a canvas with the thermal image and bounding boxes
    let thermalImageWithBoxes = thermal;

    if (
      thermal &&
      Array.isArray(thermalMeta?.boxes) &&
      thermalMeta.boxes.length > 0
    ) {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";

        await new Promise((resolve, reject) => {
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");

            if (ctx) {
              // Draw the image
              ctx.drawImage(img, 0, 0);

              // Draw bounding boxes
              thermalMeta.boxes.forEach((box: any) => {
                if (box.n && Array.isArray(box.n) && box.n.length === 4) {
                  const [x1, y1, x2, y2] = box.n;
                  const left = Math.min(x1, x2) * img.width;
                  const top = Math.min(y1, y2) * img.height;
                  const width = Math.abs(x2 - x1) * img.width;
                  const height = Math.abs(y2 - y1) * img.height;

                  // Draw box
                  ctx.strokeStyle = box.color || "#ff0000";
                  ctx.lineWidth = 4;
                  ctx.strokeRect(left, top, width, height);

                  // Draw label background
                  const label = box.klass || "Anomaly";
                  ctx.font = "bold 16px Arial";
                  const textWidth = ctx.measureText(label).width;
                  ctx.fillStyle = box.color || "#ff0000";
                  ctx.fillRect(left, top - 26, textWidth + 12, 26);

                  // Draw label text
                  ctx.fillStyle = "#ffffff";
                  ctx.fillText(label, left + 6, top - 7);
                }
              });

              thermalImageWithBoxes = canvas.toDataURL("image/png");
            }
            resolve(true);
          };
          img.onerror = reject;
          img.src = thermal;
        });
      } catch (error) {
        console.error("Error drawing boxes on image:", error);
      }
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow pop-ups to generate PDF");
      return;
    }

    const pdfContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Maintenance Record - ${transformerNo} - Inspection ${inspectionNo}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { text-align: center; color: #1e293b; }
          h2 { color: #475569; border-bottom: 2px solid #cbd5e1; padding-bottom: 8px; margin-top: 24px; page-break-after: avoid; }
          h3 { color: #475569; margin-top: 16px; page-break-after: avoid; }
          .section { margin-bottom: 24px; page-break-inside: avoid; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
          .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
          .field { margin-bottom: 12px; }
          .label { font-weight: bold; color: #475569; display: block; margin-bottom: 4px; }
          .value { border: 1px solid #cbd5e1; padding: 8px; background: #f8fafc; display: block; }
          .anomaly-item { page-break-inside: avoid; }
          @media print { body { margin: 20px; } }
        </style>
      </head>
      <body>
        <h1>Transformer Maintenance Record</h1>
        
        <div class="section">
          <h2>Inspection Details</h2>
          <div class="grid-3">
            <div class="field">
              <span class="label">Transformer No:</span>
              <span class="value">${transformerNo || ""}</span>
            </div>
            <div class="field">
              <span class="label">Pole No:</span>
              <span class="value">${transformer?.poleNo || ""}</span>
            </div>
            <div class="field">
              <span class="label">Branch:</span>
              <span class="value">${currentInspection?.branch || ""}</span>
            </div>
          </div>
          <div class="grid">
            <div class="field">
              <span class="label">Date of Inspection:</span>
              <span class="value">${(() => {
                const dateStr = currentInspection?.inspectionDate || "";
                if (!dateStr) return "";
                if (dateStr.includes("T")) return dateStr.split("T")[0];
                const timePattern = /\d{1,2}:\d{2}\s*(AM|PM)?/i;
                if (timePattern.test(dateStr))
                  return dateStr.replace(timePattern, "").trim();
                return dateStr;
              })()}</span>
            </div>
            <div class="field">
              <span class="label">Time:</span>
              <span class="value">${(() => {
                if (currentInspection?.time) return currentInspection.time;
                const dateStr = currentInspection?.inspectionDate || "";
                const timeMatch = dateStr.match(/\d{1,2}:\d{2}\s*(AM|PM)?/i);
                return timeMatch ? timeMatch[0] : "";
              })()}</span>
            </div>
          </div>
          <div class="grid">
            <div class="field">
              <span class="label">Location Details:</span>
              <span class="value">${transformer?.locationDetails || ""}</span>
            </div>
            <div class="field">
              <span class="label">Type:</span>
              <span class="value">${transformer?.type || ""}</span>
            </div>
          </div>
        </div>

        ${
          thermalImageWithBoxes
            ? `
        <div class="section">
          <h2>Thermal Image</h2>
          ${
            weatherThermal
              ? `<div style="text-align: center; margin-bottom: 12px;">
            <span style="padding: 6px 16px; background-color: ${
              weatherThermal === "SUNNY"
                ? "#fbbf24"
                : weatherThermal === "CLOUDY"
                ? "#9ca3af"
                : "#3b82f6"
            }; color: white; border-radius: 16px; font-size: 14px; font-weight: 600;">
              Weather: ${
                weatherThermal === "SUNNY"
                  ? "☀️ Sunny"
                  : weatherThermal === "CLOUDY"
                  ? "☁️ Cloudy"
                  : "🌧️ Rainy"
              }
            </span>
          </div>`
              : ""
          }
          <div style="text-align: center; margin: 20px 0;">
            <img src="${thermalImageWithBoxes}" alt="Thermal Image" style="max-width: 100%; height: auto; border: 1px solid #cbd5e1;" />
          </div>
          ${
            Array.isArray(thermalMeta?.boxes) && thermalMeta.boxes.length > 0
              ? `
          <div style="page-break-before: always;"></div>
          <h3 style="margin-top: 24px; color: #475569;">Detected Anomalies</h3>
          <div style="display: grid; gap: 12px;">
            ${thermalMeta.boxes
              .map(
                (b: any, idx: number) => `
              <div class="anomaly-item" style="background-color: #f9fafb; border: 1px solid ${
                b.color || "#ff0000"
              }; border-left: 4px solid ${
                  b.color || "#ff0000"
                }; padding: 12px; border-radius: 6px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                  <div style="width: 12px; height: 12px; background-color: ${
                    b.color || "#ff0000"
                  }; border-radius: 2px;"></div>
                  <span style="font-weight: 600; color: #1f2937;">${
                    b.klass || "Anomaly"
                  } #${idx + 1}</span>
                </div>
                ${
                  b.confidence
                    ? `<div style="margin-bottom: 4px; color: #666;"><strong>Confidence:</strong> ${(
                        b.confidence * 100
                      ).toFixed(1)}%</div>`
                    : ""
                }
                ${
                  b.details
                    ? `<div style="margin-bottom: 4px; color: #666;"><strong>Details:</strong> ${b.details}</div>`
                    : ""
                }
                <div style="color: #666; font-size: 12px;">
                  <strong>Detection:</strong> ${
                    b.aiDetected !== false ? "AI Detected" : "Manually Selected"
                  }
                </div>
              </div>
            `
              )
              .join("")}
          </div>
          `
              : ""
          }
        </div>
        `
            : ""
        }

        <div class="section">
          <h2>Engineer Assessment</h2>
          <div class="field">
            <span class="label">Inspected by:</span>
            <span class="value">${engineerInputs.inspectorName || ""}</span>
          </div>
          <div class="field">
            <span class="label">Transformer Status:</span>
            <span class="value">${engineerInputs.engineerStatus || ""}</span>
          </div>
          <div class="grid">
            <div class="field">
              <span class="label">Voltage (V):</span>
              <span class="value">${engineerInputs.voltage || ""}</span>
            </div>
            <div class="field">
              <span class="label">Current (A):</span>
              <span class="value">${engineerInputs.current || ""}</span>
            </div>
          </div>
          <div class="field">
            <span class="label">Recommended Action:</span>
            <span class="value">${engineerInputs.recommendedAction || ""}</span>
          </div>
          <div class="field">
            <span class="label">Additional Remarks:</span>
            <span class="value">${engineerInputs.additionalRemarks || ""}</span>
          </div>
        </div>

        <div class="section">
          <h2>Infrared Readings</h2>
          <div class="grid-3">
            <div class="field">
              <span class="label">IR Left:</span>
              <span class="value">${maintenanceRecord.irLeft || ""}</span>
            </div>
            <div class="field">
              <span class="label">IR Right:</span>
              <span class="value">${maintenanceRecord.irRight || ""}</span>
            </div>
            <div class="field">
              <span class="label">IR Front:</span>
              <span class="value">${maintenanceRecord.irFront || ""}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Power Readings</h2>
          <div class="grid-3">
            <div class="field">
              <span class="label">Last Month KVA:</span>
              <span class="value">${maintenanceRecord.lastMonthKva || ""}</span>
            </div>
            <div class="field">
              <span class="label">Last Month Date:</span>
              <span class="value">${
                maintenanceRecord.lastMonthDate || ""
              }</span>
            </div>
            <div class="field">
              <span class="label">Last Month Time:</span>
              <span class="value">${
                maintenanceRecord.lastMonthTime || ""
              }</span>
            </div>
          </div>
          <div class="field">
            <span class="label">Current Month KVA:</span>
            <span class="value">${
              maintenanceRecord.currentMonthKva || ""
            }</span>
          </div>
        </div>

        <div class="section">
          <h2>Equipment Details</h2>
          <div class="grid-3">
            <div class="field">
              <span class="label">Serial:</span>
              <span class="value">${maintenanceRecord.serial || ""}</span>
            </div>
            <div class="field">
              <span class="label">Meter CT Ratio:</span>
              <span class="value">${maintenanceRecord.meterCtRatio || ""}</span>
            </div>
            <div class="field">
              <span class="label">Make:</span>
              <span class="value">${maintenanceRecord.make || ""}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Maintenance Personnel & Timings</h2>
          <div class="grid">
            <div class="field">
              <span class="label">Start Time:</span>
              <span class="value">${maintenanceRecord.startTime || ""}</span>
            </div>
            <div class="field">
              <span class="label">Completion Time:</span>
              <span class="value">${
                maintenanceRecord.completionTime || ""
              }</span>
            </div>
          </div>
          <div class="field">
            <span class="label">Supervised By:</span>
            <span class="value">${maintenanceRecord.supervisedBy || ""}</span>
          </div>
        </div>

        <div class="section">
          <h2>Technicians & Helpers</h2>
          <div class="grid">
            <div class="field">
              <span class="label">Tech I:</span>
              <span class="value">${maintenanceRecord.techI || ""}</span>
            </div>
            <div class="field">
              <span class="label">Tech II:</span>
              <span class="value">${maintenanceRecord.techII || ""}</span>
            </div>
          </div>
          <div class="grid">
            <div class="field">
              <span class="label">Tech III:</span>
              <span class="value">${maintenanceRecord.techIII || ""}</span>
            </div>
            <div class="field">
              <span class="label">Helpers:</span>
              <span class="value">${maintenanceRecord.helpers || ""}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Inspection Sign-offs</h2>
          <div class="grid">
            <div class="field">
              <span class="label">Inspected By:</span>
              <span class="value">${maintenanceRecord.inspectedBy || ""}</span>
            </div>
            <div class="field">
              <span class="label">Date:</span>
              <span class="value">${
                maintenanceRecord.inspectedByDate || ""
              }</span>
            </div>
          </div>
          <div class="grid">
            <div class="field">
              <span class="label">Reflected By:</span>
              <span class="value">${maintenanceRecord.reflectedBy || ""}</span>
            </div>
            <div class="field">
              <span class="label">Date:</span>
              <span class="value">${
                maintenanceRecord.reflectedByDate || ""
              }</span>
            </div>
          </div>
          <div class="grid">
            <div class="field">
              <span class="label">Re-Inspected By:</span>
              <span class="value">${
                maintenanceRecord.reInspectedBy || ""
              }</span>
            </div>
            <div class="field">
              <span class="label">Date:</span>
              <span class="value">${
                maintenanceRecord.reInspectedByDate || ""
              }</span>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>CSS</h2>
          <div class="grid">
            <div class="field">
              <span class="label">CSS:</span>
              <span class="value">${maintenanceRecord.css || ""}</span>
            </div>
            <div class="field">
              <span class="label">CSS Date:</span>
              <span class="value">${maintenanceRecord.cssDate || ""}</span>
            </div>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(pdfContent);
    printWindow.document.close();
  };

  const handleSaveEngineerInputs = async () => {
    if (!currentInspection || !currentInspection.id) {
      alert("Cannot save: inspection not found.");
      return;
    }
    setSavingEngineer(true);
    try {
      // Save engineer inputs
      const engineerPayload = {
        id: currentInspection.id,
        transformerNo: transformerNo,
        branch: currentInspection.branch,
        inspectionDate: currentInspection.inspectionDate,
        time: currentInspection.time,
        status: currentInspection.status,
        maintenanceDate: currentInspection.maintenanceDate,
        ...engineerInputs,
      };
      const { updateInspection } = await import("../api/inspectionDataApi");
      await updateInspection(engineerPayload);

      // Save or update maintenance record if any field is filled
      const hasMaintenanceData = Object.values(maintenanceRecord).some(
        (v) => v && v.toString().trim() !== ""
      );
      if (hasMaintenanceData) {
        const maintenancePayload = {
          ...(maintenanceRecordId && { id: maintenanceRecordId }),
          inspectionId: currentInspection.id,
          // Include transformer and inspection details
          transformerNo: transformerNo,
          poleNo: transformer?.poleNo || "",
          locationDetails: transformer?.locationDetails || "",
          type: transformer?.type || "",
          branch: currentInspection.branch,
          inspectionDate: currentInspection.inspectionDate,
          time: currentInspection.time,
          ...maintenanceRecord,
        };

        try {
          let response;
          if (maintenanceRecordId) {
            // Update existing record
            console.log("Updating maintenance record ID:", maintenanceRecordId);
            response = await maintenanceApi.update(maintenancePayload);
          } else {
            // Create new record
            console.log("Creating new maintenance record");
            response = await maintenanceApi.save(maintenancePayload);
            // Store the new ID if returned
            if (response.responseData && response.responseData.id) {
              setMaintenanceRecordId(response.responseData.id);
            }
          }

          if (response.responseCode != 2000) {
            console.warn(
              "Maintenance record save warning:",
              response.responseDescription
            );
          }
        } catch (err) {
          console.warn(
            "Maintenance record save failed (engineer inputs saved)",
            err
          );
        }
      }

      // Close edit mode
      setEditingEngineer(false);

      // Show brief success message
      const successMsg = document.createElement("div");
      successMsg.textContent = "✅ Saved";
      successMsg.style.cssText =
        "position:fixed;top:20px;right:20px;background:#10b981;color:white;padding:12px 20px;border-radius:6px;z-index:9999;font-weight:bold;";
      document.body.appendChild(successMsg);
      setTimeout(() => successMsg.remove(), 2000);
    } catch (error) {
      console.error("Failed to save inspector inputs:", error);
      // Show error message
      const errorMsg = document.createElement("div");
      errorMsg.textContent = "❌ Failed to save";
      errorMsg.style.cssText =
        "position:fixed;top:20px;right:20px;background:#ef4444;color:white;padding:12px 20px;border-radius:6px;z-index:9999;font-weight:bold;";
      document.body.appendChild(errorMsg);
      setTimeout(() => errorMsg.remove(), 3000);
    } finally {
      setSavingEngineer(false);
    }
  };
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

      {/* Engineer Inputs Button */}
      {canEditEngineer && (
        <div style={{ marginBottom: 16 }}>
          <button
            className="btn primary"
            onClick={() => setEditingEngineer(true)}
          >
            ✏️ Inspection Form
          </button>
        </div>
      )}

      {/* Engineer Inputs Modal */}
      {editingEngineer && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            overflow: "hidden",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setEditingEngineer(false);
            }
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: "1400px",
              maxHeight: "92vh",
              overflow: "hidden",
              padding: 0,
              width: "95%",
              height: "92vh",
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              borderRadius: "12px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px 24px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "12px 12px 0 0",
                marginBottom: 0,
              }}
            >
              <h3
                style={{
                  margin: 0,
                  color: "white",
                  fontSize: "20px",
                  fontWeight: "600",
                }}
              >
                📋 Maintenance Inspection Form
              </h3>
              <button
                className="btn"
                onClick={() => setEditingEngineer(false)}
                style={{
                  padding: "8px 14px",
                  fontSize: "16px",
                  background: "rgba(255, 255, 255, 0.2)",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: "8px",
                  color: "white",
                  fontWeight: "600",
                  transition: "background 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background =
                    "rgba(255, 255, 255, 0.3)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background =
                    "rgba(255, 255, 255, 0.2)")
                }
              >
                ✕
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 24,
                flex: 1,
                overflow: "hidden",
                padding: "24px",
                backgroundColor: "#f9fafb",
                minHeight: 0,
              }}
            >
              {/* Left side - Form inputs - Scrollable */}
              <div
                style={{
                  overflowY: "auto",
                  overflowX: "hidden",
                  backgroundColor: "white",
                  borderRadius: "8px",
                  padding: "20px",
                  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
                  maxHeight: "100%",
                }}
              >
                {/* ===== Engineer Fields ===== */}
                <h5
                  style={{
                    marginTop: 0,
                    marginBottom: 16,
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#1e293b",
                    paddingBottom: "10px",
                    borderBottom: "2px solid #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span style={{ fontSize: "18px" }}>📄</span> Inspection
                  Details
                </h5>

                {/* Read-only inspection info */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <label>Transformer No</label>
                    <input
                      type="text"
                      value={transformerNo || ""}
                      disabled
                      style={{
                        backgroundColor: "#f3f4f6",
                        cursor: "not-allowed",
                      }}
                    />
                  </div>
                  <div>
                    <label>Pole No</label>
                    <input
                      type="text"
                      value={transformer?.poleNo || ""}
                      disabled
                      style={{
                        backgroundColor: "#f3f4f6",
                        cursor: "not-allowed",
                      }}
                    />
                  </div>
                  <div>
                    <label>Branch</label>
                    <input
                      type="text"
                      value={currentInspection?.branch || ""}
                      disabled
                      style={{
                        backgroundColor: "#f3f4f6",
                        cursor: "not-allowed",
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <label>Date of Inspection</label>
                    <input
                      type="text"
                      value={(() => {
                        const dateStr = currentInspection?.inspectionDate || "";
                        if (!dateStr) return "";
                        // Handle ISO format (2025-10-03T15:17:00)
                        if (dateStr.includes("T")) {
                          return dateStr.split("T")[0];
                        }
                        // Handle formatted string like "Fri(03), Oct, 2025 03:17 PM"
                        // Extract just the date part (everything before time)
                        const timePattern = /\d{1,2}:\d{2}\s*(AM|PM)?/i;
                        if (timePattern.test(dateStr)) {
                          return dateStr.replace(timePattern, "").trim();
                        }
                        return dateStr;
                      })()}
                      disabled
                      style={{
                        backgroundColor: "#f3f4f6",
                        cursor: "not-allowed",
                      }}
                    />
                  </div>
                  <div>
                    <label>Time</label>
                    <input
                      type="text"
                      value={(() => {
                        // First check if time field exists separately
                        if (currentInspection?.time)
                          return currentInspection.time;
                        // Extract time from formatted date string
                        const dateStr = currentInspection?.inspectionDate || "";
                        const timeMatch = dateStr.match(
                          /\d{1,2}:\d{2}\s*(AM|PM)?/i
                        );
                        return timeMatch ? timeMatch[0] : "";
                      })()}
                      disabled
                      style={{
                        backgroundColor: "#f3f4f6",
                        cursor: "not-allowed",
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <label>Location Details</label>
                    <input
                      type="text"
                      value={transformer?.locationDetails || ""}
                      disabled
                      style={{
                        backgroundColor: "#f3f4f6",
                        cursor: "not-allowed",
                      }}
                    />
                  </div>
                  <div>
                    <label>Type</label>
                    <input
                      type="text"
                      value={transformer?.type || ""}
                      disabled
                      style={{
                        backgroundColor: "#f3f4f6",
                        cursor: "not-allowed",
                      }}
                    />
                  </div>
                </div>

                <h5
                  style={{
                    marginTop: 24,
                    marginBottom: 16,
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#1e293b",
                    paddingBottom: "10px",
                    borderBottom: "2px solid #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span style={{ fontSize: "18px" }}>👷</span> Engineer
                  Information
                </h5>

                <div style={{ marginBottom: 12 }}>
                  <label>Inspected by</label>
                  <input
                    type="text"
                    placeholder="Inspected by"
                    value={engineerInputs.inspectorName}
                    onChange={(e) =>
                      setEngineerInputs({
                        ...engineerInputs,
                        inspectorName: e.target.value,
                      })
                    }
                  />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label>Transformer Status</label>
                  <select
                    value={engineerInputs.engineerStatus}
                    onChange={(e) =>
                      setEngineerInputs({
                        ...engineerInputs,
                        engineerStatus: e.target.value,
                      })
                    }
                  >
                    <option value="OK">OK</option>
                    <option value="Needs Maintenance">Needs Maintenance</option>
                    <option value="Urgent Attention">Urgent Attention</option>
                  </select>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <label>Voltage (V)</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="Voltage"
                      value={engineerInputs.voltage}
                      onChange={(e) =>
                        setEngineerInputs({
                          ...engineerInputs,
                          voltage: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label>Current (A)</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="Current"
                      value={engineerInputs.current}
                      onChange={(e) =>
                        setEngineerInputs({
                          ...engineerInputs,
                          current: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label>Recommended Action</label>
                  <textarea
                    placeholder="Recommended action"
                    value={engineerInputs.recommendedAction}
                    onChange={(e) =>
                      setEngineerInputs({
                        ...engineerInputs,
                        recommendedAction: e.target.value,
                      })
                    }
                    rows={2}
                  />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label>Additional Remarks</label>
                  <textarea
                    placeholder="Additional remarks"
                    value={engineerInputs.additionalRemarks}
                    onChange={(e) =>
                      setEngineerInputs({
                        ...engineerInputs,
                        additionalRemarks: e.target.value,
                      })
                    }
                    rows={2}
                  />
                </div>

                {/* ===== IR Readings ===== */}
                <h5
                  style={{
                    marginTop: 24,
                    marginBottom: 16,
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#1e293b",
                    paddingBottom: "10px",
                    borderBottom: "2px solid #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span style={{ fontSize: "18px" }}>🌡️</span> Infrared Readings
                </h5>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <label>IR Left</label>
                    <input
                      type="text"
                      placeholder="Left"
                      value={maintenanceRecord.irLeft}
                      onChange={(e) =>
                        setMaintenanceRecord({
                          ...maintenanceRecord,
                          irLeft: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label>IR Right</label>
                    <input
                      type="text"
                      placeholder="Right"
                      value={maintenanceRecord.irRight}
                      onChange={(e) =>
                        setMaintenanceRecord({
                          ...maintenanceRecord,
                          irRight: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label>IR Front</label>
                    <input
                      type="text"
                      placeholder="Front"
                      value={maintenanceRecord.irFront}
                      onChange={(e) =>
                        setMaintenanceRecord({
                          ...maintenanceRecord,
                          irFront: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {/* ===== Power Readings ===== */}
                <h5
                  style={{
                    marginTop: 24,
                    marginBottom: 16,
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#1e293b",
                    paddingBottom: "10px",
                    borderBottom: "2px solid #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span style={{ fontSize: "18px" }}>⚡</span> Power Readings
                </h5>

                <div style={{ marginBottom: 12 }}>
                  <label>Last Month KVA</label>
                  <input
                    type="text"
                    placeholder="Last month KVA"
                    value={maintenanceRecord.lastMonthKva}
                    onChange={(e) =>
                      setMaintenanceRecord({
                        ...maintenanceRecord,
                        lastMonthKva: e.target.value,
                      })
                    }
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <label>Last Month Date</label>
                    <input
                      type="text"
                      placeholder="Date"
                      value={maintenanceRecord.lastMonthDate}
                      onChange={(e) =>
                        setMaintenanceRecord({
                          ...maintenanceRecord,
                          lastMonthDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label>Last Month Time</label>
                    <input
                      type="text"
                      placeholder="Time"
                      value={maintenanceRecord.lastMonthTime}
                      onChange={(e) =>
                        setMaintenanceRecord({
                          ...maintenanceRecord,
                          lastMonthTime: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label>Current Month KVA</label>
                  <input
                    type="text"
                    placeholder="Current month KVA"
                    value={maintenanceRecord.currentMonthKva}
                    onChange={(e) =>
                      setMaintenanceRecord({
                        ...maintenanceRecord,
                        currentMonthKva: e.target.value,
                      })
                    }
                  />
                </div>

                {/* ===== Equipment Details ===== */}
                <h5
                  style={{
                    marginTop: 24,
                    marginBottom: 16,
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#1e293b",
                    paddingBottom: "10px",
                    borderBottom: "2px solid #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span style={{ fontSize: "18px" }}>⚙️</span> Equipment Details
                </h5>

                <div style={{ marginBottom: 12 }}>
                  <label>Serial No</label>
                  <input
                    type="text"
                    placeholder="Serial number"
                    value={maintenanceRecord.serial}
                    onChange={(e) =>
                      setMaintenanceRecord({
                        ...maintenanceRecord,
                        serial: e.target.value,
                      })
                    }
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <label>Meter CT Ratio</label>
                    <input
                      type="text"
                      placeholder="CT Ratio"
                      value={maintenanceRecord.meterCtRatio}
                      onChange={(e) =>
                        setMaintenanceRecord({
                          ...maintenanceRecord,
                          meterCtRatio: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label>Make</label>
                    <input
                      type="text"
                      placeholder="Manufacturer"
                      value={maintenanceRecord.make}
                      onChange={(e) =>
                        setMaintenanceRecord({
                          ...maintenanceRecord,
                          make: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {/* ===== Maintenance Part 2 ===== */}
                <h5
                  style={{
                    marginTop: 24,
                    marginBottom: 16,
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#1e293b",
                    paddingBottom: "10px",
                    borderBottom: "2px solid #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span style={{ fontSize: "18px" }}>👥</span> Maintenance
                  Personnel & Timings
                </h5>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <label>Start Time</label>
                    <input
                      type="text"
                      placeholder="Start time"
                      value={maintenanceRecord.startTime}
                      onChange={(e) =>
                        setMaintenanceRecord({
                          ...maintenanceRecord,
                          startTime: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label>Completion Time</label>
                    <input
                      type="text"
                      placeholder="Completion time"
                      value={maintenanceRecord.completionTime}
                      onChange={(e) =>
                        setMaintenanceRecord({
                          ...maintenanceRecord,
                          completionTime: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label>Supervised By</label>
                  <input
                    type="text"
                    placeholder="Supervisor name"
                    value={maintenanceRecord.supervisedBy}
                    onChange={(e) =>
                      setMaintenanceRecord({
                        ...maintenanceRecord,
                        supervisedBy: e.target.value,
                      })
                    }
                  />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label>Technician I</label>
                  <input
                    type="text"
                    placeholder="Technician I name"
                    value={maintenanceRecord.techI}
                    onChange={(e) =>
                      setMaintenanceRecord({
                        ...maintenanceRecord,
                        techI: e.target.value,
                      })
                    }
                  />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label>Technician II</label>
                  <input
                    type="text"
                    placeholder="Technician II name"
                    value={maintenanceRecord.techII}
                    onChange={(e) =>
                      setMaintenanceRecord({
                        ...maintenanceRecord,
                        techII: e.target.value,
                      })
                    }
                  />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label>Technician III</label>
                  <input
                    type="text"
                    placeholder="Technician III name"
                    value={maintenanceRecord.techIII}
                    onChange={(e) =>
                      setMaintenanceRecord({
                        ...maintenanceRecord,
                        techIII: e.target.value,
                      })
                    }
                  />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label>Helpers</label>
                  <input
                    type="text"
                    placeholder="Helper names"
                    value={maintenanceRecord.helpers}
                    onChange={(e) =>
                      setMaintenanceRecord({
                        ...maintenanceRecord,
                        helpers: e.target.value,
                      })
                    }
                  />
                </div>

                {/* ===== Inspection Sign-offs ===== */}
                <h5
                  style={{
                    marginTop: 24,
                    marginBottom: 16,
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#1e293b",
                    paddingBottom: "10px",
                    borderBottom: "2px solid #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span style={{ fontSize: "18px" }}>✍️</span> Inspection
                  Sign-offs
                </h5>

                <div style={{ marginBottom: 12 }}>
                  <label>Inspected By</label>
                  <input
                    type="text"
                    placeholder="Inspector name"
                    value={maintenanceRecord.inspectedBy}
                    onChange={(e) =>
                      setMaintenanceRecord({
                        ...maintenanceRecord,
                        inspectedBy: e.target.value,
                      })
                    }
                  />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label>Inspected By Date</label>
                  <input
                    type="text"
                    placeholder="Date"
                    value={maintenanceRecord.inspectedByDate}
                    onChange={(e) =>
                      setMaintenanceRecord({
                        ...maintenanceRecord,
                        inspectedByDate: e.target.value,
                      })
                    }
                  />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label>Reflected By</label>
                  <input
                    type="text"
                    placeholder="Reflected by name"
                    value={maintenanceRecord.reflectedBy}
                    onChange={(e) =>
                      setMaintenanceRecord({
                        ...maintenanceRecord,
                        reflectedBy: e.target.value,
                      })
                    }
                  />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label>Reflected By Date</label>
                  <input
                    type="text"
                    placeholder="Date"
                    value={maintenanceRecord.reflectedByDate}
                    onChange={(e) =>
                      setMaintenanceRecord({
                        ...maintenanceRecord,
                        reflectedByDate: e.target.value,
                      })
                    }
                  />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label>Re-Inspected By</label>
                  <input
                    type="text"
                    placeholder="Re-inspector name"
                    value={maintenanceRecord.reInspectedBy}
                    onChange={(e) =>
                      setMaintenanceRecord({
                        ...maintenanceRecord,
                        reInspectedBy: e.target.value,
                      })
                    }
                  />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label>Re-Inspected By Date</label>
                  <input
                    type="text"
                    placeholder="Date"
                    value={maintenanceRecord.reInspectedByDate}
                    onChange={(e) =>
                      setMaintenanceRecord({
                        ...maintenanceRecord,
                        reInspectedByDate: e.target.value,
                      })
                    }
                  />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label>CSS</label>
                  <input
                    type="text"
                    placeholder="CSS name/value"
                    value={maintenanceRecord.css}
                    onChange={(e) =>
                      setMaintenanceRecord({
                        ...maintenanceRecord,
                        css: e.target.value,
                      })
                    }
                  />
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label>CSS Date</label>
                  <input
                    type="text"
                    placeholder="Date"
                    value={maintenanceRecord.cssDate}
                    onChange={(e) =>
                      setMaintenanceRecord({
                        ...maintenanceRecord,
                        cssDate: e.target.value,
                      })
                    }
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    position: "sticky",
                    bottom: 0,
                    backgroundColor: "white",
                    paddingTop: 16,
                    paddingBottom: 8,
                    borderTop: "2px solid #e5e7eb",
                    marginLeft: -20,
                    marginRight: -20,
                    paddingLeft: 20,
                    paddingRight: 20,
                  }}
                >
                  <button
                    onClick={handleSaveEngineerInputs}
                    disabled={savingEngineer}
                    style={{
                      flex: 1,
                      padding: "12px 24px",
                      backgroundColor: savingEngineer ? "#9ca3af" : "#3b82f6",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "15px",
                      fontWeight: "600",
                      cursor: savingEngineer ? "not-allowed" : "pointer",
                      transition: "all 0.2s",
                      boxShadow: "0 2px 4px rgba(59, 130, 246, 0.3)",
                    }}
                    onMouseOver={(e) =>
                      !savingEngineer &&
                      (e.currentTarget.style.backgroundColor = "#2563eb")
                    }
                    onMouseOut={(e) =>
                      !savingEngineer &&
                      (e.currentTarget.style.backgroundColor = "#3b82f6")
                    }
                  >
                    {savingEngineer ? "💾 Saving..." : "💾 Save Changes"}
                  </button>
                  <button
                    onClick={generatePDF}
                    style={{
                      flex: 1,
                      padding: "12px 24px",
                      backgroundColor: "#10b981",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "15px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      boxShadow: "0 2px 4px rgba(16, 185, 129, 0.3)",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#059669")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "#10b981")
                    }
                  >
                    📄 Generate PDF
                  </button>
                  <button
                    onClick={() => setEditingEngineer(false)}
                    style={{
                      padding: "12px 24px",
                      backgroundColor: "#f3f4f6",
                      color: "#374151",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "15px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#e5e7eb")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f3f4f6")
                    }
                  >
                    ✕ Cancel
                  </button>
                </div>
              </div>

              {/* Right side - Thermal image with annotations */}
              <div
                style={{
                  overflowY: "auto",
                  overflowX: "hidden",
                  backgroundColor: "white",
                  borderRadius: "8px",
                  padding: "20px",
                  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
                  maxHeight: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <h4 style={{ margin: 0 }}>Thermal Image</h4>
                  {weatherThermal && (
                    <span
                      style={{
                        padding: "4px 12px",
                        backgroundColor:
                          weatherThermal === "SUNNY"
                            ? "#fbbf24"
                            : weatherThermal === "CLOUDY"
                            ? "#9ca3af"
                            : "#3b82f6",
                        color: "white",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      {weatherThermal === "SUNNY"
                        ? "☀️ Sunny"
                        : weatherThermal === "CLOUDY"
                        ? "☁️ Cloudy"
                        : "🌧️ Rainy"}
                    </span>
                  )}
                </div>
                {thermal ? (
                  <div
                    style={{
                      position: "relative",
                      backgroundColor: "#000",
                      borderRadius: "8px",
                      overflow: "hidden",
                      display: "inline-block",
                      width: "100%",
                    }}
                  >
                    <img
                      id="thermal-form-img"
                      src={thermal}
                      alt="Thermal"
                      style={{
                        display: "block",
                        maxWidth: "100%",
                        height: "auto",
                      }}
                    />
                    {/* Bounding boxes overlay */}
                    {Array.isArray(thermalMeta?.boxes) &&
                      thermalMeta.boxes.length > 0 && (
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            pointerEvents: "none",
                          }}
                        >
                          {thermalMeta.boxes.map((b: any, idx: number) => {
                            const [x1, y1, x2, y2] = b.n;
                            const left = `${Math.min(x1, x2) * 100}%`;
                            const top = `${Math.min(y1, y2) * 100}%`;
                            const width = `${Math.abs(x2 - x1) * 100}%`;
                            const height = `${Math.abs(y2 - y1) * 100}%`;
                            return (
                              <div
                                key={idx}
                                style={{
                                  position: "absolute",
                                  left,
                                  top,
                                  width,
                                  height,
                                  border: `2px solid ${b.color || "#ff0000"}`,
                                  boxSizing: "border-box",
                                }}
                              >
                                <div
                                  style={{
                                    position: "absolute",
                                    top: -22,
                                    left: 0,
                                    backgroundColor: b.color || "#ff0000",
                                    color: "#fff",
                                    padding: "2px 6px",
                                    fontSize: "11px",
                                    fontWeight: "bold",
                                    borderRadius: "2px",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {b.klass || "Anomaly"}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                  </div>
                ) : (
                  <div
                    style={{
                      backgroundColor: "#f3f4f6",
                      padding: "40px 20px",
                      textAlign: "center",
                      borderRadius: "8px",
                      color: "#666",
                      fontSize: "12px",
                    }}
                  >
                    No thermal image available
                  </div>
                )}

                {/* Anomaly Details Below Image */}
                {Array.isArray(thermalMeta?.boxes) &&
                  thermalMeta.boxes.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                      <h5
                        style={{
                          marginTop: 0,
                          marginBottom: 12,
                          fontSize: "14px",
                          fontWeight: "600",
                        }}
                      >
                        Detected Anomalies
                      </h5>
                      <div style={{ display: "grid", gap: 8 }}>
                        {thermalMeta.boxes.map((b: any, idx: number) => (
                          <div
                            key={idx}
                            style={{
                              backgroundColor: "#f9fafb",
                              border: `1px solid ${b.color || "#ff0000"}`,
                              borderLeft: `4px solid ${b.color || "#ff0000"}`,
                              padding: "12px",
                              borderRadius: "6px",
                              fontSize: "13px",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                marginBottom: 6,
                              }}
                            >
                              <div
                                style={{
                                  width: 12,
                                  height: 12,
                                  backgroundColor: b.color || "#ff0000",
                                  borderRadius: "2px",
                                }}
                              />
                              <span
                                style={{ fontWeight: "600", color: "#1f2937" }}
                              >
                                {b.klass || "Anomaly"} #{idx + 1}
                              </span>
                            </div>
                            {b.confidence && (
                              <div style={{ marginBottom: 4, color: "#666" }}>
                                <strong>Confidence:</strong>{" "}
                                {(b.confidence * 100).toFixed(1)}%
                              </div>
                            )}
                            {b.details && (
                              <div style={{ marginBottom: 4, color: "#666" }}>
                                <strong>Details:</strong> {b.details}
                              </div>
                            )}
                            <div style={{ color: "#666", fontSize: "12px" }}>
                              <strong>Detection:</strong>{" "}
                              {b.aiDetected !== false
                                ? "AI Detected"
                                : "Manually Selected"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}

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
                  <span style={{ color: "#475569", fontSize: 14 }}>{name}</span>
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
            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
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
                const userName =
                  username || localStorage.getItem("username") || "User";
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
