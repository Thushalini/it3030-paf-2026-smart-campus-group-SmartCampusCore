import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { logout } = useContext(AuthContext);

  return (
    <div style={{
      background: "#2563eb",
      color: "white",
      padding: "15px",
      display: "flex",
      justifyContent: "space-between"
    }}>
      <h3>Dashboard</h3>
      <button onClick={logout} style={{
        background: "white",
        color: "#2563eb",
        border: "none",
        padding: "8px 12px",
        cursor: "pointer"
      }}>
        Logout
      </button>
    </div>
  );
};

export default Navbar;