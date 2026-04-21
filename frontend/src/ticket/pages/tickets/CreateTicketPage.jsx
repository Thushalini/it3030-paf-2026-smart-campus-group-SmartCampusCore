import { useNavigate } from "react-router-dom";
import TicketForm from "../../components/tickets/TicketForm";
import { createTicket, uploadAttachments } from "../../api/ticketApi";

export default function CreateTicketPage() {
  const navigate = useNavigate();

  const handleSubmit = async (ticketData, files) => {
    try {
      // Step 1: Create ticket (without images)
      const res = await createTicket(ticketData);
      const ticketId = res.data.data.id; // ApiResponse<TicketResponseDTO>

      // Step 2: Upload attachments if any
      if (files && files.length > 0) {
        await uploadAttachments(ticketId, files);
      }

      // TODO: show success toast
      navigate("/tickets/my"); // TODO: role-based redirect (Admin → /admin/tickets)
    } catch (err) {
      // TODO: show error toast
      console.error(err);
    }
  };

  return <TicketForm onSubmit={handleSubmit} loading={false} />;
}
