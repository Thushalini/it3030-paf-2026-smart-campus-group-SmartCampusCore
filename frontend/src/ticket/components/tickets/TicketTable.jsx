import { useState } from "react";
import TicketStatusBadge from "./TicketStatusBadge";
import PriorityBadge from "./PriorityBadge";
import AssignTechnicianModal from "./AssignTechnicianModal";
import StatusUpdateModal from "./StatusUpdateModal";
import { getAllowedTransitions } from "../../constants/ticketStatus";
import "./TicketTable.css";

/**
 * Props:
 * - tickets (TicketResponseDTO[])
 * - onViewTicket (function) – called with ticket object
 * - onStatusUpdate (function) – called with (ticketId, data)
 * - onAssign (function) – called with (ticketId, data)
 * - loading (bool)
 * - currentRole (string) – "ADMIN" or "TECHNICIAN"
 * - currentUserId (string) – for technician view
 */
export default function TicketTable({ tickets, onViewTicket, onStatusUpdate, onAssign, loading, currentRole, currentUserId }) {
  const [assignModalFor, setAssignModalFor] = useState(null);
  const [statusModalFor, setStatusModalFor] = useState(null);

  const handleAssignClick = (ticket) => {
    setAssignModalFor(ticket);
  };

  const handleStatusClick = (ticket) => {
    setStatusModalFor(ticket);
  };

  const handleAssignConfirm = async (data) => {
    if (assignModalFor) {
      await onAssign(assignModalFor.id, data);
      setAssignModalFor(null);
    }
  };

  const handleStatusConfirm = async (data) => {
    if (statusModalFor) {
      await onStatusUpdate(statusModalFor.id, data);
      setStatusModalFor(null);
    }
  };

  const canAssign = (ticket) => {
    // Admin can assign if ticket is OPEN or IN_PROGRESS
    return currentRole === "ADMIN" && (ticket.status === "OPEN" || ticket.status === "IN_PROGRESS");
  };

  const canChangeStatus = (ticket) => {
    if (currentRole === "ADMIN") return true;
    if (currentRole === "TECHNICIAN" && ticket.assignedToId === currentUserId) {
      return ticket.status === "IN_PROGRESS";
    }
    return false;
  };

  if (loading) return <div className="loading-table">Loading tickets...</div>;

  if (!tickets.length) return <div className="empty-table">No tickets found.</div>;

  return (
    <>
      <div className="ticket-table-container">
        <table className="ticket-table">
          <thead>
            <tr>
              <th>Ticket#</th><th>Title</th><th>Status</th><th>Priority</th>
              <th>Category</th><th>Location</th><th>Reporter</th><th>Assignee</th>
              <th>Created</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td>{ticket.ticketNumber}</td>
                <td>{ticket.title}</td>
                <td><TicketStatusBadge status={ticket.status} /></td>
                <td><PriorityBadge priority={ticket.priority} /></td>
                <td>{ticket.category}</td>
                <td>{ticket.location}</td>
                <td>{ticket.reportedByName || ticket.reportedById}</td>
                <td>{ticket.assignedToName || "—"}</td>
                <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                <td className="actions-cell">
                  <button className="btn-view" onClick={() => onViewTicket(ticket)}>View</button>
                  {canChangeStatus(ticket) && (
                    <button className="btn-status" onClick={() => handleStatusClick(ticket)}>Status</button>
                  )}
                  {canAssign(ticket) && (
                    <button className="btn-assign" onClick={() => handleAssignClick(ticket)}>Assign</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {assignModalFor && (
        <AssignTechnicianModal
          ticketId={assignModalFor.id}
          currentAssignee={assignModalFor.assignedToName}
          onAssign={handleAssignConfirm}
          onClose={() => setAssignModalFor(null)}
        />
      )}

      {statusModalFor && (
        <StatusUpdateModal
          ticket={statusModalFor}
          allowedTransitions={getAllowedTransitions(statusModalFor.status, currentRole)}
          onUpdate={handleStatusConfirm}
          onClose={() => setStatusModalFor(null)}
          currentRole={currentRole}
        />
      )}
    </>
  );
}