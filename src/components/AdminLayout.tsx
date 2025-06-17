import React from "react";
import AdminSidebar from "./AdminSideBar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex font-sf">
      {/* Sidebar */}
      <AdminSidebar username="hi" />

      {/* Main Content Area */}
      <main className="flex-1 p-6 bg-gray-100 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
