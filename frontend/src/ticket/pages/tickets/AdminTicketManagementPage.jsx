import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAdminTickets from "../../hooks/useAdminTickets";
import TicketTable from "../../components/tickets/TicketTable";
import TicketFilterBar from "../../components/tickets/TicketFilterBar";
import { getTicketAnalytics } from "../../api/ticketApi";
import { updateTicketStatus, assignTechnician } from "../../api/ticketApi";
import "./AdminTicketManagementPage.css";

/**
 * TODO (Integration with Member 4):
 * - Replace currentRole and currentUserId with real values from JWT context.
 * - Ensure only ADMIN role can access this page (route guard).
 */
export default function AdminTicketManagementPage() {
    const navigate = useNavigate();
    const { tickets, loading, error, totalElements, filters, setFilters, refetch } = useAdminTickets({});
    const [analytics, setAnalytics] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);

    // TODO: Replace with real role/user from auth context
    const currentRole = "ADMIN";
    const currentUserId = "user123";

    useEffect(() => {
    const fetchAnalytics = async () => {
        setAnalyticsLoading(true);
        try {
        const res = await getTicketAnalytics();
        setAnalytics(res.data?.data);
        } catch (err) {
        console.error("Failed to fetch analytics", err);
        } finally {
        setAnalyticsLoading(false);
        }
    };
    fetchAnalytics();
    }, []);

    const handleViewTicket = (ticket) => {
    navigate(`/tickets/${ticket.id}`);
    };

    const handleStatusUpdate = async (ticketId, data) => {
    try {
        await updateTicketStatus(ticketId, data);
        refetch(); // refresh list after update
    } catch (err) {
        console.error("Status update failed", err);
    }
    };

    const handleAssign = async (ticketId, data) => {
    try {
        await assignTechnician(ticketId, data);
        refetch();
    } catch (err) {
        console.error("Assign failed", err);
    }
    };

    // Stats cards
    const statusCounts = analytics?.byStatus || {};
    const stats = [
    { label: "Open", value: statusCounts.OPEN || 0, color: "blue" },
    { label: "In Progress", value: statusCounts.IN_PROGRESS || 0, color: "amber" },
    { label: "Resolved", value: statusCounts.RESOLVED || 0, color: "green" },
    { label: "Closed", value: statusCounts.CLOSED || 0, color: "gray" },
    { label: "Rejected", value: statusCounts.REJECTED || 0, color: "red" },
    ];

    return (
    <div className="admin-tickets-page">
        <h2>Manage Tickets</h2>

        <div className="stats-row">
        {stats.map((stat) => (
            <div key={stat.label} className={`stat-card stat-${stat.color}`}>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
            </div>
        ))}
        </div>

        <TicketFilterBar
        filters={filters}
        onFilterChange={setFilters}
        showAssigneeFilter={true}
        />

        <TicketTable
        tickets={tickets}
        onViewTicket={handleViewTicket}
        onStatusUpdate={handleStatusUpdate}
        onAssign={handleAssign}
        loading={loading}
        currentRole={currentRole}
        currentUserId={currentUserId}
        />

        {error && <div className="error-message">{error}</div>}

        {/* Pagination (simplified) */}
        {/* TODO: Add pagination controls using useAdminTickets.goToPage */}
    </div>
    );
}