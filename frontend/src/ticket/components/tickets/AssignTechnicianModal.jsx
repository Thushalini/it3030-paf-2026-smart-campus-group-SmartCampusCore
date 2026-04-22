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
 * - Replace /api/v1/users?role=TECHNICIAN with the actual endpoint provided by Member 4.
 * - The endpoint should return an array of users with fields: id, fullName, email.
 * - Add authentication headers (JWT) once auth is ready.
 */
export default function AssignTechnicianModal({ ticketId, currentAssignee, onAssign, onClose }) {
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechId, setSelectedTechId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        // TODO: Replace URL with Member 4's endpoint
        const response = await axios.get("/api/v1/users?role=TECHNICIAN");
        const techs = response.data?.data || response.data || [];
        setTechnicians(techs);
        // Pre-select current assignee if any
        if (currentAssignee) {
          const current = techs.find(t => t.fullName === currentAssignee);
          if (current) setSelectedTechId(current.id);
        }
      } catch (err) {
        setError("Failed to load technician list");
        console.error(err);
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
        {!loading && !error && (
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