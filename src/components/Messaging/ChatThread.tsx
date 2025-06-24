// ChatThread.tsx
import React from "react";
import type { Chat } from "..//AdminMessageContent.tsx";

type Props = {
  chat: Chat;
  input: string;
  setInput: (value: string) => void;
  handleSend: () => void;
};

const ChatThread: React.FC<Props> = ({ chat, input, setInput, handleSend }) => {
  return (
    <div className="w-2/4 p-6 flex flex-col justify-between border-r bg-gray-50">
      <div>
        <h2 className="text-lg font-semibold mb-6">{chat.name}</h2>
        <div className="space-y-4 overflow-y-auto max-h-[75vh] pr-2">
          {chat.messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.fromMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-2 rounded-xl text-sm max-w-xs ${
                  msg.fromMe
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-700 border"
                }`}
              >
                {msg.text}
                <div className="text-[10px] mt-1 text-right opacity-70">
                  {msg.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-grow px-4 py-2 rounded-lg border text-sm"
            placeholder="Write message"
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatThread;
