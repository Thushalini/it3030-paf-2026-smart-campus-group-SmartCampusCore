import { useState, useEffect } from "react";
import { getAllowedTransitions, getStatusLabel } from "../../constants/ticketStatus";
import "./StatusUpdateModal.css";

export default function StatusUpdateModal({ ticket, onUpdate, onClose, currentRole }) {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");
  const [error, setError] = useState("");

  const allowedTransitions = getAllowedTransitions(ticket?.status, currentRole);

  // Reset form when modal opens for a different ticket
  useEffect(() => {
    setSelectedStatus("");
    setRejectionReason("");
    setResolutionNote("");
    setError("");
  }, [ticket?.id]);

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

  if (!ticket) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Update Ticket Status</h3>
        <p className="modal-subtitle">
          {ticket.ticketNumber} — Current: <strong>{getStatusLabel(ticket.status)}</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Status *</label>
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
                  {getStatusLabel(status)}
                </option>
              ))}
            </select>
            {allowedTransitions.length === 0 && (
              <small className="field-hint">No transitions available for your role.</small>
            )}
          </div>

          {selectedStatus === "REJECTED" && (
            <div className="form-group">
              <label>Rejection Reason *</label>
              <textarea
                rows="3"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Why is this ticket being rejected?"
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
                placeholder="How was the issue resolved?"
                required
              />
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={!selectedStatus}>
              Update Status
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}