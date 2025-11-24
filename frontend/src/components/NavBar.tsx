import { Link, NavLink } from "react-router-dom";

export default function NavBar() {
  const active: React.CSSProperties = { color: "white", fontWeight: 700 };

  return (
    <div
      className="card"
      style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}
    >
      <Link to="/" style={{ fontWeight: 800, fontSize: 18 }}>
        Transformer Admin
      </Link>
      <nav style={{ display: "flex", gap: 12 }}>
        <NavLink to="/transformers" style={({ isActive }) => (isActive ? active : undefined)}>
          Transformers
        </NavLink>
      </nav>
    </div>
  );
}