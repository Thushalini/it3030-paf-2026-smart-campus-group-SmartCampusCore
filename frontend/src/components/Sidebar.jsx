import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const role = user?.role;

  return (
    <div style={{
      width: "220px",
      height: "100vh",
      background: "#1e3a8a",
      color: "white",
      padding: "20px"
    }}>
      <h2>Smart Campus</h2>

      <ul style={{ listStyle: "none", padding: 0 }}>

        {/* COMMON */}
        <li><Link to="/dashboard" style={{ color: "white" }}>Dashboard</Link></li>

        {/* 👤 USER */}
        {role === "USER" && (
          <>
            <li><Link to="/bookings" style={{ color: "white" }}>My Bookings</Link></li>
            <li><Link to="/tickets" style={{ color: "white" }}>My Tickets</Link></li>
          </>
        )}

        {/* 🛠 TECHNICIAN */}
        {role === "TECHNICIAN" && (
          <>
            <li><Link to="/technician" style={{ color: "white" }}>Assigned Tickets</Link></li>
          </>
        )}

        {/* 👑 ADMIN */}
        {role === "ADMIN" && (
          <>
            <li><Link to="/admin" style={{ color: "white" }}>Admin Panel</Link></li>
            <li><Link to="/manage-users" style={{ color: "white" }}>Manage Users</Link></li>
          </>
        )}

      </ul>
    </div>
  );
};

export default Sidebar;