export default function PriorityBadge({ priority }) {
  const colors = {
    CRITICAL: "red",
    HIGH: "orange",
    MEDIUM: "dodgerblue",
    LOW: "green",
  };

  return (
    <span style={{
      backgroundColor: colors[priority] || "black",
      color: "white",
      padding: "0.2rem 0.5rem",
      borderRadius: "5px"
    }}>
      {priority}
    </span>
  );
}
