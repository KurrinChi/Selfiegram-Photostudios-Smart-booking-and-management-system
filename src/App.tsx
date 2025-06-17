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
import AdminPackagesPage from "./page/admin/PackagesPage.tsx";
import AdminMessagesPage from "./page/admin/MessagesPage.tsx";
import AdminProfilePage from "./page/admin/ProfilePage.tsx";

const App = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-info" element={<RegisterInfoForm />} />
        <Route path="/register-success" element={<RegisterSuccess />} />

        {/* Admin routes */}
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/appointments" element={<AdminAppointmentsPage />} />
        <Route path="/admin/sales" element={<AdminSalesPage />} />
        <Route path="/admin/packages" element={<AdminPackagesPage />} />
        <Route path="/admin/messages" element={<AdminMessagesPage />} />
        <Route path="/admin/profile" element={<AdminProfilePage />} />

        {/* Fallback */}
        <Route path="*" element={<Login />} />
      </Routes>
    </AnimatePresence>
  );
};

export default App;
