// SidebarChatList.tsx
import React from "react";
import type { Chat } from "..//AdminMessageContent.tsx";

type Props = {
  chats: Chat[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
};

const SidebarChatList: React.FC<Props> = ({
  chats,
  activeIndex,
  setActiveIndex,
}) => {
  return (
    <div className="w-1/4 bg-white border-r p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Messages</h2>
      <input
        type="text"
        placeholder="Search"
        className="w-full mb-4 px-3 py-2 border rounded-lg text-sm"
      />
      <div className="space-y-4">
        {chats.map((chat, idx) => (
          <div
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`cursor-pointer p-3 rounded-xl transition hover:bg-gray-100 ${
              idx === activeIndex ? "bg-gray-100" : ""
            }`}
          >
            <h3 className="font-medium text-sm">{chat.name}</h3>
            <p className="text-xs text-gray-500 truncate">{chat.message}</p>
            <p className="text-xs text-right text-gray-400 mt-1">{chat.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SidebarChatList;
