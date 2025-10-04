import { useEffect, useRef, useState } from "react";
import { Info, X, Download, Image, Trash2 } from "lucide-react";
import { Search } from "lucide-react"; // Added Search icon import
import { fetchWithAuth } from "../utils/fetchWithAuth";
import { QRCodeCanvas } from "qrcode.react"; // Import QRCodeCanvas from qrcode.react
import { useNotifications } from "../utils/useNotifications";
import ChatWidget from "./ChatWidget";
import CenteredLoader from "./CenteredLoader"; // unified loader
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

type Notification = {
  notificationID: number;
  title: string;
  label?: "Booking" | "Payment" | "Reschedule" | "Cancellation" | "Reminder" | "Promotion" | "System" | "Gallery";
  message: string;
  time: string;
  starred?: boolean;
  bookingID?: number; // Added to fix the error
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
const RECEIPT_URL = import.meta.env.VITE_URL;

const labelColors: Record<string, string> = {
  Booking: "bg-blue-100 text-blue-600",
  Payment: "bg-green-100 text-green-600",
  Reschedule: "bg-yellow-100 text-yellow-700",
  Cancellation: "bg-red-100 text-red-600",
  Reminder: "bg-purple-100 text-purple-600",
  Promotion: "bg-pink-100 text-pink-600",
  System: "bg-black text-white",
  Gallery: "bg-indigo-100 text-indigo-600",
};
const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number); // Split time into hours and minutes
    const date = new Date();
    date.setHours(hours, minutes);

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true, // Use 12-hour format
    });
  };

  const getBookingLabel = (bookingID: string, packageName: string) => {
    const acronym = packageName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
    return `${acronym}#${bookingID}`;
  };

  const formatDateTime = (dateTimeStr: string) => {
  const date = new Date(dateTimeStr); // Convert the string to a Date object

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true, // Use 12-hour format
  });
};
export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selected, setSelected] = useState<Notification | null>(null);
  const [bookingDetails, setBookingDetails] = useState<any | null>(null);
  const [query, setQuery] = useState(""); // search text
  const [loading, setLoading] = useState(true); // unified loading state
    
    const userID = localStorage.getItem("userID");
    const API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();

    // Use Pusher hook for real-time notifications
    const { notifications: pusherNotifications } = useNotifications(userID ? parseInt(userID) : null);

    const handleViewGallery = () => {
        navigate('/client/gallery');
    };

    useEffect(() => {
    const fetchNotifications = async () => {
            try {
        if (!userID) { setLoading(false); return; }

                const token = localStorage.getItem("token");
                const res = await fetchWithAuth(`${API_URL}/api/notifications/${userID}`, {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : "",
                        "Content-Type": "application/json",
                    },
                });

                if (!res.ok) throw new Error("Failed to fetch notifications");

                const data = await res.json();
                console.log("Fetched notifications:", data);
                setNotifications(data);
            } catch (err) {
                console.error("Error fetching notifications:", err);
      } finally {
        setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    // Merge existing notifications with new Pusher notifications
    useEffect(() => {
        if (pusherNotifications.length > 0) {
            console.log('Pusher notifications received:', pusherNotifications);
            setNotifications(prev => {
                const existingIds = prev.map(n => n.notificationID);
                const newNotifications = pusherNotifications.filter(n => !existingIds.includes(n.notificationID));
                console.log('Adding new notifications:', newNotifications);
                
                if (newNotifications.length > 0) {
                    // Show toast for new notifications
                    newNotifications.forEach(notification => {
                        toast.success(`New notification: ${notification.title}`, { autoClose: 3000 });
                    });
                    
                    return [...newNotifications, ...prev];
                }
                return prev;
            });
        }
    }, [pusherNotifications]);


  const markAsRead = async (id: number) => {
  try {
    const res = await fetch(`${API_URL}/api/notifications/${id}/mark-as-read`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
    });

    if (!res.ok) throw new Error("Failed to mark notification as read");

    // Update the local state to reflect the change
    setNotifications((prev) =>
      prev.map((n) =>
        n.notificationID === id ? { ...n, starred: true } : n
      )
    );

    // Decrement unread count (removed because setUnreadCount is not defined)
  } catch (err) {
    console.error("Error marking notification as read:", err);
  }
};

  // Confirmation dialog state
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const requestDelete = (id: number) => {
    setConfirmDeleteId(id);
  };

  const closeDeleteDialog = () => {
    if (deleting) return; // prevent closing mid-request
    setConfirmDeleteId(null);
  };

  const performDelete = async () => {
    if (confirmDeleteId == null) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/api/notifications/${confirmDeleteId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      if (!res.ok) throw new Error('Failed to delete notification');
      setNotifications(prev => prev.filter(n => n.notificationID !== confirmDeleteId));
      if (selected?.notificationID === confirmDeleteId) setSelected(null);
      toast.success('Notification deleted');
      setConfirmDeleteId(null);
    } catch (e) {
      console.error('Delete error', e);
      toast.error('Delete failed');
    } finally {
      setDeleting(false);
    }
  };
//Fetch Booking Details when notification with label "Booking" is selected
const fetchBookingDetails = async (bookingID: number) => {
  try {
    console.log(`Fetching booking details for bookingID: ${bookingID}`);
    const res = await fetch(`${API_URL}/api/booking-details?bookingID=${bookingID}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
    });

    console.log("API response:", res);
    console.log(`Response status: ${res.status}`);

    if (!res.ok) throw new Error("Failed to fetch booking details");

    const data = await res.json();
    console.log("Fetched booking details:", data);
    setBookingDetails(data);
  } catch (err) {
    console.error("Error fetching booking details:", err);
  }
};

useEffect(() => {
  if (selected?.label === "Booking" && selected.bookingID) {
    console.log("Selected notification matches criteria:", selected);
    fetchBookingDetails(selected.bookingID); // Use bookingID from the selected notification
  } else {
    console.log("Clearing booking details as criteria do not match.");
    setBookingDetails(null);
  }
}, [selected]);


//fetch reschedule label
  useEffect(() => {
  const fetchRescheduleDetails = async (bookingID: number) => {
  try {
    console.log(`Fetching reschedule details for bookingID: ${bookingID}`);
    const res = await fetch(`${API_URL}/api/reschedule-details?bookingID=${bookingID}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
    });

    console.log("API response:", res);
    console.log(`Response status: ${res.status}`);

    if (!res.ok) throw new Error("Failed to fetch reschedule details");

    const data = await res.json();
    console.log("Fetched reschedule details:", data);

    // Fetch the associated booking details
    const bookingRes = await fetch(`${API_URL}/api/booking-details?bookingID=${bookingID}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
    });

    if (!bookingRes.ok) throw new Error("Failed to fetch booking details");

    const bookingData = await bookingRes.json();
    console.log("Fetched booking details:", bookingData);

    // Combine reschedule and booking details
    setBookingDetails({ ...data, ...bookingData });
  } catch (err) {
    console.error("Error fetching reschedule details:", err);
  }
};

   if (selected?.label === "Reschedule" && selected.bookingID) {
    console.log("Selected notification matches reschedule criteria:", selected);
    fetchRescheduleDetails(selected.bookingID); // Use bookingID from the selected notification
  } else if (selected?.label === "Booking" && selected.bookingID) {
    console.log("Selected notification matches booking criteria:", selected);
    fetchBookingDetails(selected.bookingID); // Use bookingID from the selected notification
  } else {
    console.log("Clearing booking details as criteria do not match.");
    setBookingDetails(null);
  }
}, [selected]);








  // Nested component for booking details
const BookingDetails = ({ details }: { details: any }) => {
  const qrCodeRef = useRef<HTMLCanvasElement>(null);

  const downloadQRCode = () => {
    const canvas = qrCodeRef.current;
    if (!canvas) return;

    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `booking-${details.id}-qrcode.png`;
    link.click();
  };

  if (!details) return null;

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg shadow">
      <h4 className="text-xl font-semibold mb-2">
        {details.packageName ? getBookingLabel(details.id, details.packageName) : `Reschedule Request #${details.requestID} - Reschedule Approved`}
      </h4>
      {details.packageName && (
        <>
          <h4 className="text-lg font-semibold mb-2">{details.packageName}</h4>
          <p className="text-sm">
            <strong>Booking Date:</strong> {formatDate(details.bookingDate)}
          </p>
          <p className="text-sm">
            <strong>Booking Time:</strong> {formatTime(details.bookingStartTime)} - {formatTime(details.bookingEndTime)}
          </p>
        </>
      )}
      {!details.packageName && (
        <>
          <p className="text-sm">
            <strong>Requested Date:</strong> {formatDate(details.requestedDate)}
          </p>
          <p className="text-sm">
            <strong>Requested Time:</strong> {formatTime(details.requestedStartTime)} - {formatTime(details.requestedEndTime)}
          </p>
          <p className="text-sm">
            <strong>Reason:</strong> {details.reason}
          </p>
        </>
      )}
      <hr className="border-gray-300 my-4" />
      <div className="flex justify-center items-center mb-4">
        <QRCodeCanvas
          value={`${RECEIPT_URL}/receipt/booking/${details.id || details.bookingID}`}
          size={206}
          ref={qrCodeRef as any}
        />
      </div>
      <div className="flex justify-center">
        <button
          onClick={downloadQRCode}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition mb-4"
        >
          <Download className="w-5 h-5" />
          Download QR Code
        </button>
      </div>
      <p className="text-sm text-gray-500">
        **You can present your QR code at the studio. This will serve as your official proof of booking or reschedule request.
      </p>
    </div>
  );
};

  
  // Early return while loading
  if (loading) {
    return (
      <div className="flex h-[calc(100vh-10vh)]">
        <div className="flex-1 p-4 animate-fadeIn">
          <h1 className="text-2xl font-semibold mb-4">Inbox</h1>
          <div className="bg-white rounded-2xl shadow-md h-full">
            <CenteredLoader message="Loading notifications..." minHeightClass="min-h-[60vh]" />
          </div>
        </div>
        <ChatWidget />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-10vh)]">
      {/* Notifications List */}
      <div className="flex-1 p-4 animate-fadeIn">
        <h1 className="text-2xl font-semibold mb-4">Inbox</h1>
        <div className="bg-white rounded-2xl shadow-md overflow-x-auto h-full">
          {/* Top Controls (Search + Actions) */}
          <div className="flex items-center justify-between px-7 py-4 bg-gray-100">
            <div className="relative w-1/3">
              <input
                type="text"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-lg border pl-2 pr-8 py-1 text-sm focus:outline-none focus:border-black focus:ring-1"
                aria-label="Search notifications by title"
              />
              <Search className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Notifications Table */}
          <table className="min-w-full table-auto text-left text-sm">
        <tbody>
      {(notifications
        .filter(n => {
          if (!query.trim()) return true;
          try {
            return n.title.toLowerCase().includes(query.trim().toLowerCase());
          } catch { return true; }
        })
      ).map((n) => (
        <tr
          key={n.notificationID}
          className={`border-t border-gray-100 hover:bg-gray-50 transition-all cursor-pointer ${
            n.starred ? "bg-gray-50" : "bg-white font-semibold"
          }`} // Different styles for read (starred) and unread notifications
          onClick={() => {
            console.log("Notification ID:", n.notificationID);
            setSelected(n);
            markAsRead(n.notificationID); // Mark the notification as read when clicked
          }}
        >
         {/* Red Dot for Unread Notifications */}
      <td className="p-4">
        <div className="flex items-center gap-2">
          {!n.starred && (
            <span className="w-2 h-2 bg-red-500 rounded-full" title="Unread"></span>
          )}
          <span
            className={`text-sm ${
              n.starred ? "font-normal text-gray-700" : "font-bold text-black"
            }`}
          >
            {n.title}
          </span>
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
        <p
          className={`text-xs truncate max-w-md ${
            n.starred ? "text-gray-600" : "text-gray-800"
          }`}
        >
          {n.message}
        </p>
      </td>
              
          {/* Time */}
          <td className="p-4 text-xs text-gray-500 whitespace-nowrap">
            {formatDateTime(n.time)}
          </td>

          {/* Actions */}
          <td
            className="p-4 text-center flex gap-2 justify-center"
            onClick={(e) => e.stopPropagation()} // Prevent row click when pressing buttons
          >
            <button
              className="p-1.5 rounded-full hover:bg-gray-100"
              onClick={() => setSelected(n)}
              title="View details"
            >
              <Info className="w-4 h-4 text-gray-500" />
            </button>
            <button
              className="p-1.5 rounded-full hover:bg-red-50"
              onClick={() => requestDelete(n.notificationID)}
              title="Delete notification"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </td>
        </tr>
      ))}
      {notifications.length > 0 && notifications.filter(n => n.title.toLowerCase().includes(query.trim().toLowerCase())).length === 0 && (
        <tr>
          <td colSpan={3} className="p-6 text-center text-sm text-gray-500">
            No notifications match "{query}".
          </td>
        </tr>
      )}
</tbody>
          </table>
        </div>
      </div>

      {/* Details Sidebar */}
     {selected && (
  <div className="w-[40rem] border-l bg-white shadow-lg p-4 flex flex-col">
    <div className="flex justify-between items-center mb-4">
      <h2 className="font-semibold text-lg text-gray-600">SelfieGram Photostudios Malolos</h2>
      <button onClick={() => setSelected(null)}>
        <X className="w-5 h-5 text-gray-700" />
      </button>
    </div>

    <p className="text-sm text-gray-500">{formatDateTime(selected.time)}</p>
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
    {/* Preserve line breaks and basic spacing inside the notification message */}
    <div className="mt-4 text-gray-700 text-sm leading-relaxed whitespace-pre-line">
      {selected.message}
    </div>

    {/* Gallery Button for Gallery notifications */}
    {selected.label === "Gallery" && (
      <div className="mt-4">
        <button
          onClick={handleViewGallery}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
        >
          <Image className="w-5 h-5" />
          View Gallery
        </button>
      </div>
    )}

    {/* Nested Booking Details Component */}
    {["Booking", "Reschedule"].includes(selected.label || "") && selected.bookingID && (
      <BookingDetails details={bookingDetails} />
    )}

    {/* Placeholder for Payment Label */}
    {selected.label === "Payment" && (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg shadow">
        <h4 className="text-xl font-semibold mb-2">PayMongo API</h4>
        <p className="text-sm text-gray-500">
          This is a placeholder for the PayMongo API integration. Payment details will be displayed here in the future.
        </p>
      </div>
    )}
  </div>
      )}
       <ChatWidget />

      {/* Delete Confirmation Dialog */}
      {confirmDeleteId !== null && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeDeleteDialog}
          />
          <div className="relative bg-white w-full max-w-sm rounded-lg shadow-lg p-6 z-[130]">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">Delete Notification</h4>
              <button
                onClick={closeDeleteDialog}
                className="p-1 rounded hover:bg-gray-100"
                aria-label="Close dialog"
                disabled={deleting}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to permanently delete this notification? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={closeDeleteDialog}
                className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={performDelete}
                className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 flex items-center gap-2"
                disabled={deleting}
              >
                {deleting && <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    
  );
  
}
