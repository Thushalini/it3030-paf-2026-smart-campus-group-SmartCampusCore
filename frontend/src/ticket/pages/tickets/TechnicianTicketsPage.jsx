import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAdminTickets from "../../hooks/useAdminTickets";
import TicketTable from "../../components/tickets/TicketTable";
import "./TechnicianTicketsPage.css";

/**
 * TODO (Integration with Member 4):
 * - Replace currentUserId and currentRole with real JWT values.
 * - The hook useAdminTickets will automatically filter by assignedToId when role = TECHNICIAN.
 */
export default function TechnicianTicketsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("active"); // "active" or "all"
  
  // Fetch only tickets assigned to this technician
  const { tickets, loading, error, refetch } = useAdminTickets({});

  // TODO: Replace with real auth context
  const currentRole = "TECHNICIAN";
  const currentUserId = "user123";

  // Filter tickets: active = IN_PROGRESS, all = any status
  const activeTickets = tickets.filter(t => t.status === "IN_PROGRESS");
  const allTickets = tickets;

  const displayedTickets = activeTab === "active" ? activeTickets : allTickets;

  const handleViewTicket = (ticket) => {
    navigate(`/tickets/${ticket.id}`);
  };

  const handleStatusUpdate = async (ticketId, data) => {
    // Call API then refetch
    // For now, simulate
    await new Promise(resolve => setTimeout(resolve, 500));
    refetch();
  };

  const handleAssign = async (ticketId, data) => {
    // Technicians cannot assign, but keep for completeness
    console.warn("Technicians cannot assign tickets");
  };

  return (
    <div className="technician-tickets-page">
      <h2>My Assigned Tickets</h2>

      <div className="tabs">
        <button
          className={activeTab === "active" ? "tab-active" : "tab"}
          onClick={() => setActiveTab("active")}
        >
          Active ({activeTickets.length})
        </button>
        <button
          className={activeTab === "all" ? "tab-active" : "tab"}
          onClick={() => setActiveTab("all")}
        >
          All Assigned ({allTickets.length})
        </button>
      </div>

      <TicketTable
        tickets={displayedTickets}
        onViewTicket={handleViewTicket}
        onStatusUpdate={handleStatusUpdate}
        onAssign={handleAssign}
        loading={loading}
        currentRole={currentRole}
        currentUserId={currentUserId}
      />

      {error && <div className="error-message">{error}</div>}
    </div>
  );
}