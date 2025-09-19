import { useEffect, useState } from "react";
import { Trash2, Info, X } from "lucide-react";
import { fetchWithAuth } from "../utils/fetchWithAuth";

type Notification = {
  id: number;
  title: string;
  label?: "Booking" | "Payment" | "Reschedule" | "Cancellation" | "Reminder" | "Promotion" | "System";
  message: string;
  time: string;
  starred?: boolean;
};

/*const sampleNotifications: Notification[] = [
  {
    id: 1,
    title: "System Notification",
    label: "Booking",
    message: "Your booking for [Package Name] on [Date & Time] ...",
    time: "8:38 AM",
  },
  {
    id: 2,
    title: "System Notification",
    label: "Reschedule",
    message: "Thank you for contacting support...",
    time: "8:13 AM",
  },
  {
    id: 3,
    title: "System Notification",
    label: "Booking",
    message: "Your booking for [Package Name] on [Date & Time] ...",
    time: "8:38 AM",
  },
  {
    id: 4,
    title: "System Notification",
    label: "Promotion",
    message: "Check out our Limited Time Offer Package dedicated to you...",
    time: "7:52 PM",
    starred: true,
  },
   {
    id: 5,
    title: "System Notification",
    label: "System",
    message: "Check out our Limited Time Offer Package dedicated to you...",
    time: "7:52 PM",
    starred: true,
  },
];*/
/*
label ENUM(
  'Booking', -- has userID
  'Payment', -- has userID
  'Reschedule', -- has userID
  'Cancellation', -- has userID
  'Reminder', -- has userID
  'Promotion', -- global nullable userID (discounts, offers, etc.)
  'System' -- global nullable userID(welcome message, policy updates, etc.)
)*/

const labelColors: Record<string, string> = {
  Booking: "bg-blue-100 text-blue-600",
  Payment: "bg-green-100 text-green-600",
  Reschedule: "bg-yellow-100 text-yellow-700",
  Cancellation: "bg-red-100 text-red-600",
  Reminder: "bg-purple-100 text-purple-600",
  Promotion: "bg-pink-100 text-pink-600",
  System: "bg-black text-white",
};

export default function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selected, setSelected] = useState<Notification | null>(null);


   const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const userID = localStorage.getItem("userID"); // ✅ fetch userID from localStorage
        if (!userID) return;

        // If you have a fetchWithAuth wrapper

        const token = localStorage.getItem("token"); // Bearer token if required
        const res = await fetchWithAuth(`${API_URL}/api/notifications/${userID}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("Failed to fetch notifications");

        const data = await res.json();
        setNotifications(data);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="flex h-[calc(100vh-10vh)]">
      {/* Notifications List */}
      <div className="flex-1 p-4 animate-fadeIn">
        <h1 className="text-2xl font-semibold mb-4">Notifications</h1>
        <div className="bg-white rounded-2xl shadow-md overflow-x-auto h-full">
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
    className="border-t border-gray-100 hover:bg-gray-50 transition-all cursor-pointer"
    onClick={() => setSelected(n)} // 👈 Clicking row sets the selected notif
  >
    {/* Star */}
    <td className="p-4 w-10">
      <span
        className={`${
          n.starred ? "text-yellow-500" : "text-gray-300"
        } cursor-pointer`}
        onClick={(e) => {
          e.stopPropagation(); // 👈 prevent row click when clicking star
        }}
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
            labelColors[n.label] || "bg-gray-100 text-gray-600"
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
    <td
      className="p-4 text-center flex gap-2 justify-center"
      onClick={(e) => e.stopPropagation()} // 👈 prevent row click when pressing buttons
    >
      <button
        className="p-1.5 rounded-full hover:bg-gray-100"
        onClick={() => setSelected(n)}
      >
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

      {/* Details Sidebar */}
      {selected && (
        <div className="w-[40rem] border-l bg-white shadow-lg p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg">Details</h2>
            <button onClick={() => setSelected(null)}>
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <p className="text-sm text-gray-500">{selected.time}</p>
          <h3 className="text-xl font-semibold mt-2">{selected.title}</h3>
          {selected.label && (
            <span
              className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${
                labelColors[selected.label] || "bg-gray-100 text-gray-600"
              }`}
            >
              {selected.label}
            </span>
          )}
          <p className="mt-4 text-gray-700 text-sm leading-relaxed">
            {selected.message}
          </p>
        </div>
      )}
    </div>
  );
}
