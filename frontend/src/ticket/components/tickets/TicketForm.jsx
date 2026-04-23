import { useState, useEffect } from "react";
import ImageUploader from "./ImageUploader";
import ticketApi from "../../api/ticketApi";
import "./TicketForm.css";

export default function TicketForm({ onSubmit, loading, initialValues }) {
  const [formData, setFormData] = useState({ contactDetails: {}, ...initialValues });
  const [files, setFiles] = useState([]);
  const [resources, setResources] = useState([]);
  const [resourceError, setResourceError] = useState(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setResourceError(null);
        const res = await ticketApi.get("/resources");
        setResources(res.data?.data || []);
      } catch (err) {
        console.error("Failed to fetch resources", err);
        setResourceError("Could not load resources. Is the backend running?");
      }
    };
    fetchResources();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData, files);
  };

  return (
    <form className="ticket-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <h2>Report an Issue</h2>
        <p>Submit a maintenance or incident ticket for campus facilities</p>
      </div>

      <div className="field field-full">
        <label>Ticket Title</label>
        <input type="text" name="title" placeholder="e.g., Flickering light in Lab 2" required
          value={formData.title || ""}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
      </div>

      <div className="field">
        <label>Facility / Resource</label>
        <select name="resourceId" required value={formData.resourceId || ""}
          onChange={(e) => {
            const selected = resources.find((r) => r._id === e.target.value);
            if (selected) {
              setFormData({
                ...formData,
                resourceId: selected._id,
                resourceName: selected.name,
                location: `${selected.location}, ${selected.building}, Floor ${selected.floor}, Room ${selected.roomNumber}`
              });
            } else {
              setFormData({ ...formData, resourceId: "", resourceName: "", location: "" });
            }
          }}>
          <option value="">{resourceError || "Select Resource"}</option>
          {resources.map((r) => (
            <option key={r._id} value={r._id}>{r.name} ({r.location})</option>
          ))}
        </select>
        {resourceError && <p style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: "0.25rem" }}>{resourceError}</p>}
      </div>

      <div className="field">
        <label>Auto-detected Location</label>
        <input type="text" name="location" placeholder="Resource Location" value={formData.location || ""} readOnly />
      </div>

      <div className="field">
        <label>Category</label>
        <select name="category" required value={formData.category || ""}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
          <option value="">Select Category</option>
          <option value="ELECTRICAL">Electrical</option>
          <option value="PLUMBING">Plumbing</option>
          <option value="IT_EQUIPMENT">IT Equipment</option>
          <option value="FURNITURE">Furniture</option>
          <option value="HVAC">HVAC</option>
          <option value="SAFETY">Safety</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      <div className="field">
        <label>Priority Level</label>
        <select name="priority" required value={formData.priority || ""}
          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
          <option value="">Select Priority</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>
      </div>

      <div className="field field-full">
        <label>Description</label>
        <textarea name="description" placeholder="Describe the issue in detail..." required maxLength={1000}
          value={formData.description || ""}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
      </div>

      <div className="form-section">Contact Information</div>

      <div className="field">
        <label>Contact Name</label>
        <input type="text" name="contactName" placeholder="Your name" required
          value={formData.contactDetails?.contactName || ""}
          onChange={(e) => setFormData({ ...formData, contactDetails: { ...(formData.contactDetails || {}), contactName: e.target.value } })} />
      </div>

      <div className="field">
        <label>Email</label>
        <input type="email" name="email" placeholder="you@my.uni.lk" required
          value={formData.contactDetails?.email || ""}
          onChange={(e) => setFormData({ ...formData, contactDetails: { ...(formData.contactDetails || {}), email: e.target.value } })} />
      </div>

      <div className="field">
        <label>Phone <span style={{ fontWeight: 400, color: "#94a3b8" }}>(optional)</span></label>
        <input type="text" name="phone" placeholder="Phone number"
          value={formData.contactDetails?.phone || ""}
          onChange={(e) => setFormData({ ...formData, contactDetails: { ...(formData.contactDetails || {}), phone: e.target.value } })} />
      </div>

      <div className="field">
        <label>Preferred Contact Method</label>
        <select name="preferredMethod" required value={formData.contactDetails?.preferredMethod || ""}
          onChange={(e) => setFormData({ ...formData, contactDetails: { ...(formData.contactDetails || {}), preferredMethod: e.target.value } })}>
          <option value="">Select Method</option>
          <option value="EMAIL">Email</option>
          <option value="PHONE">Phone</option>
        </select>
      </div>

      <div className="upload-wrapper">
        <label>Attachments</label>
        <div className="upload-zone">
          <ImageUploader onChange={setFiles} maxFiles={3} />
          <div className="upload-content">
            <p>Click to upload or drag & drop</p>
            <span>PNG, JPG • Max 3 files</span>
          </div>
        </div>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Ticket"}
      </button>
    </form>
  );
}