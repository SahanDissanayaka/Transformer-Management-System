import { useState, useEffect } from "react";

interface AnnotationToolbarProps {
  isEditMode: boolean;
  isDrawMode: boolean;
  selectedAnnotationId: string | null;
  selectedAnnotation: any;
  newAnnotationPending: boolean;
  onToggleEditMode: () => void;
  onToggleDrawMode: () => void;
  onSaveAnnotation: (className: string, comment: string) => void;
  onCancelEdit: () => void;
  onAcceptAnnotation?: (annotationId: string) => void;
  onRejectAnnotation?: (annotationId: string) => void;
  onFaultTypeChange?: (faultType: string) => void; // Callback to communicate fault type selection
  drawShape?: 'bbox' | 'polygon';
  onDrawShapeChange?: (shape: 'bbox' | 'polygon') => void;
}

const FAULT_TYPES = [
  "Loose Joint Faulty",
  "Loose Joint Potentially Faulty",
  "Point Overload Faulty",
  "Point Overload Potentially Faulty",
  "Full Wire Overload (Potentially Faulty)",
  "Unknown",
];

export default function AnnotationToolbar({
  isEditMode,
  isDrawMode,
  selectedAnnotationId,
  selectedAnnotation,
  newAnnotationPending,
  onToggleEditMode,
  onToggleDrawMode,
  onSaveAnnotation,
  onCancelEdit,
  onAcceptAnnotation,
  onRejectAnnotation,
  onFaultTypeChange,
  drawShape = 'bbox',
  onDrawShapeChange,
}: AnnotationToolbarProps) {
  const [className, setClassName] = useState(selectedAnnotation?.className || "Unknown");
  const [comment, setComment] = useState(selectedAnnotation?.comment || "");
  const [showEditPanel, setShowEditPanel] = useState(false);

  // Update fields when a new annotation is selected
  useEffect(() => {
    if (selectedAnnotation) {
      setClassName(selectedAnnotation.className || "Unknown");
      setComment(selectedAnnotation.comment || "");
      // Auto-open panel for new annotations
      if (newAnnotationPending) {
        setShowEditPanel(true);
      }
    }
  }, [selectedAnnotation, selectedAnnotationId, newAnnotationPending]);

  // Communicate fault type changes to parent
  useEffect(() => {
    if (onFaultTypeChange) {
      onFaultTypeChange(className);
    }
  }, [className, onFaultTypeChange]);

  const handleSave = () => {
    onSaveAnnotation(className, comment);
    setShowEditPanel(false);
  };

  const handleCancel = () => {
    setShowEditPanel(false);
    setClassName(selectedAnnotation?.className || "Unknown");
    setComment(selectedAnnotation?.comment || "");
    onCancelEdit();
  };

  const isAIAnnotation = selectedAnnotation?.source === "AI";
  const annotationStatus = selectedAnnotation?.status; // 'pending', 'accepted', 'rejected'

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: 12,
        padding: 16,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <div style={{ fontWeight: 600, fontSize: 15, color: "#111827" }}>
          🛠️ Annotation Tools
        </div>
        
  <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: 'center' }}>
          {/* Edit Mode Toggle */}
          <button
            onClick={onToggleEditMode}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: isEditMode ? "2px solid #4F46E5" : "1px solid #D1D5DB",
              background: isEditMode ? "#EEF2FF" : "#FFFFFF",
              color: isEditMode ? "#4F46E5" : "#6B7280",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>{isEditMode ? "✓" : "✎"}</span>
            {isEditMode ? "Edit Mode ON" : "Enable Edit Mode"}
          </button>

          {isEditMode && (
            <button
              onClick={onToggleDrawMode}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: isDrawMode ? "2px solid #10B981" : "1px solid #D1D5DB",
                background: isDrawMode ? "#ECFDF5" : "#FFFFFF",
                color: isDrawMode ? "#10B981" : "#6B7280",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>✏️</span>
              {isDrawMode ? "Drawing..." : "Draw New"}
            </button>
          )}

          {isEditMode && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: '#6B7280' }}>Shape</span>
              <select
                value={drawShape}
                onChange={(e) => onDrawShapeChange && onDrawShapeChange(e.target.value as 'bbox' | 'polygon')}
                style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 13 }}
              >
                <option value="bbox">Box</option>
                <option value="polygon">Polygon</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div
        style={{
          background: "#F9FAFB",
          border: "1px solid #E5E7EB",
          borderRadius: 8,
          padding: 12,
          fontSize: 13,
          color: "#6B7280",
        }}
      >
        {!isEditMode && (
          <div>
            <strong>View Mode:</strong> Click "Enable Edit Mode" to start editing annotations.
          </div>
        )}
        {isEditMode && !isDrawMode && !selectedAnnotationId && (
          <div>
            <strong>Edit Mode:</strong> Click on an annotation to select it, or click "Draw New" to add annotations.
          </div>
        )}
        {isEditMode && isDrawMode && (
          <div>
            <strong>Draw Mode:</strong> Click and drag on the image to draw a bounding box. Click "Drawing..." to stop.
          </div>
        )}
        {isEditMode && !isDrawMode && selectedAnnotationId && (
          <div>
            <strong>Selected:</strong> Drag corners to resize, drag box to move{isAIAnnotation ? ", or accept/reject the AI detection" : ""}.
            <button
              onClick={() => setShowEditPanel(!showEditPanel)}
              style={{
                marginLeft: 12,
                padding: "4px 12px",
                borderRadius: 6,
                border: "none",
                background: "#4F46E5",
                color: "#FFFFFF",
                fontWeight: 600,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              {showEditPanel ? "Hide Details" : "Edit Details"}
            </button>
          </div>
        )}
      </div>

      {/* Quick Actions for AI Annotations */}
      {isEditMode && selectedAnnotationId && isAIAnnotation && annotationStatus === 'pending' && !showEditPanel && (
        <div style={{ marginTop: 12, display: "flex", gap: 8, padding: "12px", background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: 8 }}>
          <div style={{ flex: 1, fontSize: 13, color: "#92400E" }}>
            <strong>🤖 AI Detection:</strong> Review and accept or reject this annotation
          </div>
          <button
            onClick={() => onAcceptAnnotation?.(selectedAnnotationId)}
            style={{
              padding: "6px 16px",
              borderRadius: 6,
              border: "none",
              background: "#10B981",
              color: "#FFFFFF",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            ✓ Accept
          </button>
          <button
            onClick={() => onRejectAnnotation?.(selectedAnnotationId)}
            style={{
              padding: "6px 16px",
              borderRadius: 6,
              border: "none",
              background: "#EF4444",
              color: "#FFFFFF",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            ✕ Reject
          </button>
        </div>
      )}

      {/* New Annotation - Fault Type Selection */}
      {isDrawMode && (
        <div style={{ marginTop: 12, padding: "12px", background: "#ECFDF5", border: "1px solid #10B981", borderRadius: 8 }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: "#065F46", marginBottom: 8 }}>
            ✏️ Drawing New Annotation - Select Fault Type ({drawShape === 'polygon' ? 'Polygon' : 'Box'}):
          </div>
          <select
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid #10B981",
              fontSize: 13,
              background: "#FFFFFF",
              fontWeight: 500,
            }}
          >
            {FAULT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <div style={{ fontSize: 12, color: "#065F46", marginTop: 6 }}>
            {drawShape === 'polygon'
              ? 'Click to add points, double-click to finish the polygon, ESC to cancel'
              : 'Click and drag on the thermal image to draw the bounding box'}
          </div>
        </div>
      )}

      {/* Edit Panel for Selected Annotation */}
      {showEditPanel && selectedAnnotationId && (
        <div
          style={{
            marginTop: 12,
            background: "#F9FAFB",
            border: "1px solid #E5E7EB",
            borderRadius: 8,
            padding: 16,
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: "#111827" }}>
            Edit Annotation Details
          </div>

          {/* Fault Type Selector */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
              Fault Type
            </label>
            <select
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid #D1D5DB",
                fontSize: 13,
                background: "#FFFFFF",
              }}
            >
              {FAULT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Comment */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
              Comment (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add notes about this annotation..."
              style={{
                width: "100%",
                minHeight: 60,
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid #D1D5DB",
                fontSize: 13,
                fontFamily: "inherit",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleSave}
              style={{
                flex: 1,
                padding: "8px 16px",
                borderRadius: 6,
                border: "none",
                background: "#10B981",
                color: "#FFFFFF",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              💾 Save Changes
            </button>
            <button
              onClick={handleCancel}
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                border: "1px solid #D1D5DB",
                background: "#FFFFFF",
                color: "#6B7280",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
