import React, { useEffect, useState } from "react";
import {
  startOfWeek,
  addDays,
  format,
  isSameDay,
  isBefore,
  isAfter,
  parseISO,
} from "date-fns";
import type { TransactionModalProps } from "../ModalAppointmentInfoDialog";

interface Appointment {
  id: number;
  title: string;
  startTime: Date;
  endTime: Date;
  raw: any; // For storing original appointment fields (like customerName, etc.)
}

const getTimeLabel = (hour: number) =>
  `${hour % 12 || 12}${hour < 12 ? "am" : "pm"}`;

interface WeekViewProps {
  currentDate: Date;
  onEventClick: (data: TransactionModalProps["data"]) => void;
  onReady?: (refreshFn: () => void) => void;
}

const WeekView: React.FC<WeekViewProps> = ({ currentDate, onEventClick, onReady  }) => {
  const rowHeight = 64;
  const startHour = 9;
  const endHour = 20;
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: endHour - startHour + 1 }).map(
    (_, i) => i + startHour
  );

  const [appointments, setAppointments] = useState<Appointment[]>([]);

    const fetchAppointments = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/appointments");
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

  // Fetch on date change
  useEffect(() => {
    fetchAppointments();
  }, [currentDate]);

  // Expose fetchAppointments to parent
  useEffect(() => {
    if (onReady) {
      onReady(fetchAppointments);
    }
  }, [onReady]);
  

  return (
    <div className="w-full overflow-x-auto bg-white rounded-md shadow">
      <div className="min-w-[900px] grid grid-cols-[80px_repeat(7,1fr)]">
        {/* Time Column */}
        <div className="border-r bg-gray-50 text-s text-center">
          <div className="h-10 border-b bg-white sticky top-0 z-10" />
          {hours.map((h) => (
            <div
              key={h}
              className="flex items-start justify-end pr-2 text-gray-500 border-b text-xs"
              style={{ height: `${rowHeight}px`, minWidth: "80px" }}
            >
              {getTimeLabel(h)}
            </div>
          ))}
        </div>

        {/* Day Columns */}
        {days.map((day, dayIdx) => (
          <div key={dayIdx} className="border-r min-w-0 relative bg-white">
            <div className="text-center text-xs py-2 font-semibold bg-white border-b h-10 sticky top-0 z-10 text-gray-700">
              {format(day, "EEE, MMM d")}
            </div>
            <div className="relative">
              {hours.map((_, idx) => (
                <div
                  key={idx}
                  className="relative border-b border-dashed border-gray-300"
                  style={{ height: `${rowHeight}px` }}
                />
              ))}

              {appointments
                .filter((appt) => isSameDay(appt.startTime, day))
                .map((appt) => {
                  const apptStartHour = appt.startTime.getHours();
                  const apptStartMinutes = appt.startTime.getMinutes();
                  const apptEndHour = appt.endTime.getHours();
                  const duration =
                    (apptEndHour - apptStartHour) * 60 +
                    appt.endTime.getMinutes() - apptStartMinutes;
                  const top =
                    (apptStartHour - startHour) * rowHeight +
                    (apptStartMinutes / 60) * rowHeight;
                  const height = (duration / 60) * rowHeight;

                  if (apptStartHour < startHour || apptEndHour > endHour)
                    return null;

                  let bgColor = "bg-yellow-100 border-yellow-300";
                  const now = new Date();
                  if (isBefore(appt.endTime, now) || appt.raw.status == "Done")
                    bgColor = "bg-green-100 border-green-300";
                  else if (isAfter(appt.startTime, now))
                    bgColor = "bg-yellow-100 border-yellow-300";
                  else bgColor = "bg-orange-200 border-orange-300";

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
                          date: appt.raw.bookingDate,
                          time: appt.raw.time,
                          subtotal: Number(appt.raw.subtotal),
                          price: Number(appt.raw.price),
                          paidAmount: Number(appt.raw.payment),
                          feedback: appt.raw.feedback,
                          rating: appt.raw.rating || 0,
                        })
                      }
                      className={`absolute left-1 right-1 px-2 py-1 text-[11px] rounded-md border shadow-sm text-gray-700 cursor-pointer transition transform hover:scale-[1.02] hover:shadow-lg ${bgColor}`}
                      style={{ top: `${top}px`, height: `${height}px` }}
                    >
                      {appt.title}
                      <br />
                      <span className="text-gray-500 text-[10px]">
                        {format(appt.startTime, "h:mm a")} –{" "}
                        {format(appt.endTime, "h:mm a")}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeekView;
