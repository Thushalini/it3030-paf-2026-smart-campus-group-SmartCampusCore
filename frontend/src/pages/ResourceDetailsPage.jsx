import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { getResourceById } from "../api/resourcesApi";
import "./ResourceDetailsPage.css";
import jsPDF from "jspdf";

function ResourceDetailsPage() {
  const { id } = useParams();
  const location = useLocation();

  const isAdminView = location.pathname.startsWith("/admin");
  const backPath = isAdminView ? "/admin/resources" : "/student/resources";
  const backLabel = isAdminView
    ? "Back to Admin Resources"
    : "Back to Resources";

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); // ✅ FIXED
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    fetchResource();
  }, [id]);

  const imageUrls = useMemo(() => {
    if (!resource) return [];
    const urls = Array.isArray(resource.imageUrls) ? resource.imageUrls : [];
    const fallback = resource.imageUrl ? [resource.imageUrl] : [];
    return [...urls, ...fallback].filter(Boolean);
  }, [resource]);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [id, imageUrls.length]);

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

  // ✅ PDF DOWNLOAD FEATURE (HIGH MARKS)
  const handleDownloadPdf = () => {
    if (!resource) return;

    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(18);
    doc.text("Resource Details Report", 14, y);
    y += 12;

    doc.setFontSize(12);

    const addLine = (label, value) => {
      doc.text(`${label}: ${value || "-"}`, 14, y);
      y += 8;
    };

    addLine("Name", resource.name);
    addLine("Resource Code", resource.resourceCode);
    addLine("Type", resource.type);
    addLine("Description", resource.description);
    addLine("Capacity", resource.capacity);
    addLine("Location", resource.location);
    addLine("Building", resource.building);
    addLine("Floor", resource.floor);
    addLine("Room Number", resource.roomNumber);
    addLine("Availability", resource.availabilityWindow);
    addLine("Status", resource.status);
    addLine("Rating", resource.ratingAverage ?? 0);
    addLine("Rating Count", resource.ratingCount ?? 0);
    addLine("Booking Count", resource.bookingCount ?? 0);

    y += 4;
    doc.text("Features:", 14, y);
    y += 8;

    if (resource.features?.length > 0) {
      resource.features.forEach((feature) => {
        doc.text(`- ${feature}`, 18, y);
        y += 8;
      });
    } else {
      doc.text("- No special features", 18, y);
    }

    doc.save(`${resource.name || "resource-details"}.pdf`);
  };

  // ✅ LOADING STATE
  if (loading) {
    return <p className="details-status">Loading resource details...</p>;
  }

  // ✅ ERROR STATE
  if (error) {
    return (
      <div className="resource-details-page">
        <div className="details-error-box">
          <h2>Unable to load resource</h2>
          <p className="details-status error">{error}</p>
          <Link to={backPath} className="back-button">
            {backLabel}
          </Link>
        </div>
      </div>
    );
  }

  // ✅ NOT FOUND STATE
  if (!resource) {
    return (
      <div className="resource-details-page">
        <div className="details-error-box">
          <h2>Resource not found</h2>
          <p className="details-status">
            This resource may have been deleted.
          </p>
          <Link to={backPath} className="back-button">
            {backLabel}
          </Link>
        </div>
      </div>
    );
  }

  // ✅ MAIN UI
  return (
    <div className="resource-details-page">
      <div className="details-container">

        {/* IMAGE */}
        <div className="details-image-section">
          <div className="details-carousel">
            <img
              src={
                imageUrls[activeImageIndex] ||
                "https://images.unsplash.com/photo-1497366412874-3415097a27e7"
              }
              alt={resource.name}
              className="details-image"
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1497366412874-3415097a27e7";
              }}
            />

            {imageUrls.length > 1 && (
              <>
                <button
                  type="button"
                  className="carousel-nav carousel-prev"
                  onClick={() =>
                    setActiveImageIndex((prev) =>
                      (prev - 1 + imageUrls.length) % imageUrls.length
                    )
                  }
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="carousel-nav carousel-next"
                  onClick={() =>
                    setActiveImageIndex((prev) => (prev + 1) % imageUrls.length)
                  }
                  aria-label="Next image"
                >
                  ›
                </button>

                <div className="carousel-dots" aria-label="Image selector">
                  {imageUrls.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`carousel-dot ${
                        idx === activeImageIndex ? "active" : ""
                      }`}
                      onClick={() => setActiveImageIndex(idx)}
                      aria-label={`Go to image ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* CONTENT */}
        <div className="details-content-section">
          <p className="details-type">
            {resource.type?.replaceAll("_", " ")}
          </p>

          <h1>{resource.name}</h1>

          <p className="details-description">
            {resource.description}
          </p>

          {/* STATUS BADGE */}
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

          {/* GRID */}
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
              <h4>Room</h4>
              <p>{resource.roomNumber || "-"}</p>
            </div>

            <div className="detail-box">
              <h4>Availability</h4>
              <p>{resource.availabilityWindow || "-"}</p>
            </div>

            <div className="detail-box">
              <h4>Rating</h4>
              <p>
                {resource.ratingAverage ?? 0} (
                {resource.ratingCount ?? 0})
              </p>
            </div>

            <div className="detail-box">
              <h4>Bookings</h4>
              <p>{resource.bookingCount ?? 0}</p>
            </div>
          </div>

          {/* FEATURES */}
          <div className="features-section">
            <h3>Features</h3>
            {resource.features?.length > 0 ? (
              <div className="features-list">
                {resource.features.map((feature, index) => (
                  <span key={index} className="feature-chip">
                    {feature}
                  </span>
                ))}
              </div>
            ) : (
              <p>No features listed.</p>
            )}
          </div>

          {/* ACTIONS */}
          <div className="details-actions">
            <button onClick={handleDownloadPdf} className="pdf-button">
              Download PDF
            </button>

            <Link to={backPath} className="back-button">
              {backLabel}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResourceDetailsPage;