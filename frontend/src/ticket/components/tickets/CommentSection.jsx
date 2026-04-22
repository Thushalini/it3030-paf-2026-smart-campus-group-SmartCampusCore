import { useState } from "react";
import CommentItem from "./CommentItem";
import "./CommentSection.css";

export default function CommentSection({
  ticketId,
  comments,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  loading,
}) {
  const [newComment, setNewComment] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await onAddComment(newComment.trim());
      setNewComment("");
    } catch (err) {
      // Error handled by parent hook
    }
  };

  return (
    <div className="comment-section">
      <h3>Comments ({comments.length})</h3>

      <div className="comments-list">
        {comments.length === 0 ? (
          <p className="no-comments">No comments yet. Be the first to comment.</p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onUpdate={onUpdateComment}
              onDelete={onDeleteComment}
            />
          ))
        )}
      </div>

      <form className="comment-form" onSubmit={handleSubmit}>
        <textarea
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          maxLength={500}
          rows={3}
          disabled={loading}
        />
        <div className="comment-form-footer">
          <span className="char-count">{newComment.length}/500</span>
          <button
            type="submit"
            disabled={!newComment.trim() || loading}
            className="btn-primary"
          >
            {loading ? "Posting..." : "Post Comment"}
          </button>
        </div>
      </form>
    </div>
  );
}