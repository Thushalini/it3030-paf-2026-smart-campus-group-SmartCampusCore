import { Link } from "react-router-dom";
import "./DashboardPages.css";

function StudentDashboardPage() {
  return (
    <div className="dashboard-page">
      <div className="dashboard-hero">
        <h1>User Dashboard</h1>
        <p>
          Browse campus resources, explore facilities, and discover the most useful spaces available for students and staff.
        </p>
      </div>

      <div className="dashboard-card-grid">
        <Link to="/resources" className="dashboard-card">
          <div className="dashboard-icon">🏫</div>
          <h3>Browse Resources</h3>
          <p>View lecture halls, labs, meeting rooms, and equipment.</p>
        </Link>

        <Link to="/resources" className="dashboard-card">
          <div className="dashboard-icon">⭐</div>
          <h3>Top Rated Resources</h3>
          <p>See the most highly rated and popular resources.</p>
        </Link>

        <Link to="/resources" className="dashboard-card">
          <div className="dashboard-icon">🔍</div>
          <h3>Search & Filter</h3>
          <p>Quickly find resources by type, location, and other details.</p>
        </Link>
      </div>
    </div>
  );
}

export default StudentDashboardPage;