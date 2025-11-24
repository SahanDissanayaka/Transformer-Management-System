import React from "react";

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  tempThreshold: string;
  onTempThresholdChange: (value: string) => void;
  rule2Enabled: boolean;
  onRule2Change: (value: boolean) => void;
  rule3Enabled: boolean;
  onRule3Change: (value: boolean) => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({
  isOpen,
  onClose,
  tempThreshold,
  onTempThresholdChange,
  rule2Enabled,
  onRule2Change,
  rule3Enabled,
  onRule3Change,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        display: "grid",
        placeItems: "center",
        background: "rgba(0,0,0,0.3)",
        zIndex: 50,
      }}
    >
      <div
        style={{
          width: 900,
          maxWidth: "95%",
          background: "#fff",
          borderRadius: 14,
          padding: 28,
          boxShadow: "0 20px 40px rgba(2,6,23,0.12)",
          position: "relative",
        }}
      >
        {/* close button top-right */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            right: 20,
            top: 18,
            width: 48,
            height: 48,
            borderRadius: 12,
            border: "none",
            background: "#f3f4f6",
            display: "grid",
            placeItems: "center",
            boxShadow: "0 6px 18px rgba(2,6,23,0.06)",
            cursor: "pointer",
          }}
        >
          ×
        </button>

        <h1 style={{ margin: 0, fontSize: 36, fontWeight: 700 }}>
          Error Ruleset
        </h1>
        <div
          style={{
            marginTop: 20,
            display: "grid",
            gridTemplateColumns: "1fr 220px",
            gap: 24,
            alignItems: "start",
          }}
        >
          <div>
            <h2 style={{ margin: "0 0 8px 0", fontSize: 24 }}>
              Temperature Dereference
            </h2>
            <div
              style={{ color: "#6b7280", fontSize: 16, marginBottom: 18 }}
            >
              Temperature deference between baseline and maintenance images.
            </div>

            <div style={{ marginTop: 8, display: "grid", gap: 18 }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: 12 }}
              >
                <div style={{ fontWeight: 600, fontSize: 18 }}>Rule 2</div>
                <div style={{ marginLeft: "auto" }}>
                  <div
                    onClick={() => onRule2Change(!rule2Enabled)}
                    role="switch"
                    aria-checked={rule2Enabled}
                    style={{
                      width: 46,
                      height: 26,
                      borderRadius: 20,
                      background: rule2Enabled ? "#5b21b6" : "#e6e7ea",
                      position: "relative",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 12,
                        background: "#fff",
                        position: "absolute",
                        top: 3,
                        left: rule2Enabled ? 22 : 4,
                        transition: "left 120ms linear",
                      }}
                    />
                  </div>
                </div>
              </div>
              <div style={{ color: "#9CA3AF" }}>Rule Description</div>

              <div
                style={{ display: "flex", alignItems: "center", gap: 12 }}
              >
                <div style={{ fontWeight: 600, fontSize: 18 }}>Rule 3</div>
                <div style={{ marginLeft: "auto" }}>
                  <div
                    onClick={() => onRule3Change(!rule3Enabled)}
                    role="switch"
                    aria-checked={rule3Enabled}
                    style={{
                      width: 46,
                      height: 26,
                      borderRadius: 20,
                      background: rule3Enabled ? "#5b21b6" : "#e6e7ea",
                      position: "relative",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 12,
                        background: "#fff",
                        position: "absolute",
                        top: 3,
                        left: rule3Enabled ? 22 : 4,
                        transition: "left 120ms linear",
                      }}
                    />
                  </div>
                </div>
              </div>
              <div style={{ color: "#9CA3AF" }}>Rule Description</div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 18,
            }}
          >
            <div
              style={{
                width: "100%",
                background: "#fff",
                borderRadius: 16,
                padding: 18,
                boxShadow: "0 6px 18px rgba(2,6,23,0.04)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <select
                value={tempThreshold}
                onChange={(e) => onTempThresholdChange(e.target.value)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "1px solid #eef2f7",
                  fontSize: 16,
                }}
              >
                <option>10%</option>
                <option>15%</option>
                <option>20%</option>
                <option>25%</option>
              </select>
            </div>

            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                gap: 12,
              }}
            >
              <button
                className="btn primary"
                onClick={onClose}
                style={{
                  padding: "10px 18px",
                  borderRadius: 12,
                  boxShadow: "0 8px 24px rgba(99,102,241,0.18)",
                }}
              >
                Save
              </button>
              <button
                className="btn"
                onClick={onClose}
                style={{
                  padding: "10px 18px",
                  borderRadius: 12,
                  background: "#f8fafc",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
