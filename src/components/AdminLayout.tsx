import React, { useState } from "react";
import AdminSidebar from "./AdminSideBar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const toggleSidebar = () => setCollapsed((prev) => !prev);

  return (
    <div className="flex min-h-screen font-sf">
      {/* Sidebar */}
      <AdminSidebar username="hi" collapsed={collapsed} toggle={toggleSidebar} />

      {/* Main Content */}
      <main
        className={`flex-1 h-full overflow-hidden transition-all duration-300 ease-in-out ${
          collapsed ? "ml-16" : "ml-48"
        }`}
      >
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
