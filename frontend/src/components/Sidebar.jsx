import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const role = user?.role;

  const linkStyle = (path) => ({
    color: "white",
    display: "block",
    padding: "8px 12px",
    borderRadius: "6px",
    textDecoration: "none",
    backgroundColor: location.pathname === path ? "#1d4ed8" : "transparent",
  });

  return (
    <div style={{
      width: "220px",
      height: "100vh",
      background: "#1e3a8a",
      color: "white",
      padding: "20px",
      overflowY: "auto",
      flexShrink: 0,
    }}>
      <h2 style={{ marginBottom: "24px" }}>Smart Campus</h2>

      <ul
        style={{
          listStyle: "none",
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        {role === "USER" && (
          <>
            <li><Link to="/user" style={linkStyle("/user")}>👤 My Profile</Link></li>
            <li><Link to="/user/resources" style={linkStyle("/user/resources")}>📦 Resources</Link></li>
            <li><Link to="/user/bookings" style={linkStyle("/user/bookings")}>📅 My Bookings</Link></li>
            <li><Link to="/tickets/my" style={linkStyle("/tickets/my")}>🎫 My Tickets</Link></li>
            <li><Link to="/tickets/create" style={linkStyle("/tickets/create")}>➕ Raise Ticket</Link></li>
          </>
        )}

        {role === "TECHNICIAN" && (
          <>
            <li><Link to="/technician" style={linkStyle("/technician")}>👤 Profile</Link></li>
            <li><Link to="/technician/tickets" style={linkStyle("/technician/tickets")}>🔧 My Assignments</Link></li>
          </>
        )}

        {role === "ADMIN" && (
          <>
            <li>
              <Link to="/admin" style={linkStyle("/admin")}>
                👤 Admin Profile
              </Link>
            </li>

            <li
              style={{
                marginTop: "12px",
                fontSize: "11px",
                color: "#93c5fd",
                textTransform: "uppercase",
                padding: "0 12px",
              }}
            >
              Users
            </li>
            <li>
              <Link to="/admin/manage-users" style={linkStyle("/admin/manage-users")}>
                👥 Manage Users
              </Link>
            </li>
            <li>
              <Link to="/admin/disabled-users" style={linkStyle("/admin/disabled-users")}>
                🚫 Disabled Users
              </Link>
            </li>
            <li>
              <Link to="/admin/notifications" style={linkStyle("/admin/notifications")}>
                🔔 Notifications
              </Link>
            </li>

            <li
              style={{
                marginTop: "12px",
                fontSize: "11px",
                color: "#93c5fd",
                textTransform: "uppercase",
                padding: "0 12px",
              }}
            >
              Resources
            </li>
            <li><Link to="/admin/resources" style={linkStyle("/admin/resources")}>🗂️ Manage Resources</Link></li>
            <li><Link to="/admin/resources/new" style={linkStyle("/admin/resources/new")}>➕ Add New Resource</Link></li>
            <li><Link to="/admin/resources/analytics" style={linkStyle("/admin/resources/analytics")}>📊 Analytics</Link></li>

            {/* Bookings Section */}
            <li style={{ marginTop: "12px", fontSize: "11px", color: "#93c5fd", textTransform: "uppercase", padding: "0 12px" }}>
              Bookings
            </li>
            <li><Link to="/admin/bookings" style={linkStyle("/admin/bookings")}>📅 Manage Bookings</Link></li>

            {/* Tickets Section */}
            <li style={{ marginTop: "12px", fontSize: "11px", color: "#93c5fd", textTransform: "uppercase", padding: "0 12px" }}>
              Tickets
            </li>
            <li><Link to="/admin/tickets" style={linkStyle("/admin/tickets")}>🎫 Manage Tickets</Link></li>
          </>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;