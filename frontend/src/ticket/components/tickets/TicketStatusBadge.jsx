export default function TicketStatusBadge({ status }) {
  const colors = {
    OPEN: "blue",
    IN_PROGRESS: "orange",
    RESOLVED: "green",
    CLOSED: "gray",
    REJECTED: "red",
  };

  return (
    <span style={{
      backgroundColor: colors[status] || "black",
      color: "white",
      padding: "0.2rem 0.5rem",
      borderRadius: "5px"
    }}>
      {status}
    </span>
  );
}
