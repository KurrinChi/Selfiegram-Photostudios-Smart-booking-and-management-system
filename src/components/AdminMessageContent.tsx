import React, { useState, useEffect } from "react";
import SidebarChatList from "./Messaging/SidebarChatList";
import ChatThread from "./Messaging/ChatThread";
import ChatDetails from "./Messaging/ChatDetails";
import mockChats from "../data/mockChats.json";

export type Message = {
  text: string;
  time: string;
  fromMe: boolean;
};

export type Chat = {
  name: string;
  message: string;
  time: string;
  unread?: boolean;
  active?: boolean;
  messages: Message[];
  media?: string[];
  links?: string[];
  appointments?: {
    package: string;
    client: string;
  }[];
};

const initialChats: Chat[] = (mockChats as Chat[]).sort(
  (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
);

const AdminMessageContent: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [input, setInput] = useState<string>("");
  const [showDetails, setShowDetails] = useState(false);

  const activeChat = activeIndex !== null ? chats[activeIndex] : null;

  useEffect(() => {
    const isDesktop = window.innerWidth >= 1024;
    if (isDesktop && activeIndex === null && chats.length > 0) {
      setActiveIndex(0);
    }
  }, [chats, activeIndex]);

  const handleSend = () => {
    if (!input.trim() || activeIndex === null) return;
    const newMessage: Message = {
      text: input,
      time: new Date().toISOString(),
      fromMe: true,
    };

    const updatedChats = [...chats];
    updatedChats[activeIndex].messages.push(newMessage);
    updatedChats[activeIndex].message = input;
    updatedChats[activeIndex].time = newMessage.time;
    updatedChats[activeIndex].unread = false;

    const resorted = updatedChats.sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
    );

    setChats(resorted);
    setInput("");
  };

  return (
    <div className="flex h-screen w-full font-sf overflow-hidden relative bg-gradient-to-br from-gray-100 to-white animate-fadeIn">
      {/* Desktop Layout */}
      <div className="hidden lg:flex w-full px-4 py-6 gap-4">
        <div className="w-1/4 rounded-2xl bg-white shadow-xl overflow-hidden border border-gray-200">
          <SidebarChatList
            chats={chats}
            activeIndex={activeIndex ?? -1}
            setActiveIndex={setActiveIndex}
          />
        </div>

        <div className="w-2/4 rounded-2xl bg-white shadow-xl overflow-hidden border border-gray-200">
          <ChatThread
            chat={activeChat ?? chats[0]}
            input={input}
            setInput={setInput}
            handleSend={handleSend}
            onShowDetails={() => setShowDetails((prev) => !prev)}
            onBack={() => setActiveIndex(null)}
          />
        </div>

        <div className="w-1/4 rounded-2xl bg-white shadow-xl border border-gray-200 overflow-hidden">
          <ChatDetails
            chat={activeChat ?? chats[0]}
            isMobileVisible={true}
            onClose={() => setShowDetails(false)}
          />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex lg:hidden w-full h-full px-2 py-3">
        {activeChat ? (
          <div className="flex-1 rounded-2xl bg-white shadow-md border border-gray-200 overflow-hidden">
            <ChatThread
              chat={activeChat}
              input={input}
              setInput={setInput}
              handleSend={handleSend}
              onShowDetails={() => setShowDetails((prev) => !prev)}
              onBack={() => setActiveIndex(null)}
              showBackButton={true}
            />
          </div>
        ) : (
          <SidebarChatList
            chats={chats}
            activeIndex={activeIndex ?? -1}
            setActiveIndex={setActiveIndex}
          />
        )}
      </div>

      {/* Mobile Chat Details Slide-In */}
      {activeChat && (
        <div
          className={`lg:hidden fixed top-0 right-0 h-full w-full z-50 bg-white rounded-l-2xl shadow-xl border-l transition-transform duration-300 ease-in-out ${
            showDetails ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <ChatDetails
            chat={activeChat}
            isMobileVisible={showDetails}
            onClose={() => setShowDetails(false)}
          />
        </div>
      )}
    </div>
  );
};

export default AdminMessageContent;
