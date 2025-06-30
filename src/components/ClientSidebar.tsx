import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Package,
  Heart,
  Image,
  Inbox,
  Calendar,
  Clock,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import clsx from "clsx";

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

const navLinks = [
  { to: "/client/home", label: "Home", icon: Home },
  { to: "/client/packages", label: "Packages", icon: Package },
  { to: "/client/favorites", label: "Favorites", icon: Heart },
  { to: "/client/gallery", label: "Gallery", icon: Image },
  { to: "/client/inbox", label: "Inbox", icon: Inbox },
  { to: "/client/appointments", label: "Appointments", icon: Calendar },
  { to: "/client/history", label: "History", icon: Clock },
];

const ClientSidebar = ({ isOpen, toggle }: SidebarProps) => {
  const { pathname } = useLocation();

  return (
    <aside
      className={clsx(
        "h-full bg-white shadow-sm transition-all duration-300 ease-in-out z-40",
        "w-64",
        {
          "absolute md:relative transform -translate-x-full md:translate-x-0":
            !isOpen,
          "absolute md:relative transform translate-x-0": isOpen,
        }
      )}
    >
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 md:hidden">
        <h2 className="text-lg font-bold text-gray-800">Selfiegram</h2>
        <button
          onClick={toggle}
          className="hover:scale-110 transition-transform duration-200"
        >
          <X className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col p-4 space-y-2 items-start">
        {navLinks.map(({ to, label, icon: Icon }) => {
          const isActive = pathname === to;
          const isAppointments = label === "Appointments";

          return (
            <Link
              key={to}
              to={to}
              onClick={toggle}
              className={clsx(
                "flex items-center gap-3 w-full p-2 rounded-md transition-all duration-200 group",
                "hover:bg-gray-100 hover:translate-x-1",
                {
                  "mt-4 pt-2 border-t border-gray-300": isAppointments,
                  "bg-gray-100 border-l-4 pl-2 font-semibold": isActive,
                }
              )}
              style={
                isActive ? { borderColor: "#212121", color: "#212121" } : {}
              }
            >
              <Icon
                className={clsx("w-5 h-5 transition-colors duration-200", {
                  "text-[#212121]": isActive,
                  "text-gray-500 group-hover:text-[#212121]": !isActive,
                })}
              />
              <span
                className={clsx("text-left transition-colors duration-200", {
                  "text-[#212121]": isActive,
                  "text-gray-700 group-hover:text-[#212121]": !isActive,
                })}
              >
                {label}
              </span>
            </Link>
          );
        })}

        {/* Bottom Links */}
        <div className="absolute bottom-8 px-4 space-y-2 left-0 w-full">
          <Link
            to="/client/settings"
            onClick={toggle}
            className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-gray-100 hover:translate-x-1 transition-all duration-200 group"
          >
            <Settings className="w-5 h-5 text-gray-500 group-hover:text-[#212121] transition-colors" />
            <span className="text-left text-gray-700 group-hover:text-[#212121] transition-colors">
              Settings
            </span>
          </Link>
          <Link
            to="/login"
            onClick={toggle}
            className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-gray-100 hover:translate-x-1 transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 text-gray-500 group-hover:text-[#212121] transition-colors" />
            <span className="text-left text-gray-700 group-hover:text-[#212121] transition-colors">
              Logout
            </span>
          </Link>
        </div>
      </nav>
    </aside>
  );
};

export default ClientSidebar;
