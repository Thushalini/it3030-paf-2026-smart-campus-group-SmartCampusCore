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
    const interval = setInterval(updateElapsed, 60000); // update every minute

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

  const isBreached = ticket.slaBreached;
  const hasFirstResponse = !!ticket.firstResponseAt;
  const hasResolution = !!ticket.resolvedAt;

  return (
    <div className={`sla-timer ${isBreached ? "sla-breached" : "sla-ok"}`}>
      <div className="sla-header">
        <span className="sla-title">⏱ SLA Status</span>
        {isBreached && <span className="breached-badge">BREACHED</span>}
      </div>

      <div className="sla-metrics">
        <div className="sla-metric">
          <span className="metric-label">First Response</span>
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

        <div className="sla-metric">
          <span className="metric-label">Resolution</span>
          <span className="metric-value">
            {hasResolution
              ? ticket.slaResolutionDisplay || formatDuration(ticket.resolutionTimeMinutes)
              : "Pending..."}
          </span>
        </div>
      </div>

      {isBreached && (
        <div className="sla-warning">
          ⚠️ SLA target exceeded — escalate to supervisor
        </div>
      )}
    </div>
  );
}