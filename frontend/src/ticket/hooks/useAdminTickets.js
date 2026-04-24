import { useState, useEffect, useCallback } from "react";
import { getAllTickets } from "../api/ticketApi";

export default function useAdminTickets(initialFilters = {}) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
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
      const pageData = response.data?.data;
      let list = pageData?.content || [];

      // Client-side filtering only
      if (filters.status) list = list.filter((t) => t.status === filters.status);
      if (filters.priority) list = list.filter((t) => t.priority === filters.priority);
      if (filters.category) list = list.filter((t) => t.category === filters.category);
      if (filters.search) {
        const s = filters.search.toLowerCase();
        list = list.filter(
          (t) =>
            t.title?.toLowerCase().includes(s) ||
            t.description?.toLowerCase().includes(s) ||
            t.ticketNumber?.toLowerCase().includes(s)
        );
      }

      setTickets(list);
      setTotalPages(pageData?.totalPages || 0);
      setTotalElements(list.length);
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
  const goToPage = (newPage) =>
    setFiltersState((prev) => ({ ...prev, page: newPage }));

  return { tickets, loading, error, totalPages, totalElements, filters, setFilters, goToPage, refetch };
}