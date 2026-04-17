import { useEffect, useMemo, useState } from "react";
import { getResources } from "../api/resourcesApi";
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

function ResourceAnalyticsPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await getResources({ adminView: true });
      setResources(response.data || []);
    } catch (error) {
      console.error("Failed to load analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalResources = resources.length;

  const totalCapacity = resources.reduce(
    (sum, r) => sum + (r.capacity || 0),
    0
  );

  const averageRating =
    resources.reduce((sum, r) => sum + (r.ratingAverage || 0), 0) /
    (resources.length || 1);

  const mostBooked = [...resources].sort(
    (a, b) => (b.bookingCount || 0) - (a.bookingCount || 0)
  )[0];

  const topRated = [...resources].sort(
    (a, b) => (b.ratingAverage || 0) - (a.ratingAverage || 0)
  )[0];

  const bookingChartData = useMemo(() => {
    return resources.map((r) => ({
      name: r.name,
      bookings: r.bookingCount || 0,
    }));
  }, [resources]);

  const typeChartData = useMemo(() => {
    const counts = {};
    resources.forEach((r) => {
      const type = r.type || "UNKNOWN";
      counts[type] = (counts[type] || 0) + 1;
    });

    return Object.entries(counts).map(([type, count]) => ({
      name: type.replaceAll("_", " "),
      value: count,
    }));
  }, [resources]);

  const pieColors = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  if (loading) {
    return <p className="analytics-loading">Loading analytics...</p>;
  }

  return (
    <div className="analytics-page">
      <h1>Resource Analytics Dashboard</h1>
      <p>Insights into campus resource usage and performance</p>

      <div className="analytics-cards">
        <div className="card">
          <h3>Total Resources</h3>
          <p>{totalResources}</p>
        </div>

        <div className="card">
          <h3>Total Capacity</h3>
          <p>{totalCapacity}</p>
        </div>

        <div className="card">
          <h3>Average Rating</h3>
          <p>{averageRating.toFixed(1)}</p>
        </div>

        <div className="card">
          <h3>Most Booked</h3>
          <p>{mostBooked?.name || "N/A"}</p>
        </div>

        <div className="card">
          <h3>Top Rated</h3>
          <p>{topRated?.name || "N/A"}</p>
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <h2>Bookings by Resource</h2>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={bookingChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-12} textAnchor="end" height={70} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="bookings" fill="#2563eb" radius={[8, 8, 0, 0]} />
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
      </div>

      <div className="analytics-table">
        <h2>Top Resources</h2>

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Capacity</th>
              <th>Rating</th>
              <th>Bookings</th>
            </tr>
          </thead>

          <tbody>
            {resources.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>{r.type}</td>
                <td>{r.capacity}</td>
                <td>{r.ratingAverage}</td>
                <td>{r.bookingCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ResourceAnalyticsPage;