import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createResource,
  getResourceById,
  uploadResourceImages,
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
  imageUrls: [],
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
  const [imageUploadError, setImageUploadError] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [manualUrlInputs, setManualUrlInputs] = useState([""]);

  useEffect(() => {
    if (isEditMode) {
      fetchResource();
    }
  }, [id]);

  useEffect(() => {
    return () => {
      filePreviews.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
  }, [filePreviews]);

  const fetchResource = async () => {
    try {
      setPageLoading(true);
      setError("");
      const response = await getResourceById(id);
      const resource = response.data;
      const existingImageUrls =
        resource.imageUrls?.filter(Boolean) ||
        (resource.imageUrl ? [resource.imageUrl].filter(Boolean) : []);

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
        imageUrls: existingImageUrls,
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

  const isValidHttpUrl = (value) => {
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setImageUploadError("");

    filePreviews.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setSelectedFiles(files);
    setFilePreviews(
      files.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }))
    );
  };

  const removeExistingImage = (urlToRemove) => {
    setFormData((prev) => ({
      ...prev,
      imageUrls: (prev.imageUrls || []).filter((u) => u !== urlToRemove),
    }));
  };

  const addManualUrlField = () => {
    setManualUrlInputs((prev) => [...prev, ""]);
  };

  const updateManualUrl = (index, value) => {
    setManualUrlInputs((prev) => prev.map((u, i) => (i === index ? value : u)));
  };

  const removeManualUrlField = (index) => {
    setManualUrlInputs((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => {
      const toRemove = prev[index];
      if (toRemove) URL.revokeObjectURL(toRemove.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setImageUploadError("");

      let uploadedUrls = [];
      if (selectedFiles.length > 0) {
        try {
          console.log("[ResourceFormPage] Uploading images", {
            count: selectedFiles.length,
            files: selectedFiles.map((f) => ({ name: f.name, type: f.type, size: f.size })),
          });
          const uploadResponse = await uploadResourceImages(selectedFiles);
          console.log("[ResourceFormPage] Upload response", uploadResponse?.data);
          uploadedUrls = Array.isArray(uploadResponse.data) ? uploadResponse.data : [];
        } catch (uploadErr) {
          console.error(uploadErr);
          const message =
            uploadErr?.response?.data?.message ||
            "Failed to upload images. Please try again.";
          setImageUploadError(message);
          return;
        }
      }

      const manualUrls = (manualUrlInputs || [])
        .map((u) => (u || "").trim())
        .filter(Boolean);

      const combinedImageUrls = Array.from(
        new Set([...(formData.imageUrls || []), ...uploadedUrls, ...manualUrls])
      );

      const payload = {
        ...formData,
        capacity: Number(formData.capacity),
        ratingAverage: Number(formData.ratingAverage),
        ratingCount: Number(formData.ratingCount),
        bookingCount: Number(formData.bookingCount),
        features: formData.features
          ? formData.features.split(",").map((item) => item.trim()).filter(Boolean)
          : [],
        imageUrls: combinedImageUrls,
      };

      if (isEditMode) {
        console.log("[ResourceFormPage] Update payload", payload);
        console.log("[ResourceFormPage] Calling updateResource", { id });
        await updateResource(id, payload);
      } else {
        console.log("[ResourceFormPage] Create payload", payload);
        await createResource(payload);
      }

      console.log("[ResourceFormPage] Save success, navigating to /admin/resources");
      navigate("/admin/resources");
    } catch (err) {
      console.error(err);
      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (typeof err?.response?.data === "string" ? err.response.data : null);

      setError(backendMessage || err?.message || "Failed to save resource. Please check the form and try again.");
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
              <div className="images-section">
                <div className="images-section-header">
                  <h3>Resource Images</h3>
                  <p>Add zero or more images via upload or URL.</p>
                </div>

                <div className="images-controls">
                  <div className="images-upload">
                    <label className="images-label">Upload images</label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFilesChange}
                    />
                    {imageUploadError && (
                      <p className="form-status error">{imageUploadError}</p>
                    )}
                  </div>

                  <div className="images-manual">
                    <div className="images-manual-header">
                      <label className="images-label">Image URLs</label>
                      <button
                        type="button"
                        className="add-url-button"
                        onClick={addManualUrlField}
                      >
                        + Add Image URL
                      </button>
                    </div>

                    <div className="manual-url-list">
                      {manualUrlInputs.map((url, index) => {
                        const showRemove = manualUrlInputs.length > 1;
                        const showInvalid =
                          url.trim() !== "" && !isValidHttpUrl(url.trim());

                        return (
                          <div className="manual-url-row" key={index}>
                            <input
                              type="text"
                              placeholder="https://..."
                              value={url}
                              onChange={(e) => updateManualUrl(index, e.target.value)}
                            />
                            {showRemove && (
                              <button
                                type="button"
                                className="remove-url-button"
                                onClick={() => removeManualUrlField(index)}
                              >
                                Remove
                              </button>
                            )}
                            {showInvalid && (
                              <div className="url-hint">Not a valid URL (will be ignored if blank).</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="images-preview">
                  <p className="images-preview-title">Preview</p>

                  <div className="images-grid">
                    {(formData.imageUrls || []).map((url) => (
                      <div className="image-tile" key={url}>
                        <img
                          src={url}
                          alt="Resource"
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1497366412874-3415097a27e7";
                          }}
                        />
                        <button
                          type="button"
                          className="image-remove"
                          onClick={() => removeExistingImage(url)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}

                    {filePreviews.map((p, index) => (
                      <div className="image-tile" key={p.previewUrl}>
                        <img src={p.previewUrl} alt={p.file.name} />
                        <button
                          type="button"
                          className="image-remove"
                          onClick={() => removeSelectedFile(index)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}

                    {manualUrlInputs
                      .map((u) => (u || "").trim())
                      .filter((u) => isValidHttpUrl(u))
                      .map((url) => (
                        <div className="image-tile" key={`manual-${url}`}>
                          <img
                            src={url}
                            alt="Manual"
                            onError={(e) => {
                              e.target.src =
                                "https://images.unsplash.com/photo-1497366412874-3415097a27e7";
                            }}
                          />
                          <div className="image-caption">URL preview</div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
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