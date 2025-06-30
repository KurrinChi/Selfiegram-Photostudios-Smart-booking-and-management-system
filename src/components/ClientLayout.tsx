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
      <div className="min-h-screen flex flex-col">
        <ClientHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex flex-1 min-h-full overflow-hidden">
          {/* Sidebar with fixed width */}
          <div className="w-64 shrink-0">
            <ClientSidebar
              isOpen={sidebarOpen}
              toggle={() => setSidebarOpen(!sidebarOpen)}
            />
          </div>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-4">{children}</main>
        </div>
      </div>

      <ClientFooter />
    </div>
  );
};

export default ClientLayout;
