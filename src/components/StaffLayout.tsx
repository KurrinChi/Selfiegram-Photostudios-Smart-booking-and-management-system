// components/StaffLayout.tsx
import React, { useState, useEffect } from "react";
import StaffSidebar from "./StaffSidebar";
import { Menu } from "lucide-react"; // burger + close icon
import { motion, AnimatePresence } from "framer-motion";

interface StaffLayoutProps {
  children: React.ReactNode;
}

const StaffLayout: React.FC<StaffLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar-collapsed");
      return saved === "true";
    }
    return false;
  });

  const [username, setUsername] = useState<string>("");
  const [profilePicture, setProfilePicture] = useState<string>("");
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUsername(user.username);
        setProfilePicture(user.profilePicture ?? "");
      } catch (e) {
        console.error("Failed to parse user from localStorage:", e);
      }
    }
  }, []);

  const toggleSidebar = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  };

  return (
    <div className="flex min-h-screen font-sf relative">
      {/* Sidebar - Desktop */}
      <div className="hidden sm:block">
        <StaffSidebar
          username={username}
          profilePicture={profilePicture}
          collapsed={collapsed}
          toggle={toggleSidebar}
        />
      </div>

      {/* Mobile Burger Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="sm:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-gray-800 text-white"
      >
        <Menu size={24} />
      </button>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Dimmed background with fade */}
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setMobileOpen(false)}
            />

            {/* Slide-in sidebar */}
            <motion.div
              className="fixed left-0 top-0 bottom-0 z-50 w-64"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
            >
              <StaffSidebar
                username={username}
                profilePicture={profilePicture}
                collapsed={false} // always expanded on mobile
                toggle={() => setMobileOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Main Content */}
      <main
        className={`flex-1 h-full overflow-hidden transition-all duration-300 ease-in-out
          hidden sm:block
          ${collapsed ? "ml-16" : "ml-48"} 
        `}
      >
        {children}
      </main>

      {/* Mobile Main Content (no margin, takes full width) */}
      <main className="flex-1 h-full overflow-hidden block sm:hidden">
        {children}
      </main>
    </div>
  );
};

export default StaffLayout;
