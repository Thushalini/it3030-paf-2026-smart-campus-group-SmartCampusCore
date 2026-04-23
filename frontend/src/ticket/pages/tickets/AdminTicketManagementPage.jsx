import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAdminTickets from "../../hooks/useAdminTickets";
import StatusUpdateModal from "../../components/tickets/StatusUpdateModal";
import AssignTechnicianModal from "../../components/tickets/AssignTechnicianModal";
import { getTicketAnalytics, updateTicketStatus, assignTechnician } from "../../api/ticketApi";
import { getStatusColor, getStatusLabel } from "../../constants/ticketStatus";
import "./AdminTicketManagementPage.css";

export default function AdminTicketManagementPage() {
  const navigate = useNavigate();
  const {
    tickets,
    loading,
    error,
    totalElements,
    filters,
    setFilters,
    refetch,
    currentRole,
  } = useAdminTickets({});

  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [statusTicket, setStatusTicket] = useState(null);
  const [assignTicket, setAssignTicket] = useState(null);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setAnalyticsLoading(true);
      try {
        const res = await getTicketAnalytics();
        setAnalytics(res.data?.data);
      } catch (err) {
        console.error("Analytics failed", err);
      } finally {
        setAnalyticsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const refreshAnalytics = async () => {
    try {
      const res = await getTicketAnalytics();
      setAnalytics(res.data?.data);
    } catch (err) {
      console.error("Analytics refresh failed", err);
    }
  };

  const handleStatusUpdate = async (ticketId, data) => {
    setActionError(null);
    try {
      await updateTicketStatus(ticketId, data);
      await refetch();
      await refreshAnalytics();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Update failed";
      setActionError(msg);
    }
  };

  const handleAssign = async (ticketId, data) => {
    setActionError(null);
    try {
      await assignTechnician(ticketId, data);
      await refetch();
      await refreshAnalytics();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Assignment failed";
      setActionError(msg);
    }
  };

  const statusCounts = analytics?.byStatus || {};
  const stats = [
    { label: "Open", value: statusCounts.OPEN || 0, color: "blue", key: "OPEN" },
    { label: "In Progress", value: statusCounts.IN_PROGRESS || 0, color: "amber", key: "IN_PROGRESS" },
    { label: "Resolved", value: statusCounts.RESOLVED || 0, color: "green", key: "RESOLVED" },
    { label: "Closed", value: statusCounts.CLOSED || 0, color: "gray", key: "CLOSED" },
    { label: "Rejected", value: statusCounts.REJECTED || 0, color: "red", key: "REJECTED" },
  ];

  const toggleStatusFilter = (key) => {
    setFilters({ status: filters.status === key ? null : key });
  };

  return (
    <div className="admin-tickets-page">
      <h2>Manage Tickets</h2>

      {actionError && (
        <div className="error-banner" onClick={() => setActionError(null)}>
          ⚠️ {actionError}
        </div>
      )}

      <div className="stats-row">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`stat-card stat-${stat.color} ${filters.status === stat.key ? "active" : ""}`}
            onClick={() => toggleStatusFilter(stat.key)}
          >
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search tickets…"
          value={filters.search || ""}
          onChange={(e) => setFilters({ search: e.target.value })}
        />
        <select
          value={filters.priority || ""}
          onChange={(e) => setFilters({ priority: e.target.value || null })}
        >
          <option value="">All Priorities</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
        <select
          value={filters.category || ""}
          onChange={(e) => setFilters({ category: e.target.value || null })}
        >
          <option value="">All Categories</option>
          <option value="ELECTRICAL">Electrical</option>
          <option value="PLUMBING">Plumbing</option>
          <option value="IT_EQUIPMENT">IT Equipment</option>
          <option value="FURNITURE">Furniture</option>
          <option value="HVAC">HVAC</option>
          <option value="SAFETY">Safety</option>
          <option value="OTHER">Other</option>
        </select>
        <button
          className="btn-secondary"
          onClick={() =>
            setFilters({ status: null, priority: null, category: null, search: null })
          }
        >
          Clear
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading tickets…</div>
      ) : (
        <div className="table-wrap">
          <table className="ticket-table">
            <thead>
              <tr>
                <th>Ticket #</th>
                <th>Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Reported By</th>
                <th>Assigned To</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan="9" className="no-data">
                    No tickets found
                  </td>
                </tr>
              ) : (
                tickets.map((t) => (
                  <tr key={t.id}>
                    <td>{t.ticketNumber}</td>
                    <td>{t.title}</td>
                    <td>{t.category}</td>
                    <td>
                      <span className={`badge priority-${t.priority?.toLowerCase()}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`badge status-${getStatusColor(t.status)}`}>
                        {getStatusLabel(t.status)}
                      </span>
                    </td>
                    <td>{t.reportedByName}</td>
                    <td>{t.assignedToName || "—"}</td>
                    <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td className="actions">
                      <button className="btn-sm" onClick={() => navigate(`/tickets/${t.id}`)}>
                        View
                      </button>

                      {(t.status === "OPEN" || t.status === "IN_PROGRESS") && !t.assignedToId && (
                        <button className="btn-sm btn-assign" onClick={() => setAssignTicket(t)}>
                          Assign
                        </button>
                      )}

                      {t.status !== "CLOSED" && t.status !== "REJECTED" && (
                        <button className="btn-sm btn-update" onClick={() => setStatusTicket(t)}>
                          Status
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {statusTicket && (
        <StatusUpdateModal
          ticket={statusTicket}
          onUpdate={(data) => handleStatusUpdate(statusTicket.id, data)}
          onClose={() => setStatusTicket(null)}
          currentRole={currentRole}
        />
      )}

      {assignTicket && (
        <AssignTechnicianModal
          ticket={assignTicket}
          onAssign={(data) => handleAssign(assignTicket.id, data)}
          onClose={() => setAssignTicket(null)}
        />
      )}

      <div className="pagination">
        <button disabled={filters.page === 0} onClick={() => setFilters({ page: filters.page - 1 })}>
          ← Prev
        </button>
        <span>
          Page {filters.page + 1} ({totalElements} items)
        </span>
        <button
          disabled={tickets.length < filters.size}
          onClick={() => setFilters({ page: filters.page + 1 })}
        >
          Next →
        </button>
      </div>
    </div>
  );
}