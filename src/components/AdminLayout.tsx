// components/AdminLayout.tsx
import React, { useState } from "react";
import AdminSidebar from "./AdminSideBar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const toggleSidebar = () => setCollapsed((prev) => !prev);

  return (
    <div className="min-h-screen font-sf">
      {/* Sidebar */}
      <AdminSidebar username="hi" collapsed={collapsed} toggle={toggleSidebar} />

      {/* Main Content */}
      <main
        className={`min-h-screen overflow-auto p-6 bg-gray-100
                    transition-all duration-300 ease-in-out
                    ${collapsed ? "ml-16" : "ml-48"}`}
      >
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
