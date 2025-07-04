import { useState } from "react";
import type { ReactNode } from "react";
import ClientSidebar from "../components/ClientSidebar.tsx";
import ClientHeader from "../components/ClientHeader.tsx";
import ClientFooter from "../components/ClientFooter.tsx";

interface ClientLayoutProps {
  children?: ReactNode;
}

const ClientLayout = ({ children }: ClientLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <div className="h-16 shrink-0">
        <ClientHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      </div>

      {/* Main content (fills screen minus header) */}
      <div
        className="flex flex-grow"
        style={{ minHeight: "calc(100vh - 64px)" }}
      >
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-64 shrink-0">
          <ClientSidebar
            isOpen={sidebarOpen}
            toggle={() => setSidebarOpen(false)}
          />
        </div>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-90 md:hidden flex">
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative z-50 w-64 h-full bg-white shadow-lg animate-slideInLeft">
              <ClientSidebar
                isOpen={sidebarOpen}
                toggle={() => setSidebarOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main content scrollable */}
        <main className="flex-1 overflow-y-auto bg-white">
          <div className="min-h-full">{children}</div>
        </main>
      </div>

      {/* Footer (always below screen) */}
      <div>
        <ClientFooter />
      </div>
    </div>
  );
};

export default ClientLayout;
