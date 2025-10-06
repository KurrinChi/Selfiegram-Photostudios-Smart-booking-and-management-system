// components/StaffSidebar.tsx
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";

interface StaffSidebarProps {
  username: string;
  profilePicture?: string;
  collapsed: boolean;
  toggle: () => void;
}

/**
 * Staff navigation items - excludes User Management and Sales
 */
const navItems = [
  {
    label: "Dashboard",
    path: "/staff/dashboard",
    icon: "fas fa-tachometer-alt",
  },
  {
    label: "Packages",
    path: "/staff/packages",
    icon: "fas fa-box",
  },
  {
    label: "Appointments",
    path: "/staff/appointments",
    icon: "fas fa-calendar-alt",
  },
  { label: "Messages", path: "/staff/messages", icon: "fas fa-envelope" },
  { label: "Gallery", path: "/staff/gallery", icon: "fas fa-image" },
];

const StaffSidebar: React.FC<StaffSidebarProps> = ({
  username,
  profilePicture,
  collapsed,
  toggle,
}) => {
  const location = useLocation();
  const isProfileActive = location.pathname === "/staff/profile";

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen
                  bg-[#383838] text-white flex flex-col justify-between
                  transition-all duration-300 ease-in-out
                  ${collapsed ? "w-16" : "w-48"}`}
      aria-label="Staff sidebar"
    >
      {/* Toggle Button */}
      <button
        onClick={() => {
          toggle();
          localStorage.setItem("sidebar-collapsed", String(!collapsed));
        }}
        className="absolute -right-4 top-4 w-8 h-8 flex items-center justify-center
             bg-[#1e1e1e] border border-gray-600 rounded-full
             text-white hover:scale-110 transition-transform duration-300"
        aria-label="Toggle sidebar"
      >
        <i
          className={`fas fa-chevron-left text-xs transform transition-transform duration-300
            ${collapsed ? "rotate-180" : "rotate-0"}`}
        />
      </button>

      {/* Logo */}
      <div className="flex justify-center my-6">
        <img
          src="/slfg.svg"
          alt="Selfie Gram Logo"
          className={`transition-all duration-300 ${
            collapsed ? "h-10" : "h-20"
          }`}
          style={{ filter: "invert(100%) brightness(200%)" }}
        />
      </div>

      {/* NAV - Simple list without dropdown */}
      <nav className="flex-1 flex flex-col gap-1 px-2 relative overflow-visible">
        {navItems.map(({ label, path, icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 py-2 px-3 rounded-md text-xs overflow-hidden
               transition-all duration-300 ease-in-out
               ${
                 isActive
                   ? "bg-[rgba(238,238,225,0.13)] text-white scale-[1.02]"
                   : "hover:bg-gray-700 text-gray-300"
               }`
            }
          >
            <span
              className={`absolute left-0 top-0 h-full w-1 bg-[#ffffff] rounded-tr-md rounded-br-md
                          transition-all duration-300 ease-in-out
                          group-[.active]:opacity-100 opacity-0 group-hover:opacity-30`}
            />
            <div
              className={`absolute inset-0 z-0 transition-all duration-300 ease-in-out rounded-md
                          ${collapsed ? "" : "group-hover:bg-gray-700"}`}
            />
            <i className={`${icon} w-4 text-sm z-10`} />
            <span
              className={`z-10 transition-opacity duration-300 ${
                collapsed ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
            >
              {label}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* User Info Link */}
      <NavLink
        to="/staff/profile"
        className={({ isActive }) =>
          `relative block group ${
            isActive
              ? "bg-[rgba(238,238,225,0.13)] text-white scale-[1.02]"
              : "hover:bg-gray-700 text-gray-400"
          }`
        }
      >
        <div
          className={`relative flex items-center gap-2 text-[10px] px-3 py-4 rounded-md cursor-pointer 
                    transition-all duration-300 ease-in-out group`}
        >
          <span
            className={`absolute left-0 top-0 h-full w-1 rounded-tr-md rounded-br-md
                      transition-opacity duration-300 ease-in-out
                      ${
                        isProfileActive
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-30"
                      }`}
          />

          <div
            className={`absolute inset-0 z-0 rounded-md transition-all duration-300 ease-in-out 
                      ${collapsed ? "" : "group-hover:bg-gray-700"}`}
          />

          {/* Profile Picture or First Letter */}
          <div className="z-10 w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-white text-black font-semibold">
            {profilePicture ? (
              <img
                src={profilePicture}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              username.charAt(0).toUpperCase()
            )}
          </div>

          {!collapsed && (
            <div className="z-10 transition-opacity duration-300">
              <div className="text-white font-medium text-xs">{username}</div>
              <div className="text-gray-400">Staff</div>
            </div>
          )}
        </div>
      </NavLink>
    </aside>
  );
};

export default StaffSidebar;
