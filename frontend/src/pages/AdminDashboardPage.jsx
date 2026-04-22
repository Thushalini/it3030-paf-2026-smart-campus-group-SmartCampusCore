import { Link } from "react-router-dom";
import "./DashboardPages.css";

function AdminDashboardPage() {
  return (
    <div className="dashboard-page">
      <div className="dashboard-hero">
        <h1>Admin Dashboard</h1>
        <p>
          Manage campus resources, monitor status, and access resource analytics for better decision-making.
        </p>
      </div>

      <div className="dashboard-card-grid">
        <Link to="/admin/resources" className="dashboard-card">
          <div className="dashboard-icon">🗂️</div>
          <h3>Manage Resources</h3>
          <p>View, update, and organize all campus resources from one place.</p>
        </Link>

        <Link to="/admin/resources/new" className="dashboard-card">
          <div className="dashboard-icon">➕</div>
          <h3>Add New Resource</h3>
          <p>Create a new resource with details, status, image, and availability.</p>
        </Link>

        <Link to="/admin/resources/analytics" className="dashboard-card">
          <div className="dashboard-icon">📊</div>
          <h3>Analytics</h3>
          <p>Review usage insights, top-rated resources, and capacity summaries.</p>
        </Link>
      </div>
    </div>
  );
}

export default AdminDashboardPage;