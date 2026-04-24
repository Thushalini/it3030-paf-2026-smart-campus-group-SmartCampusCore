import "./PriorityBadge.css";

export default function PriorityBadge({ priority }) {
  const normalized = priority?.toLowerCase() || "low";

  return (
    <span className={`priority-badge priority-${normalized}`}>
      {priority || "LOW"}
    </span>
  );
}