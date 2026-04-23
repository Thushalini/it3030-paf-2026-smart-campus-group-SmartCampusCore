import { useState, useEffect, useCallback } from "react";
import { getMyTickets } from "../api/ticketApi";

export default function useTickets(initialFilters = {}) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [version, setVersion] = useState(0);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyTickets(filters);
      const pageData = res.data?.data;
      const list = pageData?.content || pageData || [];
      setTickets(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to fetch tickets");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [filters, version]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const refetch = useCallback(() => setVersion(v => v + 1), []);

  return { tickets, loading, error, filters, setFilters, refetch };
}