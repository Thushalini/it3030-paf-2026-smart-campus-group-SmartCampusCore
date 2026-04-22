import { useState, useEffect, useCallback } from "react";
import { getAllTickets } from "../api/ticketApi";

/**
 * TODO (Integration with Member 4):
 * - Replace currentUserId and currentRole with real values from JWT context.
 */
export default function useAdminTickets(initialFilters = {}) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filters, setFilters] = useState({
    page: 0,
    size: 10,
    sortBy: "createdAt",
    sortDir: "DESC",
    ...initialFilters,
  });

  // TODO: Replace with real user context from JWT
  const currentUserId = "user123";
  const currentRole = "ADMIN"; // or "TECHNICIAN"

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { ...filters };
      if (currentRole === "TECHNICIAN") {
        params.assignedToId = currentUserId;
      }
      const response = await getAllTickets(params);
      
      // ✅ FIX: Extract the Page object from response.data.data
      const pageData = response.data?.data;
      const ticketsArray = pageData?.content || [];
      
      setTickets(ticketsArray);
      setTotalPages(pageData?.totalPages || 0);
      setTotalElements(pageData?.totalElements || 0);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to fetch tickets");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [filters, currentUserId, currentRole]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const refetch = () => fetchTickets();

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 0 }));
  };

  const goToPage = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  return {
    tickets,
    loading,
    error,
    totalPages,
    totalElements,
    filters,
    setFilters: updateFilters,
    goToPage,
    refetch,
  };
}