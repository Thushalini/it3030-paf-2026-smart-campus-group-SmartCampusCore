import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CreateTicketPage from "./ticket/pages/tickets/CreateTicketPage.jsx";
import MyTicketsPage from "./ticket/pages/tickets/MyTicketsPage.jsx";
// TODO: later import TicketDetailPage, AdminTicketManagementPage, TechnicianTicketsPage

function App() {
  return (
    <Router>
      <div>
        {/* Simple navigation bar */}
        <nav style={{ padding: "1rem", background: "#f0f0f0" }}>
          <Link to="/" style={{ marginRight: "1rem" }}>Home</Link>
          <Link to="/tickets/create" style={{ marginRight: "1rem" }}>Create Ticket</Link>
          <Link to="/tickets/my">My Tickets</Link>
          {/* TODO: add more links as you build chunks 9–12 */}
        </nav>

        {/* Route definitions */}
        <Routes>
          <Route path="/" element={<h1>Welcome to Smart Campus</h1>} />
          <Route path="/tickets/create" element={<CreateTicketPage />} />
          <Route path="/tickets/my" element={<MyTicketsPage />} />
          {/* TODO: add /tickets/:id, /admin/tickets, /technician/tickets */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
