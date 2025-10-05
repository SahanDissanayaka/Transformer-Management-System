import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { uploadImage, viewImage, type ImgType, type Weather } from "../api/imageApi";

type Box = { n: [number, number, number, number]; color: string; idx: number; klass: string; conf: number; };
type ImgMeta = { dateTime?: string; weather?: Weather | null; };
type ThermalMeta = ImgMeta & { boxes?: Box[] };

const CLASS_COLORS: Record<string, string> = {
  "Loose Joint Faulty": "#ef4444",
  "Loose Joint Potentially Faulty": "#f59e0b",
  "Point Overload Faulty": "#8b5cf6",
  "Point Overload Potentially Faulty": "#06b6d4",
  "Full Wire Overload (Potentially Faulty)": "#10b981",
  "default": "#3b82f6",
};

function normalizeWeather(w: unknown): Weather | null {
  if (!w || typeof w !== "string") return null;
  const u = w.trim().toUpperCase();
  return u === "SUNNY" || u === "CLOUDY" || u === "RAINY" ? (u as Weather) : null;
}

export default function InspectionDetailPage() {
  const navigate = useNavigate();
  const { transformerNo, inspectionNo } = useParams<{ transformerNo: string; inspectionNo: string }>();

  const [baseline, setBaseline] = useState<string | null>(null);
  const [thermal, setThermal] = useState<string | null>(null);
  const [, setBaselineMeta] = useState<ImgMeta>({});
  const [thermalMeta, setThermalMeta] = useState<ThermalMeta>({});

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
  // Track whether anomaly detection has been run for this inspection's thermal image.
  // We only show the green "No detected errors." message when this is true and there are zero anomalies.
  const [detectionRan, setDetectionRan] = useState(false);

  const SCALE_STEP = 0.15;
  const [scaleB, setScaleB] = useState(1), [offXB, setOffXB] = useState(0), [offYB, setOffYB] = useState(0), [rotB, setRotB] = useState(0);
  const [scaleT, setScaleT] = useState(1), [offXT, setOffXT] = useState(0), [offYT, setOffYT] = useState(0), [rotT, setRotT] = useState(0);

  const onWheel = (which: "baseline" | "thermal") => (e: React.WheelEvent) => {
    e.preventDefault();
    const d = e.deltaY > 0 ? -SCALE_STEP : SCALE_STEP;
    if (which === "baseline") setScaleB(s => Math.max(0.2, Math.min(6, s + d)));
    else setScaleT(s => Math.max(0.2, Math.min(6, s + d)));
  };

  const onPointerDown = (which: "baseline" | "thermal") => (e: React.PointerEvent) => {
    if (e.button && e.button !== 0) return;
    const sx = e.clientX, sy = e.clientY;
    const orig = which === "baseline" ? {x: offXB, y: offYB} : {x: offXT, y: offYT};
    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - sx, dy = ev.clientY - sy;
      if (which === "baseline") { setOffXB(Math.round(orig.x + dx)); setOffYB(Math.round(orig.y + dy)); }
      else { setOffXT(Math.round(orig.x + dx)); setOffYT(Math.round(orig.y + dy)); }
    };
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
    e.preventDefault();
  };

  const resetView = (which: "baseline" | "thermal") => {
    if (which === "baseline") { setScaleB(1); setOffXB(0); setOffYB(0); setRotB(0); }
    else { setScaleT(1); setOffXT(0); setOffYT(0); setRotT(0); }
  };

  useEffect(() => {
    async function load(kind: ImgType) {
      try {
        const r = await viewImage(transformerNo!, inspectionNo!, kind);
        if (r?.responseCode === "2000" && r.responseData) {
          const src = r.responseData.photoBase64 ? `data:image/png;base64,${r.responseData.photoBase64}` : null;
          if (kind === "Baseline") {
            setBaseline(src);
            setBaselineMeta({ dateTime: r.responseData.dateTime, weather: normalizeWeather(r.responseData.weather) });
          } else {
            setThermal(src);
            const anomalies: any[] = r.responseData?.anomaliesResponse?.anomalies || [];
            // If the backend returned an anomaliesResponse field (even an empty array),
            // consider that detection has been run for this stored image.
            if (typeof r.responseData?.anomaliesResponse !== 'undefined') {
              setDetectionRan(true);
            }
            // clear any previous error state when load succeeds
            setErrorMsg(null);
            const boxes: Box[] = anomalies.map((a:any,i:number)=>{
              const n = Array.isArray(a.box) ? a.box : [0,0,0,0];
              const klass = typeof a.class === "string" ? a.class : "Unknown";
              const color = CLASS_COLORS[klass] || CLASS_COLORS.default;
              const conf = typeof a.confidence === "number" ? a.confidence : 0;
              return { n: [n[0],n[1],n[2],n[3]], color, idx: i+1, klass, conf };
            });
            setThermalMeta({ dateTime: r.responseData.dateTime, weather: normalizeWeather(r.responseData.weather), boxes });
          }
        }
      } catch {}
    }
    if (transformerNo && inspectionNo) { load("Baseline"); load("Thermal"); }
  }, [transformerNo, inspectionNo]);

  async function handleSubmit(which: ImgType) {
  setErrorMsg(null);
    if (!transformerNo || !inspectionNo) { setErrorMsg("Missing transformer/inspection id."); return; }
    const file = which === "Baseline" ? baselineFile : thermalFile;
    const weather = which === "Baseline" ? weatherBaseline : weatherThermal;
    if (!file) { setErrorMsg(`Please choose a ${which.toLowerCase()} image first.`); return; }
    which === "Baseline" ? setSubmittingBaseline(true) : setSubmittingThermal(true);
    try {
      const res = await uploadImage(transformerNo, inspectionNo, file, which, weather);
      if (res?.responseCode !== "2000") throw new Error(res?.responseDescription || "Upload failed");

      // If the upload endpoint returned the stored image + anomalies directly
      // (some backends return responseData immediately), use it. Otherwise
      // fall back to fetching the stored image via viewImage.
      const view = (res?.responseData) ? res : await viewImage(transformerNo, inspectionNo, which);
      if (!(view?.responseCode === "2000" && view.responseData)) throw new Error(view?.responseDescription || "Cannot fetch stored image");
      const src = view.responseData.photoBase64 ? `data:image/png;base64,${view.responseData.photoBase64}` : null;
      if (which === "Baseline") {
        setBaseline(src);
        setBaselineMeta({ dateTime: view.responseData.dateTime, weather: normalizeWeather(view.responseData.weather) });
        setBaselineFile(null);
      } else {
        setThermal(src);
        const anomalies: any[] = view.responseData?.anomaliesResponse?.anomalies || [];
          // clear any previous error state when upload & detection succeed
          setErrorMsg(null);
        // After an upload we attempted detection; mark that detection has been run (even if it returned zero anomalies)
        setDetectionRan(true);
        const boxes: Box[] = anomalies.map((a:any,i:number)=>{
          const n = Array.isArray(a.box) ? a.box : [0,0,0,0];
          const klass = typeof a.class === "string" ? a.class : "Unknown";
          const color = CLASS_COLORS[klass] || CLASS_COLORS.default;
          const conf = typeof a.confidence === "number" ? a.confidence : 0;
          return { n: [n[0],n[1],n[2],n[3]], color, idx: i+1, klass, conf };
        });
        setThermalMeta({ dateTime: view.responseData.dateTime, weather: normalizeWeather(view.responseData.weather), boxes });
        setThermalFile(null);
      }
    } catch (e:any) {
  setErrorMsg(e?.response?.data?.responseDescription || e?.message || "Upload/view failed");
    } finally {
      which === "Baseline" ? setSubmittingBaseline(false) : setSubmittingThermal(false);
    }
  }

  const ImagePanel = ({ title, src, which, boxes } : { title: string; src: string | null; which: "baseline"|"thermal"; boxes?: Box[] }) => {
    const isB = which === "baseline";
    const scale = isB ? scaleB : scaleT;
    const offX = isB ? offXB : offXT;
    const offY = isB ? offYB : offYT;
    const rot = isB ? rotB : rotT;
    return (
      <div>
        <h4>{title}</h4>
        <div style={{ position:"relative", width:"100%", height:360, borderRadius:8, background:"#f8fafc", border:"1px solid #e5e7eb", overflow:"hidden" }} onWheel={onWheel(which)} onPointerDown={onPointerDown(which)}>
          {src ? (
            <div style={{ position:"absolute", left:`calc(50% + ${offX}px)`, top:`calc(50% + ${offY}px)`, transform:`translate(-50%, -50%) scale(${scale}) rotate(${rot}deg)`, transformOrigin:"center center" }}>
              <img src={src} alt={title} style={{ display:"block", maxWidth:"100%", maxHeight:360, objectFit:"contain", pointerEvents:"none" }}/>
              {boxes && boxes.length > 0 && (
                <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
                  {boxes.map(b => {
                    const [x1,y1,x2,y2] = b.n;
                    const left = `${Math.min(x1,x2)*100}%`;
                    const top = `${Math.min(y1,y2)*100}%`;
                    const width = `${Math.abs(x2-x1)*100}%`;
                    const height = `${Math.abs(y2-y1)*100}%`;
                    return (
                      <div key={b.idx} style={{ position:"absolute", left, top, width, height, border:`0.5px solid ${b.color}`, boxSizing:'border-box', borderRadius:0 }}>
                        {/* combined pill: confidence (dark) + index (color) */}
                        <div style={{ position:"absolute", left:"50%", top:-12, transform:"translateX(-50%)", display:"flex", alignItems:"center", borderRadius:999, overflow:"hidden", boxShadow:'0 1px 2px rgba(0,0,0,0.12)' }}>
                          <div style={{ background:"rgba(0,0,0,0.6)", color:"#fff", padding:"1px 6px", fontSize:5, lineHeight:1 }}>{(b.conf*100).toFixed(0)}%</div>
                          <div style={{ background:b.color, color:"#fff", padding:"1px 6px", fontSize:5, lineHeight:1, fontWeight:700 }}>#{b.idx}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (<div style={{ position:"absolute", inset:0, display:"grid", placeItems:"center", color:"#64748b" }}>No {which} image uploaded yet</div>)}
        </div>
        <div style={{ display:"flex", gap:8, marginTop:8 }}>
          <button className="btn" onClick={() => isB ? setScaleB(s=>Math.min(6,s+SCALE_STEP)) : setScaleT(s=>Math.min(6,s+SCALE_STEP))}>Zoom in</button>
          <button className="btn" onClick={() => isB ? setScaleB(s=>Math.max(0.2,s-SCALE_STEP)) : setScaleT(s=>Math.max(0.2,s-SCALE_STEP))}>Zoom out</button>
          <button className="btn" onClick={() => isB ? setRotB(r=>r-90) : setRotT(r=>r-90)}>Rotate ⟲</button>
          <button className="btn" onClick={() => isB ? setRotB(r=>r+90) : setRotT(r=>r+90)}>Rotate ⟳</button>
          <button className="btn" onClick={() => resetView(which)}>Reset</button>
        </div>
      </div>
    );
  };

  return (
    <div className="container">
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
        <button className="btn" onClick={() => navigate(-1)}>← Back</button>
        <h2 style={{ margin:0 }}>Inspection: {inspectionNo}</h2>
        <div style={{ marginLeft:"auto", opacity:0.75 }}>Transformer: <strong>{transformerNo}</strong></div>
      </div>

  {errorMsg && (<div style={{padding:12, background:"#FEF2F2", color:"#991B1B", border:"1px solid #FCA5A5", borderRadius:8, marginBottom:12}}>{errorMsg}</div>)}

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop:0 }}>Upload Images</h3>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <div style={{ display:"grid", gap:8, minWidth:280 }}>
            <label><strong>Baseline</strong></label>
            <label>Weather</label>
            <select className="input" value={weatherBaseline} onChange={e=>setWeatherBaseline(e.target.value as Weather)}>
              <option value="SUNNY">Sunny</option><option value="CLOUDY">Cloudy</option><option value="RAINY">Rainy</option>
            </select>
            <input type="file" accept="image/*" onChange={(e)=>{ const f = e.target.files?.[0] ?? null; setBaselineFile(f); }} />
            {baselineFile && <div style={{ fontSize:12, opacity:0.8 }}>Selected: <em>{baselineFile.name}</em></div>}
            <button className="btn primary" onClick={()=>handleSubmit("Baseline")} disabled={submittingBaseline}>{submittingBaseline ? "Uploading…" : "Submit Baseline"}</button>
          </div>
          <div style={{ display:"grid", gap:8, minWidth:280 }}>
            <label><strong>Thermal</strong></label>
            <label>Weather</label>
            <select className="input" value={weatherThermal} onChange={e=>setWeatherThermal(e.target.value as Weather)}>
              <option value="SUNNY">Sunny</option><option value="CLOUDY">Cloudy</option><option value="RAINY">Rainy</option>
            </select>
            <input type="file" accept="image/*" onChange={(e)=>{ const f = e.target.files?.[0] ?? null; setThermalFile(f); }} />
            {thermalFile && <div style={{ fontSize:12, opacity:0.8 }}>Selected: <em>{thermalFile.name}</em></div>}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button className="btn primary" onClick={()=>handleSubmit("Thermal")} disabled={submittingThermal}>{submittingThermal ? "Uploading & Detecting\u001A" : "Submit Thermal"}</button>
              <button className="btn" onClick={() => setShowRulesModal(true)} aria-haspopup="dialog">Rules</button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <ImagePanel title="Baseline Image" src={baseline} which="baseline" />
        <ImagePanel title="Thermal Image" src={thermal} which="thermal" boxes={thermalMeta.boxes} />
      </div>

      <div className="card" style={{ marginTop:16 }}>
        <h3 style={{ marginTop:0 }}>Version 1 Errors</h3>
        {thermalMeta.boxes && thermalMeta.boxes.length > 0 ? (
          <div style={{ display:"grid", gap:8 }}>
            {thermalMeta.boxes.map(b => {
              const [x1,y1,x2,y2] = b.n;
              return (
                <div key={b.idx} style={{ display:"flex", gap:12, alignItems:"center", background:"#f1f5f9", padding:"8px 12px", borderRadius:8 }}>
                  <span style={{ background:b.color, color:"#fff", borderRadius:999, padding:"2px 8px", fontWeight:700 }}>#{b.idx}</span>
                  <div style={{ fontWeight:600 }}>{b.klass}</div>
                  <div style={{ marginLeft:"auto", fontSize:12, opacity:0.85 }}>Confidence: {(b.conf*100).toFixed(0)}%</div>
                  <div style={{ fontSize:12, opacity:0.7 }}>Box: [{x1.toFixed(3)}, {y1.toFixed(3)}, {x2.toFixed(3)}, {y2.toFixed(3)}]</div>
                </div>
              );
            })}
          </div>
        ) : (
          // Only show "No detected errors" after detection has actually run and returned no anomalies.
          detectionRan ? (
            <div style={{ padding:12, background: "#ECFDF5", color: "#065F46", border: "1px solid #A7F3D0", borderRadius:8 }}>
              No detected errors.
            </div>
          ) : (
            // Detection has not run yet for this thermal image; show a subtle placeholder instead of the green message.
            <div style={{ padding:12, color: "#64748b" }}>No detection run yet for this inspection.</div>
          )
        )}
      </div>

      {/* Rules modal (client-side only) */}
      {showRulesModal && (
        <div role="dialog" aria-modal="true" style={{ position:'fixed', inset:0, display:'grid', placeItems:'center', background:'rgba(0,0,0,0.3)', zIndex:50 }}>
          <div style={{ width:900, maxWidth:'95%', background:'#fff', borderRadius:14, padding:28, boxShadow:'0 20px 40px rgba(2,6,23,0.12)', position:'relative' }}>
            {/* close button top-right */}
            <button onClick={() => setShowRulesModal(false)} aria-label="Close" style={{ position:'absolute', right:20, top:18, width:48, height:48, borderRadius:12, border:'none', background:'#f3f4f6', display:'grid', placeItems:'center', boxShadow:'0 6px 18px rgba(2,6,23,0.06)', cursor:'pointer' }}>×</button>

            <h1 style={{ margin:0, fontSize:36, fontWeight:700 }}>Error Ruleset</h1>
            <div style={{ marginTop:20, display:'grid', gridTemplateColumns:'1fr 220px', gap:24, alignItems:'start' }}>
              <div>
                <h2 style={{ margin:'0 0 8px 0', fontSize:24 }}>Temperature Dereference</h2>
                <div style={{ color:'#6b7280', fontSize:16, marginBottom:18 }}>Temperature deference between baseline and maintenance images.</div>

                <div style={{ marginTop:8, display:'grid', gap:18 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ fontWeight:600, fontSize:18 }}>Rule 2</div>
                    <div style={{ marginLeft:'auto' }}>
                      <div onClick={() => setRule2Enabled(r=>!r)} role="switch" aria-checked={rule2Enabled} style={{ width:46, height:26, borderRadius:20, background: rule2Enabled ? '#5b21b6' : '#e6e7ea', position:'relative', cursor:'pointer' }}>
                        <div style={{ width:20, height:20, borderRadius:12, background:'#fff', position:'absolute', top:3, left: rule2Enabled ? 22 : 4, transition:'left 120ms linear' }} />
                      </div>
                    </div>
                  </div>
                  <div style={{ color:'#9CA3AF' }}>Rule Description</div>

                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ fontWeight:600, fontSize:18 }}>Rule 3</div>
                    <div style={{ marginLeft:'auto' }}>
                      <div onClick={() => setRule3Enabled(r=>!r)} role="switch" aria-checked={rule3Enabled} style={{ width:46, height:26, borderRadius:20, background: rule3Enabled ? '#5b21b6' : '#e6e7ea', position:'relative', cursor:'pointer' }}>
                        <div style={{ width:20, height:20, borderRadius:12, background:'#fff', position:'absolute', top:3, left: rule3Enabled ? 22 : 4, transition:'left 120ms linear' }} />
                      </div>
                    </div>
                  </div>
                  <div style={{ color:'#9CA3AF' }}>Rule Description</div>
                </div>
              </div>

              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:18 }}>
                <div style={{ width:'100%', background:'#fff', borderRadius:16, padding:18, boxShadow:'0 6px 18px rgba(2,6,23,0.04)', display:'flex', justifyContent:'center', alignItems:'center' }}>
                  <select value={tempThreshold} onChange={e=>setTempThreshold(e.target.value)} style={{ padding:'10px 14px', borderRadius:12, border:'1px solid #eef2f7', fontSize:16 }}>
                    <option>10%</option>
                    <option>15%</option>
                    <option>20%</option>
                    <option>25%</option>
                  </select>
                </div>

                <div style={{ width:'100%', display:'flex', flexDirection:'column', alignItems:'stretch', gap:12 }}>
                  <button className='btn primary' onClick={() => setShowRulesModal(false)} style={{ padding:'10px 18px', borderRadius:12, boxShadow:'0 8px 24px rgba(99,102,241,0.18)' }}>Save</button>
                  <button className='btn' onClick={() => setShowRulesModal(false)} style={{ padding:'10px 18px', borderRadius:12, background:'#f8fafc' }}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop:16 }}>
        <h3 style={{ marginTop:0 }}>Notes</h3>
        <textarea className="input" placeholder="Type here to add notes…" value={notes} onChange={(e)=>setNotes(e.target.value)} rows={4} />
        <div style={{ display:"flex", gap:12, marginTop:8 }}>
          <button className="btn primary">Confirm</button>
          <button className="btn">Cancel</button>
        </div>
      </div>
    </div>
  );
}
