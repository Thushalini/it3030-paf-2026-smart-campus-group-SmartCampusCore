import { useState, useEffect, useCallback } from "react";
import { getTicketById, updateTicketStatus, assignTechnician } from "../api/ticketApi";
import { getComments, addComment as apiAddComment, updateComment as apiUpdateComment, deleteComment as apiDeleteComment } from "../api/commentApi";

export default function useTicketDetail(ticketId) {
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [statusHistory, setStatusHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentUserId = "user123";   // TODO: Member 4 JWT
  const currentUserRole = "USER";    // TODO: Member 4 JWT

  const fetchTicket = useCallback(async () => {
    if (!ticketId) return;
    setLoading(true);
    try {
      const res = await getTicketById(ticketId);
      const data = res.data?.data;
      setTicket(data);
      setStatusHistory(data?.statusHistory || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load ticket");
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  const fetchComments = useCallback(async () => {
    if (!ticketId) return;
    try {
      const res = await getComments(ticketId);
      setComments(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error("Failed to fetch comments", err);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchTicket();
    fetchComments();
  }, [fetchTicket, fetchComments]);

  const addComment = async (content) => {
    const res = await apiAddComment(ticketId, content);
    const newComment = res.data?.data;
    if (newComment) setComments(prev => [...prev, newComment]);
    return newComment;
  };

  const updateComment = async (commentId, content) => {
    const res = await apiUpdateComment(ticketId, commentId, content);
    const updated = res.data?.data;
    if (updated) setComments(prev => prev.map(c => c.id === commentId ? updated : c));
    return updated;
  };

  const deleteComment = async (commentId) => {
    await apiDeleteComment(ticketId, commentId);
    setComments(prev => prev.map(c => c.id === commentId ? { ...c, content: "[deleted]", canEdit: false, canDelete: false } : c));
  };

  const updateStatus = async (data) => {
    const res = await updateTicketStatus(ticketId, data);
    const updated = res.data?.data;
    setTicket(updated);
    return updated;
  };

  const assignTech = async (data) => {
    const res = await assignTechnician(ticketId, data);
    const updated = res.data?.data;
    setTicket(updated);
    return updated;
  };

  return {
    ticket, comments, statusHistory, loading, error,
    currentUserId, currentUserRole,
    addComment, updateComment, deleteComment, updateStatus, assignTech,
  };
}