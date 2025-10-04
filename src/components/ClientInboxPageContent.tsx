import React, { useEffect, useState } from "react";
import CenteredLoader from "./CenteredLoader";
// Fallback lightweight components & types (original Messaging components not found)
interface Message { text: string; time: string; fromMe?: boolean }
interface Chat { id?: string; messages: Message[]; message?: string; time?: string; unread?: boolean }

const ChatThread: React.FC<{
  chat: Chat;
  input: string;
  setInput: (v: string) => void;
  handleSend: () => void;
  onShowDetails: () => void;
  onBack: () => void;
  showBackButton: boolean;
}> = ({ chat, input, setInput, handleSend, onShowDetails }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-4 space-y-3 text-sm">
        {chat.messages.map((m, i) => (
          <div key={i} className={`max-w-xs px-3 py-2 rounded-md shadow text-[13px] whitespace-pre-wrap ${m.fromMe ? 'ml-auto bg-slate-900 text-white' : 'bg-slate-100 text-slate-800'}`}>{m.text}</div>
        ))}
      </div>
      <div className="border-t p-3 flex gap-2">
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter') handleSend();}} placeholder="Type a message" className="flex-1 border rounded-md px-3 py-2 text-sm outline-none" />
        <button onClick={handleSend} className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm">Send</button>
        <button onClick={onShowDetails} className="px-3 py-2 bg-slate-100 rounded-md text-xs">Details</button>
      </div>
    </div>
  );
};

const ChatDetails: React.FC<{ chat: Chat; isMobileVisible: boolean; onClose: () => void }> = ({ chat, onClose }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex items-center justify-between"><h3 className="font-medium text-sm">Conversation Details</h3><button onClick={onClose} className="text-xs text-slate-500 hover:text-slate-800">Close</button></div>
      <div className="p-4 text-xs text-slate-600 space-y-2 overflow-auto">
        <div>Total Messages: {chat.messages.length}</div>
        <div>Last Activity: {chat.time ? new Date(chat.time).toLocaleString() : '—'}</div>
      </div>
    </div>
  );
};
import mockClientChat from "../data/mockClientChat.json";

const ClientInboxPageContent: React.FC = () => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [input, setInput] = useState<string>("");
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Simulate async loading (replace later with real fetch)
    const timer = setTimeout(() => {
      const loadedChat = mockClientChat as Chat;
      setChat(loadedChat);
      setLoading(false);
    }, 150);
    return () => clearTimeout(timer);
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

  if (loading || !chat) {
    return (
      <div className="p-4 animate-fadeIn h-[calc(100vh-64px)]">
        <CenteredLoader message="Loading inbox..." />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] w-full font-sf overflow-hidden relative bg-gradient-to-br from-gray-100 to-white animate-fadeIn">
      {/* Desktop Layout */}
      <div className="hidden lg:flex w-full px-4 py-6 gap-4">
        <div className="w-2/3 rounded-2xl bg-white shadow-xl overflow-hidden border border-gray-200">
          <ChatThread
            chat={chat}
            input={input}
            setInput={setInput}
            handleSend={handleSend}
            onShowDetails={() => setShowDetails((prev) => !prev)}
            onBack={() => {}}
            showBackButton={false}
          />
        </div>
        <div className="w-1/3 rounded-2xl bg-white shadow-xl border border-gray-200 overflow-hidden">
          <ChatDetails
            chat={chat}
            isMobileVisible={true}
            onClose={() => setShowDetails(false)}
          />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex lg:hidden w-full h-full px-2 py-3">
        <div className="flex-1 rounded-2xl bg-white shadow-md border border-gray-200 overflow-hidden">
          <ChatThread
            chat={chat}
            input={input}
            setInput={setInput}
            handleSend={handleSend}
            onShowDetails={() => setShowDetails((prev) => !prev)}
            onBack={() => {}}
            showBackButton={false}
          />
        </div>
      </div>

      {/* Mobile Slide-in Chat Details */}
      <div
        className={`lg:hidden fixed top-0 right-0 h-full w-full z-50 bg-white rounded-l-2xl shadow-xl border-l transition-transform duration-300 ease-in-out ${
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
