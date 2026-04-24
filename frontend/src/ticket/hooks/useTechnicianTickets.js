import { useState, useEffect, useCallback } from "react";
import { getAllTickets } from "../api/ticketApi";

export default function useTechnicianTickets(initialFilters = {}) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFiltersState] = useState({
    page: 0,
    size: 10,
    sortBy: "createdAt",
    sortDir: "DESC",
    ...initialFilters,
  });

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: filters.page, size: filters.size };
      const response = await getAllTickets(params);
      // Backend already filters by assigned technician when role = TECHNICIAN
      let list = response.data?.data?.content || [];

      // Only apply optional client-side filters
      if (filters.status) list = list.filter((t) => t.status === filters.status);
      if (filters.search) {
        const s = filters.search.toLowerCase();
        list = list.filter(
          (t) =>
            t.title?.toLowerCase().includes(s) ||
            t.ticketNumber?.toLowerCase().includes(s)
        );
      }

      setTickets(list);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to fetch tickets");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const refetch = () => fetchTickets();
  const setFilters = (newFilters) =>
    setFiltersState((prev) => ({ ...prev, ...newFilters, page: 0 }));

  return { tickets, loading, error, filters, setFilters, refetch };
}