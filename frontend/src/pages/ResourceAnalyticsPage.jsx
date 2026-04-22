import { useEffect, useMemo, useRef, useState } from "react";
import { getResourceAnalytics } from "../api/resourcesApi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import "./ResourceAnalyticsPage.css";

// Build simple, viva-friendly insight strings from analytics response.
// Keep it defensive (null/undefined safe) and easy to explain.
function buildInsights(analyticsData) {
  const summary = analyticsData?.summary;
  const underused = analyticsData?.underusedResources || [];
  const topUsed = analyticsData?.topUsedResources || [];
  const byType = analyticsData?.resourcesByType || [];
  const byLocation = analyticsData?.resourcesByLocation || [];

  const insights = [];

  const underusedCount = underused.length;
  if (underusedCount > 0) {
    insights.push({
      icon: "⚠️",
      text: `${underusedCount} resources are underused and may need attention`,
    });
  }

  const mostPopular = topUsed[0];
  if (mostPopular?.name) {
    const bookings = Number(mostPopular.bookingCount ?? 0);
    insights.push({
      icon: "🔥",
      text: `${mostPopular.name} is the most popular resource with ${bookings} bookings`,
    });
  }

  const mostCommonType = byType[0];
  if (mostCommonType?.key) {
    const label = String(mostCommonType.key).replaceAll("_", " ");
    insights.push({
      icon: "📌",
      text: `${label} are the most common resource type`,
    });
  }

  const total = Number(summary?.totalResources ?? 0);
  const active = Number(summary?.activeResources ?? 0);
  if (total > 0) {
    const health = Math.round((active / total) * 100);
    insights.push({
      icon: "✅",
      text: `System operational health is ${health}%`,
    });
  }

  const outOfService = Number(summary?.outOfServiceResources ?? 0);
  if (outOfService > 0) {
    insights.push({
      icon: "🛠️",
      text: `${outOfService} resources are currently out of service`,
    });
  }

  const topLocation = byLocation[0];
  if (topLocation?.key) {
    insights.push({
      icon: "🏢",
      text: `${topLocation.key} has the highest number of resources`,
    });
  }

  // "Never used" can be derived from underused list (bookingCount === 0).
  const neverUsedCount = underused.filter((r) => Number(r?.bookingCount ?? 0) === 0).length;
  if (neverUsedCount > 0) {
    insights.push({
      icon: "🧊",
      text: `${neverUsedCount} resources have never been used`,
    });
  }

  // If nothing stands out, show a positive default message.
  if (insights.length === 0) {
    insights.push({ icon: "🌟", text: "All resources are performing normally." });
  }

  return insights;
}

// Compact 3–5 one-line insights for the top-right small card.
// This is intentionally short and derived only from existing analytics data.
function buildQuickInsights(analyticsData) {
  const summary = analyticsData?.summary;
  const topUsed = analyticsData?.topUsedResources || [];
  const underused = analyticsData?.underusedResources || [];
  const byLocation = analyticsData?.resourcesByLocation || [];

  const lines = [];

  const top = topUsed[0];
  if (top?.name) {
    const bookings = Number(top.bookingCount ?? 0);
    lines.push(`⭐ Top: ${top.name} (${bookings} bookings)`);
  }

  const underusedCount = underused.length;
  if (underusedCount > 0) {
    lines.push(`⚠ ${underusedCount} underused resources`);
  }

  const total = Number(summary?.totalResources ?? 0);
  const active = Number(summary?.activeResources ?? 0);
  if (total > 0) {
    const health = Math.round((active / total) * 100);
    lines.push(`🟢 ${health}% operational`);
  }

  const outOfService = Number(summary?.outOfServiceResources ?? 0);
  if (outOfService > 0) {
    lines.push(`🔧 ${outOfService} out of service`);
  }

  const topLoc = byLocation[0];
  if (topLoc?.key) {
    lines.push(`📍 Top location: ${topLoc.key}`);
  }

  // If we have no strong signals, show the positive message.
  const hasIssue = underusedCount > 0 || outOfService > 0;
  if (!hasIssue) {
    lines.unshift("✅ All resources performing well");
  }

  // Ensure we show 4–5 short lines (compact popover).
  // These are still derived from analytics data and safe to explain in viva.
  const totalBookings = Number(summary?.totalBookings ?? 0);
  if (lines.length < 4) {
    lines.push(`📊 Total bookings: ${totalBookings}`);
  }
  const avgRating = Number(summary?.averageRating ?? 0);
  if (lines.length < 4) {
    lines.push(`⭐ Avg rating: ${avgRating.toFixed(1)}`);
  }

  return lines.slice(0, 5);
}

function ResourceAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("ALL");
  const [quickInsightsOpen, setQuickInsightsOpen] = useState(false);
  const quickInsightsRef = useRef(null);

  useEffect(() => {
    fetchAnalytics(selectedType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType]);

  const fetchAnalytics = async (type) => {
    try {
      const response = await getResourceAnalytics(
        type && type !== "ALL" ? { type } : undefined
      );
      setAnalytics(response.data || null);
    } catch (error) {
      console.error("Failed to load analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  const summary = analytics?.summary;
  const topUsed = analytics?.topUsedResources || [];
  const underused = analytics?.underusedResources || [];
  const insights = useMemo(() => buildInsights(analytics), [analytics]);
  const quickInsights = useMemo(() => buildQuickInsights(analytics), [analytics]);
  const hasQuickWarnings = (underused?.length || 0) > 0 || Number(summary?.outOfServiceResources ?? 0) > 0;

  // Close the popover when user clicks outside (simple and viva-friendly).
  useEffect(() => {
    if (!quickInsightsOpen) {
      return;
    }
    const onDocMouseDown = (e) => {
      const root = quickInsightsRef.current;
      if (!root) {
        return;
      }
      if (!root.contains(e.target)) {
        setQuickInsightsOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [quickInsightsOpen]);

  const typeChartData = useMemo(() => {
    return (analytics?.resourcesByType || []).map((x) => ({
      name: (x.key || "UNKNOWN").replaceAll("_", " "),
      value: x.count || 0,
    }));
  }, [analytics]);

  const statusChartData = useMemo(() => {
    return (analytics?.resourcesByStatus || []).map((x) => ({
      name: (x.key || "UNKNOWN").replaceAll("_", " "),
      value: x.count || 0,
    }));
  }, [analytics]);

  const locationChartData = useMemo(() => {
    return (analytics?.resourcesByLocation || []).map((x) => ({
      name: x.key || "UNKNOWN",
      value: x.count || 0,
    }));
  }, [analytics]);

  const pieColors = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  if (loading) {
    return <p className="analytics-loading">Loading analytics...</p>;
  }

  if (!analytics) {
    return (
      <div className="analytics-page">
        <h1>Resource Analytics</h1>
        <p className="analytics-error">No analytics data available.</p>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div>
          <h1>Resource Analytics</h1>
          <p>Everything you need in one dashboard (summary, charts, lists, insights).</p>
        </div>

        <div className="analytics-filters">
          <label className="filter">
            <span>Resource Type</span>
            <select
              value={selectedType}
              onChange={(e) => {
                setLoading(true);
                setSelectedType(e.target.value);
              }}
            >
              <option value="ALL">All</option>
              <option value="LECTURE_HALL">LECTURE_HALL</option>
              <option value="LAB">LAB</option>
              <option value="MEETING_ROOM">MEETING_ROOM</option>
              <option value="EQUIPMENT">EQUIPMENT</option>
            </select>
          </label>

          {/* Clickable "Quick Insights" icon + popover (no page redesign) */}
          <div className="quick-insights" ref={quickInsightsRef}>
            <button
              type="button"
              className="quick-insights-btn"
              onClick={() => setQuickInsightsOpen((v) => !v)}
              aria-label="Quick Insights"
              aria-haspopup="dialog"
              aria-expanded={quickInsightsOpen}
              title="Quick Insights"
            >
              <span aria-hidden="true">💡</span>
              {hasQuickWarnings && <span className="quick-insights-badge" aria-hidden="true" />}
            </button>

            {quickInsightsOpen && (
              <div className="quick-insights-popover" role="dialog" aria-label="Quick Insights">
                <div className="quick-insights-title">Quick Insights</div>
                <ul className="quick-insights-list">
                  {quickInsights.slice(0, 5).map((line, idx) => (
                    <li key={idx} className="quick-insights-item">
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="analytics-cards">
        <div className="card">
          <h3>Total Resources</h3>
          <p>{summary?.totalResources ?? 0}</p>
        </div>

        <div className="card">
          <h3>Active Resources</h3>
          <p>{summary?.activeResources ?? 0}</p>
        </div>

        <div className="card">
          <h3>Out of Service</h3>
          <p>{summary?.outOfServiceResources ?? 0}</p>
        </div>

        <div className="card">
          <h3>Average Rating</h3>
          <p>{Number(summary?.averageRating ?? 0).toFixed(1)}</p>
        </div>

        <div className="card">
          <h3>Total Bookings</h3>
          <p>{summary?.totalBookings ?? 0}</p>
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <h2>Resources by Location</h2>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={locationChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-12} textAnchor="end" height={70} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Resources by Type</h2>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={typeChartData}
                dataKey="value"
                nameKey="name"
                outerRadius={110}
                label
              >
                {typeChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={pieColors[index % pieColors.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Resources by Status</h2>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={statusChartData}
                dataKey="value"
                nameKey="name"
                outerRadius={110}
                label
              >
                {statusChartData.map((entry, index) => (
                  <Cell
                    key={`status-cell-${index}`}
                    fill={pieColors[index % pieColors.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="analytics-grid-2">
        <div className="analytics-panel">
          <h2>Top Used Resources</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Building</th>
                <th>Bookings</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {topUsed.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{r.type?.replaceAll("_", " ") || "—"}</td>
                  <td>{r.building || r.location || "—"}</td>
                  <td className="num">{r.bookingCount ?? 0}</td>
                  <td className="num">
                    {r.ratingAverage === null || r.ratingAverage === undefined
                      ? "—"
                      : Number(r.ratingAverage).toFixed(1)}
                  </td>
                </tr>
              ))}
              {topUsed.length === 0 && (
                <tr>
                  <td colSpan="5" className="empty">
                    No data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="analytics-panel">
          <h2>Underused Resources (ACTIVE)</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Bookings</th>
                <th>Rating</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {underused.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{r.type?.replaceAll("_", " ") || "—"}</td>
                  <td className="num">{r.bookingCount ?? 0}</td>
                  <td className="num">
                    {r.ratingAverage === null || r.ratingAverage === undefined
                      ? "—"
                      : Number(r.ratingAverage).toFixed(1)}
                  </td>
                  <td>{r.building || r.location || "—"}</td>
                </tr>
              ))}
              {underused.length === 0 && (
                <tr>
                  <td colSpan="5" className="empty">
                    No underused ACTIVE resources.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

     
    </div>
  );
}

export default ResourceAnalyticsPage;