export const TicketStatus = {
  OPEN: "OPEN",
  IN_PROGRESS: "IN_PROGRESS",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED",
  REJECTED: "REJECTED",
};

export const getAllowedTransitions = (currentStatus, role) => {
  // Base transitions
  const common = {
    OPEN: ["IN_PROGRESS", "REJECTED"],
    IN_PROGRESS: ["RESOLVED", "REJECTED"],
    RESOLVED: ["CLOSED"],
    CLOSED: [],
    REJECTED: [],
  };

  if (role === "ADMIN") {
    if (currentStatus === "RESOLVED") return ["CLOSED", "IN_PROGRESS"];
    if (currentStatus === "REJECTED") return ["OPEN"];
    if (currentStatus === "OPEN") return ["IN_PROGRESS", "REJECTED"];
    if (currentStatus === "IN_PROGRESS") return ["RESOLVED", "REJECTED"];
  }

  if (role === "TECHNICIAN") {
    if (currentStatus === "IN_PROGRESS") return ["RESOLVED"];
    return [];
  }

  return common[currentStatus] || [];
};

export const getStatusLabel = (status) => {
  if (!status) return "";
  return status.replace(/_/g, " ");
};

export const getStatusColor = (status) => {
  const map = {
    OPEN: "blue",
    IN_PROGRESS: "amber",
    RESOLVED: "green",
    CLOSED: "gray",
    REJECTED: "red",
  };
  return map[status] || "gray";
};