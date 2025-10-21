import { useState, useRef } from "react";
import type { Annotation } from "../types";

interface AnnotationCanvasProps {
  imageUrl: string | null;
  annotations: Annotation[];
  scale: number;
  offsetX: number;
  offsetY: number;
  rotation: number;
  isEditMode: boolean;
  isDrawMode: boolean;
  drawShape?: 'bbox' | 'polygon';
  selectedAnnotationId: string | null;
  currentUser: string;
  onAnnotationUpdate: (annotation: Annotation) => void;
  onAnnotationDelete: (annotationId: string) => void;
  onAnnotationCreate: (
    bbox: [number, number, number, number],
    className: string,
    polygon?: Array<[number, number]>,
    shape?: 'bbox' | 'polygon'
  ) => void;
  onAnnotationSelect: (annotationId: string | null) => void;
}

type DragHandle = "tl" | "tr" | "bl" | "br" | "move" | null;

export default function AnnotationCanvas({
  imageUrl,
  annotations,
  scale,
  offsetX,
  offsetY,
  rotation,
  isEditMode,
  isDrawMode,
  drawShape = 'bbox',
  selectedAnnotationId,
  currentUser,
  onAnnotationUpdate,
  onAnnotationDelete,
  onAnnotationCreate,
  onAnnotationSelect,
}: AnnotationCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  // Drawing new annotation
  const [drawingStart, setDrawingStart] = useState<{ x: number; y: number } | null>(null);
  const [drawingCurrent, setDrawingCurrent] = useState<{ x: number; y: number } | null>(null);
  const [polyPoints, setPolyPoints] = useState<Array<[number, number]>>([]);
  
  // Dragging/resizing existing annotation
  const [draggedHandle, setDraggedHandle] = useState<DragHandle>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; bbox: [number, number, number, number] } | null>(null);

  const handleImageLoad = () => {
    // Image loaded and ready for annotations
  };

  // Convert screen coordinates to normalized image coordinates
  const screenToNormalized = (screenX: number, screenY: number): { x: number; y: number } => {
    if (!containerRef.current || !imageRef.current) return { x: 0, y: 0 };
    
    const imageRect = imageRef.current.getBoundingClientRect();
    
    const relX = screenX - imageRect.left;
    const relY = screenY - imageRect.top;
    
    const normX = Math.max(0, Math.min(1, relX / imageRect.width));
    const normY = Math.max(0, Math.min(1, relY / imageRect.height));
    
    return { x: normX, y: normY };
  };

  // Handle mouse down for drawing new annotations
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEditMode) return;
    if (isDrawMode) {
      e.preventDefault();
      e.stopPropagation();
      const coords = screenToNormalized(e.clientX, e.clientY);
      if (drawShape === 'polygon') {
        // Add point to polygon sequence
        setPolyPoints((pts) => [...pts, [coords.x, coords.y]]);
      } else {
        setDrawingStart(coords);
        setDrawingCurrent(coords);
      }
      onAnnotationSelect(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isEditMode) return;
    
    // Drawing new annotation
    if (isDrawMode && drawShape === 'bbox' && drawingStart) {
      e.preventDefault();
      const coords = screenToNormalized(e.clientX, e.clientY);
      setDrawingCurrent(coords);
      return;
    }
    
    // Resizing/moving existing annotation
    if (draggedHandle && dragStart && selectedAnnotationId) {
      const coords = screenToNormalized(e.clientX, e.clientY);
      const dx = coords.x - dragStart.x;
      const dy = coords.y - dragStart.y;
      
      const [x1, y1, x2, y2] = dragStart.bbox;
      let newBbox: [number, number, number, number] = [x1, y1, x2, y2];
      
      switch (draggedHandle) {
        case "tl":
          newBbox = [
            Math.max(0, Math.min(x2 - 0.01, x1 + dx)),
            Math.max(0, Math.min(y2 - 0.01, y1 + dy)),
            x2,
            y2
          ];
          break;
        case "tr":
          newBbox = [
            x1,
            Math.max(0, Math.min(y2 - 0.01, y1 + dy)),
            Math.min(1, Math.max(x1 + 0.01, x2 + dx)),
            y2
          ];
          break;
        case "bl":
          newBbox = [
            Math.max(0, Math.min(x2 - 0.01, x1 + dx)),
            y1,
            x2,
            Math.min(1, Math.max(y1 + 0.01, y2 + dy))
          ];
          break;
        case "br":
          newBbox = [
            x1,
            y1,
            Math.min(1, Math.max(x1 + 0.01, x2 + dx)),
            Math.min(1, Math.max(y1 + 0.01, y2 + dy))
          ];
          break;
        case "move":
          const width = x2 - x1;
          const height = y2 - y1;
          const newX1 = Math.max(0, Math.min(1 - width, x1 + dx));
          const newY1 = Math.max(0, Math.min(1 - height, y1 + dy));
          newBbox = [newX1, newY1, newX1 + width, newY1 + height];
          break;
      }
      
  const annotation = (annotations || []).find(a => a.id === selectedAnnotationId);
      if (annotation) {
        onAnnotationUpdate({
          ...annotation,
          bbox: newBbox,
          modifiedBy: currentUser,
          modifiedAt: new Date().toISOString(),
          annotationType: 'EDITED',
        });
      }
    }
  };

  const handleMouseUp = () => {
    if (!isEditMode) return;
    
    // Complete drawing new annotation
    if (isDrawMode && drawShape === 'bbox' && drawingStart && drawingCurrent) {
      const x1 = Math.min(drawingStart.x, drawingCurrent.x);
      const y1 = Math.min(drawingStart.y, drawingCurrent.y);
      const x2 = Math.max(drawingStart.x, drawingCurrent.x);
      const y2 = Math.max(drawingStart.y, drawingCurrent.y);
      // Only create if box has minimum size
      if (x2 - x1 > 0.01 && y2 - y1 > 0.01) {
        onAnnotationCreate([x1, y1, x2, y2], "Unknown", undefined, 'bbox');
      } else {
        // too small
      }
      
      setDrawingStart(null);
      setDrawingCurrent(null);
    }
    
    // Complete dragging/resizing
    if (draggedHandle) {
      setDraggedHandle(null);
      setDragStart(null);
    }
  };

  // Finalize polygon (on double click)
  const handleDoubleClick = () => {
    if (!isEditMode || !isDrawMode || drawShape !== 'polygon') return;
    if (polyPoints.length >= 3) {
      const xs = polyPoints.map(([x]) => x);
      const ys = polyPoints.map(([, y]) => y);
      const x1 = Math.max(0, Math.min(...xs));
      const y1 = Math.max(0, Math.min(...ys));
      const x2 = Math.min(1, Math.max(...xs));
      const y2 = Math.min(1, Math.max(...ys));
      onAnnotationCreate([x1, y1, x2, y2], 'Unknown', polyPoints, 'polygon');
      setPolyPoints([]);
    }
  };

  // Cancel polygon with ESC
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isEditMode && isDrawMode && drawShape === 'polygon' && e.key === 'Escape') {
      setPolyPoints([]);
    }
  };

  const startDrag = (annotationId: string, handle: DragHandle, bbox: [number, number, number, number]) => (e: React.MouseEvent) => {
    if (!isEditMode || isDrawMode) return;
    e.stopPropagation();
    
    const coords = screenToNormalized(e.clientX, e.clientY);
    setDraggedHandle(handle);
    setDragStart({ x: coords.x, y: coords.y, bbox });
    onAnnotationSelect(annotationId);
  };

  const renderAnnotations = () => {
    if (!imageRef.current) return null;
    
  // Defensive: annotations may be undefined if parent state was incorrectly set by API
  const visibleAnnotations = (annotations || []).filter(a => !a.isDeleted);
    
    return visibleAnnotations.map((annotation) => {
      const [x1, y1, x2, y2] = annotation.bbox;
      const left = `${Math.min(x1, x2) * 100}%`;
      const top = `${Math.min(y1, y2) * 100}%`;
      const width = `${Math.abs(x2 - x1) * 100}%`;
      const height = `${Math.abs(y2 - y1) * 100}%`;
      
      const isSelected = annotation.id === selectedAnnotationId;
      const isEditable = isEditMode && !isDrawMode;
      
      return (
        <div
          key={annotation.id}
          style={{
            position: "absolute",
            left,
            top,
            width,
            height,
            border: `2px solid ${annotation.color}`,
            boxSizing: "border-box",
            borderRadius: 2,
            background: isSelected ? `${annotation.color}15` : "transparent",
            cursor: isEditable ? "move" : "pointer",
            pointerEvents: isEditMode ? "auto" : "none",
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (isEditMode && !isDrawMode) {
              onAnnotationSelect(annotation.id);
            }
          }}
          onMouseDown={isEditable ? startDrag(annotation.id, "move", annotation.bbox) : undefined}
        >
          {/* Label with confidence/source */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: -20,
              transform: "translateX(-50%)",
              display: "flex",
              alignItems: "center",
              borderRadius: 999,
              overflow: "hidden",
              boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
              fontSize: 11,
              whiteSpace: "nowrap",
              pointerEvents: "none",
            }}
          >
            {annotation.source === "AI" && annotation.confidence !== undefined && (
              <div style={{ background: "rgba(0,0,0,0.7)", color: "#fff", padding: "2px 8px" }}>
                {(annotation.confidence * 100).toFixed(0)}%
              </div>
            )}
            <div style={{ background: annotation.color, color: "#fff", padding: "2px 8px", fontWeight: 700 }}>
              {annotation.source === "USER" ? "👤" : "🤖"}
            </div>
          </div>
          
          {/* Polygon path (if polygon) */}
          {annotation.shape === 'polygon' && annotation.polygon && (
            <svg
              viewBox={`0 0 100 100`}
              style={{ position: 'absolute', inset: 0 }}
              preserveAspectRatio="none"
            >
              <polygon
                points={annotation.polygon.map(([px, py]) => `${(px - x1) / (x2 - x1) * 100},${(py - y1) / (y2 - y1) * 100}`).join(' ')}
                fill="none"
                stroke={annotation.color}
                strokeWidth={1}
              />
            </svg>
          )}

          {/* Resize handles (only when selected and in edit mode) */}
          {isSelected && isEditable && (
            <>
              {["tl", "tr", "bl", "br"].map((handle) => {
                const handleStyle: React.CSSProperties = {
                  position: "absolute",
                  width: 10,
                  height: 10,
                  background: "#fff",
                  border: `2px solid ${annotation.color}`,
                  borderRadius: "50%",
                  cursor: handle.includes("t") && handle.includes("l") ? "nwse-resize" :
                          handle.includes("t") && handle.includes("r") ? "nesw-resize" :
                          handle.includes("b") && handle.includes("l") ? "nesw-resize" : "nwse-resize",
                  zIndex: 10,
                };
                
                if (handle === "tl") {
                  handleStyle.top = -5;
                  handleStyle.left = -5;
                } else if (handle === "tr") {
                  handleStyle.top = -5;
                  handleStyle.right = -5;
                } else if (handle === "bl") {
                  handleStyle.bottom = -5;
                  handleStyle.left = -5;
                } else {
                  handleStyle.bottom = -5;
                  handleStyle.right = -5;
                }
                
                return (
                  <div
                    key={handle}
                    style={handleStyle}
                    onMouseDown={startDrag(annotation.id, handle as DragHandle, annotation.bbox)}
                  />
                );
              })}
              
              {/* Delete button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Delete annotation "${annotation.className}"?`)) {
                    onAnnotationDelete(annotation.id);
                  }
                }}
                style={{
                  position: "absolute",
                  top: -10,
                  right: -10,
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  border: "2px solid #EF4444",
                  background: "#FEE2E2",
                  color: "#EF4444",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                  zIndex: 10,
                }}
              >
                ✕
              </button>
            </>
          )}
        </div>
      );
    });
  };

  const renderDrawingBox = () => {
    if (!isDrawMode) return null;
    if (drawShape === 'bbox') {
      if (!drawingStart || !drawingCurrent) return null;
      const x1 = Math.min(drawingStart.x, drawingCurrent.x);
      const y1 = Math.min(drawingStart.y, drawingCurrent.y);
      const x2 = Math.max(drawingStart.x, drawingCurrent.x);
      const y2 = Math.max(drawingStart.y, drawingCurrent.y);
      return (
        <div
          style={{
            position: "absolute",
            left: `${x1 * 100}%`,
            top: `${y1 * 100}%`,
            width: `${(x2 - x1) * 100}%`,
            height: `${(y2 - y1) * 100}%`,
            border: "2px dashed #4F46E5",
            background: "rgba(79, 70, 229, 0.1)",
            pointerEvents: "none",
          }}
        />
      );
    } else {
      if (polyPoints.length === 0) return null;
      return (
        <svg style={{ position: 'absolute', inset: 0 }} viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline
            points={polyPoints.map(([px, py]) => `${px * 100},${py * 100}`).join(' ')}
            fill="none"
            stroke="#4F46E5"
            strokeDasharray="4 2"
            strokeWidth={1}
          />
        </svg>
      );
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        cursor: isDrawMode ? "crosshair" : "default",
        overflow: "hidden",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      onMouseLeave={handleMouseUp}
    >
      {imageUrl && (
        <div
          style={{
            position: "absolute",
            left: `calc(50% + ${offsetX}px)`,
            top: `calc(50% + ${offsetY}px)`,
            transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`,
            transformOrigin: "center center",
            pointerEvents: isEditMode ? "auto" : "none",
          }}
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Annotatable"
            style={{
              display: "block",
              maxWidth: "100%",
              maxHeight: "100%",
              userSelect: "none",
              pointerEvents: "none",
            }}
            onLoad={handleImageLoad}
            draggable={false}
          />
          
          {/* Annotation overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "auto",
              cursor: isDrawMode ? "crosshair" : isEditMode ? "pointer" : "default",
            }}
          >
            {renderAnnotations()}
            {renderDrawingBox()}
          </div>
        </div>
      )}
      
      {!imageUrl && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            color: "#64748b",
          }}
        >
          No image uploaded yet
        </div>
      )}
    </div>
  );
}
