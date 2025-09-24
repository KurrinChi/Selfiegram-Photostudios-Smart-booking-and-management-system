import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import ClientSidebar from "../components/ClientSidebar";
import ClientHeader from "../components/ClientHeader";
import ClientFooter from "../components/ClientFooter";
import { fetchWithAuth } from "../utils/fetchWithAuth";

interface ClientLayoutProps {
  children?: ReactNode;
}

const ClientLayout = ({ children }: ClientLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0); // Manage unread count here

  const API_URL = import.meta.env.VITE_API_URL;

  const handleSidebarClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setSidebarOpen(false);
      setIsAnimatingOut(false);
    }, 300);
  };

  // Fetch notifications and calculate unread count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const userID = localStorage.getItem("userID");
        if (!userID) return;

        const token = localStorage.getItem("token");
        const res = await fetchWithAuth(`${API_URL}/api/notifications/${userID}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("Failed to fetch notifications");

        const data = await res.json();
        const unread = data.filter((n: any) => !n.starred).length; // Count unread notifications
        setUnreadCount(unread); // Update unread count
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    fetchUnreadCount();
  }, []); // Run once on component mount

  return (
    <div className="bg-gray-100 font-sf">
      {/* Screen-height section with header + sidebar + main */}
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="h-16 shrink-0">
          <ClientHeader onToggleSidebar={() => setSidebarOpen(true)} />
        </div>

        {/* Sidebar + Main */}
        <div className="flex flex-1 overflow-hidden">
          {/* Desktop Sidebar */}
          <div className="hidden md:flex w-64 shrink-0">
            <ClientSidebar
              isOpen
              toggle={() => setSidebarOpen(false)}
              unreadCount={unreadCount} // Pass unreadCount to the sidebar
            />
          </div>

          {/* Mobile Sidebar */}
          {(sidebarOpen || isAnimatingOut) && (
            <div className="fixed inset-0 z-90 md:hidden flex">
              <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={handleSidebarClose}
              />
              <div
                className={`relative z-50 w-64 h-full bg-white shadow-lg ${
                  isAnimatingOut
                    ? "animate-slideOutLeft"
                    : "animate-slideInLeft"
                }`}
              >
                <ClientSidebar
                  isOpen
                  toggle={handleSidebarClose}
                  unreadCount={unreadCount} // Pass unreadCount to the sidebar
                />
              </div>
            </div>
          )}

          {/* Main Content */}
          <main className="flex-1 flex flex-col bg-white overflow-y-auto">
            {children}
          </main>
        </div>
      </div>

      {/* Footer outside of the screen-height wrapper */}
      <ClientFooter />
    </div>
  );
};

export default ClientLayout;