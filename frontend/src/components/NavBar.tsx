import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NavBar() {
  const active: React.CSSProperties = { color: "white", fontWeight: 700 };
  const { username, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  console.log("NavBar: render — username:", username, "isAuthenticated:", isAuthenticated);

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
        gap: 16,
        marginBottom: 16,
      }}
    >
      <Link to="/" style={{ fontWeight: 800, fontSize: 18 }}>
        Transformer Admin
      </Link>
      <nav style={{ display: "flex", gap: 12, flex: 1 }}>
        <NavLink
          to="/transformers"
          style={({ isActive }) => (isActive ? active : undefined)}
        >
          Transformers
        </NavLink>
      </nav>
      <div className="navbar-user">
        <span>Welcome, {username}</span>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </div>
    </div>
  );
}
