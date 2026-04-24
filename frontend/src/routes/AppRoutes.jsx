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

import StudentResourcesPage from "../pages/StudentResourcesPage";
import ResourceDetailsPage from "../pages/ResourceDetailsPage";
import AdminResourcesPage from "../pages/AdminResourcesPage";
import ResourceFormPage from "../pages/ResourceFormPage";
import ResourceAnalyticsPage from "../pages/ResourceAnalyticsPage";

import BookingFormPage from "../pages/BookingFormPage";
import MyBookingsPage from "../pages/MyBookingsPage";
import BookingDashboardPage from "../pages/BookingDashboardPage";

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
          <Route path="resources" element={<StudentResourcesPage />} />
          <Route path="resources/:id" element={<ResourceDetailsPage />} />
          <Route path="book-resource" element={<BookingFormPage />} />
          <Route path="my-bookings" element={<MyBookingsPage />} />
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

          <Route path="resources" element={<AdminResourcesPage />} />
          <Route path="resources/new" element={<ResourceFormPage />} />
          <Route path="resources/edit/:id" element={<ResourceFormPage />} />
          <Route path="resources/view/:id" element={<ResourceDetailsPage />} />
          <Route path="resources/analytics" element={<ResourceAnalyticsPage />} />

          <Route path="bookings" element={<BookingDashboardPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;