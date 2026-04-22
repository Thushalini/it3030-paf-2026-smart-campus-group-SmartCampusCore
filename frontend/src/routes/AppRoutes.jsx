import { BrowserRouter, Routes, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoutes";
import MainLayout from "../layouts/MainLayout";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Signup from "../pages/Signup";

import Profile from "../pages/Profile";
import AdminManageUsers from "../pages/AdminManageUsers";
import AdminDisabledUsers from "../pages/AdminDisabledUsers";
import AdminNotificationsPanel from "../pages/AdminNotificationsPanel";

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
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Profile />} />
        </Route>

        <Route
          path="/technician"
          element={
            <PrivateRoute allowedRoles={["TECHNICIAN"]}>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Profile />} />
        </Route>

        {/* ADMIN ONLY */}
        <Route
          path="/admin"
          element={
            <PrivateRoute allowedRoles={["ADMIN"]}>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Profile />} />
          <Route path="manage-users" element={<AdminManageUsers />} />
          <Route path="disabled-users" element={<AdminDisabledUsers />} />
          <Route path="notifications" element={<AdminNotificationsPanel />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;