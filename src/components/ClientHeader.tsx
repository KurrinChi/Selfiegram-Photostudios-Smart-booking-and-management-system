import { useEffect, useState } from "react";
import { Menu } from "lucide-react";

interface HeaderProps {
  onToggleSidebar: () => void;
}

const ClientHeader = ({ onToggleSidebar }: HeaderProps) => {
  const [username, setUsername] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUsername(user.username || "Guest");
        setProfilePicture(user.profilePicture || null);
      } catch (e) {
        console.error("Failed to parse user from localStorage:", e);
      }
    }
  }, []);

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
        {profilePicture ? (
          <img
            src={profilePicture}
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover border border-gray-300"
            onError={(e) => {
              e.currentTarget.src = "/fallback.png"; // optional fallback image
            }}
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-300" />
        )}
        <span className="text-sm">{username ?? "Loading..."}</span>
      </div>
    </header>
  );
};

export default ClientHeader;
