import React, { useEffect, useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  format,
  parseISO,
} from "date-fns";
import type { TransactionModalProps } from "../ModalAppointmentInfoDialog";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

const MAX_EVENTS_PER_CELL = 4;

interface Appointment {
  id: number;
  title: string;
  startTime: Date;
  endTime: Date;
  raw: any;
}

interface MonthViewProps {
  currentDate: Date;
  onEventClick: (data: TransactionModalProps["data"]) => void;
  onReady?: (refreshFn: () => void) => void;
  onDayCellClick?: (date: Date) => void;
}

const API_URL = import.meta.env.VITE_API_URL;

const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  onEventClick,
  onReady,
  onDayCellClick,
}) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const fetchAppointments = async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/api/appointments`);
      const data = await res.json();
      const formatted = data.map((item: any) => ({
        id: item.id,
        title: item.package + " – " + item.customerName,
        startTime: parseISO(`${item.bookingDate}T${item.bookingStartTime}`),
        endTime: parseISO(`${item.bookingDate}T${item.bookingEndTime}`),
        raw: item,
      }));
      setAppointments(formatted);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [currentDate]);

  useEffect(() => {
    if (onReady) onReady(fetchAppointments);
  }, [onReady]);

  // Calendar grid logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days: Date[] = [];
  for (let d = calendarStart; d <= calendarEnd; d = addDays(d, 1)) {
    days.push(d);
  }

  // 6 rows of 7 days always
  const rows = [];
  for (let i = 0; i < days.length; i += 7) {
    rows.push(days.slice(i, i + 7));
  }

  // Group appointments by day
  const byDay: Record<string, Appointment[]> = {};
  appointments.forEach((appt) => {
    const key = format(appt.startTime, "yyyy-MM-dd");
    if (!byDay[key]) byDay[key] = [];
    byDay[key].push(appt);
  });

  return (
    <div className="w-full h-full bg-white rounded-md shadow flex flex-col">
      <div className="grid grid-cols-7 border-b sticky top-0 z-10 text-gray-600 text-xs bg-white">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((wd) => (
          <div
            key={wd}
            className="py-3 text-center font-medium border-x first:border-l-0 last:border-r-0"
          >
            {wd}
          </div>
        ))}
      </div>
      {/* Make calendar body a flex column container */}
      <div className="flex-1 flex flex-col">
        {rows.map((week, rIdx) => (
          <div
            key={rIdx}
            className="grid grid-cols-7 flex-1 border-b last:border-b-0"
          >
            {week.map((day, dIdx) => {
              const key = format(day, "yyyy-MM-dd");
              const appts = byDay[key] || [];
              const showCount = Math.min(appts.length, MAX_EVENTS_PER_CELL);
              const moreCount = appts.length - showCount;

              return (
                <div
                  key={dIdx}
                  className={`relative p-1 border-x first:border-l-0 last:border-r-0 min-h-[90px] flex flex-col ${
                    isSameMonth(day, currentDate)
                      ? ""
                      : "bg-gray-50 text-gray-400"
                  } transition-colors hover:bg-gray-100`}
                  style={{ fontSize: "13px" }}
                >
                  <div className="text-right font-semibold mb-1 select-none">
                    {format(day, "d")}
                  </div>
                  <div className="flex-1 flex flex-col gap-[1px] overflow-y-auto">
                    {appts.slice(0, MAX_EVENTS_PER_CELL).map((appt) => (
                      <button
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
                            feedback: appt.raw.feedback,
                            rating: appt.raw.rating || 0,
                            status: Number(appt.raw.status),
                            paymentStatus: Number(appt.raw.paymentStatus),
                            balance: Number(appt.raw.balance),
                            selectedAddOns: appt.raw.selectedAddOns || "",
                            selectedConcepts: appt.raw.selectedConcepts || "",
                          })
                        }
                        className={`truncate w-full text-left rounded-md px-2 py-[2px] my-[1px] text-xs border cursor-pointer hover:brightness-95
                          ${
                            appt.raw.status == "Done"
                              ? "bg-green-100 border-green-300 text-green-900"
                              : appt.startTime > new Date()
                              ? "bg-yellow-100 border-yellow-300 text-yellow-900"
                              : "bg-green-200 border-green-300 text-green-900"
                          }`}
                        style={{ fontSize: "12px" }}
                        title={appt.title}
                      >
                        {format(appt.startTime, "h:mmaaa").replace(/M$/, "") +
                          " | " +
                          appt.title}
                      </button>
                    ))}
                    {moreCount > 0 && (
                      <button
                        className="w-full border border-green-400 text-green-700 mt-1 py-[2px] rounded-md text-xs font-semibold bg-white hover:bg-green-50"
                        onClick={() => onDayCellClick?.(day)}
                      >
                        VIEW ALL ({moreCount} MORE)
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthView;
