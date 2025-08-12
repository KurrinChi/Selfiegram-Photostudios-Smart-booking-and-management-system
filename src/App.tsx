// Updated App.tsx with Client Routes and Admin Routes
import { Routes, Route, useLocation } from "react-router-dom";
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

const App = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-info" element={<RegisterInfoForm />} />
        <Route path="/register-success" element={<RegisterSuccess />} />
        <Route path="/profile" element={<AdminProfilePage />} />

        {/* Admin routes */}
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/appointments" element={<AdminAppointmentsPage />} />
        <Route path="/admin/sales" element={<AdminSalesPage />} />
        <Route path="/admin/messages" element={<AdminMessagesPage />} />
        <Route path="/admin/profile" element={<AdminProfilePage />} />

        <Route path="/admin/packages" element={<AdminPackagesPage />}>
          <Route index element={<AdminPackageContent />} />
          <Route path="add" element={<AddPackagePage />} />
          <Route path="edit/:id" element={<EditPackagePage />} />
          <Route path="select/:id" element={<SelectPackagePage />} />
        </Route>

        {/* Client Routes */}
        <Route path="/client/home" element={<ClientHomePage />} />
        <Route path="/client/packages" element={<ClientPackagesPage />}>
          <Route index element={<ClientPackagePageContent />} />
          <Route path="select/:id" element={<SelectPackagePage />} />
        </Route>

        <Route path="/client/favorites" element={<ClientFavoritesPage />} />
        <Route path="/client/gallery" element={<ClientGalleryPage />} />
        <Route path="/client/inbox" element={<ClientInboxPage />} />
        <Route
          path="/client/appointments"
          element={<ClientAppointmentsPage />}
        />
        <Route path="/client/history" element={<ClientHistoryPage />} />
        <Route path="/client/profile" element={<ClientSettingsPage />} />

           <Route path="/receipt/booking/:bookingID" element={<ReceiptPage />} />
        {/* Fallback */}
        <Route path="*" element={<Login />} />
      </Routes>
    </AnimatePresence>
  );
};

export default App;
