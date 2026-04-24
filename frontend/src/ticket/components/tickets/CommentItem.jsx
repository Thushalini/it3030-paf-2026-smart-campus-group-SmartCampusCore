import { useState } from "react";
import "./CommentItem.css";

/**
 * TODO (Member 4 - JWT Integration):
 * - canEdit / canDelete currently computed by backend based on stubbed userId
 * - Once JWT is integrated, backend will use real user claims
 */

export default function CommentItem({ comment, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const handleSave = async () => {
    if (!editContent.trim() || editContent === comment.content) {
      setIsEditing(false);
      return;
    }
    await onUpdate(comment.id, editContent.trim());
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      await onDelete(comment.id);
    }
  };

  const isDeleted = comment.content === "[deleted]";

  return (
    <div className={`comment-item ${isDeleted ? "comment-deleted" : ""}`}>
      <div className="comment-header">
        <div className="comment-author">
          <span className="author-name">{comment.authorName || "Unknown"}</span>
          {comment.authorRole && (
            <span className={`role-badge role-${comment.authorRole.toLowerCase()}`}>
              {comment.authorRole}
            </span>
          )}
          <span className="comment-time">
            {comment.createdAt
              ? new Date(comment.createdAt).toLocaleString()
              : "Just now"}
          </span>
          {comment.isEdited && <span className="edited-label">(edited)</span>}
        </div>

        {!isDeleted && (
          <div className="comment-actions">
            {comment.canEdit && (
              <button
                className="btn-text"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Cancel" : "Edit"}
              </button>
            )}
            {comment.canDelete && (
              <button className="btn-text btn-danger" onClick={handleDelete}>
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="comment-edit">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            maxLength={500}
            rows={3}
          />
          <div className="edit-actions">
            <button className="btn-primary" onClick={handleSave}>
              Save
            </button>
            <button className="btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="comment-content">{comment.content}</p>
      )}
    </div>
  );
}