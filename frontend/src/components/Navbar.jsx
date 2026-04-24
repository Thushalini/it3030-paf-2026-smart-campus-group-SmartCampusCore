import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div style={{
      background: "#2563eb",
      color: "white",
      padding: "15px",
      display: "flex",
      justifyContent: "space-between"
    }}>
      <h3>Welcome to Smart Campus Core</h3>
      <NotificationBell />

      <div>
        <span>{user?.email}</span>
        <span> | {user?.role}</span>

        <button onClick={logout} style={{
          background: "white",
          color: "#2563eb",
          border: "none",
          padding: "8px 12px",
          marginLeft: "10px",
          cursor: "pointer"
        }}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;