import { BrowserRouter, Routes, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoutes";
import MainLayout from "../layouts/MainLayout";

import UserPage from "../pages/UserPage";
import TechnicianPage from "../pages/TechnicianPage";
import AdminPage from "../pages/AdminPage";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Signup from "../pages/Signup";

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
              <MainLayout>
                <AdminPage />
              </MainLayout>
            </PrivateRoute>
          }
        />


      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;