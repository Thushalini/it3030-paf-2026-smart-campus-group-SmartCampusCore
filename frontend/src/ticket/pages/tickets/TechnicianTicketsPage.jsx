import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useTechnicianTickets from "../../hooks/useTechnicianTickets";
import StatusUpdateModal from "../../components/tickets/StatusUpdateModal";
import { updateTicketStatus } from "../../api/ticketApi";
import { getStatusColor, getStatusLabel } from "../../constants/ticketStatus";
import "./TechnicianTicketsPage.css";

export default function TechnicianTicketPage() {
  const navigate = useNavigate();
  const { tickets, loading, error, filters, setFilters, refetch, currentRole } =
    useTechnicianTickets({});

  const [statusTicket, setStatusTicket] = useState(null);
  const [actionError, setActionError] = useState(null);

  const handleStatusUpdate = async (ticketId, data) => {
    setActionError(null);
    try {
      await updateTicketStatus(ticketId, data);
      await refetch();
      setStatusTicket(null);
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || "Update failed");
    }
  };

  return (
    <div className="technician-tickets-page">
      <h2>My Assigned Tickets</h2>

      {actionError && (
        <div className="error-banner" onClick={() => setActionError(null)}>
          ⚠️ {actionError}
        </div>
      )}

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search…"
          value={filters.search || ""}
          onChange={(e) => setFilters({ search: e.target.value })}
        />
        <select
          value={filters.status || ""}
          onChange={(e) => setFilters({ status: e.target.value || null })}
        >
          <option value="">All Statuses</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
        </select>
        <button className="btn-secondary" onClick={() => setFilters({ status: null, search: null })}>
          Clear
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading…</div>
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
                <th>SLA</th>
                <th>Location</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan="9" className="no-data">
                    No assigned tickets
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
                    <td>
                      {t.slaBreached === true ? (
                        <span className="badge sla-breached">Breached</span>
                      ) : t.slaBreached === false ? (
                        <span className="badge sla-ok">Met</span>
                      ) : (
                        <span className="badge sla-pending">Pending</span>
                      )}
                    </td>
                    <td>{t.location}</td>
                    <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td className="actions">
                      <button className="btn-sm" onClick={() => navigate(`/tickets/${t.id}`)}>
                        View
                      </button>
                      {t.status === "IN_PROGRESS" && (
                        <button className="btn-sm btn-resolve" onClick={() => setStatusTicket(t)}>
                          Resolve
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
    </div>
  );
}