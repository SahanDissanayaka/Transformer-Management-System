import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { uploadImage, viewImage } from "../api/imageApi";

export default function InspectionDetailPage() {
  const navigate = useNavigate();
  const { transformerNo, inspectionNo } = useParams<{ transformerNo: string; inspectionNo: string }>();
  const location = useLocation();
  const { inspection } = (location.state as any) || {};

  const [baseline, setBaseline] = useState<string | null>(null);
  const [thermal, setThermal] = useState<string | null>(null);

  // Fetch existing images from API
  useEffect(() => {
    async function fetchImages() {
      try {
        const res = await viewImage(transformerNo!, inspectionNo!);
        if (res && res.responseCode === "2000" && res.responseData) {
          const src = `data:image/png;base64,${res.responseData.photoBase64}`;
          if (res.responseData.type === "Baseline") setBaseline(src);
          if (res.responseData.type === "Thermal") setThermal(src);
        } else {
          console.warn("⚠️ No image found for this inspection yet.");
        }
      } catch (err) {
        console.error("❌ Failed to load images:", err);
      }
    }
    fetchImages();
  }, [transformerNo, inspectionNo]);

  // Handle upload
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "Baseline" | "Thermal") => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await uploadImage(transformerNo!, inspectionNo!, file, type);
      if (res.responseCode === "2000") {
        const url = URL.createObjectURL(file);
        if (type === "Baseline") setBaseline(url);
        else setThermal(url);
      } else {
        alert("❌ Upload failed: " + res.responseDescription);
      }
    } catch (err) {
      console.error("❌ Upload error:", err);
      alert("Failed to upload image");
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
        <div style={{ display: "flex", gap: 20, marginTop: 12 }}>
          <label>
            Baseline:
            <input type="file" accept="image/*" onChange={(e) => handleUpload(e, "Baseline")} />
          </label>
          <label>
            Thermal:
            <input type="file" accept="image/*" onChange={(e) => handleUpload(e, "Thermal")} />
          </label>
        </div>
      </div>

      {baseline || thermal ? (
        <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
          <div style={{ flex: 1 }}>
            <h4>Baseline Image</h4>
            {baseline ? <img src={baseline} alt="Baseline" style={{ maxWidth: "100%", borderRadius: 8 }} /> : <p>No baseline uploaded yet</p>}
          </div>
          <div style={{ flex: 1 }}>
            <h4>Thermal Image</h4>
            {thermal ? <img src={thermal} alt="Thermal" style={{ maxWidth: "100%", borderRadius: 8 }} /> : <p>No thermal uploaded yet</p>}
          </div>
        </div>
      ) : (
        <p style={{ marginTop: 16 }}>No images uploaded yet.</p>
      )}
    </div>
  );
}
