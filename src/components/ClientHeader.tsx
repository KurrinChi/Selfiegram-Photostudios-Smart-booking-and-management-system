import React, { useEffect, useState } from "react";
import { Menu } from "lucide-react";

interface HeaderProps {
  onToggleSidebar: () => void;
}

const ClientHeader = ({ onToggleSidebar }: HeaderProps) => {
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    const fetchUsername = async () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user?.userID;

      if (!userId) return;

      try {
        const res = await fetch(`http://localhost:8000/api/user/${userId}`);
        const data = await res.json();

        if (data && data.username) {
          setUsername(data.username);
        } else {
          console.warn("No username found for user:", data);
        }
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      }
    };

    fetchUsername();
  }, []);

  useEffect(() => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.userID;

  if (!userId) return;

  fetch(`http://localhost:8000/api/user/${userId}`)
    .then((res) => res.json())
    .then((data) => setUsername(data.username)) // or name/email
    .catch((err) => {
      console.error("Failed to fetch user:", err);
    });
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
        <div className="w-8 h-8 rounded-full bg-gray-300" />
        <span className="text-sm">{username || "..."}</span>
      </div>
    </header>
  );
};

export default ClientHeader;
