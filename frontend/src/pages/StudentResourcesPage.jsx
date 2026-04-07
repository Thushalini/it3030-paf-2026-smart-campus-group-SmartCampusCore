import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getResources } from "../api/resourcesApi";
import "./StudentResourcesPage.css";

function StudentResourcesPage() {
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    filterResources();
  }, [search, type, location, resources]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getResources();
      setResources(response.data);
      setFilteredResources(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load resources.");
    } finally {
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = [...resources];

    if (search) {
      filtered = filtered.filter((resource) =>
        resource.name?.toLowerCase().includes(search.toLowerCase()) ||
        resource.description?.toLowerCase().includes(search.toLowerCase()) ||
        resource.resourceCode?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (type) {
      filtered = filtered.filter((resource) => resource.type === type);
    }

    if (location) {
      filtered = filtered.filter((resource) =>
        resource.location?.toLowerCase().includes(location.toLowerCase()) ||
        resource.building?.toLowerCase().includes(location.toLowerCase())
      );
    }

    setFilteredResources(filtered);
  };

  return (
    <div className="student-resources-page">
      <div className="hero-section">
        <h1>Campus Resources</h1>
        <p>Search and explore available lecture halls, labs, meeting rooms, and equipment.</p>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search by name, code, or description"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All Types</option>
          <option value="LECTURE_HALL">Lecture Hall</option>
          <option value="LAB">Lab</option>
          <option value="MEETING_ROOM">Meeting Room</option>
          <option value="EQUIPMENT">Equipment</option>
        </select>

        <input
          type="text"
          placeholder="Filter by location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      {loading && <p className="status-message">Loading resources...</p>}
      {error && <p className="status-message error">{error}</p>}

      {!loading && !error && filteredResources.length === 0 && (
        <p className="status-message">No resources found.</p>
      )}

      <div className="resource-grid">
        {!loading &&
          !error &&
          filteredResources.map((resource) => (
            <div className="resource-card" key={resource.id}>
              <img
                src={
                  resource.imageUrl ||
                  "https://images.unsplash.com/photo-1497366412874-3415097a27e7"
                }
                alt={resource.name}
                className="resource-image"
              />

              <div className="resource-card-content">
                <h3>{resource.name}</h3>
                <p className="resource-type">{resource.type?.replaceAll("_", " ")}</p>
                <p>{resource.description}</p>

                <div className="resource-details">
                  <span><strong>Code:</strong> {resource.resourceCode}</span>
                  <span><strong>Capacity:</strong> {resource.capacity}</span>
                  <span><strong>Location:</strong> {resource.location}</span>
                  <div
                      className={`status-badge ${
                        resource.status === "ACTIVE"
                            ? "status-active"
                            : resource.status === "OUT_OF_SERVICE"
                            ? "status-out"
                            : "status-maintenance"
                      }`}
                  >
                      {resource.status}
                  </div>


                </div>

                <Link to={`/student/resources/${resource.id}`} className="view-button">
                  View Details
                </Link>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default StudentResourcesPage;