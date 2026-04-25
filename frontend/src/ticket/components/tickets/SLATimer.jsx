import { useState, useEffect } from "react";
import "./SLATimer.css";

export default function SLATimer({ ticket }) {
  const [elapsed, setElapsed] = useState(0);

  // Live timer for OPEN/IN_PROGRESS tickets awaiting first response
  useEffect(() => {
    if (!ticket || ticket.firstResponseAt) return;
    if (ticket.status !== "OPEN" && ticket.status !== "IN_PROGRESS") return;

    const createdAt = ticket.createdAt ? new Date(ticket.createdAt).getTime() : Date.now();
    
    const updateElapsed = () => {
      const now = Date.now();
      const diff = Math.floor((now - createdAt) / 60000); // minutes
      setElapsed(diff);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 60000);

    return () => clearInterval(interval);
  }, [ticket]);

  const formatDuration = (minutes) => {
    if (minutes === null || minutes === undefined) return "Pending...";
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  const formatLiveElapsed = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  if (!ticket) return null;

  const hasFirstResponse = !!ticket.firstResponseAt;
  const hasResolution = !!ticket.resolvedAt;

  // Get breach status for each metric (true = breached, false = met, null = pending)
  const firstResponseBreached = ticket.firstResponseSlaBreached;
  const resolutionBreached = ticket.resolutionSlaBreached;

  // Helper to get CSS class for each metric
  const getMetricClass = (breached) => {
    if (breached === true) return "metric-breached";
    if (breached === false) return "metric-met";
    return "metric-pending";
  };

  // Helper to get label text
  const getMetricLabel = (breached) => {
    if (breached === true) return "Breached";
    if (breached === false) return "Met";
    return "Pending";
  };

  return (
    <div className="sla-timer">
      <div className="sla-header">
        <span className="sla-title">⏱ SLA Status</span>
      </div>

      <div className="sla-metrics">
        {/* First Response Metric */}
        <div className={`sla-metric ${getMetricClass(firstResponseBreached)}`}>
          <div className="metric-header">
            <span className="metric-label">First Response</span>
            <span className="metric-badge">{getMetricLabel(firstResponseBreached)}</span>
          </div>
          <span className="metric-value">
            {hasFirstResponse
              ? ticket.slaFirstResponseDisplay || formatDuration(ticket.firstResponseTimeMinutes)
              : "Pending..."}
          </span>
          {!hasFirstResponse && (ticket.status === "OPEN" || ticket.status === "IN_PROGRESS") && (
            <span className="live-timer">
              Awaiting: {formatLiveElapsed(elapsed)} elapsed
            </span>
          )}
        </div>

        {/* Resolution Metric */}
        <div className={`sla-metric ${getMetricClass(resolutionBreached)}`}>
          <div className="metric-header">
            <span className="metric-label">Resolution</span>
            <span className="metric-badge">{getMetricLabel(resolutionBreached)}</span>
          </div>
          <span className="metric-value">
            {hasResolution
              ? ticket.slaResolutionDisplay || formatDuration(ticket.resolutionTimeMinutes)
              : "Pending..."}
          </span>
        </div>
      </div>

      {/* Global warning if either is breached */}
      {(firstResponseBreached === true || resolutionBreached === true) && (
        <div className="sla-warning">
          ⚠️ SLA target exceeded — escalate to supervisor
        </div>
      )}
    </div>
  );
}