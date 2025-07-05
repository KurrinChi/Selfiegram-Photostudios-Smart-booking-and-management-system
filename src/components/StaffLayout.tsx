import React, { useState, useEffect } from "react";
import ClientSidebar from "./StaffSidebar.tsx";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    return saved === "true";
  });

  const toggleSidebar = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  };

  return (
    <div className="flex min-h-screen font-sf">
      {/* Sidebar */}
      <ClientSidebar
        username="hi"
        collapsed={collapsed}
        toggle={toggleSidebar}
      />

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
