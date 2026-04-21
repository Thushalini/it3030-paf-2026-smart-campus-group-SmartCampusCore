import { useNavigate } from "react-router-dom";
import TicketStatusBadge from "./TicketStatusBadge";
import PriorityBadge from "./PriorityBadge";
import "./TicketCard.css";

export default function TicketCard({ ticket, onClick, showActions = false }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick(ticket);
    } else {
      navigate(`/tickets/${ticket.id}`);
    }
  };

  const handleViewDetails = (e) => {
    e.stopPropagation();
    navigate(`/tickets/${ticket.id}`);
  };

  return (
    <div
      className="ticket-card"
      data-priority={ticket.priority}
      onClick={handleClick}
    >
      <div className="ticket-card-header">
        <h3>
          #{ticket.ticketNumber} — {ticket.title}
        </h3>
        <div className="ticket-card-badges">
          <TicketStatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
        </div>
      </div>

      <div className="ticket-card-meta">
        <span className="category-label">{ticket.category}</span>
      </div>

      <div className="ticket-card-location">
        {ticket.location}
      </div>

      <div className="ticket-card-footer">
        <span className="ticket-card-date">
          {new Date(ticket.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        {ticket.assignedToName && (
          <span className="ticket-card-assignee">
            {ticket.assignedToName}
          </span>
        )}
      </div>

      {showActions && (
        <div className="ticket-card-actions">
          <button className="btn-view-details" onClick={handleViewDetails}>
            View Details
          </button>
        </div>
      )}
    </div>
  );
}