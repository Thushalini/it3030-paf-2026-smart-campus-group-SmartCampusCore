import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { deleteResource, getResources } from "../api/resourcesApi";
import "./AdminResourcesPage.css";

function AdminResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getResources({ adminView: true });
      setResources(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load resources.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this resource?");
    if (!confirmed) return;

    try {
      await deleteResource(id);
      fetchResources();
    } catch (err) {
      console.error(err);
      alert("Failed to delete resource.");
    }
  };

  const stats = useMemo(() => {
    const total = resources.length;
    const active = resources.filter((r) => r.status === "ACTIVE").length;
    const outOfService = resources.filter((r) => r.status === "OUT_OF_SERVICE").length;
    const maintenance = resources.filter((r) => r.status === "UNDER_MAINTENANCE").length;
    const totalCapacity = resources.reduce((sum, r) => sum + (r.capacity || 0), 0);

    return { total, active, outOfService, maintenance, totalCapacity };
  }, [resources]);

  return (
    <div className="admin-resources-page">
      <div className="admin-header">
        <div>
          <h1>Admin Resource Management</h1>
          <p>Manage all campus resources, update details, and remove outdated entries.</p>
        </div>

        <div className="admin-header-actions">
          <Link to="/admin/resources/new" className="add-resource-button">
            + Add New Resource
          </Link>

          <Link to="/admin/resources/analytics" className="analytics-button">
            View Analytics
          </Link>
        </div>
      </div>

      {!loading && !error && (
        <div className="admin-summary-cards">
          <div className="summary-card">
            <h4>Total Resources</h4>
            <p>{stats.total}</p>
          </div>

          <div className="summary-card">
            <h4>Active</h4>
            <p>{stats.active}</p>
          </div>

          <div className="summary-card">
            <h4>Out of Service</h4>
            <p>{stats.outOfService}</p>
          </div>

          <div className="summary-card">
            <h4>Maintenance</h4>
            <p>{stats.maintenance}</p>
          </div>

          <div className="summary-card">
            <h4>Total Capacity</h4>
            <p>{stats.totalCapacity}</p>
          </div>
        </div>
      )}

      {loading && <p className="admin-status-message">Loading resources...</p>}
      {error && <p className="admin-status-message error">{error}</p>}

      {!loading && !error && resources.length === 0 && (
        <p className="admin-status-message">No resources available.</p>
      )}

      {!loading && !error && resources.length > 0 && (
        <div className="admin-table-wrapper">
          <table className="admin-resource-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Code</th>
                <th>Type</th>
                <th>Capacity</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {resources.map((resource) => (
                <tr key={resource.id}>
                  <td>
                    <img
                      src={
                        resource.imageUrl ||
                        "https://images.unsplash.com/photo-1497366412874-3415097a27e7"
                      }
                      alt={resource.name}
                      className="admin-resource-thumb"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1497366412874-3415097a27e7";
                      }}
                    />
                  </td>

                  <td>{resource.name}</td>
                  <td>{resource.resourceCode}</td>
                  <td>{resource.type}</td>
                  <td>{resource.capacity}</td>
                  <td>{resource.location}</td>
                  <td>
                    <span
                      className={`admin-status-badge ${
                        resource.status === "ACTIVE"
                          ? "status-active"
                          : resource.status === "OUT_OF_SERVICE"
                          ? "status-out"
                          : "status-maintenance"
                      }`}
                    >
                      {resource.status}
                    </span>
                  </td>

                  <td>
                    <div className="admin-action-buttons">
                      <Link
                        to={`/admin/resources/view/${resource.id}`}
                        className="view-admin-button"
                      >
                        View
                      </Link>

                      <Link
                        to={`/admin/resources/edit/${resource.id}`}
                        className="edit-button"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() => handleDelete(resource.id)}
                        className="delete-button"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminResourcesPage;