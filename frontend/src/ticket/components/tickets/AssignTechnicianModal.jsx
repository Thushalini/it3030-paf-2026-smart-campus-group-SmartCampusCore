import { useState, useEffect } from "react";
import axios from "axios";
import "./AssignTechnicianModal.css";

/**
 * Props:
 * - ticketId (string)
 * - currentAssignee (string|null) – technician name or null
 * - onAssign (function) – called with { technicianId, technicianName }
 * - onClose (function)
 * 
 * TODO (Integration with Member 4):
 * - Replace mock data with real endpoint /api/v1/users?role=TECHNICIAN
 * - Add authentication headers once JWT is ready.
 */
export default function AssignTechnicianModal({ ticketId, currentAssignee, onAssign, onClose }) {
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechId, setSelectedTechId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Temporary mock data for testing (remove when Member 4's API is ready)
  const MOCK_TECHNICIANS = [
    { id: "tech1", fullName: "John Doe", email: "john.doe@example.com" },
    { id: "tech2", fullName: "Jane Smith", email: "jane.smith@example.com" },
    { id: "tech3", fullName: "Bob Johnson", email: "bob.johnson@example.com" },
  ];

  useEffect(() => {
    const fetchTechnicians = async () => {
      setLoading(true);
      setError(null);
      try {
        // TODO: Replace with real endpoint from Member 4
        const response = await axios.get("/api/v1/users?role=TECHNICIAN");
        
        // Extract technicians array from response – handle different structures
        let techsArray = [];
        if (response.data?.data && Array.isArray(response.data.data)) {
          techsArray = response.data.data;
        } else if (Array.isArray(response.data)) {
          techsArray = response.data;
        } else {
          // If response is not as expected, fallback to mock (or empty)
          console.warn("Unexpected API response, using mock technicians:", response.data);
          techsArray = MOCK_TECHNICIANS;
        }
        
        setTechnicians(techsArray);
        
        // Pre-select current assignee if found
        if (currentAssignee) {
          const current = techsArray.find(t => t.fullName === currentAssignee);
          if (current) setSelectedTechId(current.id);
        }
      } catch (err) {
        console.error("Failed to fetch technicians:", err);
        // Fallback to mock data for development
        setTechnicians(MOCK_TECHNICIANS);
        setError("Could not load technicians from server. Using demo list.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchTechnicians();
  }, [currentAssignee]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedTechId) return;
    const selected = technicians.find(t => t.id === selectedTechId);
    if (selected) {
      onAssign({ technicianId: selected.id, technicianName: selected.fullName });
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Assign Technician</h3>
        {loading && <p>Loading technicians...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && technicians.length === 0 && !error && (
          <p>No technicians available.</p>
        )}
        {!loading && technicians.length > 0 && (
          <form onSubmit={handleSubmit}>
            <select
              value={selectedTechId}
              onChange={(e) => setSelectedTechId(e.target.value)}
              required
            >
              <option value="">Select a technician</option>
              {technicians.map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.fullName} ({tech.email})
                </option>
              ))}
            </select>
            <div className="modal-actions">
              <button type="button" onClick={onClose}>Cancel</button>
              <button type="submit">Assign</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}