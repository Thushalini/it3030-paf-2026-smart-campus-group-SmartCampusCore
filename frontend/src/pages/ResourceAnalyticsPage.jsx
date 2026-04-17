import { useEffect, useState } from "react";
import { getResources } from "../api/resourcesApi";
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