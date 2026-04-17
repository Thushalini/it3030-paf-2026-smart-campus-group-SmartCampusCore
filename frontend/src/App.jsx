import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import StudentResourcesPage from "./pages/StudentResourcesPage";
import ResourceDetailsPage from "./pages/ResourceDetailsPage";
import AdminResourcesPage from "./pages/AdminResourcesPage";
import ResourceFormPage from "./pages/ResourceFormPage";
import ResourceAnalyticsPage from "./pages/ResourceAnalyticsPage";
import StudentDashboardPage from "./pages/StudentDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";

function StudentDashboard() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>User Dashboard</h1>
      <p>Browse and explore campus resources.</p>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <Link to="/student/resources">
          <button>Browse Resources</button>
        </Link>
      </div>
    </div>
  );
}

function AdminDashboard() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin Dashboard</h1>
      <p>Manage campus resources and view analytics.</p>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <Link to="/admin/resources">
          <button>Manage Resources</button>
        </Link>

        <Link to="/admin/resources/new">
          <button>Add New Resource</button>
        </Link>

        <Link to="/admin/resources/analytics">
          <button>View Analytics</button>
        </Link>
      </div>
    </div>
  );
}

function HomePage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f7f9fc", padding: "40px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
        <h1 style={{ marginBottom: "12px" }}>Smart Campus Operations Hub</h1>
        <p style={{ color: "#6b7280", marginBottom: "28px" }}>
          Facilities & Resource Management Module
        </p>

        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/student/dashboard">
            <button>User Dashboard</button>
          </Link>

          <Link to="/admin/dashboard">
            <button>Admin Dashboard</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/resources" element={<StudentResourcesPage />} />
        <Route path="/student/resources/:id" element={<ResourceDetailsPage />} />

        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/resources" element={<AdminResourcesPage />} />
        <Route path="/admin/resources/new" element={<ResourceFormPage />} />
        <Route path="/admin/resources/edit/:id" element={<ResourceFormPage />} />
        <Route path="/admin/resources/view/:id" element={<ResourceDetailsPage />} />
        <Route path="/admin/resources/analytics" element={<ResourceAnalyticsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;