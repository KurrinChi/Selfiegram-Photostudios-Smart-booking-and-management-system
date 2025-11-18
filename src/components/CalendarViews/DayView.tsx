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

const DayView: React.FC<DayViewProps> = ({
  currentDate,
  onEventClick,
  onReady,
}) => {
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

  const minutesSinceStart =
    (now.getHours() - START_HOUR) * 60 + now.getMinutes();
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

          const totalMinutes = HOURS_IN_VIEW * 60;
          const slotMinutes = 30;

          // Snap start to the nearest lower slot and end to the higher slot
          const snappedStartMin =
            Math.floor(startMin / slotMinutes) * slotMinutes;
          const snappedEndMin = Math.ceil(endMin / slotMinutes) * slotMinutes;
          const topPercent = (snappedStartMin / totalMinutes) * 100;
          const heightPercent =
            ((snappedEndMin - snappedStartMin) / totalMinutes) * 100;

          let bgColor = "bg-yellow-100 border-yellow-300";
          const currTime = new Date();
          if (appt.end < currTime || appt.raw.status === "Done") {
            bgColor = "bg-green-100 border-green-300";
          } else if (appt.start > currTime) {
            bgColor = "bg-yellow-100 border-yellow-300";
          } else {
            bgColor = "bg-orange-200 border-orange-300";
          }

          return (
            <div
              key={appt.id}
              onClick={() =>
                onEventClick({
                  id: appt.id.toString(),
                  customerName: appt.raw.customerName,
                  email: appt.raw.email,
                  address: appt.raw.address,
                  contact: appt.raw.contactNo,
                  package: appt.raw.package,
                  duration: appt.raw.duration,
                  date: appt.raw.bookingDate,
                  time: appt.raw.time,
                  subtotal: Number(appt.raw.subtotal),
                  price: Number(appt.raw.price),
                  paidAmount: Number(appt.raw.payment),
                  feedback: appt.raw.feedback || "N/A",
                  rating: Number(appt.raw.rating || 0),
                  status: Number(appt.raw.status),
                  paymentStatus: Number(appt.raw.paymentStatus),
                  balance: Number(appt.raw.balance),
                  selectedAddOns: appt.raw.selectedAddOns || "",
                  selectedConcepts: appt.raw.selectedConcepts || "",
                })
              }
              className={`${bgColor} absolute left-4 right-4 p-2 rounded-md border shadow-sm cursor-pointer transition transform hover:scale-[1.02] hover:shadow-lg overflow-hidden flex flex-row items-center`}
              style={{ top: `${topPercent}%`, height: `${heightPercent}%` }}
              title={`${appt.title} | ${format(
                appt.start,
                "h:mm a"
              )} – ${format(appt.end, "h:mm a")}`}
            >
              <span className="truncate font-semibold text-gray-800 leading-snug block flex-1 mr-2">
                {appt.title}
              </span>
              <span className="truncate text-xs text-gray-900 text-right block min-w-[90px] font-medium">
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
