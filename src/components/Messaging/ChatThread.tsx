import React, { useRef, useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import type { Chat, Message } from "../AdminMessageContent";
import { Paperclip, Send } from "lucide-react";

type Props = {
  chat: Chat;
  input: string;
  setInput: (value: string) => void;
  handleSend: () => void;
  onShowDetails: () => void;
  onBack: () => void;
  showBackButton?: boolean; // <-- Optional new prop
};

const ChatThread: React.FC<Props> = ({
  chat,
  input,
  setInput,
  handleSend,
  onShowDetails,
  onBack,
  showBackButton = true, // <-- Default true
}) => {
  const endRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Auto scroll only after first load
  useEffect(() => {
    if (!initialLoad) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat.messages]);

  useEffect(() => {
    const timer = setTimeout(() => setInitialLoad(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachedFile(file);

    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSendWithFile = () => {
    if (!input.trim() && !attachedFile) return;

    const newMessage: Message = {
      text: input,
      time: new Date().toISOString(),
      fromMe: true,
    };

    if (attachedFile) {
      const fileUrl = previewUrl || URL.createObjectURL(attachedFile);
      newMessage.media = [fileUrl];
    }

    chat.messages.push(newMessage);
    chat.message = input || attachedFile?.name || "File sent";
    chat.time = newMessage.time;
    chat.unread = false;

    setInput("");
    setAttachedFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="px-4 py-3 bg-white shadow-sm sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showBackButton && (
            <button className="lg:hidden text-blue-500" onClick={onBack}>
              ← Back
            </button>
          )}
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
              {msg.media?.map((url, i) => (
                <div key={i} className="mt-2">
                  {url.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                    <img
                      src={url}
                      alt="attachment"
                      className="w-40 rounded-lg"
                    />
                  ) : (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs underline break-words block mt-1"
                    >
                      {url.split("/").pop()}
                    </a>
                  )}
                </div>
              ))}
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-blue-500 hover:text-blue-600"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-grow px-4 py-2 rounded-full text-sm border focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Write a message..."
          />

          <button
            onClick={handleSendWithFile}
            className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm flex items-center gap-1"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {previewUrl && (
          <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
            <span>Preview:</span>
            <img src={previewUrl} alt="preview" className="w-16 rounded" />
            <button
              onClick={() => {
                setAttachedFile(null);
                setPreviewUrl(null);
              }}
              className="text-red-500 hover:underline text-xs"
            >
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatThread;
