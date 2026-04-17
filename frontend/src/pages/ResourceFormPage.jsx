import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createResource,
  getResourceById,
  updateResource,
} from "../api/resourcesApi";
import "./ResourceFormPage.css";

const initialForm = {
  name: "",
  resourceCode: "",
  type: "LAB",
  description: "",
  capacity: "",
  location: "",
  building: "",
  floor: "",
  roomNumber: "",
  availabilityWindow: "",
  status: "ACTIVE",
  features: "",
  imageUrl: "",
  ratingAverage: 0,
  ratingCount: 0,
  bookingCount: 0,
};

function ResourceFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEditMode);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEditMode) {
      fetchResource();
    }
  }, [id]);

  const fetchResource = async () => {
    try {
      setPageLoading(true);
      setError("");
      const response = await getResourceById(id);
      const resource = response.data;

      setFormData({
        name: resource.name || "",
        resourceCode: resource.resourceCode || "",
        type: resource.type || "LAB",
        description: resource.description || "",
        capacity: resource.capacity ?? "",
        location: resource.location || "",
        building: resource.building || "",
        floor: resource.floor || "",
        roomNumber: resource.roomNumber || "",
        availabilityWindow: resource.availabilityWindow || "",
        status: resource.status || "ACTIVE",
        features: resource.features ? resource.features.join(", ") : "",
        imageUrl: resource.imageUrl || "",
        ratingAverage: resource.ratingAverage ?? 0,
        ratingCount: resource.ratingCount ?? 0,
        bookingCount: resource.bookingCount ?? 0,
      });
    } catch (err) {
      console.error(err);
      setError("Failed to load resource for editing.");
    } finally {
      setPageLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const payload = {
        ...formData,
        capacity: Number(formData.capacity),
        ratingAverage: Number(formData.ratingAverage),
        ratingCount: Number(formData.ratingCount),
        bookingCount: Number(formData.bookingCount),
        features: formData.features
          ? formData.features.split(",").map((item) => item.trim()).filter(Boolean)
          : [],
      };

      if (isEditMode) {
        await updateResource(id, payload);
      } else {
        await createResource(payload);
      }

      navigate("/admin/resources");
    } catch (err) {
      console.error(err);
      setError("Failed to save resource. Please check the form and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <p className="form-status">Loading form...</p>;
  }

  return (
    <div className="resource-form-page">
      <div className="resource-form-wrapper">
        <div className="resource-form-header">
          <h1>{isEditMode ? "Edit Resource" : "Add New Resource"}</h1>
          <p>
            {isEditMode
              ? "Update the selected resource information."
              : "Create a new campus resource for students and admins."}
          </p>
        </div>

        {error && <p className="form-status error">{error}</p>}

        <form className="resource-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Resource Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Resource Code</label>
              <input
                type="text"
                name="resourceCode"
                value={formData.resourceCode}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Type</label>
              <select name="type" value={formData.type} onChange={handleChange}>
                <option value="LECTURE_HALL">Lecture Hall</option>
                <option value="LAB">Lab</option>
                <option value="MEETING_ROOM">Meeting Room</option>
                <option value="EQUIPMENT">Equipment</option>
              </select>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="ACTIVE">ACTIVE</option>
                <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
                <option value="UNDER_MAINTENANCE">UNDER_MAINTENANCE</option>
              </select>
            </div>

            <div className="form-group form-group-full">
              <label>Description</label>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Capacity</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Building</label>
              <input
                type="text"
                name="building"
                value={formData.building}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Floor</label>
              <input
                type="text"
                name="floor"
                value={formData.floor}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Room Number</label>
              <input
                type="text"
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Availability Window</label>
              <input
                type="text"
                name="availabilityWindow"
                placeholder="08:00 - 17:00"
                value={formData.availabilityWindow}
                onChange={handleChange}
              />
            </div>

            <div className="form-group form-group-full">
              <label>Features (comma separated)</label>
              <input
                type="text"
                name="features"
                placeholder="Projector, WiFi, AC"
                value={formData.features}
                onChange={handleChange}
              />
            </div>

            <div className="form-group form-group-full">
              <label>Image URL</label>
              <input
                type="text"
                name="imageUrl"
                placeholder="https://..."
                value={formData.imageUrl}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Rating Average</label>
              <input
                type="number"
                step="0.1"
                name="ratingAverage"
                value={formData.ratingAverage}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Rating Count</label>
              <input
                type="number"
                name="ratingCount"
                value={formData.ratingCount}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Booking Count</label>
              <input
                type="number"
                name="bookingCount"
                value={formData.bookingCount}
                onChange={handleChange}
              />
            </div>
          </div>

         {formData.imageUrl && (
            <div className="image-preview-box">
              <p>Image Preview</p>
              <img 
                 src={formData.imageUrl} 
                 alt="Preview" 
                 className="image-preview" 
                 onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1497366412874-3415097a27e7";
                 }}
                  />
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="save-button" disabled={loading}>
              {loading
                ? "Saving..."
                : isEditMode
                ? "Update Resource"
                : "Create Resource"}
            </button>

            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate("/admin/resources")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResourceFormPage;