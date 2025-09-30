import React, { useState, useEffect, useCallback } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  isSameDay,
  isWithinInterval,
  isToday,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  XCircle,
  CalendarClock,
} from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import pusher from "../utils/pusher";

// Define types
type NotificationType = "reschedule" | "cancellation" | "decline";

type Notification = {
  id: number;
  type: NotificationType;
  icon: React.ElementType;
  message: string;
  requiresAction: boolean;
  clientName: string;
  requestDate: string;
  requestedDate: string;
  requestedStartTime: string;
  requestedEndTime: string;
  bookingID: string;
  bookingDate: string;
  bookingStartTime: string;
  bookingEndTime: string;
  packageName: string;
  reason?: string;
};

// API base URL (adjust if needed)
const API_URL = import.meta.env.VITE_API_URL;
type AdminAppointmentSidebarProps = {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  refreshAppointments?: () => void; // optional function from parent
};

const AdminAppointmentSidebar: React.FC<AdminAppointmentSidebarProps> = ({
  currentDate,
  onDateChange,
  refreshAppointments,
}) => {
  const [minimized, setMinimized] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Modal state
  const [viewMode, setViewMode] = useState<NotificationType | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<Notification | null>(
    null
  );

  // Fetch booking requests
  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/api/admin/booking-requests`, {
        headers: { Accept: "application/json" },
      });
      const data = await res.json();

      if (res.ok && Array.isArray(data.data)) {
        const mapped = data.data.map((req: any) => ({
          id: req.requestID,
          type: req.requestType === "reschedule" ? "reschedule" : "cancellation",
          icon: req.requestType === "reschedule" ? CalendarClock : XCircle,
          message:
            req.requestType === "reschedule"
              ? (
                <>Client <strong>{req.user.fname} {req.user.lname}</strong> requested to <strong>reschedule</strong> an appointment.</>
              ) : (
                <>Client <strong>{req.user.fname} {req.user.lname}</strong> requested <strong>cancellation</strong>.</>
              ),
          requiresAction: true,
          clientName: req.user ? `${req.user.fname} ${req.user.lname}` : "Unknown Client",
          requestDate: req.requestDate,
          requestedDate: req.requestedDate,
          requestedStartTime: req.requestedStartTime,
          requestedEndTime: req.requestedEndTime,
          reason: req.reason,
          bookingID: req.booking?.bookingID,
          bookingDate: req.booking?.bookingDate,
          bookingStartTime: req.booking?.bookingStartTime,
          packageName: req.booking?.packages.name,
          bookingEndTime: req.booking?.bookingEndTime,
        }));
        setNotifications(mapped);
      } else {
        console.error("Failed to fetch booking requests:", data.message);
      }
    } catch (error) {
      console.error("Error fetching booking requests:", error);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Real-time subscription for admins: refresh list when a new request arrives
  useEffect(() => {
    const userID = localStorage.getItem("userID");
    if (!userID) {
      console.warn("AdminAppointmentSidebar: Missing userID in localStorage; skipping Pusher subscription.");
      return;
    }

    const channelName = `private-user.${userID}`;
    // Reuse existing channel if present to avoid duplicate subscriptions
    const channel = (pusher as any).channel(channelName) || pusher.subscribe(channelName);

    // Deduplicate events in case of double-binds or rapid duplicates
    const seenKeys = new Set<string>();

    const handler = (data: any) => {
      const payload = data?.notification || {};
      const key = `${payload?.type || ""}|${payload?.requestID || ""}|${payload?.requestDate || ""}`;
      if (seenKeys.has(key)) {
        return;
      }
      seenKeys.add(key);
      // No toast requested; just refresh the list
      fetchRequests();
    };

    channel.bind("booking.request.submitted", handler);

    return () => {
      channel.unbind("booking.request.submitted", handler);
    };
  }, [fetchRequests]);

  const getWeekOfMonth = (date: Date) => {
    const first = new Date(date.getFullYear(), date.getMonth(), 1);
    return Math.ceil((date.getDate() + first.getDay()) / 7);
  };

  const getBookingLabel = (bookingID: string, packageName: string) => {
    const acronym = packageName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
    return `${acronym}#${bookingID}`;
  };

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });

const handleAction = (note: Notification, action: "approve" | "decline") => {
  setSelectedRequest(note);

  if (action === "approve") {
    setViewMode(note.type); // open reschedule or cancellation modal
  } else {
    setViewMode("decline"); // open decline modal
  }
};

  const handleRescheduleConfirm = async () => {
    if (!selectedRequest) return;

    try {
      const res = await fetchWithAuth(`${API_URL}/api/admin/booking-requests/${selectedRequest.id}/confirm-reschedule`, {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        console.log("Reschedule confirmed:", data.data);
        toast.success("Reschedule confirmed: ", data.data)

        // Remove the notification from the sidebar
        setNotifications((prev) => prev.filter((n) => n.id !== selectedRequest.id));
        setViewMode(null);
        setSelectedRequest(null);
        
        refreshAppointments?.();
      } else {
        console.error("Failed to confirm reschedule:", data.message);
        toast.error("Error: ", data.message)
      }
    } catch (error) {
      console.error("Error confirming reschedule:", error);
      alert("An error occurred while confirming the reschedule.");
    }
  };


  const handleCancellation = async () => {
    if (!selectedRequest) return;

    try {
      const res = await fetchWithAuth(`${API_URL}/api/admin/booking-requests/${selectedRequest.id}/confirm-cancellation`, {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        console.log("Cancellation approved:", data.data);
        toast.success("Cancellation approved:", data.data);
        // Remove the notification from the sidebar
        setNotifications((prev) => prev.filter((n) => n.id !== selectedRequest.id));
        setViewMode(null);
        setSelectedRequest(null);

        refreshAppointments?.();
      } else {
        console.error("Failed to approve cancellation:", data.message);
        toast.error(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error approving cancellation:", error);
      toast.error("An error occurred while approving the cancellation.");
    }
  };

  const handleDecline = async () => {
    if (!selectedRequest) return;

    try {
      const res = await fetchWithAuth(`${API_URL}/api/admin/booking-requests/${selectedRequest.id}/decline-request`, {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        console.log("Booking Request Declined", data.data);
        toast.success("Booking Request Declined");
        // Remove the notification from the sidebar
        setNotifications((prev) => prev.filter((n) => n.id !== selectedRequest.id));
        setViewMode(null);
        setSelectedRequest(null);

        refreshAppointments?.();
      } else {
        console.error("Failed to declince request:", data.message);
        toast.error(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error declining request:", error);
      toast.error("An error occurred while declining the request.");
    }
  };



  const goBack = () => {
    setViewMode(null);
    setSelectedRequest(null);
  };

  return (
    <div
      className={`h-full flex flex-col bg-white ${collapsed ? "w-12" : "w-full md:w-80"
        } transition-all duration-300 ease-in-out`}
    >
      {/* Mobile toggle button */}
      <button
        className="absolute top-2 left-2 z-30 md:hidden bg-gray-100 rounded-full p-1 shadow"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <ChevronLeft className="w-5 h-5" />
        )}
      </button>

      {!collapsed && (
        <div className="flex flex-col h-full p-4 md:p-6">
          {/* Top summary */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold">
              Selected: {format(currentDate, "eeee, MMM d")}
            </h2>
            <p className="text-sm text-gray-500">
              Week {getWeekOfMonth(currentDate)} of{" "}
              {format(currentDate, "MMMM")}
            </p>

            {/* Date Picker */}
            <div className="mt-3">
              {/* Mobile: compact date input */}
              <div className="block md:hidden">
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  value={format(currentDate, "yyyy-MM-dd")}
                  onChange={(e) => onDateChange(new Date(e.target.value))}
                />
              </div>

              {/* Desktop: calendar */}
              <div
                className="hidden md:block bg-white p-2 rounded-md"
                style={{ filter: "grayscale(100%)" }}
              >
                <DayPicker
                  mode="single"
                  selected={currentDate}
                  onSelect={(date) => date && onDateChange(date)}
                  captionLayout="label"
                  modifiers={{
                    week: (d) =>
                      isWithinInterval(d, { start: weekStart, end: weekEnd }),
                    selected: (d) => isSameDay(d, currentDate),
                    today: (d) => isToday(d),
                  }}
                  modifiersClassNames={{
                    week: "bg-gray-200",
                    selected: "bg-gray-800 text-white",
                    today: "font-bold text-black bg-gray-100 rounded-xl",
                  }}
                  classNames={{
                    caption: "text-sm text-black",
                    dropdown: "text-black z-30",
                    day: "text-sm",
                    nav_button: "text-black hover:bg-gray-100 p-1 rounded",
                    nav_icon: "stroke-black fill-black w-4 h-4",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Notification Tray */}
          <div className="flex items-center justify-between mb-2 mt-4">
            <h3 className="text-md font-semibold">Notifications</h3>
            <button
              className="text-sm text-black hover:underline"
              onClick={() => setMinimized(!minimized)}
            >
              {minimized ? "Expand" : "Minimize"}
            </button>
          </div>

          {!minimized && (
            <div className="max-h-64 md:max-h-80 overflow-y-auto space-y-2 pr-1">
              {notifications.map((note) => (
                <div
                  key={note.id}
                  className={`flex flex-col gap-2 p-3 rounded border shadow-sm ${note.type === "reschedule"
                    ? "bg-blue-50 border-l-4 border-blue-500"
                    : "bg-red-50 border-l-4 border-red-500"
                    }`}
                >
                  <div className="flex items-start gap-2">
                    <note.icon
                      className={`w-5 h-5 mt-1 ${note.type === "reschedule"
                        ? "text-blue-600"
                        : "text-red-600"
                        }`}
                    />
                    <p className="text-sm leading-snug flex-1">{note.message}</p>
                  </div>

                  <div className="flex gap-2 ml-7">
                    <button
                      onClick={() => handleAction(note, "approve")}
                      className="px-2 py-1 text-xs rounded bg-black text-white hover:bg-black-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(note, "decline")}
                      className="px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Overlay */}
      {viewMode && selectedRequest && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-lg">

            {/* RESCHEDULE VIEW */}
            {viewMode === "reschedule" && (
              <div className="space-y-6">
                <h2 className="text-center text-xl font-semibold text-gray-800">
                  Reschedule Request
                </h2>
                <p className="text-center text-sm text-gray-500">
                  This appointment has been requested to be rescheduled.
                  <br /> Please review the proposed date and time below.
                </p>

                {/* Client Info */}
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200 shadow-sm">
                  <p className="text-sm">
                    <strong>Client:</strong> {selectedRequest.clientName}
                  </p>

                  <p className="text-sm">
                    <strong>Request Date:</strong>{" "}
                    {new Date(selectedRequest.requestDate).toLocaleDateString()}{" "}
                    {new Date(selectedRequest.requestDate).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>

                  <p className="text-sm mt-3 font-medium">
                    <strong>Booking Details</strong>
                  </p>
                  <p className="text-sm font-medium">
                    {getBookingLabel(selectedRequest.bookingID, selectedRequest.packageName)}{" "}-{" "}{selectedRequest.packageName}
                  </p>
                  <p className="text-sm font-medium">
                    {new Date(selectedRequest.bookingDate).toLocaleDateString()}{" "}|{" "}
                    {new Date(`${selectedRequest.bookingDate}T${selectedRequest.bookingStartTime}`).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}-{" "}
                    {new Date(`${selectedRequest.bookingDate}T${selectedRequest.bookingEndTime}`).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>

                  {/* Reason */}
                  <div className="mt-3">
                    <p className="text-sm font-medium mb-1"><strong>Reason for Reschedule:</strong></p>
                    <div className="p-3 bg-white border border-gray-200 rounded-md text-sm text-gray-700">
                      {selectedRequest.reason || "No reason provided"}
                    </div>
                  </div>
                </div>

                {/* Requested Date & Time */}
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 bg-gray-50 p-4 rounded-md border border-gray-200">
                    <h2 className="mb-1"><strong>Requested Date</strong></h2>
                    <p className="text-gray-900 text-sm">
                      {new Date(selectedRequest.requestedDate).toLocaleDateString([], {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex-1 bg-gray-50 p-4 rounded-md border border-gray-200">
                    <h2 className="mb-1"><strong>Requested Time</strong></h2>
                    <p className="text-gray-900 text-sm">
                      {new Date(`${selectedRequest.requestedDate}T${selectedRequest.requestedStartTime}`).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}-{" "}
                      {new Date(`${selectedRequest.requestedDate}T${selectedRequest.requestedEndTime}`).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    onClick={goBack}
                    className="flex-1 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRescheduleConfirm}
                    className="flex-1 py-2 bg-black text-white text-sm rounded-md hover:opacity-90 transition"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}

            {/* CANCELLATION VIEW */}
            {viewMode === "cancellation" && (
              <div className="space-y-6">
                <h2 className="text-center text-xl font-semibold text-gray-800">
                  Cancellation Request
                </h2>

                {/* Client Info */}
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200 shadow-sm">
                  <p className="text-sm">
                    <strong>Client:</strong> {selectedRequest.clientName}
                  </p>

                  <p className="text-sm">
                    <strong>Request Date:</strong>{" "}
                    {new Date(selectedRequest.requestDate).toLocaleDateString()}{" "}
                    {new Date(selectedRequest.requestDate).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>

                  <p className="text-sm mt-3 font-medium">
                    <strong>Booking Details</strong>
                  </p>
                  <p className="text-sm font-medium">
                    {getBookingLabel(selectedRequest.bookingID, selectedRequest.packageName)}{" "}-{" "}{selectedRequest.packageName}
                  </p>
                  <p className="text-sm font-medium">
                    {new Date(selectedRequest.bookingDate).toLocaleDateString()}{" "}|{" "}
                    {new Date(`${selectedRequest.bookingDate}T${selectedRequest.bookingStartTime}`).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}-{" "}
                    {new Date(`${selectedRequest.bookingDate}T${selectedRequest.bookingEndTime}`).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>

                  {/* Reason */}
                  <div className="mt-3">
                    <p className="text-sm font-medium mb-1"><strong>Reason for Cancellation:</strong></p>
                    <div className="p-3 bg-white border border-gray-200 rounded-md text-sm text-gray-700">
                      {selectedRequest.reason || "No reason provided"}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    onClick={goBack}
                    className="flex-1 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleCancellation}
                    className="flex-1 py-2 bg-black text-white text-sm rounded-md hover:opacity-90 transition"
                  >
                    Approve Cancellation
                  </button>
                </div>
              </div>
            )}

            {/* DECLINE VIEW */}
            {viewMode === "decline" && (
              <div className="space-y-6">
                <h2 className="text-center text-xl font-semibold text-gray-800">
                  Decline Booking Request
                </h2>
                <p className="text-center text-sm text-gray-500">
                  You are about to decline this booking request. Please review the details below.
                </p>

                {/* Client Info */}
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200 shadow-sm">
                  <p className="text-sm">
                    <strong>Client:</strong> {selectedRequest.clientName}
                  </p>
                  <p className="text-sm">
                    <strong>Request Date:</strong>{" "}
                    {new Date(selectedRequest.requestDate).toLocaleDateString()}{" "}
                    {new Date(selectedRequest.requestDate).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>

                  <p className="text-sm mt-3 font-medium">
                    <strong>Booking Details</strong>
                  </p>
                  <p className="text-sm font-medium">
                    {getBookingLabel(selectedRequest.bookingID, selectedRequest.packageName)} -{" "}
                    {selectedRequest.packageName}
                  </p>
                  <p className="text-sm font-medium">
                    {new Date(selectedRequest.bookingDate).toLocaleDateString()} |{" "}
                    {new Date(`${selectedRequest.bookingDate}T${selectedRequest.bookingStartTime}`).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })} -{" "}
                    {new Date(`${selectedRequest.bookingDate}T${selectedRequest.bookingEndTime}`).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>

                  {/* Reason */}
                  <div className="mt-3">
                    <p className="text-sm font-medium mb-1"><strong>Reason for Request:</strong></p>
                    <div className="p-3 bg-white border border-gray-200 rounded-md text-sm text-gray-700">
                      {selectedRequest.reason || "No reason provided"}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    onClick={goBack}
                    className="flex-1 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDecline}
                    className="flex-1 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition"
                  >
                    Confirm Decline
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminAppointmentSidebar;
