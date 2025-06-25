import React from "react";
import type { Chat } from "../AdminMessageContent";

type Props = {
  chats: Chat[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
};

const formatChatTime = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  return isToday
    ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString([], { month: "short", day: "numeric" });
};

const SidebarChatList: React.FC<Props> = ({
  chats,
  activeIndex,
  setActiveIndex,
}) => {
  // Sort chats by most recent first
  const sortedChats = [...chats].sort(
    (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
  );

  return (
    <div className="w-100% bg-white h-full flex flex-col ">
      {/* Header */}
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-3">Messages</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-3 py-2 rounded-full text-sm bg-gray-100"
          />
          <svg
            className="w-4 h-4 text-gray-500 absolute left-3 top-2.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35m0 0a7 7 0 1 0-9.9 0 7 7 0 0 0 9.9 0z"
            />
          </svg>
        </div>
      </div>

      {/* Chat List */}
      <div className="overflow-y-auto flex-grow p-2 space-y-1 bg-gray-50">
        {sortedChats.map((chat, idx) => (
          <div
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`relative p-3 rounded-xl transition cursor-pointer ${
              idx === activeIndex ? "bg-gray-100" : "hover:bg-gray-50"
            }`}
          >
            {chat.unread && (
              <span className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full" />
            )}
            <div className="ml-4">
              <div className="flex justify-between items-center">
                <p className="font-semibold text-sm">{chat.name}</p>
                <p className="text-xs text-gray-500">
                  {formatChatTime(chat.time)}
                </p>
              </div>
              <p className="text-sm text-gray-500 truncate">{chat.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SidebarChatList;
