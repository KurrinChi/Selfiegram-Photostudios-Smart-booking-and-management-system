// components/AdminSidebar.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";

interface AdminSidebarProps {
  username: string;
  collapsed: boolean;
  toggle: () => void;
}

const navItems = [
  { label: "Dashboard",       path: "/admin/dashboard",   icon: "fas fa-tachometer-alt" },
  { label: "User Management", path: "/admin/users",       icon: "fas fa-users" },
  { label: "Appointments",    path: "/admin/appointments", icon: "fas fa-calendar-alt" },
  { label: "Sales",           path: "/admin/sales",       icon: "fas fa-dollar-sign" },
  { label: "Packages",        path: "/admin/packages",    icon: "fas fa-box" },
  { label: "Messages",        path: "/admin/messages",    icon: "fas fa-envelope" },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({ username, collapsed, toggle }) => {
  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen
                  bg-[#1e1e1e] text-white flex flex-col justify-between
                  transition-all duration-300 ease-in-out
                  ${collapsed ? "w-16" : "w-48"}`}
    >
      {/* ─── Toggle Button ────────────────────────────── */}
      <button
        onClick={toggle}
        className="absolute -right-4 top-4 w-8 h-8 flex items-center justify-center
                   bg-[#1e1e1e] border border-gray-600 rounded-full
                   text-white hover:scale-110 transition-transform duration-300"
      >
        <i className={`fas ${collapsed ? "fa-chevron-right" : "fa-chevron-left"} text-xs`} />
      </button>

      {/* ─── Logo ─────────────────────────────────────── */}
      <div className="flex justify-center my-6">
        <img
          src="/slfg.svg"
          alt="Selfie Gram Logo"
          className={`transition-all duration-300 ${collapsed ? "h-10" : "h-20"}`}
          style={{ filter: "invert(100%) brightness(200%)" }}
        />
      </div>

      {/* ─── Nav Items ───────────────────────────────── */}
      <nav className="flex-1 flex flex-col gap-1 px-2 relative overflow-visible">
        {navItems.map(({ label, path, icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 py-2 px-3 rounded-md text-xs overflow-hidden
               transition-all duration-300 ease-in-out
               ${isActive ? "bg-[rgba(238,238,225,0.13)] text-white scale-[1.02] active" : "hover:bg-gray-700 text-gray-300"}`
            }
          >
            {/* Sliding indicator */}
            <span
              className={`absolute left-0 top-0 h-full w-1 bg-yellow-300 rounded-tr-md rounded-br-md
                          transition-all duration-300 ease-in-out
                          group-[.active]:opacity-100 opacity-0 group-hover:opacity-30`}
            />

            {/* background hover effect (underlay) */}
            <div
              className={`absolute inset-0 z-0 transition-all duration-300 ease-in-out rounded-md
                          ${collapsed ? "" : "group-hover:bg-gray-700"}`}
            />

            <i className={`${icon} w-4 text-sm z-10`} />
            <span
              className={`z-10 transition-opacity duration-300
                          ${collapsed ? "opacity-0 pointer-events-none" : "opacity-100"}`}
            >
              {label}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* ─── User Info ───────────────────────────────── */}
      <div className="flex items-center gap-2 text-[10px] text-gray-400 px-3 py-4">
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black font-semibold">
          {username.charAt(0).toUpperCase()}
        </div>
        {!collapsed && (
          <div className="transition-opacity duration-300">
            <div className="text-white font-medium text-xs">{username}</div>
            <div className="text-gray-400">Admin</div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default AdminSidebar;
