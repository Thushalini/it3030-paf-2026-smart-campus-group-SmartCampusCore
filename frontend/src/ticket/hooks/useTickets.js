import { useState, useEffect, useCallback } from "react";
import { getMyTickets } from "../api/ticketApi";

export default function useTickets(initialFilters = {}) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getMyTickets(filters);
        const pageData = res.data?.data;
        const list = pageData?.content || pageData || [];
        if (!cancelled) {
          setTickets(Array.isArray(list) ? list : []);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || err.message || "Failed to fetch tickets");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetch();
    return () => {
      cancelled = true;
    };
  }, [filters, version]);

  const refetch = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  return { tickets, loading, error, filters, setFilters, refetch };
}