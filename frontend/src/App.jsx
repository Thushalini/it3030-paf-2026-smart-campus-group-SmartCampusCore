import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import StudentResourcesPage from "./pages/StudentResourcesPage";
import ResourceDetailsPage from "./pages/ResourceDetailsPage";
import AdminResourcesPage from "./pages/AdminResourcesPage";
import ResourceFormPage from "./pages/ResourceFormPage";
import ResourceAnalyticsPage from "./pages/ResourceAnalyticsPage";

function HomePage() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Smart Campus Operations Hub</h1>
      <p>Facilities & Resource Management Module</p>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <Link to="/resources">
          <button>Student Resources</button>
        </Link>

        <Link to="/admin/resources">
          <button>Admin Manage Resources</button>
        </Link>

        <Link to="/admin/resources/new">
          <button>Add New Resource</button>
        </Link>

        <Link to="/admin/resources/analytics">
          <button>Resource Analytics</button>
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/resources" element={<StudentResourcesPage />} />
        <Route path="/resources/:id" element={<ResourceDetailsPage />} />

        <Route path="/student/resources" element={<StudentResourcesPage />} />
        <Route path="/student/resources/:id" element={<ResourceDetailsPage />} />

        <Route path="/admin/resources" element={<AdminResourcesPage />} />
        <Route path="/admin/resources/new" element={<ResourceFormPage />} />
        <Route path="/admin/resources/edit/:id" element={<ResourceFormPage />} />
        <Route path="/admin/resources/analytics" element={<ResourceAnalyticsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;