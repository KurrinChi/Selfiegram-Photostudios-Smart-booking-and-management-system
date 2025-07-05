// components/client/ClientHeader.tsx
import { Menu } from "lucide-react";

interface HeaderProps {
  onToggleSidebar: () => void;
}

const ClientHeader = ({ onToggleSidebar }: HeaderProps) => {
  return (
    <header className="w-full bg-white px-4 py-3 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-3">
        <button onClick={onToggleSidebar} className="md:hidden">
          <Menu className="w-6 h-6" />
        </button>
        <img src="/slfg.svg" alt="Selfie Gram Logo" className="w-13 ml-2" />
        <h1 className="text-xs font-bold tracking-widest hidden md:block">
          SELFIEGRAM PHOTOSTUDIOS MALOLOS
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gray-300" />
        <span className="text-sm">user01</span>
      </div>
    </header>
  );
};

export default ClientHeader;
