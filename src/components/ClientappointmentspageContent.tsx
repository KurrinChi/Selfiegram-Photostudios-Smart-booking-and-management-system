import { useEffect, useState } from "react";
import { Menu, Plus, X, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ModalTransactionDialog from "../components/ModalTransactionDialog";
import { fetchWithAuth } from "../utils/fetchWithAuth";

interface Appointment {
  id: string;
  date: string;
  time: string;
  bookingStartTime: string;
  bookingEndTime: string;
  package: string;
  price: number;
  total: number;
  paidAmount: number;
  pendingBalance: number;
  status: string;
  image: string | null;
  contact: string;
  location: string;
  name: string;
  email: string;
  tagColor: string;
  paymentStatus: number; 
  rawStatus: number;
   selectedAddOns?: string[];      // or a more detailed type if needed
  selectedConcepts?: string[];
   feedback?: string;
  rating?: number;
    transactionDate?: string;
}

const API_URL = import.meta.env.VITE_API_URL;

const ClientAppointmentsPageContent = () => {
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showSidebar, setShowSidebar] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setProfilePicture(user.profilePicture || null);
      } catch (e) {
        console.error("Failed to parse user from localStorage:", e);
      }
    }
  }, []);

  useEffect(() => {
    const fetchAppointments = async () => {
    try {
     const userID = localStorage.getItem("userID");

      if (!userID) {
        console.warn("No userID in localStorage");
        return;
      }

      const response = await fetchWithAuth(`${API_URL}/api/appointments/${userID}`);

      const data = await response.json() as any[];

      const formatted = data.map((item: any) => ({
        id: String(item.id),
        date: item.bookingDate,
        time: item.bookingStartTime,
        package: item.packageName,
        price: parseFloat(item.subTotal),
        paidAmount: Number(item.receivedAmount) || 0,
        pendingBalance: Number(item.rem) || 0,
        total: Number(item.total),
        status: item.paymentStatus === 1 ? "FULLY PAID" : "PENDING",
        image: item.imagePath || null, // fetch from package images table if needed
        location: item.address,
        contact: item.contact,
        email: item.email,
        name: item.customerName,
        paymentStatus: item.paymentStatus,
        rawStatus: item.status,
        bookingStartTime: item.bookingStartTime,
        bookingEndTime: item.bookingEndTime,
       tagColor:
        item.status === 3
          ? "bg-red-500"
          : item.status === 4
          ? "bg-purple-700"
          : item.paymentStatus === 1
          ? "bg-green-500"
          : "bg-orange-500",
        selectedAddOns: item.selectedAddOns,
        selectedConcepts: item.selectedConcepts,
        feedback: item.feedback,
        rating: item.rating,
        transactionDate: item.transactionDate
      }));

        console.log("Formatted appointments:", formatted); // <-- verify here


      setAppointments(formatted);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    }
  };

  fetchAppointments();
  }, []);

  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const startDay = firstDayOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const totalCells = Math.ceil((startDay + daysInMonth) / 7) * 7;
    return Array.from({ length: totalCells }, (_, index) => {
      const day = index - startDay + 1;
      return day > 0 && day <= daysInMonth ? day : null;
    });
  };

  const formattedMonth = currentMonth.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const handlePrevMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  const days = getMonthDays(currentMonth);

  const today = new Date();
  const isSameMonth =
    today.getFullYear() === currentMonth.getFullYear() &&
    today.getMonth() === currentMonth.getMonth();
  const todayDate = isSameMonth ? today.getDate() : null;

  let currentWeekIndexRange: number[] = [];
  if (todayDate !== null) {
    const startDay = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    ).getDay();
    const indexInGrid = todayDate + startDay - 1;
    const weekStart = Math.floor(indexInGrid / 7) * 7;
    currentWeekIndexRange = Array.from({ length: 7 }, (_, i) => weekStart + i);
  }
  

    const formatTime = (time: string) => {
    const date = new Date(`1970-01-01T${time}`);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

  const getBookingLabel = (bookingID: number, packageName?: string) => {
  if (!packageName) return `#${bookingID}`; // fallback if packageName is missing
  const acronym = packageName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  return `${acronym}#${bookingID}`;
};


  const filteredAppointments = appointments.filter(
    (a) =>
      a.date.includes(searchQuery) ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.package.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden font-sf relative">
      {/* Toggle Button for Mobile */}
      <button
        onClick={() => setShowSidebar(true)}
        className="lg:hidden fixed top-20 right-4 z-[20] bg-black text-white p-2 rounded-md"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">My Appointments</h2>

        {/* Calendar */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <button className="text-lg" onClick={handlePrevMonth}>
              ←
            </button>
            <span className="font-semibold">{formattedMonth}</span>
            <button className="text-lg" onClick={handleNextMonth}>
              →
            </button>
          </div>
          <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-600 border-b pb-2">
            {"SMTWTFS".split("").map((d, i) => (
              <div key={i}>{d}</div>
            ))}
          </div>
          <div className="h-[calc(70vh)] grid grid-cols-7 gap-y-2 mt-2 text-center text-sm">
           {days.map((day, i) => {
  const dayStr = day !== null ? String(day).padStart(2, "0") : "";
  const dateKey = `${currentMonth.getFullYear()}-${String(
    currentMonth.getMonth() + 1
  ).padStart(2, "0")}-${dayStr}`;

  const matched = appointments.filter((a) => a.date === dateKey);

  const isToday = isSameMonth && day === today.getDate();
  const isInCurrentWeek = currentWeekIndexRange.includes(i);

  return (
    <div
      key={i}
      className={`relative h-full px-1 py-2 text-center
        ${isInCurrentWeek ? "bg-gray-100" : ""}
        ${isToday ? "border border-gray-900 font-bold text-gray-900 rounded-full" : ""}
      `}
    >
      {day && (
        <div className="flex flex-col items-center justify-start space-y-[3px]">
          <span className="text-sm">{day}</span>

          {matched.map((appointment, index) => (
            <span
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedAppointment(appointment);
              }}
              className={`text-[15px] text-white px-5 py-[1px] rounded-md cursor-pointer truncate max-w-full ${appointment.tagColor}`}
              title={getBookingLabel(Number(appointment.id), appointment.package)}
            >
              {getBookingLabel(Number(appointment.id), appointment.package)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
})}
          </div>
        </div>

        {/* Appointment Cards */}
{/* Appointment Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {appointments.map((a, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow p-4 flex flex-col items-start hover:shadow-md transition"
            >
              {a.image ? (
              <img
                src={`${API_URL}/storage/${a.image?.split('storage/')[1]}`}
                alt={a.package}
                className="w-full h-48 object-cover rounded-lg mb-3"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 rounded-lg mb-3 flex items-center justify-center text-gray-500">
                No Image
              </div>
            )}
              <div className="text-sm font-semibold">{getBookingLabel(Number(a.id), a.package)}</div>
              <div className="text-sm">
                {formatDate(a.date)} at {formatTime(a.time)}
              </div>
              <div className="text-sm mb-1">
                {a.package} | ₱{a.price.toFixed(2)}
              </div>
              <div
                className={`text-xs font-bold ${
                  a.status === "FULLY PAID"
                    ? "text-green-600"
                    : "text-yellow-600"
                }`}
              >
                {a.status}
              </div>
              <button
                onClick={() => setSelectedAppointment(a)}
                className="mt-3 px-4 py-1 rounded-full text-xs border hover:bg-gray-100"
              >
                DETAILS
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-white border-l shadow-md transform transition-transform duration-300 ease-in-out
      ${showSidebar ? "translate-x-0" : "translate-x-full"} 
      lg:static lg:translate-x-0 lg:w-[300px]`}
      >
        <div className="p-4 flex flex-col h-full">
          <button
            onClick={() => setShowSidebar(false)}
            className="lg:hidden self-end mb-4"
          >
            <X className="w-5 h-5" />
          </button>

          <button
            onClick={() => navigate("/client/packages")}
            className="bg-black text-white px-4 py-2 rounded-md shadow mb-4 hover:opacity-90"
          >
            <Plus className="w-4 h-4 inline mr-1" /> Add New Booking
          </button>

          <div className="relative mb-3">
            <input
              type="text"
              placeholder="Search by date, name, or package"
              className="w-full px-3 py-2 text-sm border rounded-md pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          </div>

          {/* Scheduled Photoshoots Section */}
<div className="font-semibold mb-2">Scheduled Photoshoots</div>
{appointments.some((a) => [2, 3, 4].includes(a.rawStatus)) ? (
  <div className="space-y-4 overflow-y-auto">
    {filteredAppointments.map((a, i) => {
      if ([2, 3, 4].includes(a.rawStatus)) {
        return (
          <div
            key={i}
            className="flex items-start gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded-lg"
            onClick={() => {
              setSelectedAppointment(a);
              setShowSidebar(false);
            }}
          >
            {profilePicture ? (
              <img
                src={profilePicture}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover border border-gray-300"
                onError={(e) => {
                  e.currentTarget.src = "/fallback.png";
                }}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-300" />
            )}
            <div className="text-xs text-gray-700">
              <div className="font-bold">{getBookingLabel(Number(a.id), a.package)}</div>
              <div className="text-[11px]">
                {formatDate(a.date)} at {formatTime(a.time)}
              </div>
              <div className="text-[11px] leading-tight">
                3rd Floor Kim Kar Building F Estrella St., Malolos, Philippines
              </div>
              <div className="text-[11px] italic mt-1">Name: {a.name}</div>
            </div>
          </div>
        );
      }
      return null;
    })}
  </div>
) : (
  <div className="text-center text-gray-500 mt-4">
  No scheduled photoshoot appointments yet.{" "}Begin your booking{" "}
  <button
    onClick={() => navigate("/client/packages")}
    className="text-gray-700 underline hover:text-blue-700 transition"
  >
     now!
  </button>
</div>
)}

        </div>
      </div>

      {/* Modal */}
      {selectedAppointment && (
      <ModalTransactionDialog
        isOpen={true}
        onClose={() => setSelectedAppointment(null)}
        data={{
          id: selectedAppointment.id,
          customerName: selectedAppointment.name,
          email: selectedAppointment.email,
          address: selectedAppointment.location,
          contact: selectedAppointment.contact,
          package: selectedAppointment.package,
          bookingDate: selectedAppointment.date,
          transactionDate: selectedAppointment.transactionDate || selectedAppointment.date,
          time: `${formatTime(selectedAppointment.bookingStartTime)} - ${formatTime(selectedAppointment.bookingEndTime)}`,
          subtotal: selectedAppointment.price,
          paidAmount: selectedAppointment.paidAmount,
          pendingBalance: selectedAppointment.pendingBalance,
           total: Number(selectedAppointment.total),
           feedback: selectedAppointment.feedback || "",  // make sure this exists
          rating: selectedAppointment.rating || 0,   
          status: selectedAppointment.rawStatus,
          paymentStatus: selectedAppointment.paymentStatus,
          selectedAddOns: selectedAppointment.selectedAddOns || [],
          selectedConcepts: selectedAppointment.selectedConcepts || [],
        }}
      />
    )}
    </div>
  );
};

export default ClientAppointmentsPageContent;
