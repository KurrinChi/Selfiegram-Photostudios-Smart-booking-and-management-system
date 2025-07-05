import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { Chat } from "../AdminMessageContent";

const extractLinksFromMessages = (messages: Chat["messages"]) => {
  const linkRegex = /https?:\/\/[^\s]+/g;
  const allLinks = messages
    .map((msg) => msg.text.match(linkRegex))
    .flat()
    .filter(Boolean);
  return Array.from(new Set(allLinks)) as string[];
};

interface ChatDetailsProps {
  chat: Chat;
  isMobileVisible: boolean;
  onClose: () => void;
}

const ChatDetails: React.FC<ChatDetailsProps> = ({
  chat,
  isMobileVisible,
  onClose,
}) => {
  const [showMedia, setShowMedia] = useState(true);
  const [showLinks, setShowLinks] = useState(true);
  const [showAppointments, setShowAppointments] = useState(true);

  const messageLinks = useMemo(
    () => extractLinksFromMessages(chat.messages),
    [chat.messages]
  );
  const combinedLinks = useMemo(() => {
    const staticLinks = chat.links || [];
    const dynamicLinks = messageLinks || [];
    return Array.from(new Set([...staticLinks, ...dynamicLinks]));
  }, [chat.links, messageLinks]);

  return (
    <div
      className={`
        bg-[#212121] text-white flex flex-col gap-5 overflow-y-auto transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 lg:static lg:block lg:h-full lg:w-full
        fixed top-0 bottom-0 right-0 z-50 p-6 w-full max-w-md
        ${isMobileVisible ? "translate-x-0" : "translate-x-full"}
      `}
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold tracking-wide mb-5">Chat Details</h2>
        <button
          onClick={onClose}
          className="lg:hidden text-sm text-white px-2 py-1 bg-gray-700 rounded"
        >
          Close
        </button>
      </div>

      {/* Media */}
      <section>
        <div
          onClick={() => setShowMedia(!showMedia)}
          className="flex items-center justify-between cursor-pointer mb-5 "
        >
          <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-1">
            {showMedia ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            Photos and Videos
          </h3>
        </div>
        {showMedia &&
          (chat.media?.length ? (
            <div className="flex gap-3 flex-wrap">
              {chat.media.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt="media"
                  className="w-16 h-16 rounded-lg object-cover shadow-md hover:scale-105 transition-transform"
                />
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">
              No photos or videos shared.
            </p>
          ))}
      </section>

      {/* Links */}
      <section>
        <div
          onClick={() => setShowLinks(!showLinks)}
          className="flex items-center justify-between cursor-pointer mb-5 mt-10"
        >
          <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-1">
            {showLinks ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            Shared Links
          </h3>
        </div>
        {showLinks &&
          (combinedLinks.length ? (
            <ul className="text-xs space-y-1 break-all">
              {combinedLinks.map((link, i) => (
                <li
                  key={i}
                  className="text-blue-400 underline hover:text-blue-300 cursor-pointer"
                >
                  <a href={link} target="_blank" rel="noopener noreferrer">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-gray-400 italic">No links shared.</p>
          ))}
      </section>

      {/* Appointments */}
      <section>
        <div
          onClick={() => setShowAppointments(!showAppointments)}
          className="flex items-center justify-between cursor-pointer mb-5 mt-10"
        >
          <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-1">
            {showAppointments ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
            Appointments
          </h3>
        </div>
        {showAppointments &&
          (chat.appointments?.length ? (
            <div className="flex flex-col gap-3">
              {chat.appointments.map((appt, i) => (
                <div
                  key={i}
                  className="bg-gray-100 text-gray-900 text-xs p-3 rounded-xl shadow-sm"
                >
                  <p className="font-semibold">{appt.package}</p>
                  <p className="text-sm">{appt.client}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">
              No appointments scheduled.
            </p>
          ))}
      </section>
    </div>
  );
};

export default ChatDetails;
