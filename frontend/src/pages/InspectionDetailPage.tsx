import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { uploadImage, viewImage } from "../api/imageApi";

type ImgType = "Baseline" | "Thermal";
type Weather = "SUNNY" | "CLOUDY" | "RAINY";

function normalizeWeather(w: unknown): Weather | null {
  if (!w || typeof w !== "string") return null;
  const u = w.trim().toUpperCase();
  return u === "SUNNY" || u === "CLOUDY" || u === "RAINY" ? (u as Weather) : null;
}

export default function InspectionDetailPage() {
  const navigate = useNavigate();
  const { transformerNo, inspectionNo } = useParams<{
    transformerNo: string;
    inspectionNo: string;
  }>();
  const location = useLocation();
  const { inspection } = (location.state as any) || {};

  // Image previews
  const [baseline, setBaseline] = useState<string | null>(null);
  const [thermal, setThermal] = useState<string | null>(null);

  // Dropdown selections (client-side)
  const [weatherBaseline, setWeatherBaseline] = useState<Weather>("SUNNY");
  const [weatherThermal, setWeatherThermal] = useState<Weather>("SUNNY");

  // Files (not auto-uploaded)
  const [baselineFile, setBaselineFile] = useState<File | null>(null);
  const [thermalFile, setThermalFile] = useState<File | null>(null);

  // Loading states
  const [submittingBaseline, setSubmittingBaseline] = useState(false);
  const [submittingThermal, setSubmittingThermal] = useState(false);

  // NEW: weather saved on the server (for each image)
  const [savedWeatherBaseline, setSavedWeatherBaseline] = useState<Weather | null>(null);
  const [savedWeatherThermal, setSavedWeatherThermal] = useState<Weather | null>(null);

  // Fetch existing images (and saved weather)
  useEffect(() => {
    async function fetchImages() {
      try {
        // Baseline
        const baselineRes = await viewImage(transformerNo!, inspectionNo!, "Baseline");
        if (baselineRes?.responseCode === "2000" && baselineRes.responseData) {
          if (baselineRes.responseData.photoBase64) {
            setBaseline(`data:image/png;base64,${baselineRes.responseData.photoBase64}`);
          } else {
            setBaseline(null);
          }
          const wb = normalizeWeather(baselineRes.responseData.weather);
          if (wb) setSavedWeatherBaseline(wb);
        } else {
          setBaseline(null);
          setSavedWeatherBaseline(null);
        }

        // Thermal
        const thermalRes = await viewImage(transformerNo!, inspectionNo!, "Thermal");
        if (thermalRes?.responseCode === "2000" && thermalRes.responseData) {
          if (thermalRes.responseData.photoBase64) {
            setThermal(`data:image/png;base64,${thermalRes.responseData.photoBase64}`);
          } else {
            setThermal(null);
          }
          const wt = normalizeWeather(thermalRes.responseData.weather);
          if (wt) setSavedWeatherThermal(wt);
        } else {
          setThermal(null);
          setSavedWeatherThermal(null);
        }
      } catch (err) {
        console.error("❌ Failed to load images:", err);
      }
    }
    if (transformerNo && inspectionNo) fetchImages();
  }, [transformerNo, inspectionNo]);

  // Explicit submit per image type
  const handleSubmit = async (type: ImgType) => {
    const file = type === "Baseline" ? baselineFile : thermalFile;
    const weather = type === "Baseline" ? weatherBaseline : weatherThermal;

    if (!file) {
      alert(`Please choose a ${type} image before submitting.`);
      return;
    }

    try {
      if (type === "Baseline") setSubmittingBaseline(true);
      else setSubmittingThermal(true);

      const res = await uploadImage(transformerNo!, inspectionNo!, file, type, weather);
      if (res?.responseCode === "2000") {
        // Local preview
        const url = URL.createObjectURL(file);
        if (type === "Baseline") {
          setBaseline(url);
          setBaselineFile(null);
          setSavedWeatherBaseline(weather); // reflect server value immediately
        } else {
          setThermal(url);
          setThermalFile(null);
          setSavedWeatherThermal(weather); // reflect server value immediately
        }
        alert(`✅ ${type} image uploaded (${weather})`);
      } else {
        const msg = res?.responseDescription || "Unknown error";
        alert("❌ Upload failed: " + msg);
      }
    } catch (err) {
      console.error("❌ Upload error:", err);
      alert("Failed to upload image");
    } finally {
      if (type === "Baseline") setSubmittingBaseline(false);
      else setSubmittingThermal(false);
    }
  };

  return (
    <div className="container">
      <button className="btn secondary" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h2 style={{ marginTop: 16 }}>Inspection {inspectionNo}</h2>
      <p>
        Transformer <span className="badge">{transformerNo}</span>
      </p>

      {inspection && (
        <div className="card" style={{ marginTop: 16 }}>
          <p><strong>Branch:</strong> {inspection.branch}</p>
          <p><strong>Status:</strong> <span className="badge">{inspection.status}</span></p>
          <p><strong>Inspected Date:</strong> {inspection.inspectedDate}</p>
          <p><strong>Maintenance Date:</strong> {inspection.maintenanceDate || "-"}</p>
        </div>
      )}

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Upload Images</h3>

        <div style={{ display: "flex", gap: 40, marginTop: 12, flexWrap: "wrap" }}>
          {/* Baseline */}
          <div style={{ display: "grid", gap: 8, minWidth: 280 }}>
            <label><strong>Baseline</strong></label>

            <label style={{ fontSize: 12 }}>Weather</label>
            <select
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
              onChange={(e) => setBaselineFile(e.target.files?.[0] ?? null)}
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

          {/* Thermal */}
          <div style={{ display: "grid", gap: 8, minWidth: 280 }}>
            <label><strong>Thermal</strong></label>

            <label style={{ fontSize: 12 }}>Weather</label>
            <select
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
              onChange={(e) => setThermalFile(e.target.files?.[0] ?? null)}
            />
            {thermalFile && (
              <div style={{ fontSize: 12, opacity: 0.8 }}>
                Selected: <em>{thermalFile.name}</em>
              </div>
            )}

            <button
              className="btn primary"
              onClick={() => handleSubmit("Thermal")}
              disabled={submittingThermal}
            >
              {submittingThermal ? "Uploading…" : "Submit Thermal"}
            </button>
          </div>
        </div>
      </div>

{/* Previews */}
{baseline || thermal ? (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
      gap: 20,
      marginTop: 20,
    }}
  >
    {/* Baseline */}
    <div>
      <h4>Baseline Image</h4>
      <div
        style={{
          width: "100%",
          height: 320,                 // <-- equal height
          borderRadius: 8,
          background: "#f8fafc",
          border: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {baseline ? (
          <img
            src={baseline}
            alt="Baseline"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        ) : (
          <p style={{ margin: 0, color: "#64748b" }}>No baseline uploaded yet</p>
        )}
      </div>
      <div style={{ marginTop: 6, fontSize: 12 }}>
        Weather selected: <strong>{savedWeatherBaseline ?? weatherBaseline}</strong>
      </div>
    </div>

    {/* Thermal */}
    <div>
      <h4>Thermal Image</h4>
      <div
        style={{
          width: "100%",
          height: 320,                 // <-- same height
          borderRadius: 8,
          background: "#f8fafc",
          border: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {thermal ? (
          <img
            src={thermal}
            alt="Thermal"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        ) : (
          <p style={{ margin: 0, color: "#64748b" }}>No thermal uploaded yet</p>
        )}
      </div>
      <div style={{ marginTop: 6, fontSize: 12 }}>
        Weather selected: <strong>{savedWeatherThermal ?? weatherThermal}</strong>
      </div>
    </div>
  </div>
) : (
  <p style={{ marginTop: 16 }}>No images uploaded yet.</p>
)}
    </div>
  );
}
