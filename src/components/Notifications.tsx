import { useState } from "react";
import { Trash2, Info } from "lucide-react";

type Notification = {
  id: number;
  title: string;
  label?: "Primary" | "Support";
  message: string;
  time: string;
  starred?: boolean;
};

const sampleNotifications: Notification[] = [
  {
    id: 1,
    title: "System Notification",
    label: "Primary",
    message: "Your booking for [Package Name] on [Date & Time] ...",
    time: "8:38 AM",
  },
  {
    id: 2,
    title: "System Notification",
    label: "Support",
    message: "Thank you for contacting support...",
    time: "8:13 AM",
  },
  {
    id: 3,
    title: "System Notification",
    label: "Primary",
    message: "Your booking for [Package Name] on [Date & Time] ...",
    time: "8:38 AM",
  },
  {
    id: 4,
    title: "System Notification",
    message: "Check out our Limited Time Offer Package dedicated to you...",
    time: "7:52 PM",
    starred: true,
  },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(sampleNotifications);

  return (
    <div className="p-4 animate-fadeIn">
      <h1 className="text-2xl font-semibold mb-4">Notifications</h1>
      <div className="bg-white rounded-2xl shadow-md overflow-x-auto h-[calc(100vh-20vh)]">
        {/* Top Controls (Search + Actions) */}
        <div className="flex items-center justify-between px-7 py-4 bg-gray-100">
          <input
            type="text"
            placeholder="Search"
            className="w-1/3 rounded-lg border px-2 py-1 text-sm focus:outline-none focus:border-black focus:ring-1"
          />
        </div>

        {/* Notifications Table */}
        <table className="min-w-full table-auto text-left text-sm">
          <tbody>
            {notifications.map((n) => (
              <tr
                key={n.id}
                className="border-t border-gray-100 hover:bg-gray-50 transition-all"
              >
                {/* Star */}
                <td className="p-4 w-10">
                  <span
                    className={`${
                      n.starred ? "text-yellow-500" : "text-gray-300"
                    } cursor-pointer`}
                  >
                    ★
                  </span>
                </td>

                {/* Title + Label + Message */}
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{n.title}</span>
                    {n.label && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          n.label === "Primary"
                            ? "bg-green-100 text-green-600"
                            : "bg-orange-100 text-orange-600"
                        }`}
                      >
                        {n.label}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 truncate max-w-md">
                    {n.message}
                  </p>
                </td>

                {/* Time */}
                <td className="p-4 text-xs text-gray-500 whitespace-nowrap">
                  {n.time}
                </td>

                {/* Actions */}
                <td className="p-4 text-center flex gap-2 justify-center">
                  <button className="p-1.5 rounded-full hover:bg-gray-100">
                    <Info className="w-4 h-4 text-gray-500" />
                  </button>
                  <button className="p-1.5 rounded-full hover:bg-gray-100">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
