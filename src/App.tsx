import { Routes, Route, useLocation } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import { AnimatePresence } from "framer-motion";

// Public Pages
import Login from "./page/Login";
import Register from "./page/Register";
import RegisterInfoForm from "./page/RegisterInfo";
import RegisterSuccess from "./page/RegisterSuccess";
import LandingPage from "./components/LandingPage";

// Admin Pages
import AdminDashboardPage from "./page/admin/DashboardPage";
import AdminUsersPage from "./page/admin/UsersPage";
import AdminAppointmentsPage from "./page/admin/AppointmentsPage";
import AdminSalesPage from "./page/admin/SalesPage";
import AdminMessagesPage from "./page/admin/MessagesPage";
import AdminProfilePage from "./page/admin/ProfilePage";
import AdminGalleryPage from "./page/admin/GalleryPage";
import AdminEditExtras from "./components/Packages/editExtras";

import AdminPackagesPage from "./page/admin/PackagesPage";
import AdminPackageContent from "./components/AdminPackageContent";
import AddPackagePage from "./components/Packages/add";
import EditPackagePage from "./components/Packages/edit";
import SelectPackagePage from "./components/Packages/select";

// Client Pages
import ClientHomePage from "./page/client/HomePage";
import ClientPackagesPage from "./page/client/PackagePage";
import ClientFavoritesPage from "./page/client/FavoritePage";
import ClientGalleryPageContent from "./components/ClientGalleryPageContent.tsx";
import ClientGalleryPage from "./page/client/GalleryPage";
import ClientInboxPage from "./page/client/InboxPage";
import ClientAppointmentsPage from "./page/client/AppointmentsPage";
import ClientHistoryPage from "./page/client/HistoryPage";
import ClientSettingsPage from "./page/client/SettingsPage";
import ClientPackagePageContent from "./components/ClientPackagePageContent";
import ReceiptPage from "./page/client/ReceiptPage";
import PhotoEditorAPI from "./components/Embed/PhotoEditor";

const App = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          }
        />
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

        {/* Admin routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/appointments"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminAppointmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/sales"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminSalesPage />
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

        {/* Client routes */}
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
        >
          <Route index element={<ClientGalleryPageContent />} />
          <Route path="edit" element={<PhotoEditorAPI />} />
        </Route>

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

        {/* Misc routes */}
        <Route path="/receipt/booking/:bookingID" element={<ReceiptPage />} />

        {/* 404 fallback */}
        <Route
          path="*"
          element={
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
              }}
            >
              404 Not Found
            </div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

export default App;
