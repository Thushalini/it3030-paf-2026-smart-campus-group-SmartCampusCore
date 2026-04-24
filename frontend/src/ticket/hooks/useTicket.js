import { useState, useEffect, useCallback } from "react";
import { getTicketById, updateTicketStatus } from "../api/ticketApi";

export default function useTicket(ticketId) {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTicket = useCallback(async () => {
    if (!ticketId) return;
    setLoading(true);
    try {
      const res = await getTicketById(ticketId);
      setTicket(res.data?.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  const updateStatus = async (data) => {
    const res = await updateTicketStatus(ticketId, data);
    const updated = res.data?.data;
    setTicket(updated);
    return updated;
  };

  return { ticket, loading, error, refetch: fetchTicket, updateStatus };
}