import { useEffect, useState } from "react";
import { Menu, Plus, X, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ModalTransactionDialog from "../components/ModalTransactionDialog";
import mockAppointments from "../data/mockAppointment.json";

interface Appointment {
  id: string;
  date: string;
  time: string;
  package: string;
  price: number;
  status: string;
  image: string | null;
  location: string;
  name: string;
  tagColor: string;
}

const ClientAppointmentsPageContent = () => {
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showSidebar, setShowSidebar] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setAppointments(mockAppointments);
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
              const matched = appointments.find((a) => a.date === dateKey);

              const isToday = isSameMonth && day === today.getDate();
              const isInCurrentWeek = currentWeekIndexRange.includes(i);

              return (
                <div
                  key={i}
                  className={`relative h-full flex items-center justify-center
                    ${matched ? "cursor-pointer hover:bg-gray-100" : ""}
                    ${isInCurrentWeek ? "bg-gray-100" : ""}
                    ${
                      isToday
                        ? "border border-gray-900 rounded-full font-bold text-gray-900"
                        : ""
                    }
                    ${matched ? "rounded" : ""}
                  `}
                  onClick={() => matched && setSelectedAppointment(matched)}
                >
                  {day && (
                    <>
                      <span>{day}</span>
                      {matched && (
                        <span
                          className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 text-[10px] text-white px-1 rounded ${matched.tagColor}`}
                        >
                          {matched.id}
                        </span>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Appointment Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {appointments.map((a, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow p-4 flex flex-col items-start hover:shadow-md transition"
            >
              <img
                src={a.image || "/slfg-placeholder.png"}
                alt={a.package}
                className="w-full h-40 object-cover rounded-xl mb-4"
              />
              <div className="text-sm font-semibold">{a.id}</div>
              <div className="text-sm">
                {a.date} at {a.time}
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

          <div className="font-semibold mb-2">Scheduled Photoshoots</div>
          <div className="space-y-4 overflow-y-auto">
            {filteredAppointments.map((a, i) => (
              <div
                key={i}
                className="flex items-start gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded-lg"
                onClick={() => {
                  setSelectedAppointment(a);
                  setShowSidebar(false);
                }}
              >
                <img
                  src={a.image || "/slfg-placeholder.png"}
                  alt="user"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="text-xs text-gray-700">
                  <div className="font-medium">{a.id}</div>
                  <div className="text-[11px]">
                    {a.date} at {a.time}
                  </div>
                  <div className="text-[11px] leading-tight">{a.location}</div>
                  <div className="text-[11px] italic mt-1">Name: {a.name}</div>
                </div>
              </div>
            ))}
          </div>
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
            email: "client@email.com",
            address: selectedAppointment.location,
            contact: "0917-123-4567",
            package: selectedAppointment.package,
            date: selectedAppointment.date,
            time: selectedAppointment.time,
            subtotal: selectedAppointment.price,
            paidAmount:
              selectedAppointment.status === "FULLY PAID"
                ? selectedAppointment.price
                : 0,
            feedback: "N/A",
            rating: 4,
          }}
        />
      )}
    </div>
  );
};

export default ClientAppointmentsPageContent;
