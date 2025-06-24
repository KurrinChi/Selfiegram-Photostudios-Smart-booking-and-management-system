// ChatInterface.tsx (Main Layout Entry)
import React, { useState } from "react";
import SidebarChatList from "./Messaging/SidebarChatList";
import ChatThread from "./Messaging/ChatThread";
import ChatDetails from "./Messaging/ChatDetails";

export type Message = {
  text: string;
  time: string;
  fromMe: boolean;
};

export type Chat = {
  name: string;
  message: string;
  time: string;
  active?: boolean;
  messages: Message[];
};

const initialChats: Chat[] = [
  {
    name: "Stephen Yustiono",
    message:
      "I don't know why people get all worked up about hawaiian pizza...",
    time: "9:36 AM",
    active: true,
    messages: [
      {
        text: "It is a long established fact...",
        time: "6:30 PM",
        fromMe: false,
      },
      {
        text: "There are many variations of passages...",
        time: "6:34 PM",
        fromMe: true,
      },
      {
        text: "The point of using Lorem Ipsum...",
        time: "6:38 PM",
        fromMe: false,
      },
    ],
  },
  {
    name: "Erin Steed",
    message: "(Sad fact: you cannot search for a gif of the word 'girl'...",
    time: "9:28 AM",
    messages: [],
  },
  {
    name: "Daisy Tinsley",
    message: "Maybe email isn't the best form of communication.",
    time: "9:20 AM",
    messages: [],
  },
];

const AdminMessageContent: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [input, setInput] = useState<string>("");

  const activeChat = chats[activeIndex];

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessage: Message = {
      text: input,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      fromMe: true,
    };
    const updatedChats = [...chats];
    updatedChats[activeIndex].messages.push(newMessage);
    updatedChats[activeIndex].message = input;
    updatedChats[activeIndex].time = newMessage.time;
    setChats(updatedChats);
    setInput("");
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <SidebarChatList
        chats={chats}
        activeIndex={activeIndex}
        setActiveIndex={setActiveIndex}
      />
      <ChatThread
        chat={activeChat}
        input={input}
        setInput={setInput}
        handleSend={handleSend}
      />
      <ChatDetails />
    </div>
  );
};

export default AdminMessageContent;
