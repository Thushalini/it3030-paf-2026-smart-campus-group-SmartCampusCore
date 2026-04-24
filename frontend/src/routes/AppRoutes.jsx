import { BrowserRouter, Routes, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoutes";
import MainLayout from "../layouts/MainLayout";

// Auth pages
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import ForgotPassword from "../pages/ForgotPassword";
import Dashboard from "../pages/Dashboard";

// Profile & user management
import Profile from "../pages/Profile";
import AdminManageUsers from "../pages/AdminManageUsers";
import AdminDisabledUsers from "../pages/AdminDisabledUsers";
import AdminNotificationsPanel from "../pages/AdminNotificationsPanel";

// Resource module
import StudentResourcesPage from "../pages/StudentResourcesPage";
import ResourceDetailsPage from "../pages/ResourceDetailsPage";
import AdminResourcesPage from "../pages/AdminResourcesPage";
import ResourceFormPage from "../pages/ResourceFormPage";
import ResourceAnalyticsPage from "../pages/ResourceAnalyticsPage";

// Booking module
import BookingFormPage from "../pages/BookingFormPage";
import MyBookingsPage from "../pages/MyBookingsPage";
import BookingDashboardPage from "../pages/BookingDashboardPage";

// ========== TICKET MODULE ==========
import CreateTicketPage from "../ticket/pages/tickets/CreateTicketPage";
import MyTicketsPage from "../ticket/pages/tickets/MyTicketsPage";
import TicketDetailPage from "../ticket/pages/tickets/TicketDetailPage";
import AdminTicketManagementPage from "../ticket/pages/tickets/AdminTicketManagementPage";
import TechnicianTicketsPage from "../ticket/pages/tickets/TechnicianTicketsPage";


const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Authenticated routes (any role) */}
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

        {/* USER routes */}
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
          
          <Route path="bookings" element={<MyBookingsPage />} />
          <Route path="bookings/new" element={<BookingFormPage />} />
        </Route>

        {/* ========== TICKET ROUTES (shared by USER, ADMIN, TECHNICIAN) ========== */}
        <Route
          path="/tickets"
          element={
            <PrivateRoute allowedRoles={["USER", "ADMIN", "TECHNICIAN"]}>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route path="create" element={<CreateTicketPage />} />
          <Route path="my" element={<MyTicketsPage />} />
          <Route path=":id" element={<TicketDetailPage />} />
        </Route>

        {/* TECHNICIAN routes */}
        <Route
          path="/technician"
          element={
            <PrivateRoute allowedRoles={["TECHNICIAN"]}>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Profile />} />
          <Route path="tickets" element={<TechnicianTicketsPage />} />
        </Route>

        {/* ADMIN routes */}
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

          {/* Admin ticket management */}
          <Route path="tickets" element={<AdminTicketManagementPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;