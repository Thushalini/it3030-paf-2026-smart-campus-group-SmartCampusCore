import "./TicketFilterBar.css";

export default function TicketFilterBar({ filters, onFilterChange, showAssigneeFilter = false }) {
  const handleChange = (e) => {
    onFilterChange({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="filter-bar">
      <select name="status" value={filters.status || ""} onChange={handleChange}>
        <option value="">All Statuses</option>
        <option value="OPEN">Open</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="RESOLVED">Resolved</option>
        <option value="CLOSED">Closed</option>
        <option value="REJECTED">Rejected</option>
      </select>

      <select name="priority" value={filters.priority || ""} onChange={handleChange}>
        <option value="">All Priorities</option>
        <option value="CRITICAL">Critical</option>
        <option value="HIGH">High</option>
        <option value="MEDIUM">Medium</option>
        <option value="LOW">Low</option>
      </select>

      <select name="category" value={filters.category || ""} onChange={handleChange}>
        <option value="">All Categories</option>
        <option value="ELECTRICAL">Electrical</option>
        <option value="PLUMBING">Plumbing</option>
        <option value="IT_EQUIPMENT">IT Equipment</option>
        <option value="FURNITURE">Furniture</option>
        <option value="HVAC">HVAC</option>
        <option value="SAFETY">Safety</option>
        <option value="OTHER">Other</option>
      </select>

      {showAssigneeFilter && (
        <select name="assignedToId" value={filters.assignedToId || ""} onChange={handleChange}>
          <option value="">All Technicians</option>
          {/* TODO: populate technician list from backend once Member 2 API is ready */}
        </select>
      )}

      <input
        type="text"
        name="search"
        placeholder="Search title/description"
        value={filters.search || ""}
        onChange={handleChange}
      />
    </div>
  );
}
