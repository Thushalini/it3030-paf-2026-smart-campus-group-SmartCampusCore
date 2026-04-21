import { useState, useEffect, useCallback } from "react";
import { getTicketById, updateTicketStatus, assignTechnician } from "../api/ticketApi";
import {
  getComments,
  addComment as apiAddComment,
  updateComment as apiUpdateComment,
  deleteComment as apiDeleteComment,
} from "../api/commentApi";

/**
 * TODO (Member 4 - JWT Integration):
 * - Replace "user123" / "USER" / "Test User" with actual user from JWT token / SecurityContext
 * - Pass auth headers in all API calls once JWT is ready
 */

export default function useTicketDetail(ticketId) {
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [statusHistory, setStatusHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // TODO: Get from JWT claims when Member 4 completes auth
  const currentUserId = "user123";
  const currentUserRole = "USER";
  const currentUserName = "Test User";

  const fetchTicket = useCallback(async () => {
    if (!ticketId) return;
    setLoading(true);
    try {
      const res = await getTicketById(ticketId);
      const ticketData = res.data?.data;
      setTicket(ticketData);
      // TODO: Backend to provide statusHistory array in TicketResponseDTO
      setStatusHistory(ticketData?.statusHistory || []);
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
      const list = res.data?.data || [];
      setComments(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Failed to fetch comments", err);
    }
  }, [ticketId]);

  const addComment = async (content) => {
    try {
      const res = await apiAddComment(ticketId, content);
      const newComment = res.data?.data;
      if (newComment) {
        setComments((prev) => [...prev, newComment]);
      }
      return newComment;
    } catch (err) {
      console.error("Failed to add comment", err);
      throw err;
    }
  };

  const updateComment = async (commentId, content) => {
    try {
      const res = await apiUpdateComment(ticketId, commentId, content);
      const updated = res.data?.data;
      if (updated) {
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? updated : c))
        );
      }
      return updated;
    } catch (err) {
      console.error("Failed to update comment", err);
      throw err;
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await apiDeleteComment(ticketId, commentId);
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? { ...c, content: "[deleted]", canEdit: false, canDelete: false }
            : c
        )
      );
    } catch (err) {
      console.error("Failed to delete comment", err);
      throw err;
    }
  };

  const updateStatus = async (data) => {
    try {
      const res = await updateTicketStatus(ticketId, data);
      const updated = res.data?.data;
      setTicket(updated);
      // TODO: Refresh statusHistory when backend provides it
      return updated;
    } catch (err) {
      console.error("Failed to update status", err);
      throw err;
    }
  };

  const assignTech = async (data) => {
    try {
      const res = await assignTechnician(ticketId, data);
      const updated = res.data?.data;
      setTicket(updated);
      return updated;
    } catch (err) {
      console.error("Failed to assign technician", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchTicket();
    fetchComments();
  }, [fetchTicket, fetchComments]);

  return {
    ticket,
    comments,
    statusHistory,
    loading,
    error,
    currentUserId,
    currentUserRole,
    fetchTicket,
    fetchComments,
    addComment,
    updateComment,
    deleteComment,
    updateStatus,
    assignTech,
  };
}