import React, { useEffect, useState } from "react";
import ChatThread from "./Messaging/ChatThread";
import ChatDetails from "./Messaging/ChatDetails";
import type { Chat, Message } from "./AdminMessageContent";
import mockClientChat from "../data/mockClientChat.json";

const ClientInboxPageContent: React.FC = () => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [input, setInput] = useState<string>("");
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const loadedChat = mockClientChat as Chat;
    setChat(loadedChat);
  }, []);

  const handleSend = () => {
    if (!input.trim() || !chat) return;

    const newMessage: Message = {
      text: input,
      time: new Date().toISOString(),
      fromMe: true,
    };

    const updatedChat: Chat = {
      ...chat,
      messages: [...chat.messages, newMessage],
      message: input,
      time: newMessage.time,
      unread: false,
    };

    setChat(updatedChat);
    setInput("");
  };

  if (!chat) return null;

  return (
    <div className="flex h-[calc(100vh-64px)] w-full bg-gray-100 font-sf overflow-hidden animate-fadeIn relative">
      {/* Desktop Layout */}
      <div className="hidden lg:flex w-full">
        <div className="w-2/3 border-r border-gray-200">
          <ChatThread
            chat={chat}
            input={input}
            setInput={setInput}
            handleSend={handleSend}
            onShowDetails={() => setShowDetails((prev) => !prev)}
            onBack={() => {}}
            showBackButton={false} // ✅ Explicitly disable on desktop
          />
        </div>
        <div className="w-1/3">
          <ChatDetails
            chat={chat}
            isMobileVisible={true}
            onClose={() => setShowDetails(false)}
          />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex lg:hidden w-full h-full">
        <ChatThread
          chat={chat}
          input={input}
          setInput={setInput}
          handleSend={handleSend}
          onShowDetails={() => setShowDetails((prev) => !prev)}
          onBack={() => {}}
          showBackButton={false} // ✅ Disable back button on mobile
        />
      </div>

      {/* Mobile Slide-in Chat Details */}
      <div
        className={`lg:hidden fixed top-0 right-0 h-full w-full z-50 bg-white transform transition-transform duration-300 ease-in-out ${
          showDetails ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <ChatDetails
          chat={chat}
          isMobileVisible={showDetails}
          onClose={() => setShowDetails(false)}
        />
      </div>
    </div>
  );
};

export default ClientInboxPageContent;
