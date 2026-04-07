import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getResourceById } from "../api/resourcesApi";
import "./ResourceDetailsPage.css";

function ResourceDetailsPage() {
  const { id } = useParams();

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchResource();
  }, [id]);

  const fetchResource = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getResourceById(id);
      setResource(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load resource details.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p className="details-status">Loading resource details...</p>;
  }

  if (error) {
    return <p className="details-status error">{error}</p>;
  }

  if (!resource) {
    return <p className="details-status">Resource not found.</p>;
  }

  return (
    <div className="resource-details-page">
      <div className="details-container">
        <div className="details-image-section">
          <img
            src={
              resource.imageUrl ||
              "https://images.unsplash.com/photo-1497366412874-3415097a27e7"
            }
            alt={resource.name}
            className="details-image"
          />
        </div>

        <div className="details-content-section">
          <p className="details-type">{resource.type?.replaceAll("_", " ")}</p>
          <h1>{resource.name}</h1>
          <p className="details-description">{resource.description}</p>

          <div
            className={`details-status-badge ${
              resource.status === "ACTIVE"
                ? "status-active"
                : resource.status === "OUT_OF_SERVICE"
                ? "status-out"
                : "status-maintenance"
            }`}
          >
            {resource.status}
          </div>

          <div className="details-grid">
            <div className="detail-box">
              <h4>Resource Code</h4>
              <p>{resource.resourceCode}</p>
            </div>

            <div className="detail-box">
              <h4>Capacity</h4>
              <p>{resource.capacity}</p>
            </div>

            <div className="detail-box">
              <h4>Location</h4>
              <p>{resource.location}</p>
            </div>

            <div className="detail-box">
              <h4>Building</h4>
              <p>{resource.building || "-"}</p>
            </div>

            <div className="detail-box">
              <h4>Floor</h4>
              <p>{resource.floor || "-"}</p>
            </div>

            <div className="detail-box">
              <h4>Room Number</h4>
              <p>{resource.roomNumber || "-"}</p>
            </div>

            <div className="detail-box">
              <h4>Availability</h4>
              <p>{resource.availabilityWindow || "-"}</p>
            </div>

            <div className="detail-box">
              <h4>Rating</h4>
              <p>{resource.ratingAverage ?? 0} ({resource.ratingCount ?? 0} ratings)</p>
            </div>

            <div className="detail-box">
              <h4>Bookings</h4>
              <p>{resource.bookingCount ?? 0}</p>
            </div>
          </div>

          <div className="features-section">
            <h3>Features</h3>
            {resource.features && resource.features.length > 0 ? (
              <div className="features-list">
                {resource.features.map((feature, index) => (
                  <span key={index} className="feature-chip">
                    {feature}
                  </span>
                ))}
              </div>
            ) : (
              <p>No special features listed.</p>
            )}
          </div>

          <div className="details-actions">
            <Link to="/student/resources" className="back-button">
              Back to Resources
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResourceDetailsPage;