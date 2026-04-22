import { useState } from "react";
import { TicketStatus } from "../../constants/ticketStatus"; // we'll create this helper
import "./StatusUpdateModal.css";

/**
 * Props:
 * - ticket (TicketResponseDTO)
 * - allowedTransitions (TicketStatus[]) – list of valid next statuses
 * - onUpdate (function) – called with { newStatus, rejectionReason?, resolutionNote? }
 * - onClose (function)
 * - currentRole (string) – "ADMIN", "TECHNICIAN", etc.
 * 
 * TODO (Integration):
 * - The allowedTransitions should mirror backend logic. 
 *   Frontend can either compute based on current status + role, or receive from backend.
 * - For now, we'll compute using a helper function (see constants file).
 */
export default function StatusUpdateModal({ ticket, allowedTransitions, onUpdate, onClose, currentRole }) {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedStatus) {
      setError("Please select a status");
      return;
    }
    if (selectedStatus === "REJECTED" && !rejectionReason.trim()) {
      setError("Rejection reason is required");
      return;
    }
    if (selectedStatus === "RESOLVED" && !resolutionNote.trim()) {
      setError("Resolution note is required");
      return;
    }
    const payload = { newStatus: selectedStatus };
    if (selectedStatus === "REJECTED") payload.rejectionReason = rejectionReason;
    if (selectedStatus === "RESOLVED") payload.resolutionNote = resolutionNote;
    onUpdate(payload);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Update Ticket Status</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setError("");
              }}
              required
            >
              <option value="">Select status</option>
              {allowedTransitions.map((status) => (
                <option key={status} value={status}>
                  {status.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          {selectedStatus === "REJECTED" && (
            <div className="form-group">
              <label>Rejection Reason *</label>
              <textarea
                rows="3"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
              />
            </div>
          )}

          {selectedStatus === "RESOLVED" && (
            <div className="form-group">
              <label>Resolution Note *</label>
              <textarea
                rows="3"
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                required
              />
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">Update</button>
          </div>
        </form>
      </div>
    </div>
  );
}