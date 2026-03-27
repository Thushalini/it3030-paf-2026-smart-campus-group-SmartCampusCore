import { useParams } from "react-router-dom";

function ResourceDetailsPage() {
  const { id } = useParams();

  return (
    <div style={{ padding: "20px" }}>
      <h2>Resource Details Page</h2>
      <p>Resource ID: {id}</p>
    </div>
  );
}

export default ResourceDetailsPage;