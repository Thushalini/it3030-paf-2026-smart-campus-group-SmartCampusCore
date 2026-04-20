import { useState, useEffect } from "react";
import ImageUploader from "./ImageUploader";
import axios from "axios";
import "./TicketForm.css";

export default function TicketForm({ onSubmit, loading, initialValues }) {
  const [formData, setFormData] = useState({
    contactDetails: {}, // safe initialization
    ...initialValues
  });
  const [files, setFiles] = useState([]);
  const [resources, setResources] = useState([]);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/resources`, {
          auth: {
            username: "user",      // Spring Security default username
            password: "password"   // Spring Security default password
          }
        });
        console.log("Fetched resources:", res.data.data); // debug log
        setResources(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch resources", err);
      }
    };
    fetchResources();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Step 1: create ticket
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/tickets`,
        formData,
        {
          auth: {
            username: "user",
            password: "password"
          }
        }
      );

      const ticketId = res.data.data.id; // adjust based on your backend response DTO

      // Step 2: upload attachments if any
      if (files.length > 0) {
        const formDataWithFiles = new FormData();
        files.forEach((file) => formDataWithFiles.append("files", file));

        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/tickets/${ticketId}/attachments`,
          formDataWithFiles,
          {
            headers: { "Content-Type": "multipart/form-data" },
            auth: {
              username: "user",
              password: "password"
            }
          }
        );
      }

      console.log("Ticket created with attachments");
    } catch (err) {
      console.error("Failed to create ticket", err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Title */}
      <input
        type="text"
        name="title"
        placeholder="Title"
        required
        value={formData.title || ""}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
      />

      {/* Resource dropdown */}
      <select
        name="resourceId"
        required
        value={formData.resourceId || ""}
        onChange={(e) => {
          const selected = resources.find((r) => r._id === e.target.value);
          if (selected) {
            setFormData({
              ...formData,
              resourceId: selected._id,
              resourceName: selected.name,
              location: `${selected.location}, ${selected.building}, Floor ${selected.floor}, Room ${selected.roomNumber}`
            });
          }
        }}
      >
        <option value="">Select Resource</option>
        {resources.map((r) => (
          <option key={r._id} value={r._id}>
            {r.name} ({r.location})
          </option>
        ))}
      </select>

      {/* Auto-filled location */}
      <input
        type="text"
        name="location"
        placeholder="Resource Location"
        value={formData.location || ""}
        readOnly
      />

      {/* Category */}
      <select
        name="category"
        required
        value={formData.category || ""}
        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
      >
        <option value="">Select Category</option>
        <option value="ELECTRICAL">Electrical</option>
        <option value="PLUMBING">Plumbing</option>
        <option value="IT_EQUIPMENT">IT Equipment</option>
        <option value="FURNITURE">Furniture</option>
        <option value="HVAC">HVAC</option>
        <option value="SAFETY">Safety</option>
        <option value="OTHER">Other</option>
      </select>

      {/* Description */}
      <textarea
        name="description"
        placeholder="Description"
        required
        maxLength={1000}
        value={formData.description || ""}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      />

      {/* Priority */}
      <select
        name="priority"
        required
        value={formData.priority || ""}
        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
      >
        <option value="">Select Priority</option>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
        <option value="CRITICAL">Critical</option>
      </select>

      {/* Contact details */}
      <input
        type="text"
        name="contactName"
        placeholder="Contact Name"
        required
        value={formData.contactDetails.contactName || ""}
        onChange={(e) =>
          setFormData({
            ...formData,
            contactDetails: {
              ...(formData.contactDetails || {}),
              contactName: e.target.value,
            },
          })
        }
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        required
        value={formData.contactDetails.email || ""}
        onChange={(e) =>
          setFormData({
            ...formData,
            contactDetails: {
              ...(formData.contactDetails || {}),
              email: e.target.value,
            },
          })
        }
      />
      <input
        type="text"
        name="phone"
        placeholder="Phone (optional)"
        value={formData.contactDetails.phone || ""}
        onChange={(e) =>
          setFormData({
            ...formData,
            contactDetails: {
              ...(formData.contactDetails || {}),
              phone: e.target.value,
            },
          })
        }
      />
      <select
        name="preferredMethod"
        required
        value={formData.contactDetails.preferredMethod || ""}
        onChange={(e) =>
          setFormData({
            ...formData,
            contactDetails: {
              ...(formData.contactDetails || {}),
              preferredMethod: e.target.value,
            },
          })
        }
      >
        <option value="">Preferred Contact Method</option>
        <option value="EMAIL">Email</option>
        <option value="PHONE">Phone</option>
      </select>

      {/* Image uploader */}
      <ImageUploader onChange={setFiles} maxFiles={3} />

      <button type="submit" disabled={loading}>Create Ticket</button>
    </form>
  );
}
