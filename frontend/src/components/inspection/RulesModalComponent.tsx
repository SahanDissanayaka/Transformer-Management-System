import React from "react";
import { useTheme } from "../../context/ThemeContext";

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
  const { theme } = useTheme();
  
  if (!isOpen) return null;

  const isDark = theme === 'dark';
  
  // Color scheme based on theme
  const colors = {
    overlay: isDark ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.3)",
    background: isDark ? "rgba(20, 10, 50, 0.9)" : "#fff",
    closeBtn: isDark ? "rgba(0, 212, 255, 0.15)" : "#f3f4f6",
    closeBtnHover: isDark ? "rgba(0, 212, 255, 0.25)" : "#e5e7eb",
    title: isDark ? "#00d4ff" : "#000",
    subtitle: isDark ? "#a0a0c0" : "#6b7280",
    text: isDark ? "#e0e0ff" : "#1f2937",
    ruleLabel: isDark ? "#e0e0ff" : "#1f2937",
    ruleToggleBg: isDark ? "rgba(0, 212, 255, 0.08)" : "#e6e7ea",
    ruleToggleOn: isDark ? "#00d4ff" : "#5b21b6",
    selectBg: isDark ? "rgba(30, 15, 60, 0.6)" : "#fff",
    selectBorder: isDark ? "rgba(0, 212, 255, 0.3)" : "#eef2f7",
    selectText: isDark ? "#e0e0ff" : "#000",
    shadow: isDark ? "0 6px 18px rgba(0, 212, 255, 0.2)" : "0 6px 18px rgba(2,6,23,0.04)",
    border: isDark ? "1px solid rgba(0, 212, 255, 0.2)" : "none",
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        display: "grid",
        placeItems: "center",
        background: colors.overlay,
        zIndex: 50,
      }}
    >
      <div
        style={{
          width: 900,
          maxWidth: "95%",
          background: colors.background,
          borderRadius: 14,
          padding: 28,
          boxShadow: colors.shadow,
          position: "relative",
          border: colors.border,
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
            background: colors.closeBtn,
            display: "grid",
            placeItems: "center",
            boxShadow: colors.shadow,
            cursor: "pointer",
            color: colors.text,
            fontSize: 28,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.closeBtnHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = colors.closeBtn;
          }}
        >
          ×
        </button>

        <h1 style={{ margin: 0, fontSize: 36, fontWeight: 700, color: colors.title }}>
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
            <h2 style={{ margin: "0 0 8px 0", fontSize: 24, color: colors.title }}>
              Temperature Dereference
            </h2>
            <div
              style={{ color: colors.subtitle, fontSize: 16, marginBottom: 18 }}
            >
              Temperature deference between baseline and maintenance images.
            </div>

            <div style={{ marginTop: 8, display: "grid", gap: 18 }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: 12 }}
              >
                <div style={{ fontWeight: 600, fontSize: 18, color: colors.ruleLabel }}>Rule 2</div>
                <div style={{ marginLeft: "auto" }}>
                  <div
                    onClick={() => onRule2Change(!rule2Enabled)}
                    role="switch"
                    aria-checked={rule2Enabled}
                    style={{
                      width: 46,
                      height: 26,
                      borderRadius: 20,
                      background: rule2Enabled ? colors.ruleToggleOn : colors.ruleToggleBg,
                      position: "relative",
                      cursor: "pointer",
                      transition: "background 0.2s ease",
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
              <div style={{ color: colors.subtitle }}>Rule Description</div>

              <div
                style={{ display: "flex", alignItems: "center", gap: 12 }}
              >
                <div style={{ fontWeight: 600, fontSize: 18, color: colors.ruleLabel }}>Rule 3</div>
                <div style={{ marginLeft: "auto" }}>
                  <div
                    onClick={() => onRule3Change(!rule3Enabled)}
                    role="switch"
                    aria-checked={rule3Enabled}
                    style={{
                      width: 46,
                      height: 26,
                      borderRadius: 20,
                      background: rule3Enabled ? colors.ruleToggleOn : colors.ruleToggleBg,
                      position: "relative",
                      cursor: "pointer",
                      transition: "background 0.2s ease",
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
              <div style={{ color: colors.subtitle }}>Rule Description</div>
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
                background: colors.selectBg,
                borderRadius: 16,
                padding: 18,
                boxShadow: colors.shadow,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                border: colors.selectBorder ? `1px solid ${colors.selectBorder}` : "none",
              }}
            >
              <select
                value={tempThreshold}
                onChange={(e) => onTempThresholdChange(e.target.value)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: `1px solid ${colors.selectBorder}`,
                  fontSize: 16,
                  background: colors.selectBg,
                  color: colors.selectText,
                  cursor: "pointer",
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
                  background: colors.selectBg,
                  color: colors.text,
                  border: `1px solid ${colors.selectBorder}`,
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
