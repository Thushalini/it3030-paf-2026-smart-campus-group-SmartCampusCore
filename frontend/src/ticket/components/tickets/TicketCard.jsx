import TicketStatusBadge from "./TicketStatusBadge";
import PriorityBadge from "./PriorityBadge";

export default function TicketCard({ ticket, onClick, showActions = false }) {
  return (
    <div
      className="ticket-card"
      onClick={() => onClick && onClick(ticket)}
      style={{ cursor: "pointer", border: "1px solid #ddd", padding: "1rem", marginBottom: "1rem" }}
    >
      <h3>{ticket.ticketNumber} — {ticket.title}</h3>
      <div>
        <TicketStatusBadge status={ticket.status} />{" "}
        <PriorityBadge priority={ticket.priority} />{" "}
        <span>{ticket.category}</span>
      </div>
      <p>{ticket.location}</p>
      <small>Created: {new Date(ticket.createdAt).toLocaleString()}</small>
      {ticket.assignedToName && <p>Assigned to: {ticket.assignedToName}</p>}
      {showActions && <button>View Details</button>}
    </div>
  );
}
