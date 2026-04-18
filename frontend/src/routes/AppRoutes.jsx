import { BrowserRouter, Routes, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoutes";
import MainLayout from "../layouts/MainLayout";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Signup from "../pages/Signup";

import UserPage from "../pages/UserPage";
import TechnicianPage from "../pages/TechnicianPage";
import AdminPage from "../pages/AdminPage";
import AdminManageUsers from "../pages/AdminManageUsers";
import AdminDisabledUsers from "../pages/AdminDisabledUsers";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/user"
          element={
            <PrivateRoute allowedRoles={["USER"]}>
              <MainLayout>
                <UserPage />
              </MainLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/technician"
          element={
            <PrivateRoute allowedRoles={["TECHNICIAN"]}>
              <MainLayout>
                <TechnicianPage />
              </MainLayout>
            </PrivateRoute>
          }
        />

        {/* ADMIN ONLY */}
        <Route
          path="/admin"
          element={
            <PrivateRoute allowedRoles={["ADMIN"]}>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<AdminPage />} />
          <Route path="manage-users" element={<AdminManageUsers />} />
          <Route path="disabled-users" element={<AdminDisabledUsers />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;