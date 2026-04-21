import { useParams, useNavigate } from "react-router-dom";
import useTicketDetail from "../../hooks/useTicketDetail";
import TicketStatusBadge from "../../components/tickets/TicketStatusBadge";
import PriorityBadge from "../../components/tickets/PriorityBadge";
import SLATimer from "../../components/tickets/SLATimer";
import CommentSection from "../../components/tickets/CommentSection";
import "./TicketDetailPage.css";

/**
 * TODO (Member 4 - JWT Integration):
 * - Replace role checks ("ADMIN", "TECHNICIAN") with real JWT role claims
 * - Replace userId checks with actual authenticated user
 * 
 * TODO (Backend):
 * - Backend should provide statusHistory in TicketResponseDTO
 * - Backend should provide full image URL paths (not just filenames)
 */

export default function TicketDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const {
    ticket,
    comments,
    statusHistory,
    loading,
    error,
    currentUserRole,
    addComment,
    updateComment,
    deleteComment,
    updateStatus,
    assignTech,
    } = useTicketDetail(id);

    // TODO: Replace with real role from JWT when Member 4 completes auth
    const isAdmin = currentUserRole === "ADMIN";
    const isTechnician = currentUserRole === "TECHNICIAN";
    const canManageTicket = isAdmin || isTechnician;

    const handleStatusUpdate = async () => {
    // TODO: Open StatusUpdateModal (Chunk 11) instead of prompt
    const newStatus = window.prompt(
        "Enter new status (OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED):"
    );
    if (!newStatus) return;
    const note = window.prompt("Add a note (optional):") || "";
    await updateStatus({ status: newStatus, note });
    };

    const handleAssignTech = async () => {
    // TODO: Open AssignTechnicianModal (Chunk 11) instead of prompt
    const techId = window.prompt("Enter technician user ID:");
    if (!techId) return;
    await assignTech({ assignedToId: techId });
    };

    const handleImageClick = (url) => {
    window.open(url, "_blank");
    };

    // Helper to build full image URLs
    const API_BASE = import.meta.env.VITE_API_BASE_URL; // http://localhost:8080/api/v1
    const BACKEND_BASE = API_BASE.replace("/api/v1", ""); // http://localhost:8080

    const getImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;           // already full URL
    if (url.startsWith("/")) return `${BACKEND_BASE}${url}`; // /uploads/... → http://localhost:8080/uploads/...
    return `${BACKEND_BASE}/uploads/${url}`;          // just filename
    };

    if (loading) {
    return (
        <div className="ticket-detail-page">
        <p>Loading ticket details...</p>
        </div>
    );
    }

    if (error) {
    return (
        <div className="ticket-detail-page">
        <p className="error-message">Error: {error}</p>
        <button onClick={() => navigate("/tickets/my")}>Back to My Tickets</button>
        </div>
    );
    }

    if (!ticket) {
    return (
        <div className="ticket-detail-page">
        <p>Ticket not found.</p>
        <button onClick={() => navigate("/tickets/my")}>Back to My Tickets</button>
        </div>
    );
    }

    return (
    <div className="ticket-detail-page">
        {/* Back button */}
        <button className="btn-back" onClick={() => navigate("/tickets/my")}>
        ← Back to My Tickets
        </button>

        <div className="ticket-detail-layout">
        {/* LEFT: Main content */}
        <div className="ticket-detail-main">
            {/* Header */}
            <div className="ticket-header">
            <div className="ticket-title-row">
                <h1>
                #{ticket.ticketNumber} — {ticket.title}
                </h1>
                <div className="ticket-badges">
                <TicketStatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
                </div>
            </div>
            <SLATimer ticket={ticket} />
            </div>

            {/* Details */}
            <div className="ticket-details-card">
            <h3>Details</h3>
            <div className="detail-grid">
                <div className="detail-item">
                <span className="detail-label">Category</span>
                <span className="detail-value">{ticket.category}</span>
                </div>
                <div className="detail-item">
                <span className="detail-label">Resource</span>
                <span className="detail-value">{ticket.resourceName || "N/A"}</span>
                </div>
                <div className="detail-item">
                <span className="detail-label">Location</span>
                <span className="detail-value">{ticket.location || "N/A"}</span>
                </div>
                <div className="detail-item">
                <span className="detail-label">Reported By</span>
                <span className="detail-value">
                    {ticket.reportedByName || ticket.reportedById || "Unknown"}
                </span>
                </div>
                <div className="detail-item">
                <span className="detail-label">Created</span>
                <span className="detail-value">
                    {ticket.createdAt
                    ? new Date(ticket.createdAt).toLocaleString()
                    : "N/A"}
                </span>
                </div>
                {ticket.assignedToName && (
                <div className="detail-item">
                    <span className="detail-label">Assigned To</span>
                    <span className="detail-value">{ticket.assignedToName}</span>
                </div>
                )}
            </div>

            <div className="detail-description">
                <span className="detail-label">Description</span>
                <p>{ticket.description}</p>
            </div>

            {ticket.contactDetails && (
                <div className="detail-contact">
                <span className="detail-label">Contact</span>
                <p>
                    {ticket.contactDetails.contactName} | {ticket.contactDetails.phone} |{" "}
                    {ticket.contactDetails.preferredMethod}
                </p>
                </div>
            )}
            </div>

            {/* Image Attachments */}
            {ticket.imageUrls && ticket.imageUrls.length > 0 && (
            <div className="ticket-attachments">
                <h3>Attachments ({ticket.imageUrls.length})</h3>
                <div className="attachment-thumbnails">
                {ticket.imageUrls.map((url, idx) => (
                    <img
                    key={idx}
                    src={getImageUrl(url)}
                    alt={`Attachment ${idx + 1}`}
                    className="attachment-thumb"
                    onClick={() => handleImageClick(getImageUrl(url))}
                    title="Click to view full size"
                    onError={(e) => {
                        e.target.style.display = "none";
                        console.error("Failed to load image:", url);
                    }}
                    />
                ))}
                </div>
            </div>
            )}

            {/* Status History */}
            {statusHistory && statusHistory.length > 0 && (
            <div className="status-history">
                <h3>Status History</h3>
                <div className="timeline">
                {statusHistory.map((entry, idx) => (
                    <div key={idx} className="timeline-item">
                    <div className="timeline-dot" />
                    <div className="timeline-content">
                        <span className="timeline-status">{entry.status}</span>
                        <span className="timeline-meta">
                        by {entry.changedByName || entry.changedById} on{" "}
                        {entry.changedAt
                            ? new Date(entry.changedAt).toLocaleString()
                            : "N/A"}
                        </span>
                        {entry.note && <p className="timeline-note">{entry.note}</p>}
                    </div>
                    </div>
                ))}
                </div>
            </div>
            )}

            {/* Comments */}
            <CommentSection
            ticketId={id}
            comments={comments}
            onAddComment={addComment}
            onUpdateComment={updateComment}
            onDeleteComment={deleteComment}
            loading={loading}
            />
        </div>

        {/* RIGHT: Sidebar (Admin/Tech only) */}
        {canManageTicket && (
            <div className="ticket-detail-sidebar">
            <div className="sidebar-card">
                <h3>Ticket Management</h3>

                <div className="sidebar-info">
                <div className="info-row">
                    <span>Reporter</span>
                    <span>{ticket.reportedByName || ticket.reportedById}</span>
                </div>
                <div className="info-row">
                    <span>Technician</span>
                    <span>{ticket.assignedToName || "Unassigned"}</span>
                </div>
                </div>

                <div className="sidebar-actions">
                <button className="btn-primary" onClick={handleStatusUpdate}>
                    Change Status
                </button>
                <button className="btn-secondary" onClick={handleAssignTech}>
                    Assign Technician
                </button>
                </div>
            </div>
            </div>
        )}
        </div>
    </div>
    );
}