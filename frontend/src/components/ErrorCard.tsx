import { useState } from "react";
import type { AnnotationType, AnnotationSource, AnnotationMetadata } from "../types";

export interface ErrorCardProps {
  index: number;
  className: string;
  confidence?: number;
  bbox: [number, number, number, number];
  color: string;
  source?: AnnotationSource;
  annotationType?: AnnotationType;
  createdBy?: string;
  createdAt?: string;
  modifiedBy?: string;
  modifiedAt?: string;
  action?: "Approved" | "Pending" | "Rejected";
  version?: string;
  note?: string;
  history?: AnnotationMetadata[];
  onActionChange?: (action: "Approved" | "Pending" | "Rejected") => void;
  onNoteChange?: (note: string) => void;
}

export default function ErrorCard({
  index,
  className,
  confidence,
  bbox,
  color,
  source = "AI",
  annotationType = "AI_DETECTED",
  createdBy = "AI-YOLOv8",
  createdAt,
  modifiedBy,
  modifiedAt,
  action = "Pending",
  version = "v1",
  note = "",
  history = [],
  onActionChange,
  onNoteChange,
}: ErrorCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [localNote, setLocalNote] = useState(note);
  const [localAction, setLocalAction] = useState(action);

  const handleActionChange = (newAction: "Approved" | "Pending" | "Rejected") => {
    setLocalAction(newAction);
    onActionChange?.(newAction);
  };

  const handleNoteSubmit = () => {
    onNoteChange?.(localNote);
  };

  const getAnnotationTypeLabel = () => {
    switch (annotationType) {
      case "AI_DETECTED": return "AI Detected";
      case "MANUAL_ADDED": return "Manually Added";
      case "EDITED": return "Edited";
      case "DELETED": return "Deleted";
      default: return "Unknown";
    }
  };

  const getAnnotationTypeColor = () => {
    switch (annotationType) {
      case "AI_DETECTED": return "#3B82F6";
      case "MANUAL_ADDED": return "#10B981";
      case "EDITED": return "#F59E0B";
      case "DELETED": return "#EF4444";
      default: return "#6B7280";
    }
  };

  const getActionColor = () => {
    switch (localAction) {
      case "Approved": return "#10B981";
      case "Rejected": return "#EF4444";
      case "Pending": return "#F59E0B";
      default: return "#6B7280";
    }
  };

  const getActionBgColor = () => {
    switch (localAction) {
      case "Approved": return "#ECFDF5";
      case "Rejected": return "#FEF2F2";
      case "Pending": return "#FFFBEB";
      default: return "#F3F4F6";
    }
  };

  return (
    <div
      style={{
        border: `2px solid ${isExpanded ? color : "#E5E7EB"}`,
        borderRadius: 12,
        overflow: "hidden",
        transition: "all 0.2s ease",
        boxShadow: isExpanded ? "0 4px 12px rgba(0,0,0,0.1)" : "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      {/* Header - Always Visible */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 16px",
          background: isExpanded ? "#F9FAFB" : "#FFFFFF",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        {/* Number Badge */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: color,
            color: "#FFF",
            display: "grid",
            placeItems: "center",
            fontWeight: 700,
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          {index}
        </div>

        {/* Error Name */}
          <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 16, color: "#111827" }}>
            {className}
          </div>
          <div style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>
            🤖 AI Detection{confidence !== undefined ? ` · ${(confidence * 100).toFixed(0)}% confidence` : ""}
          </div>
        </div>        {/* Version Badge */}
        <div
          style={{
            background: "#EEF2FF",
            color: "#4F46E5",
            padding: "4px 12px",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {version}
        </div>

        {/* Expand/Collapse Icon */}
        <div
          style={{
            width: 28,
            height: 28,
            display: "grid",
            placeItems: "center",
            color: "#6B7280",
            fontSize: 20,
            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        >
          ▼
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div style={{ padding: "16px 20px", background: "#FFFFFF", borderTop: "1px solid #E5E7EB" }}>
          {/* Annotation Type Badge */}
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 8,
                background: `${getAnnotationTypeColor()}15`,
                border: `1px solid ${getAnnotationTypeColor()}40`,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 600, color: getAnnotationTypeColor() }}>
                {source === "USER" ? "👤" : "🤖"} {getAnnotationTypeLabel()}
              </span>
            </div>
          </div>

          {/* BBox Info */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 4 }}>
              BBox: ({bbox[0].toFixed(3)}, {bbox[1].toFixed(3)}) — ({bbox[2].toFixed(3)}, {bbox[3].toFixed(3)})
            </div>
          </div>

          {/* Metadata Grid */}
          <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
            {/* Created By */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, color: "#6B7280" }}>👤</span>
              <span style={{ fontSize: 13, color: "#6B7280" }}>Created by:</span>
              <span style={{ fontSize: 14, fontWeight: 500, color: "#111827", marginLeft: "auto" }}>
                {createdBy}
              </span>
            </div>

            {/* Created At */}
            {createdAt && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14, color: "#6B7280" }}>🕐</span>
                <span style={{ fontSize: 13, color: "#6B7280" }}>Created:</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: "#111827", marginLeft: "auto" }}>
                  {createdAt}
                </span>
              </div>
            )}

            {/* Modified By */}
            {modifiedBy && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14, color: "#6B7280" }}>✏️</span>
                <span style={{ fontSize: 13, color: "#6B7280" }}>Modified by:</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: "#111827", marginLeft: "auto" }}>
                  {modifiedBy}
                </span>
              </div>
            )}

            {/* Modified At */}
            {modifiedAt && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14, color: "#6B7280" }}>🕐</span>
                <span style={{ fontSize: 13, color: "#6B7280" }}>Modified:</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: "#111827", marginLeft: "auto" }}>
                  {modifiedAt}
                </span>
              </div>
            )}
          </div>

          {/* History Section */}
          {history && history.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <button
                onClick={() => setShowHistory(!showHistory)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "1px solid #D1D5DB",
                  background: "#FFFFFF",
                  color: "#6B7280",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  width: "100%",
                  justifyContent: "space-between",
                }}
              >
                <span>📜 View History ({history.length} changes)</span>
                <span style={{ transform: showHistory ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                  ▼
                </span>
              </button>

              {showHistory && (
                <div
                  style={{
                    marginTop: 8,
                    padding: 12,
                    background: "#F9FAFB",
                    border: "1px solid #E5E7EB",
                    borderRadius: 6,
                    maxHeight: 200,
                    overflowY: "auto",
                  }}
                >
                  {history.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "8px 0",
                        borderBottom: idx < history.length - 1 ? "1px solid #E5E7EB" : "none",
                      }}
                    >
                      <div style={{ fontSize: 12, color: "#111827", fontWeight: 500 }}>
                        {item.actionType.replace(/_/g, " ")}
                      </div>
                      <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>
                        By: {item.userName || item.userId} • {new Date(item.timestamp).toLocaleString()}
                      </div>
                      {item.comment && (
                        <div style={{ fontSize: 11, color: "#6B7280", marginTop: 4, fontStyle: "italic" }}>
                          "{item.comment}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action Status */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 14, color: "#6B7280" }}>📋</span>
              <span style={{ fontSize: 13, color: "#6B7280" }}>Action:</span>
              <span
                style={{
                  marginLeft: "auto",
                  padding: "4px 12px",
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  color: getActionColor(),
                  background: getActionBgColor(),
                }}
              >
                {localAction}
              </span>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                gap: 8,
                padding: 12,
                background: "#F9FAFB",
                borderRadius: 8,
              }}
            >
              <button
                onClick={() => handleActionChange("Approved")}
                style={{
                  flex: 1,
                  padding: "8px 16px",
                  borderRadius: 6,
                  border: localAction === "Approved" ? "2px solid #10B981" : "1px solid #D1D5DB",
                  background: localAction === "Approved" ? "#ECFDF5" : "#FFFFFF",
                  color: localAction === "Approved" ? "#10B981" : "#6B7280",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                ✓ Approved
              </button>
              <button
                onClick={() => handleActionChange("Pending")}
                style={{
                  flex: 1,
                  padding: "8px 16px",
                  borderRadius: 6,
                  border: localAction === "Pending" ? "2px solid #F59E0B" : "1px solid #D1D5DB",
                  background: localAction === "Pending" ? "#FFFBEB" : "#FFFFFF",
                  color: localAction === "Pending" ? "#F59E0B" : "#6B7280",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                ⏱ Pending
              </button>
              <button
                onClick={() => handleActionChange("Rejected")}
                style={{
                  flex: 1,
                  padding: "8px 16px",
                  borderRadius: 6,
                  border: localAction === "Rejected" ? "2px solid #EF4444" : "1px solid #D1D5DB",
                  background: localAction === "Rejected" ? "#FEF2F2" : "#FFFFFF",
                  color: localAction === "Rejected" ? "#EF4444" : "#6B7280",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                ✕ Rejected
              </button>
            </div>
          </div>

          {/* Add Note Section */}
          <div
            style={{
              background: "#F9FAFB",
              border: "1px solid #E5E7EB",
              borderRadius: 8,
              padding: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 14, color: "#6B7280" }}>📝</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#6B7280" }}>Add Note</span>
            </div>
            <textarea
              value={localNote}
              onChange={(e) => setLocalNote(e.target.value)}
              placeholder="Type your note here..."
              style={{
                width: "100%",
                minHeight: 80,
                padding: "10px 12px",
                borderRadius: 6,
                border: "1px solid #D1D5DB",
                fontSize: 14,
                fontFamily: "inherit",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button
                onClick={handleNoteSubmit}
                style={{
                  padding: "6px 16px",
                  borderRadius: 6,
                  border: "none",
                  background: "#4F46E5",
                  color: "#FFFFFF",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Save Note
              </button>
              <button
                onClick={() => setLocalNote(note)}
                style={{
                  padding: "6px 16px",
                  borderRadius: 6,
                  border: "1px solid #D1D5DB",
                  background: "#FFFFFF",
                  color: "#6B7280",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
