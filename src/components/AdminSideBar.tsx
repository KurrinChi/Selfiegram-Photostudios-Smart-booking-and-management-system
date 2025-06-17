// components/AdminSidebar.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";

interface AdminSidebarProps {
  username: string;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ username }) => {
  const navItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "fas fa-tachometer-alt" },
    { label: "User Management", path: "/admin/users", icon: "fas fa-users" },
    { label: "Appointments", path: "/admin/appointments", icon: "fas fa-calendar-alt" },
    { label: "Sales", path: "/admin/sales", icon: "fas fa-dollar-sign" },
    { label: "Packages", path: "/admin/packages", icon: "fas fa-box" },
    { label: "Messages", path: "/admin/messages", icon: "fas fa-envelope" },
  ];

  return (
    <aside className="w-48 min-h-screen bg-[#1e1e1e] text-white flex flex-col justify-between fixed top-0 left-0 p-4">
      <div>
        <div className="flex justify-center mb-6">
          <img
            src="/slfg.svg"
            alt="Selfie Gram Logo"
            className="h-20"
            style={{ filter: "invert(100%) brightness(200%)" }}
          />
        </div>
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 py-2 px-3 rounded-md text-xs transition-colors ${
                  isActive
                    ? "bg-[rgba(238,238,225,0.13)] text-white"
                    : "hover:bg-gray-700"
                }`
              }
            >
              <i className={`${item.icon} w-4 text-base`}></i>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-400 px-3 py-4">
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black font-semibold">
          {username.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="text-white font-medium">{username}</div>
          <div className="text-gray-400 text-[10px]">Admin</div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
