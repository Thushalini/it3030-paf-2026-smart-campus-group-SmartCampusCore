import { useNavigate } from "react-router-dom";
import TicketForm from "../../components/tickets/TicketForm";
import { createTicket, uploadAttachments } from "../../api/ticketApi";
import "./CreateTicketPage.css";

export default function CreateTicketPage() {
  const navigate = useNavigate();

  const handleSubmit = async (ticketData, files) => {
    try {
      const res = await createTicket(ticketData);
      const ticketId = res.data?.data?.id || res.data?.data?._id; // handle both id formats
      
      if (!ticketId) {
        console.error("No ticket ID in response", res.data);
        alert("Ticket created but no ID returned. Please refresh.");
        return;
      }

      if (files && files.length > 0) {
        await uploadAttachments(ticketId, files);
      }

      navigate("/tickets/my");
    } catch (err) {
      console.error(err);
      alert("Failed to create ticket: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="create-ticket-page">
      <div className="create-ticket-container">
        <div className="page-breadcrumb">
          <button onClick={() => navigate("/tickets/my")}>
            ← Back to My Tickets
          </button>
        </div>

        <div className="page-header">
          <h1>Create New Ticket</h1>
          <p>Report a facility issue and we'll get it resolved quickly.</p>
        </div>

        <TicketForm onSubmit={handleSubmit} loading={false} />
      </div>
    </div>
  );
}