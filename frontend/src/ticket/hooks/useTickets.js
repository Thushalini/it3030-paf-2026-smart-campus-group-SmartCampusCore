import { useState, useEffect } from "react";
import { getMyTickets } from "../api/ticketApi";

export default function useTickets(initialFilters = {}) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await getMyTickets(filters);
      const list = res.data?.data?.content || res.data?.data || [];
      setTickets(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  return { tickets, loading, error, filters, refetch: fetchTickets, setFilters };
}