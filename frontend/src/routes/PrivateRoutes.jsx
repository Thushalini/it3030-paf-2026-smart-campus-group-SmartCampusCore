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
  if (allowedRoles && user.role !== "ADMIN" && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default PrivateRoute;