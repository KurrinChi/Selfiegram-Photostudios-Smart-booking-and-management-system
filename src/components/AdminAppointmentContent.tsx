import React, { useState } from "react";
import AdminAppointmentSidebar from "./AdminAppointmentSidebar";
import DayView from "./CalendarViews/DayView";
import WeekView from "./CalendarViews/WeekView";
import TransactionModal from "./ModalAppointmentInfoDialog";
import type { TransactionModalProps } from "./ModalAppointmentInfoDialog";

const AdminAppointmentContent: React.FC = () => {
  const [view, setView] = useState<"week" | "day">("week");
  const [currentDate, setCurrentDate] = useState(new Date());

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<TransactionModalProps["data"]>(null);

  const handleEventClick = (appt: TransactionModalProps["data"]) => {
    setSelectedAppointment(appt);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b bg-white">
        <h2 className="text-lg sm:text-xl font-semibold">Appointments</h2>

        {/* View Toggle */}
        <div className="flex bg-gray-200 rounded-full overflow-hidden text-xs sm:text-sm">
          {(["week", "day"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`relative px-4 sm:px-6 py-2 font-medium transition-colors duration-300 ${
                view === v ? "text-black" : "text-gray-500"
              }`}
            >
              {v[0].toUpperCase() + v.slice(1)}
              {view === v && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] sm:h-[3px] bg-black rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden flex-col sm:flex-row">
        {/* Calendar View */}
        <div className="flex-1 overflow-auto">
          {view === "week" ? (
            <WeekView
              currentDate={currentDate}
              onEventClick={handleEventClick}
            />
          ) : (
            <DayView
              currentDate={currentDate}
              onEventClick={handleEventClick}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="w-full sm:w-[320px] md:w-[360px] bg-white border-t sm:border-t-0 sm:border-l h-[300px] sm:h-auto overflow-y-auto">
          <AdminAppointmentSidebar
            currentDate={currentDate}
            onDateChange={setCurrentDate}
          />
        </div>
      </div>

      {/* Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={selectedAppointment}
      />
    </div>
  );
};

export default AdminAppointmentContent;
