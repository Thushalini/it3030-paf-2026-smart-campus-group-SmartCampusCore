import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import useTickets from "../../hooks/useTickets";
import TicketCard from "../../components/tickets/TicketCard";
import TicketFilterBar from "../../components/tickets/TicketFilterBar";
import "./MyTicketsPage.css";

export default function MyTicketsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tickets, loading, error, filters, setFilters, refetch } = useTickets({});
  const isFirstRender = useRef(true);

  // Refetch when navigating back to this page, but NOT on initial mount
  // (useTickets already fetches on mount)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    refetch();
  }, [location.key, refetch]);

  const handleTicketClick = (ticket) => {
    navigate(`/tickets/${ticket.id}`);
  };

  return (
    <div className="my-tickets-page">
      <h2>My Tickets</h2>

      <TicketFilterBar
        filters={filters}
        onFilterChange={setFilters}
        showAssigneeFilter={false}
      />

      {loading && <div className="loading-state">Loading tickets...</div>}
      {error && <div className="error-state">Error: {error}</div>}

      {!loading && tickets.length === 0 ? (
        <div className="empty-state">
          <p>No tickets yet. Raise your first incident.</p>
          <button
            className="btn-create-ticket"
            onClick={() => navigate("/tickets/create")}
          >
            Raise New Ticket
          </button>
        </div>
      ) : (
        <div className="tickets-list">
          {tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onClick={handleTicketClick}
            />
          ))}
        </div>
      )}

      {tickets.length > 0 && (
        <button
          className="btn-create-ticket"
          onClick={() => navigate("/tickets/create")}
        >
          + Raise New Ticket
        </button>
      )}
    </div>
  );
}