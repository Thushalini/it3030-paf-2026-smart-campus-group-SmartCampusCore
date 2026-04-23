import { useEffect, useMemo, useState } from "react";
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

    if (search && search.trim() !== "") {
      const searchValue = search.toLowerCase().trim();

      filtered = filtered.filter((resource) =>
        (resource.name && resource.name.toLowerCase().includes(searchValue)) ||
        (resource.description && resource.description.toLowerCase().includes(searchValue)) ||
        (resource.resourceCode && resource.resourceCode.toLowerCase().includes(searchValue))
      );
    }

    if (type && type.trim() !== "") {
      filtered = filtered.filter(
        (resource) => resource.type && resource.type === type
      );
    }

    if (location && location.trim() !== "") {
      const locationValue = location.toLowerCase().trim();

      filtered = filtered.filter((resource) =>
        (resource.location && resource.location.toLowerCase().includes(locationValue)) ||
        (resource.building && resource.building.toLowerCase().includes(locationValue))
      );
    }

    setFilteredResources(filtered);
  };

  const topRatedResource = useMemo(() => {
    if (!filteredResources.length) return null;
    return [...filteredResources].sort(
      (a, b) => (b.ratingAverage || 0) - (a.ratingAverage || 0)
    )[0];
  }, [filteredResources]);

  const mostPopularResource = useMemo(() => {
    if (!filteredResources.length) return null;
    return [...filteredResources].sort(
      (a, b) => (b.bookingCount || 0) - (a.bookingCount || 0)
    )[0];
  }, [filteredResources]);

  // Add this helper function inside StudentResourcesPage, above return()
  const fixImageUrl = (url) => {
    if (!url) return "https://images.unsplash.com/photo-1497366412874-3415097a27e7";
    // Replace wrong port 8084 with correct port 8080
    return url.replace("localhost:8084", "localhost:8080");
  };

  const renderFeatureCard = (title, resource, badgeClass, badgeText) => {
    if (!resource) return null;

    return (
      <div className="feature-card">
        <div className={`feature-badge ${badgeClass}`}>{badgeText}</div>
        <img
          src={
            resource.imageUrls?.[0] ||
            "https://images.unsplash.com/photo-1497366412874-3415097a27e7"
          }
          alt={resource.name}
          className="feature-image"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1497366412874-3415097a27e7";
          }}
        />
        <div className="feature-content">
          <h3>{title}</h3>
          <h2>{resource.name}</h2>
          <p>{resource.description}</p>
          <div className="feature-meta">
            <span><strong>Type:</strong> {resource.type?.replaceAll("_", " ")}</span>
            <span><strong>Capacity:</strong> {resource.capacity}</span>
            <span><strong>Location:</strong> {resource.location}</span>
            <span><strong>Rating:</strong> {resource.ratingAverage ?? 0}</span>
            <span><strong>Bookings:</strong> {resource.bookingCount ?? 0}</span>
          </div>
          <Link to={`/user/resources/${resource.id}`} className="feature-button">
            Explore Details
          </Link>
        </div>
      </div>
    );
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

      {!loading && !error && filteredResources.length > 0 && (
        <div className="featured-section">
          <h2>Featured Resource Insights</h2>
          <div className="featured-grid">
            {renderFeatureCard(
              "Top Rated Resource",
              topRatedResource,
              "badge-rated",
              "Top Rated"
            )}

            {renderFeatureCard(
              "Most Popular Resource",
              mostPopularResource,
              "badge-popular",
              "Most Popular"
            )}
          </div>
        </div>
      )}

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
                  resource.imageUrls?.[0] ||
                  "https://images.unsplash.com/photo-1497366412874-3415097a27e7"
                }
                alt={resource.name}
                className="resource-image"
                onError={(e) => {
                  e.target.src =
                    "https://images.unsplash.com/photo-1497366412874-3415097a27e7";
                }}
              />

              <div className="resource-card-content">
                <h3>{resource.name}</h3>
                <p className="resource-type">{resource.type?.replaceAll("_", " ")}</p>
                <p>{resource.description}</p>

                <div className="resource-details">
                  <span><strong>Code:</strong> {resource.resourceCode}</span>
                  <span><strong>Capacity:</strong> {resource.capacity}</span>
                  <span><strong>Location:</strong> {resource.location}</span>
                </div>

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

                <Link to={`/user/resources/${resource.id}`} className="view-button">
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