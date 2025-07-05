import { useState } from "react";
import type { ReactNode } from "react";
import ClientSidebar from "../components/ClientSidebar";
import ClientHeader from "../components/ClientHeader";
import ClientFooter from "../components/ClientFooter";

interface ClientLayoutProps {
  children?: ReactNode;
}

const ClientLayout = ({ children }: ClientLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const handleSidebarClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setSidebarOpen(false);
      setIsAnimatingOut(false);
    }, 300); // Matches slideOutLeft animation duration
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-sf">
      {/* Header */}
      <div className="h-16 shrink-0">
        <ClientHeader onToggleSidebar={() => setSidebarOpen(true)} />
      </div>

      {/* Main content (fills screen minus header) */}
      <div className="flex flex-grow min-h-[calc(100vh-64px)]">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-64 shrink-0">
          <ClientSidebar isOpen toggle={() => setSidebarOpen(false)} />
        </div>

        {/* Mobile Sidebar */}
        {(sidebarOpen || isAnimatingOut) && (
          <div className="fixed inset-0 z-90 md:hidden flex">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={handleSidebarClose}
            />
            {/* Slide Animation */}
            <div
              className={`relative z-50 w-64 h-full bg-white shadow-lg ${
                isAnimatingOut ? "animate-slideOutLeft" : "animate-slideInLeft"
              }`}
            >
              <ClientSidebar isOpen toggle={handleSidebarClose} />
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-white">
          <div className="min-h-full">{children}</div>
        </main>
      </div>

      {/* Footer */}
      <div>
        <ClientFooter />
      </div>
    </div>
  );
};

export default ClientLayout;
