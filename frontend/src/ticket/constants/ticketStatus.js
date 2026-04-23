export const TicketStatus = {
  OPEN: "OPEN",
  IN_PROGRESS: "IN_PROGRESS",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED",
  REJECTED: "REJECTED",
};

// Allowed transitions based on current status and role (simplified)
export const getAllowedTransitions = (currentStatus, role) => {
  const common = {
    OPEN: ["IN_PROGRESS", "REJECTED"],
    IN_PROGRESS: ["RESOLVED", "REJECTED"],
    RESOLVED: ["CLOSED"],
    CLOSED: [],
    REJECTED: [],
  };
  // Admin can also move RESOLVED back to IN_PROGRESS? Not in spec, but add if needed.
  if (role === "ADMIN") {
    if (currentStatus === "RESOLVED") return ["CLOSED", "IN_PROGRESS"];
    if (currentStatus === "REJECTED") return ["OPEN"];
  }
  if (role === "TECHNICIAN") {
    // Technician can only move IN_PROGRESS → RESOLVED
    if (currentStatus === "IN_PROGRESS") return ["RESOLVED"];
    return [];
  }
  return common[currentStatus] || [];
};