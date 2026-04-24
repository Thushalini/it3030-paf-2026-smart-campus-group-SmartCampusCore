import { useState, useEffect } from "react";
import { getTechnicians } from "../../api/ticketApi";
import "./AssignTechnicianModal.css";

export default function AssignTechnicianModal({ ticket, onAssign, onClose }) {
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechId, setSelectedTechId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchTechs = async () => {
      setLoading(true);
      try {
        const res = await getTechnicians();
        if (mounted) setTechnicians(res.data?.data || []);
      } catch {
        if (mounted) setError("Failed to load technicians");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchTechs();
    return () => { mounted = false; };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedTechId) {
      setError("Please select a technician");
      return;
    }
    const tech = technicians.find((t) => t.id === selectedTechId);
    onAssign({ technicianId: selectedTechId, technicianName: tech.fullName });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Assign Technician</h3>
        <p className="modal-subtitle">
          {ticket?.ticketNumber} — <em>Will auto-set status to In Progress</em>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Technician *</label>
            {loading ? (
              <p>Loading…</p>
            ) : (
              <select
                value={selectedTechId}
                onChange={(e) => {
                  setSelectedTechId(e.target.value);
                  setError(null);
                }}
                required
              >
                <option value="">Choose technician…</option>
                {technicians.map((tech) => (
                  <option key={tech.id} value={tech.id}>
                    {tech.fullName} ({tech.email})
                  </option>
                ))}
              </select>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={!selectedTechId || loading}>
              Assign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}