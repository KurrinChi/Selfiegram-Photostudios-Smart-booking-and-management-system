import React, { useEffect, useRef } from "react";
import { format } from "date-fns";
import type { TransactionModalProps } from "../ModalAppointmentInfoDialog";

interface Appointment {
  id: number;
  title: string;
  start: Date;
  end: Date;
}

const sampleAppointments: Appointment[] = [
  {
    id: 1,
    title: "Haircut – John",
    start: new Date(new Date().setHours(9, 0)),
    end: new Date(new Date().setHours(10, 0)),
  },
  {
    id: 2,
    title: "Coloring – Jane",
    start: new Date(new Date().setHours(13, 30)),
    end: new Date(new Date().setHours(15, 0)),
  },
];

interface DayViewProps {
  currentDate: Date;
  onEventClick: (data: TransactionModalProps["data"]) => void;
}

const DayView: React.FC<DayViewProps> = ({ currentDate, onEventClick }) => {
  const nowRef = useRef<HTMLDivElement>(null);
  const now = new Date();

  useEffect(() => {
    nowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [currentDate]);

  const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes();
  const topPercent = (minutesSinceMidnight / (24 * 60)) * 100;

  return (
    <div className="relative h-[1440px] flex border-l border-gray-300">
      {/* Time Labels */}
      <div className="w-16 pr-2 text-right text-xs text-gray-500">
        {Array.from({ length: 25 }).map((_, i) => (
          <div key={i} className="h-[60px] relative">
            <span className="absolute -top-2 right-0">
              {format(new Date().setHours(i, 0), "h a")}
            </span>
          </div>
        ))}
      </div>

      {/* Main Column */}
      <div className="flex-1 relative">
        {/* Hour Lines */}
        {Array.from({ length: 25 }).map((_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 border-t border-gray-200"
            style={{ top: `${(i / 24) * 100}%` }}
          />
        ))}

        {/* Current Time Line */}
        <div
          ref={nowRef}
          className="absolute left-0 right-0 h-[3px] bg-red-600 z-10"
          style={{ top: `${topPercent}%` }}
        >
          <div className="absolute -left-2 top-[-4px] w-3 h-3 bg-red-600 rounded-full animate-pulse shadow" />
        </div>

        {/* Appointments */}
        {sampleAppointments.map((appt) => {
          const startMin = appt.start.getHours() * 60 + appt.start.getMinutes();
          const endMin = appt.end.getHours() * 60 + appt.end.getMinutes();
          const top = (startMin / (24 * 60)) * 100;
          const height = ((endMin - startMin) / (24 * 60)) * 100;

          let bg = "bg-yellow-200";
          if (appt.end < now) bg = "bg-green-200";
          else if (appt.start <= now && appt.end >= now) bg = "bg-orange-200";

          return (
            <div
              key={appt.id}
              className={`${bg} absolute left-4 right-4 p-2 rounded-md shadow text-sm cursor-pointer`}
              style={{ top: `${top}%`, height: `${height}%` }}
              onClick={() =>
                onEventClick({
                  id: appt.id.toString(),
                  customerName: appt.title.includes("John")
                    ? "John Doe"
                    : "Jane Smith",
                  email: appt.title.includes("John")
                    ? "john@example.com"
                    : "jane@example.com",
                  address: "123 Main Street",
                  contact: "09171234567",
                  package: appt.title,
                  date: format(appt.start, "yyyy-MM-dd"),
                  time: format(appt.start, "h:mm a"),
                  subtotal: 1200,
                  paidAmount: 500,
                  feedback: "Excited to get this done!",
                  rating: appt.id % 5 || 4,
                })
              }
            >
              {appt.title}
              <br />
              <span className="text-xs text-gray-600">
                {format(appt.start, "h:mm a")} – {format(appt.end, "h:mm a")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DayView;
