import React, { useRef, useEffect } from "react";
import type { Chat } from "../AdminMessageContent";

type Props = {
  chat: Chat;
  input: string;
  setInput: (value: string) => void;
  handleSend: () => void;
  onShowDetails: () => void;
  onBack: () => void;
};

const ChatThread: React.FC<Props> = ({
  chat,
  input,
  setInput,
  handleSend,
  onShowDetails,
  onBack,
}) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages]);

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="px-4 py-3 bg-white shadow-sm sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="lg:hidden text-blue-500" onClick={onBack}>
            ← Back
          </button>
          <h2 className="text-lg font-semibold">{chat.name}</h2>
        </div>
        <button
          onClick={onShowDetails}
          className="lg:hidden text-sm text-blue-500"
        >
          View Details
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 px-6 py-4 overflow-y-auto space-y-4">
        {chat.messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.fromMe ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-4 py-2 rounded-2xl text-sm max-w-xs shadow ${
                msg.fromMe
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-800 border border-gray-200"
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{msg.text}</p>
              <div className="text-[10px] mt-1 text-right opacity-70">
                {msg.time}
              </div>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-white sticky bottom-0 z-10 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-grow px-4 py-2 rounded-full text-sm border focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Write a message..."
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatThread;
