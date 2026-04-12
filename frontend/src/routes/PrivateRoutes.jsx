import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // ❌ Not logged in
  if (!user) {
    return <Navigate to="/" state={{ from: location }} />;
  }

  // 🔐 Role check
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  if (user === undefined) {
    return <div>Loading...</div>;
  }

  return children;
};

export default PrivateRoute;