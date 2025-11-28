import { useState, useCallback, useEffect } from "react";
import { uploadImage, viewImage, type ImgType, type Weather } from "../api/imageDataApi";
import type { Box, ThermalMeta, FeedbackLog, AnomalyResponse } from "../types/inspection.types";
import { normalizeWeather, mapAnomaliestoBoxes } from "../utils/inspectionHelpers";

export function useInspectionDetail(transformerNo?: string, inspectionNo?: string) {
  const [baseline, setBaseline] = useState<string | null>(null);
  const [thermal, setThermal] = useState<string | null>(null);
  const [thermalMeta, setThermalMeta] = useState<ThermalMeta>({});
  const [originalAnomalies, setOriginalAnomalies] = useState<AnomalyResponse[]>([]);
  const [removedAnomalies, setRemovedAnomalies] = useState<Box[]>([]);
  const [feedbackLog, setFeedbackLog] = useState<FeedbackLog[]>([]);
  
  const [weatherBaseline, setWeatherBaseline] = useState<Weather>("SUNNY");
  const [weatherThermal, setWeatherThermal] = useState<Weather>("SUNNY");
  const [baselineFile, setBaselineFile] = useState<File | null>(null);
  const [thermalFile, setThermalFile] = useState<File | null>(null);
  
  const [submittingBaseline, setSubmittingBaseline] = useState(false);
  const [submittingThermal, setSubmittingThermal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [detectionRan, setDetectionRan] = useState(false);

  const loadFeedbackLogs = useCallback(async () => {
    if (!transformerNo || !inspectionNo) return;
    
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
        const logs = typeof data.responseData.logs === "string" ? JSON.parse(data.responseData.logs) : data.responseData.logs;
        setFeedbackLog(Array.isArray(logs) ? logs : [logs]);
      }
    } catch (error) {
      console.error("Error loading feedback logs:", error);
    }
  }, [transformerNo, inspectionNo]);

  useEffect(() => {
    async function load(kind: ImgType) {
      if (!transformerNo || !inspectionNo) return;
      
      try {
        const r = await viewImage(transformerNo, inspectionNo, kind);
        if (r?.responseCode === "2000" && r.responseData) {
          const src = r.responseData.photoBase64 ? `data:image/png;base64,${r.responseData.photoBase64}` : null;
          
          if (kind === "Baseline") {
            setBaseline(src);
          } else {
            setThermal(src);
            const anomalies: AnomalyResponse[] = r.responseData?.anomaliesResponse?.anomalies || [];
            setOriginalAnomalies(anomalies);
            
            if (typeof r.responseData?.anomaliesResponse !== "undefined") {
              setDetectionRan(true);
            }
            setErrorMsg(null);
            
            const boxes = mapAnomaliestoBoxes(anomalies);
            setThermalMeta({ dateTime: r.responseData.dateTime, weather: normalizeWeather(r.responseData.weather), boxes });

            if (r.responseData.logs) {
              const logs = typeof r.responseData.logs === "string" ? JSON.parse(r.responseData.logs) : r.responseData.logs;
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

  const handleSubmit = async (which: ImgType) => {
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
      const res = await uploadImage(transformerNo, inspectionNo, file, which, weather);
      if (res?.responseCode !== "2000") throw new Error(res?.responseDescription || "Upload failed");

      const view = res?.responseData ? res : await viewImage(transformerNo, inspectionNo, which);
      if (!(view?.responseCode === "2000" && view.responseData)) throw new Error(view?.responseDescription || "Cannot fetch stored image");
      
      const src = view.responseData.photoBase64 ? `data:image/png;base64,${view.responseData.photoBase64}` : null;

      if (which === "Baseline") {
        setBaseline(src);
        setBaselineFile(null);
      } else {
        setThermal(src);
        const anomalies: AnomalyResponse[] = view.responseData?.anomaliesResponse?.anomalies || [];
        setOriginalAnomalies(anomalies);
        setErrorMsg(null);
        setDetectionRan(true);

        const boxes = mapAnomaliestoBoxes(anomalies);
        setThermalMeta({ dateTime: view.responseData.dateTime, weather: normalizeWeather(view.responseData.weather), boxes });
        setThermalFile(null);
      }
    } catch (e) {
      const error = e as { response?: { data?: { responseDescription?: string } }; message?: string };
      setErrorMsg(error?.response?.data?.responseDescription || error?.message || "Upload/view failed");
    } finally {
      if (which === "Baseline") {
        setSubmittingBaseline(false);
      } else {
        setSubmittingThermal(false);
      }
    }
  };

    return {
    baseline,
    thermal,
    thermalMeta,
      originalAnomalies,
    setThermalMeta,
    removedAnomalies,
    setRemovedAnomalies,
    feedbackLog,
    setFeedbackLog,
    weatherBaseline,
    setWeatherBaseline,
    weatherThermal,
    setWeatherThermal,
    baselineFile,
    setBaselineFile,
    thermalFile,
    setThermalFile,
    submittingBaseline,
    submittingThermal,
    errorMsg,
    setErrorMsg,
    detectionRan,
    handleSubmit,
  };
}
