import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
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

  // NEW: metadata from server (dateTime, bounding boxes, error type)
  type Box = [number, number, number, number];
  const [baselineMeta, setBaselineMeta] = useState<{ dateTime?: string } | null>(null);
  const [thermalMeta, setThermalMeta] = useState<{ dateTime?: string; errorType?: string; boundingBoxes?: Box[] } | null>(null);

  // Refs and sizing for correct box scaling/positioning
  const baselineContainerRef = useRef<HTMLDivElement | null>(null);
  const thermalContainerRef = useRef<HTMLDivElement | null>(null);
  const baselineImgRef = useRef<HTMLImageElement | null>(null);
  const thermalImgRef = useRef<HTMLImageElement | null>(null);
  // track the displayed image area (inside the container) so boxes can be scaled/positioned correctly
  const [baselineDisplaySize, setBaselineDisplaySize] = useState({ clientWidth: 0, clientHeight: 0, naturalWidth: 0, naturalHeight: 0, offsetX: 0, offsetY: 0 });
  const [thermalDisplaySize, setThermalDisplaySize] = useState({ clientWidth: 0, clientHeight: 0, naturalWidth: 0, naturalHeight: 0, offsetX: 0, offsetY: 0 });

  // Shared transform state (applies to both images)
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0); // degrees
  // Shared pan offsets (in pixels) applied after scale/rotation
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  // will hold drag state and handler references so we can remove them
  const draggingRef = useRef<any>({ active: false });
  const DRAG_SPEED = 2.0; // multiplier to speed up dragging

  // start dragging: attach window-level handlers so dragging continues even if pointer leaves the element
  const onPointerDown = (e: React.PointerEvent) => {
    // only start for primary button / touch
    if (e.button && e.button !== 0) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const origX = offsetX;
    const origY = offsetY;
    const moveHandler = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      // apply speed multiplier and update offsets
      setOffsetX(Math.round(origX + dx * DRAG_SPEED));
      setOffsetY(Math.round(origY + dy * DRAG_SPEED));
    };
    const upHandler = () => {
      window.removeEventListener('pointermove', moveHandler);
      window.removeEventListener('pointerup', upHandler);
      draggingRef.current.active = false;
    };
    draggingRef.current = { active: true, moveHandler, upHandler };
    window.addEventListener('pointermove', moveHandler);
    window.addEventListener('pointerup', upHandler);
    // prevent default to avoid accidental text selection/scroll
    e.preventDefault();
  };

  // Helper: compute displayed image rect (accounting for object-fit: contain)
  const computeDisplaySize = useCallback((imgEl: HTMLImageElement | null, containerEl: HTMLDivElement | null) => {
    if (!imgEl || !containerEl) return null;
    const naturalWidth = imgEl.naturalWidth || imgEl.width || 0;
    const naturalHeight = imgEl.naturalHeight || imgEl.height || 0;
    const containerWidth = containerEl.clientWidth;
    const containerHeight = containerEl.clientHeight;
    if (!naturalWidth || !naturalHeight || !containerWidth || !containerHeight) return null;

    const imgRatio = naturalWidth / naturalHeight;
    const containerRatio = containerWidth / containerHeight;
    let displayWidth = containerWidth;
    let displayHeight = containerHeight;
    if (imgRatio > containerRatio) {
      // image is wider than container -> full width
      displayWidth = containerWidth;
      displayHeight = containerWidth / imgRatio;
    } else {
      // image is taller (or equal) -> full height
      displayHeight = containerHeight;
      displayWidth = containerHeight * imgRatio;
    }
    const offsetX = Math.round((containerWidth - displayWidth) / 2);
    const offsetY = Math.round((containerHeight - displayHeight) / 2);
    return { clientWidth: Math.round(displayWidth), clientHeight: Math.round(displayHeight), naturalWidth, naturalHeight, offsetX, offsetY };
  }, []);

  // update display sizes on load and window resize
  useEffect(() => {
    const update = () => {
      const b = computeDisplaySize(baselineImgRef.current, baselineContainerRef.current);
      if (b) setBaselineDisplaySize(b as any);
      const t = computeDisplaySize(thermalImgRef.current, thermalContainerRef.current);
      if (t) setThermalDisplaySize(t as any);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [computeDisplaySize, baseline, thermal]);

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
          // metadata
          setBaselineMeta({ dateTime: baselineRes.responseData.dateTime });
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
          // parse bounding boxes (if any) and other metadata
          let boxes: Box[] | undefined = undefined;
          try {
            if (thermalRes.responseData.boundingBoxesJson) {
              const parsed = JSON.parse(thermalRes.responseData.boundingBoxesJson);
              if (Array.isArray(parsed)) boxes = parsed as Box[];
            }
          } catch (e) {
            console.warn("Failed to parse boundingBoxesJson:", e);
          }
          setThermalMeta({ dateTime: thermalRes.responseData.dateTime, errorType: thermalRes.responseData.errorType, boundingBoxes: boxes });
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
          // no bounding boxes for local preview baseline; set only dateTime to now
          setBaselineMeta({ dateTime: new Date().toLocaleString() });
        } else {
          setThermal(url);
          setThermalFile(null);
          setSavedWeatherThermal(weather); // reflect server value immediately
          // local preview won't have bounding boxes; set dateTime
          setThermalMeta((m) => ({ ...(m ?? {}), dateTime: new Date().toLocaleString() }));
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
        ref={baselineContainerRef}
        style={{
          position: "relative",
          width: "100%",
          height: 320, // <-- equal height
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
          <>
            <div
              onPointerDown={onPointerDown}
              onPointerCancel={() => { /* no-op, window handlers handle cancel */ }}
              style={{ transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale}) rotate(${rotation}deg)`, transformOrigin: 'center center', width: '100%', height: '100%', position: 'relative', touchAction: 'none', cursor: draggingRef.current.active ? 'grabbing' : 'grab' }}
            >
              <img
                ref={baselineImgRef}
                src={baseline}
                alt="Baseline"
                style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
              />
            </div>
            {/* dateTime overlay kept outside the transform so it stays fixed at the bottom */}
            {baselineMeta?.dateTime && (
              <div
                style={{
                  position: "absolute",
                  left: 8,
                  right: 8,
                  bottom: 8,
                  background: "rgba(0,0,0,0.5)",
                  color: "#fff",
                  padding: "4px 6px",
                  borderRadius: 4,
                  fontSize: 12,
                  textAlign: "center",
                }}
              >
                {baselineMeta.dateTime}
              </div>
            )}
          </>
        ) : (
          <p style={{ margin: 0, color: "#64748b" }}>No baseline uploaded yet</p>
        )}
      </div>
      {/* small hidden reference so TypeScript sees baselineDisplaySize is used (keeps lint happy) */}
      <div style={{ display: "none" }}>{JSON.stringify(baselineDisplaySize)}</div>
      <div style={{ marginTop: 6, fontSize: 12 }}>
        Weather selected: <strong>{savedWeatherBaseline ?? weatherBaseline}</strong>
      </div>
    </div>

    {/* Thermal */}
    <div>
      <h4>Thermal Image</h4>
      <div
        ref={thermalContainerRef}
        style={{
          position: "relative",
          width: "100%",
          height: 320, // <-- same height
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
          <>
            <div
              onPointerDown={onPointerDown}
              onPointerCancel={() => { /* no-op, window handlers handle cancel */ }}
              style={{ transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale}) rotate(${rotation}deg)`, transformOrigin: 'center center', width: '100%', height: '100%', position: 'relative', touchAction: 'none', cursor: draggingRef.current.active ? 'grabbing' : 'grab' }}
            >
              <img
                ref={thermalImgRef}
                src={thermal}
                alt="Thermal"
                style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
              />

              {/* Overlay: bounding boxes */}
              {thermalMeta?.boundingBoxes && thermalMeta.boundingBoxes.length > 0 && (
                <div style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0, pointerEvents: "none" }}>
                  {thermalMeta.boundingBoxes.map((box, idx) => {
                    // box is [x,y,width,height] in natural image coordinates
                    const [x, y, w, h] = box;
                    const d = thermalDisplaySize;
                    if (!d.naturalWidth || !d.naturalHeight) return null;
                    const scaleX = d.clientWidth / d.naturalWidth;
                    const scaleY = d.clientHeight / d.naturalHeight;
                    const left = Math.round(d.offsetX + x * scaleX);
                    const top = Math.round(d.offsetY + y * scaleY);
                    const width = Math.round(w * scaleX);
                    const height = Math.round(h * scaleY);
                    return (
                      <div key={idx}>
                        <div
                          style={{
                            position: "absolute",
                            left,
                            top,
                            width,
                            height,
                            border: "2px solid rgba(255,0,0,0.9)",
                            boxSizing: "border-box",
                            borderRadius: 4,
                          }}
                        />
                        {/* label */}
                        {thermalMeta.errorType && (
                          <div
                            style={{
                              position: "absolute",
                              left,
                              top: Math.max(0, top - 22),
                              background: "rgba(255,0,0,0.85)",
                              color: "#fff",
                              padding: "2px 6px",
                              borderRadius: 4,
                              fontSize: 12,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {thermalMeta.errorType}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {/* dateTime overlay kept outside the transform so it stays fixed at the bottom */}
            {thermalMeta?.dateTime && (
              <div
                style={{
                  position: "absolute",
                  left: 8,
                  right: 8,
                  bottom: 8,
                  background: "rgba(0,0,0,0.5)",
                  color: "#fff",
                  padding: "4px 6px",
                  borderRadius: 4,
                  fontSize: 12,
                  textAlign: "center",
                }}
              >
                {thermalMeta.dateTime}
              </div>
            )}
          </>
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
      {/* Compact icon toolbar will be positioned under the thermal image */}
              {/* toolbar removed from thermal container — it will be rendered below both images */}
              {(baseline || thermal) && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
                  <div style={{ display: 'flex', gap: 8, background: 'rgba(0,0,0,0.35)', padding: '6px 8px', borderRadius: 24, alignItems: 'center' }}>
                    <button className="btn" title="Zoom in" onClick={() => setScale((s) => Math.min(3, +(s + 0.15).toFixed(2)))} style={{ background: 'transparent', border: 'none', color: '#fff' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 21l-4.35-4.35"/><circle cx="11" cy="11" r="6"/><path d="M11 8v6"/><path d="M8 11h6"/></svg>
                    </button>
                    <button className="btn" title="Zoom out" onClick={() => setScale((s) => Math.max(0.2, +(s - 0.15).toFixed(2)))} style={{ background: 'transparent', border: 'none', color: '#fff' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 21l-4.35-4.35"/><circle cx="11" cy="11" r="6"/><path d="M8 11h6"/></svg>
                    </button>
                    <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.2)' }} />
                    <button className="btn" title="Rotate left" onClick={() => setRotation((r) => (r + 90) % 360)} style={{ background: 'transparent', border: 'none', color: '#fff' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 0-3.16 6.84"/><path d="M21 3v6h-6"/></svg>
                    </button>
                    <button className="btn" title="Rotate right" onClick={() => setRotation((r) => (r - 90) % 360)} style={{ background: 'transparent', border: 'none', color: '#fff' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 1 3.16 6.84"/><path d="M3 3v6h6"/></svg>
                    </button>
                    <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.2)' }} />
                    <button className="btn" title="Reset" onClick={() => { setScale(1); setRotation(0); setOffsetX(0); setOffsetY(0); }} style={{ background: 'transparent', border: 'none', color: '#fff' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 0-9 9"/><polyline points="21 3 21 9 15 9"/></svg>
                    </button>
                  </div>
                </div>
              )}
    </div>
  );
}
