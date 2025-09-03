import { Routes, Route, useLocation } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import { AnimatePresence } from "framer-motion";

import Login from "./page/Login";
import Register from "./page/Register";
import RegisterInfoForm from "./page/RegisterInfo";
import RegisterSuccess from "./page/RegisterSuccess";

import AdminDashboardPage from "./page/admin/DashboardPage.tsx";
import AdminUsersPage from "./page/admin/UsersPage.tsx";
import AdminAppointmentsPage from "./page/admin/AppointmentsPage.tsx";
import AdminSalesPage from "./page/admin/SalesPage.tsx";
import AdminMessagesPage from "./page/admin/MessagesPage.tsx";
import AdminProfilePage from "./page/admin/ProfilePage.tsx";

import AdminPackagesPage from "./page/admin/PackagesPage.tsx";
import AdminPackageContent from "../src/components/AdminPackageContent.tsx";
import AddPackagePage from "../src/components/Packages/add.tsx";
import EditPackagePage from "../src/components/Packages/edit.tsx";
import SelectPackagePage from "../src/components/Packages/select.tsx";

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

import LandingPage from "./components/LandingPage.tsx";

const App = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/register-info" element={<PublicRoute><RegisterInfoForm /></PublicRoute>} />
        <Route path="/register-success" element={<PublicRoute><RegisterSuccess /></PublicRoute>} />
        <Route path="/LandingPage" element={<PublicRoute><LandingPage /></PublicRoute>} />


        {/* Routes that are not found */}
          <Route path="*" element={<ProtectedRoute><div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>404 Not Found</div></ProtectedRoute>} />
          <Route path="/" element={<ProtectedRoute><div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>Already Logged In</div></ProtectedRoute>} />
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

        {/* Client Routes */}
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

        <Route path="/receipt/booking/:bookingID" element={<ReceiptPage />} />
        {/* Fallback */}

        <Route path="*" element={<LandingPage />} />
      </Routes>
    </AnimatePresence>
  );
};

export default App;
