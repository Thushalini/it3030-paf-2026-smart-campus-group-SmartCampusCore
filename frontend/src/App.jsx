import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import CreateTicketPage from "./ticket/pages/tickets/CreateTicketPage.jsx";
import MyTicketsPage from "./ticket/pages/tickets/MyTicketsPage.jsx";
import TicketDetailPage from "./ticket/pages/tickets/TicketDetailPage.jsx";
import "./App.css";

function NavLink({ to, children }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`nav-link ${isActive ? "active" : ""}`}>
      {children}
    </Link>
  );
}

function App() {
  return (
    <Router>
      <div>
        <nav className="app-navbar">
          <div className="app-navbar-inner">
            <Link to="/" className="navbar-brand">
              <span>Smart Campus</span>
            </Link>
            <div className="navbar-links">
              <NavLink to="/tickets/create">Create Ticket</NavLink>
              <NavLink to="/tickets/my">My Tickets</NavLink>
            </div>
          </div>
        </nav>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<h1 style={{ textAlign: "center", padding: "4rem" }}>Welcome to Smart Campus</h1>} />
            <Route path="/tickets/create" element={<CreateTicketPage />} />
            <Route path="/tickets/my" element={<MyTicketsPage />} />
            <Route path="/tickets/:id" element={<TicketDetailPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;