import { Routes, Route, useLocation } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import { AnimatePresence } from "framer-motion";

import Login from "./page/Login";
import Register from "./page/Register";
import RegisterInfoForm from "./page/RegisterInfo";
import RegisterSuccess from "./page/RegisterSuccess";

// Admin pages
import AdminDashboardPage from "./page/admin/DashboardPage.tsx";
import AdminUsersPage from "./page/admin/UsersPage.tsx";
import AdminAppointmentsPage from "./page/admin/AppointmentsPage.tsx";
import AdminSalesPage from "./page/admin/SalesPage.tsx";
import AdminMessagesPage from "./page/admin/MessagesPage.tsx";
import AdminProfilePage from "./page/admin/ProfilePage.tsx";
import AdminGalleryPage from "./page/admin/GalleryPage.tsx";
import AdminEditExtras from "../src/components/Packages/editExtras.tsx";

import AdminPackagesPage from "./page/admin/PackagesPage.tsx";
import AdminPackageContent from "../src/components/AdminPackageContent.tsx";
import AddPackagePage from "../src/components/Packages/add.tsx";
import EditPackagePage from "../src/components/Packages/edit.tsx";
import SelectPackagePage from "../src/components/Packages/select.tsx";

// Staff pages (reuse admin pages with StaffLayout)
import StaffDashboardPage from "./page/staff/DashboardPage.tsx";
import StaffAppointmentsPage from "./page/staff/AppointmentsPage.tsx";
import StaffMessagesPage from "./page/staff/MessagesPage.tsx";
import StaffProfilePage from "./page/staff/ProfilePage.tsx";
import StaffGalleryPage from "./page/staff/GalleryPage.tsx";
import StaffPackageContent from "../src/components/StaffPackageContent.tsx";
import StaffPackagesPage from "./page/staff/PackagesPage.tsx";
import StaffEditExtrasPage from "./page/staff/EditExtrasPage.tsx";
import StaffSelectPackagePage from "../src/components/Packages/staffSelect.tsx";

// Client pages
import ClientHomePage from "./page/client/HomePage.tsx";
import ClientPackagesPage from "./page/client/PackagePage.tsx";
import ClientFavoritesPage from "./page/client/FavoritePage.tsx";
import ClientGalleryPage from "./page/client/GalleryPage.tsx";
import ClientInboxPage from "./page/client/InboxPage.tsx";
import ClientAppointmentsPage from "./page/client/AppointmentsPage.tsx";
import ClientHistoryPage from "./page/client/HistoryPage.tsx";
import ClientSettingsPage from "./page/client/SettingsPage.tsx";
import ClientPackagePageContent from "./components/ClientPackagePageContent.tsx";
import ReceiptPage from "./page/client/ReceiptPage.tsx";
import PhotoEditorAPI from "./components/Embed/PhotoEditor.tsx";
import LandingPage from "./components/LandingPage.tsx";
import PusherDebugPage from "./components/PusherDebugPage.tsx";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

const App = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* ========== PUBLIC ROUTES ========== */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/register-info"
          element={
            <PublicRoute>
              <RegisterInfoForm />
            </PublicRoute>
          }
        />
        <Route
          path="/register-success"
          element={
            <PublicRoute>
              <RegisterSuccess />
            </PublicRoute>
          }
        />
        <Route
          path="/"
          element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          }
        />

        {/* ========== ADMIN ROUTES ========== */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminDashboardPage />
              <ToastContainer position="bottom-right" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminUsersPage />
              <ToastContainer position="bottom-right" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/appointments"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminAppointmentsPage />
              <ToastContainer position="bottom-right" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/sales"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminSalesPage />
              <ToastContainer position="bottom-right" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/messages"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminMessagesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminProfilePage />
              <ToastContainer position="bottom-right" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/packages"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminPackagesPage />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminPackageContent />} />
          <Route path="add" element={<AddPackagePage />} />
          <Route path="edit/:id" element={<EditPackagePage />} />
          <Route path="select/:id" element={<SelectPackagePage />} />
        </Route>

        <Route
          path="/admin/packages/extras"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminEditExtras />
              <ToastContainer position="bottom-right" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/gallery"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminGalleryPage />
            </ProtectedRoute>
          }
        />

        {/* ========== STAFF ROUTES ========== */}
        <Route
          path="/staff/dashboard"
          element={
            <ProtectedRoute allowedRoles={["Staff"]}>
              <StaffDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/appointments"
          element={
            <ProtectedRoute allowedRoles={["Staff"]}>
              <StaffAppointmentsPage />
              <ToastContainer position="bottom-right" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/messages"
          element={
            <ProtectedRoute allowedRoles={["Staff"]}>
              <StaffMessagesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/profile"
          element={
            <ProtectedRoute allowedRoles={["Staff"]}>
              <StaffProfilePage />
              <ToastContainer position="bottom-right" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/packages"
          element={
            <ProtectedRoute allowedRoles={["Staff"]}>
              <StaffPackagesPage />
            </ProtectedRoute>
          }
        >
          <Route index element={<StaffPackageContent />} />
          <Route path="select/:id" element={<StaffSelectPackagePage />} />
        </Route>

        <Route
          path="/staff/packages/extras"
          element={
            <ProtectedRoute allowedRoles={["Staff"]}>
              <StaffEditExtrasPage />
              <ToastContainer position="bottom-right" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/gallery"
          element={
            <ProtectedRoute allowedRoles={["Staff"]}>
              <StaffGalleryPage />
            </ProtectedRoute>
          }
        />

        {/* ========== CLIENT ROUTES ========== */}
        <Route
          path="/client/home"
          element={
            <ProtectedRoute allowedRoles={["Customer"]}>
              <ClientHomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/packages"
          element={
            <ProtectedRoute allowedRoles={["Customer"]}>
              <ClientPackagesPage />
            </ProtectedRoute>
          }
        >
          <Route index element={<ClientPackagePageContent />} />
          <Route path="select/:id" element={<SelectPackagePage />} />
        </Route>

        <Route
          path="/client/favorites"
          element={
            <ProtectedRoute allowedRoles={["Customer"]}>
              <ClientFavoritesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/gallery"
          element={
            <ProtectedRoute allowedRoles={["Customer"]}>
              <ClientGalleryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/inbox"
          element={
            <ProtectedRoute allowedRoles={["Customer"]}>
              <ClientInboxPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/appointments"
          element={
            <ProtectedRoute allowedRoles={["Customer"]}>
              <ClientAppointmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/history"
          element={
            <ProtectedRoute allowedRoles={["Customer"]}>
              <ClientHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/profile"
          element={
            <ProtectedRoute allowedRoles={["Customer"]}>
              <ClientSettingsPage />
            </ProtectedRoute>
          }
        />

        {/* ========== UTILITY ROUTES ========== */}
        <Route path="/edit" element={<PhotoEditorAPI />} />
        <Route path="/pusher-debug" element={<PusherDebugPage />} />
        <Route path="/receipt/booking/:bookingID" element={<ReceiptPage />} />

        {/* ========== FALLBACK ========== */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </AnimatePresence>
  );
};

export default App;
