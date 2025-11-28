import { useState } from "react";
import type { Box } from "../../types/inspection.types";
interface AnomalyCardProps {
  box: Box;
  onReject?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  isEditing?: boolean;
  onSave?: () => void;
}

export function AnomalyCard({
  box,
  onReject,
  onDelete,
  onEdit,
  isEditing,
  onSave,
}: AnomalyCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [action, setAction] = useState<"Approved" | "Pending" | "Rejected">(
    "Pending"
  );
  const [note, setNote] = useState("");
  const [notesList, setNotesList] = useState<
    Array<{ text: string; by: string; at: string }>
  >([]);
  const userName =
    localStorage.getItem("userName") || localStorage.getItem("username") || "User";
  const changedBy = box.aiDetected === false ? box.rejectedBy ?? userName : "AI-YOLOv8";
  const changedAt = box.rejectedAt ?? new Date().toLocaleString();
  const [x1, y1, x2, y2] = box.n;

  return (
    <div
      style={{
        border: `2px solid ${expanded ? box.color : "#e5e7eb"}`,
        borderRadius: 12,
        overflow: "hidden",
        transition: "all 0.2s ease",
        boxShadow: expanded
          ? "0 4px 12px rgba(0,0,0,0.1)"
          : "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      {/* Collapsed Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          background: expanded ? "var(--card)" : "rgba(0, 212, 255, 0.05)",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              background: box.color,
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              flexShrink: 0,
            }}
        >
          {box.idx}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2, color: "var(--text)" }}>
            {box.klass}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: "var(--muted)",
            }}
          >
            <span>{box.aiDetected === false ? "Not AI Detected" : "AI Detection"}</span>
            <span>•</span>
            <span>
              {box.aiDetected === false
                ? box.rejectedBy ?? userName
                : `${(box.conf * 100).toFixed(0)}% confidence`}
            </span>
          </div>
        </div>

        {/* Status badges in collapsed view */}
        {!expanded && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                padding: "3px 8px",
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600,
                background: "#e0e7ff",
                color: "#4338ca",
              }}
            >
              v1
            </div>
            <div
              style={{
                padding: "3px 10px",
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 600,
                background:
                  action === "Approved"
                    ? "#d1fae5"
                    : action === "Rejected"
                    ? "#fee2e2"
                    : "#fef3c7",
                color:
                  action === "Approved"
                    ? "#065f46"
                    : action === "Rejected"
                    ? "#991b1b"
                    : "#92400e",
              }}
            >
              {action}
            </div>
          </div>
        )}

        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            background: expanded ? "#f1f5f9" : "transparent",
            display: "grid",
            placeItems: "center",
            fontSize: 16,
            transition: "all 0.2s ease",
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            flexShrink: 0,
          }}
        >
          ▼
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div style={{ padding: "0 20px 20px 20px", background: "var(--card)" }}>
          <div style={{ borderTop: "1px solid rgba(0, 212, 255, 0.2)", paddingTop: 16 }}>
            {/* Badge */}
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 8,
                  background: "rgba(0, 212, 255, 0.1)",
                  border: "1px solid rgba(0, 212, 255, 0.3)",
                }}
              >
                <span
                  style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)" }}
                >
                  {box.aiDetected
                    ? "AI Detected"
                    : box.userAdded
                    ? "User Added"
                    : "User Updated"}
                </span>
              </div>
            </div>

            {/* Details */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>
                BBox: ({x1.toFixed(3)}, {y1.toFixed(3)}) — ({x2.toFixed(3)},{" "}
                {y2.toFixed(3)})
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gap: "8px 16px",
                  fontSize: 14,
                  marginTop: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span>👤</span>
                  <span style={{ fontWeight: 600, color: "var(--text)" }}>
                    Changed by:
                  </span>
                </div>
                <div style={{ textAlign: "right", fontWeight: 600 }}>
                  {changedBy}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span>🕐</span>
                  <span style={{ fontWeight: 600, color: "#475569" }}>
                    Changed at:
                  </span>
                </div>
                <div style={{ textAlign: "right" }}>{changedAt}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontWeight: 600, color: "#475569" }}>
                    ◆ Action:
                  </span>
                </div>
                <div
                  style={{
                    textAlign: "right",
                    fontWeight: 600,
                    color:
                      action === "Approved"
                        ? "#059669"
                        : action === "Rejected"
                        ? "#dc2626"
                        : "#6366f1",
                  }}
                >
                  {action}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
              {!isEditing ? (
                <button
                  onClick={onEdit}
                  style={{
                    flex: 1,
                    minWidth: 120,
                    padding: "10px 16px",
                    borderRadius: 8,
                    border: "2px solid #6366f1",
                    background: "rgba(0, 212, 255, 0.15)",
                    color: "var(--accent)",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  ✏️ Edit Box
                </button>
              ) : (
                <button
                  onClick={onSave}
                  style={{
                    flex: 1,
                    minWidth: 120,
                    padding: "10px 16px",
                    borderRadius: 8,
                    border: "2px solid #10b981",
                    background: "rgba(16, 185, 129, 0.15)",
                    color: "#10b981",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  💾 Save Box
                </button>
              )}
              <button
                onClick={() => setAction("Approved")}
                style={{
                  flex: 1,
                  minWidth: 120,
                  padding: "10px 16px",
                  borderRadius: 8,
                  border:
                    action === "Approved"
                      ? "2px solid #059669"
                      : "1px solid rgba(16, 185, 129, 0.3)",
                  background: action === "Approved" ? "rgba(16, 185, 129, 0.2)" : "rgba(16, 185, 129, 0.08)",
                  color: "#10b981",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                ✓ Approved
              </button>
              {onDelete && (
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to delete this anomaly?"
                      )
                    ) {
                      onDelete();
                    }
                  }}
                  style={{
                    flex: 1,
                    minWidth: 120,
                    padding: "10px 16px",
                    borderRadius: 8,
                    border: "2px solid #ef4444",
                    background: "rgba(239, 68, 68, 0.15)",
                    color: "#ef4444",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  🗑 Delete
                </button>
              )}
              <button
                onClick={() => setAction("Pending")}
                style={{
                  flex: 1,
                  minWidth: 120,
                  padding: "10px 16px",
                  borderRadius: 8,
                  border:
                    action === "Pending"
                      ? "2px solid #6366f1"
                      : "1px solid rgba(99, 102, 241, 0.3)",
                  background: action === "Pending" ? "rgba(99, 102, 241, 0.2)" : "rgba(99, 102, 241, 0.08)",
                  color: "#6366f1",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                ⏱ Pending
              </button>
              <button
                onClick={() => {
                  setAction("Rejected");
                  if (onReject) {
                    onReject();
                  }
                }}
                style={{
                  flex: 1,
                  minWidth: 120,
                  padding: "10px 16px",
                  borderRadius: 8,
                  border:
                    action === "Rejected"
                      ? "2px solid #dc2626"
                      : "1px solid rgba(220, 38, 38, 0.3)",
                  background: action === "Rejected" ? "rgba(220, 38, 38, 0.2)" : "rgba(220, 38, 38, 0.08)",
                  color: "#dc2626",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                ✕ Rejected
              </button>
            </div>

            {/* Add Note Section */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: 16 }}>📝</span>
                <span
                  style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}
                >
                  Notes
                </span>
              </div>

              {/* Display saved notes */}
              {notesList.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  {notesList.map((savedNote, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 8,
                        border: "1px solid rgba(0, 212, 255, 0.2)",
                        background: "rgba(0, 212, 255, 0.08)",
                        fontSize: 13,
                      }}
                    >
                      <div style={{ marginBottom: 6, color: "var(--text)" }}>
                        {savedNote.text}
                      </div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>
                        By {savedNote.by} • {savedNote.at}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new note */}
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Type your note here..."
                style={{
                  width: "100%",
                  minHeight: 60,
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid rgba(0, 212, 255, 0.3)",
                  background: "rgba(0, 212, 255, 0.05)",
                  color: "var(--text)",
                  fontSize: 13,
                  fontFamily: "inherit",
                  resize: "vertical",
                  marginBottom: 10,
                }}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => {
                    if (note.trim()) {
                      setNotesList([
                        ...notesList,
                        {
                          text: note,
                          by: userName,
                          at: new Date().toLocaleString(),
                        },
                      ]);
                      setNote("");
                    }
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
                  Confirm
                </button>
                <button
                  onClick={() => setNote("")}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 8,
                    border: "1px solid rgba(0, 212, 255, 0.3)",
                    background: "rgba(0, 212, 255, 0.1)",
                    color: "var(--muted)",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
