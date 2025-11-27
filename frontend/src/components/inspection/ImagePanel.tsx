import React from "react";
import type { Box } from "../../types/inspection.types";
import AnnotationCanvas from "../AnnotationCanvas";
import { CLASS_COLORS, SCALE_STEP } from "../../constants/inspection.constants";

interface ImagePanelProps {
  title: string;
  src: string | null;
  which: "baseline" | "thermal";
  boxes?: Box[];
  scale: number;
  offX: number;
  offY: number;
  rot: number;
  onScaleChange: (scale: number) => void;
  onOffXChange: (offX: number) => void;
  onOffYChange: (offY: number) => void;
  onRotChange: (rot: number) => void;
  onResetView: () => void;
  addDrawingActive?: boolean;
  newAnomalyClass?: string;
  onAnnotationCreate?: (coords: [number, number, number, number], selectedClass: string) => void;
}

export const ImagePanel: React.FC<ImagePanelProps> = ({
  title,
  src,
  which,
  boxes,
  scale,
  offX,
  offY,
  rot,
  onScaleChange,
  onOffXChange,
  onOffYChange,
  onRotChange,
  onResetView,
  addDrawingActive = false,
  newAnomalyClass = "Loose Joint Faulty",
  onAnnotationCreate,
}) => {
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button && e.button !== 0) return;
    const sx = e.clientX,
      sy = e.clientY;
    const orig = { x: offX, y: offY };

    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - sx,
        dy = ev.clientY - sy;
      onOffXChange(Math.round(orig.x + dx));
      onOffYChange(Math.round(orig.y + dy));
    };

    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    e.preventDefault();
  };

  return (
    <div>
      <h4>{title}</h4>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: 360,
          borderRadius: 8,
          background: "var(--card)",
          border: "1px solid rgba(0, 212, 255, 0.2)",
          overflow: "hidden",
        }}
        onPointerDown={
          which === "thermal" && addDrawingActive ? undefined : onPointerDown
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
              color: "var(--muted)",
            }}
          >
            No {which} image uploaded yet
          </div>
        )}
        {/* Add-mode drawing overlay for thermal image */}
        {which === "thermal" && addDrawingActive && onAnnotationCreate && (
          <AnnotationCanvas
            active={addDrawingActive}
            targetImgId="thermal-image"
            drawShape="bbox"
            selectedClass={newAnomalyClass}
            stroke={CLASS_COLORS[newAnomalyClass] || "#63666f"}
            onAnnotationCreate={onAnnotationCreate}
          />
        )}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
        <button
          className="btn"
          onClick={() => onScaleChange(Math.min(8, scale + SCALE_STEP))}
        >
          Zoom in
        </button>
        <button
          className="btn"
          onClick={() => onScaleChange(Math.max(0.2, scale - SCALE_STEP))}
        >
          Zoom out
        </button>
        <button className="btn" onClick={() => onRotChange(rot - 90)}>
          Rotate ⟲
        </button>
        <button className="btn" onClick={() => onRotChange(rot + 90)}>
          Rotate ⟳
        </button>
        <button className="btn" onClick={onResetView}>
          Reset
        </button>
      </div>
    </div>
  );
};
