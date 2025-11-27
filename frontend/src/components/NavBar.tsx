import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import "../styles/NavBar.css";

export default function NavBar() {
  const { username, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div
      className="card"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        marginBottom: 16,
      }}
    >
      <nav style={{ display: "flex", gap: 12, flex: 1 }}>
        <NavLink
          to="/transformers"
          className="nav-link"
        >
          Transformers
        </NavLink>
      </nav>
      <div className="navbar-user" style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "var(--muted)", fontSize: "12px" }}>Hello,</div>
          <div style={{ color: "var(--accent)", fontSize: "14px", fontWeight: "600" }}>
            {username}
          </div>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
        <button
          onClick={toggleTheme}
          className="theme-toggle-btn"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </div>
  );
}
