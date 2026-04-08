import { Link } from "react-router-dom";

const Sidebar = () => {
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
        <li><Link to="/dashboard" style={{ color: "white" }}>Dashboard</Link></li>
        <li><Link to="/bookings" style={{ color: "white" }}>Bookings</Link></li>
        <li><Link to="/tickets" style={{ color: "white" }}>Tickets</Link></li>
      </ul>
    </div>
  );
};

export default Sidebar;