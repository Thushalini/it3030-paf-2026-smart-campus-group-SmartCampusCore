import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const token = sessionStorage.getItem("token");

  // ⏳ Still loading user (important for refresh handling)
  if (user === undefined) {
    return <div>Loading...</div>;
  }

  // ❌ No token OR no user → not logged in
  if (!token || !user) {
    return <Navigate to="/" state={{ from: location }} />;
  }

  // 🔐 Role-based access
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default PrivateRoute;

// import { useContext } from "react";
// import { Navigate, useLocation } from "react-router-dom";
// import { AuthContext } from "../context/AuthContext";

// const PrivateRoute = ({ children, allowedRoles }) => {
//   const { user } = useContext(AuthContext);
//   const location = useLocation();

//   // ❌ Not logged in
//   if (!user) {
//     return <Navigate to="/" state={{ from: location }} />;
//   }

//   // 🔐 Role check
//   if (allowedRoles && !allowedRoles.includes(user.role)) {
//     return <Navigate to="/dashboard" />;
//   }

//   if (user === undefined) {
//     return <div>Loading...</div>;
//   }

//   return children;
// };

// export default PrivateRoute;