import { useState, useEffect } from "react";
import { getMyTickets } from "../api/ticketApi";

export default function useTickets(initialFilters = {}) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await getMyTickets(initialFilters);
      setTickets(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  return { tickets, loading, error, refetch: fetchTickets };
}
