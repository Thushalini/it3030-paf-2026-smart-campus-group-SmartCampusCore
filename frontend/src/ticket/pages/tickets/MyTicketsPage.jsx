import useTickets from "../../hooks/useTickets";
import TicketCard from "../../components/tickets/TicketCard";
import TicketFilterBar from "../../components/tickets/TicketFilterBar";

export default function MyTicketsPage() {
  const { tickets, loading, error, filters, setFilters } = useTickets({});

  return (
    <div>
      <h2>My Tickets</h2>
      <TicketFilterBar
        filters={filters}
        onFilterChange={setFilters}
        showAssigneeFilter={false}
      />

      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {!loading && tickets.length === 0 ? (
        <p>No tickets yet. Raise your first incident.</p>
      ) : (
        tickets.map((ticket) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            onClick={() => console.log("Navigate to detail")}
          />
        ))
      )}

      <button onClick={() => console.log("Navigate to CreateTicketPage")}>
        Raise New Ticket
      </button>
    </div>
  );
}