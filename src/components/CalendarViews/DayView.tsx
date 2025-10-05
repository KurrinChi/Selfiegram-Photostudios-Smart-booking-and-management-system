import React, { useEffect, useRef, useState } from "react";
import { format, parseISO } from "date-fns";
import type { TransactionModalProps } from "../ModalAppointmentInfoDialog";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

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
  onReady?: (refreshFn: () => void) => void;
}

const START_HOUR = 7;
const END_HOUR = 22;
const HOURS_IN_VIEW = END_HOUR - START_HOUR;

const API_URL = import.meta.env.VITE_API_URL;

const DayView: React.FC<DayViewProps> = ({ currentDate, onEventClick, onReady }) => {
  const nowRef = useRef<HTMLDivElement>(null);
  const now = new Date();
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const fetchAppointments = async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/api/appointments`);
      const json = await res.json();

      const filtered = json.filter((item: any) => {
        return item.bookingDate === format(currentDate, "yyyy-MM-dd");
      });

      const transformed = filtered.map((item: any) => ({
        id: item.id,
        title: `${item.package} – ${item.customerName}`,
        start: parseISO(`${item.bookingDate}T${item.bookingStartTime}`),
        end: parseISO(`${item.bookingDate}T${item.bookingEndTime}`),
        raw: item,
      }));

      setAppointments(transformed);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  useEffect(() => {
    fetchAppointments();
    if (onReady) {
      onReady(fetchAppointments);
    }
  }, [currentDate]);

  useEffect(() => {
    nowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [appointments]);

  const minutesSinceStart = (now.getHours() - START_HOUR) * 60 + now.getMinutes();
  const topPercent = (minutesSinceStart / (HOURS_IN_VIEW * 60)) * 100;

  return (
    <div className="relative h-[840px] flex border-l border-gray-300">
      {/* Time Labels */}
      <div className="w-16 pr-2 text-right text-xs text-gray-500">
        {Array.from({ length: HOURS_IN_VIEW + 1 }).map((_, i) => (
          <div key={i} className="h-[60px] relative">
            <span className="absolute -top-2 right-0">
              {format(new Date().setHours(START_HOUR + i, 0), "h a")}
            </span>
          </div>
        ))}
      </div>

      {/* Main Column */}
      <div className="flex-1 relative">
        {/* Hour Lines */}
        {Array.from({ length: HOURS_IN_VIEW + 1 }).map((_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 border-t border-gray-200"
            style={{ top: `${(i / HOURS_IN_VIEW) * 100}%` }}
          />
        ))}

       

        {/* Current Time Line */}
        {now.getHours() >= START_HOUR && now.getHours() <= END_HOUR && (
          <div
            ref={nowRef}
            className="absolute left-0 right-0 h-[3px] bg-red-600 z-10"
            style={{ top: `${topPercent}%` }}
          >
            <div className="absolute -left-2 top-[-4px] w-3 h-3 bg-red-600 rounded-full animate-pulse shadow" />
          </div>
        )}

        {/* Appointments */}
        {appointments.map((appt) => {
          const startMin =
            (appt.start.getHours() - START_HOUR) * 60 + appt.start.getMinutes();
          const endMin =
            (appt.end.getHours() - START_HOUR) * 60 + appt.end.getMinutes();

          if (startMin < 0 || endMin > HOURS_IN_VIEW * 60) return null;

          const top = (startMin / (HOURS_IN_VIEW * 60)) * 100;
          const height = ((endMin - startMin) / (HOURS_IN_VIEW * 60)) * 100;

          let bg = "bg-yellow-200";
          if (appt.end < now || appt.raw.status === "Done") bg = "bg-green-200";
          else if (appt.start <= now && appt.end >= now) bg = "bg-orange-200";

          const { raw } = appt;

          return (
            <div
              key={appt.id}
              className={`${bg} absolute left-4 right-4 p-2 rounded-md shadow text-sm cursor-pointer transition transform hover:scale-[1.02] hover:shadow-lg`}
              style={{ top: `${top}%`, height: `${height}%` }}
              onClick={() =>
                onEventClick({
                  id: appt.id.toString(),
                  customerName: raw.customerName,
                  email: raw.email,
                  address: raw.address,
                  contact: raw.contactNo,
                  package: raw.package,
                  duration: raw.duration,
                  date: raw.bookingDate,
                  time: raw.time,
                  subtotal: Number(raw.subtotal),
                  price: Number(raw.price),
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
