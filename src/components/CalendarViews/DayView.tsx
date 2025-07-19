import React, { useEffect, useRef, useState } from "react";
import { format, parseISO } from "date-fns";
import type { TransactionModalProps } from "../ModalAppointmentInfoDialog";

interface Appointment {
  id: number;
  title: string;
  start: Date;
  end: Date;
  raw: any;
}

interface DayViewProps {
  currentDate: Date;
  onEventClick: (data: TransactionModalProps["data"]) => void;
}

const DayView: React.FC<DayViewProps> = ({ currentDate, onEventClick }) => {
  const nowRef = useRef<HTMLDivElement>(null);
  const now = new Date();
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
  const fetchAppointments = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/appointments");
        const json = await res.json();

        const filtered = json.filter((item: any) => {
          return item.bookingDate === format(currentDate, "yyyy-MM-dd");
        });

        const transformed = filtered.map((item: any, index: number) => {
          return {
            id: item.transId || index,
            title: `${item.package} – ${item.customerName}`,
            start: parseISO(`${item.bookingDate}T${item.bookingStartTime}`),
            end: parseISO(`${item.bookingDate}T${item.bookingEndTime}`),
            raw: item,
          };
        });

        setAppointments(transformed);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    fetchAppointments();
  }, [currentDate]);


  useEffect(() => {
    nowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [appointments]);

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
        {appointments.map((appt) => {
          const startMin = appt.start.getHours() * 60 + appt.start.getMinutes();
          const endMin = appt.end.getHours() * 60 + appt.end.getMinutes();
          const top = (startMin / (24 * 60)) * 100;
          const height = ((endMin - startMin) / (24 * 60)) * 100;

          let bg = "bg-yellow-200";
          if (appt.end < now) bg = "bg-green-200";
          else if (appt.start <= now && appt.end >= now) bg = "bg-orange-200";

          const { raw } = appt;

          return (
            <div
              key={appt.id}
              className={`${bg} absolute left-4 right-4 p-2 rounded-md shadow text-sm cursor-pointer`}
              style={{ top: `${top}%`, height: `${height}%` }}
              onClick={() =>
                onEventClick({
                  id: raw.id.toString(),
                  customerName: raw.customerName,
                  email: raw.email,
                  address: raw.address,
                  contact: raw.contactNo,
                  package: raw.package,
                  date: raw.bookingDate,
                  time: raw.time,
                  subtotal: Number(raw.subtotal),
                  paidAmount: Number(raw.payment),
                  feedback: raw.feedback || "N/A",
                  rating: Number(raw.rating || 0),
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
