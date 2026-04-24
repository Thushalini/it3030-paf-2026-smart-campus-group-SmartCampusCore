import "./TicketStatusBadge.css";

export default function TicketStatusBadge({ status }) {
  const normalized = status?.toLowerCase() || "open";

  return (
    <span className={`status-badge status-${normalized}`}>
      {status?.replace("_", " ") || "OPEN"}
    </span>
  );
}