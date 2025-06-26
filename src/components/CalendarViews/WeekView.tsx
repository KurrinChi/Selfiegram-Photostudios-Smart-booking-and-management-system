import React from "react";
import {
  startOfWeek,
  addDays,
  format,
  isSameDay,
  isBefore,
  isAfter,
} from "date-fns";

interface Appointment {
  id: number;
  title: string;
  startTime: Date;
  endTime: Date;
}

const sampleAppointments: Appointment[] = [
  {
    id: 1,
    title: "Haircut – John",
    startTime: new Date(new Date().setHours(9, 30)),
    endTime: new Date(new Date().setHours(10, 30)),
  },
  {
    id: 2,
    title: "Coloring – Jane",
    startTime: addDays(new Date(), 1),
    endTime: addDays(new Date(), 1),
  },
  {
    id: 3,
    title: "Treatment – Mark",
    startTime: new Date(new Date().setHours(11, 0)),
    endTime: new Date(new Date().setHours(12, 0)),
  },
];

const getTimeLabel = (hour: number) =>
  `${hour % 12 || 12}${hour < 12 ? "am" : "pm"}`;

const WeekView: React.FC<{ currentDate: Date }> = ({ currentDate }) => {
  const rowHeight = 64;
  const startHour = 9;
  const endHour = 20;

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: endHour - startHour + 1 }).map(
    (_, i) => i + startHour
  );

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
              {sampleAppointments
                .filter((appt) => isSameDay(appt.startTime, day))
                .map((appt) => {
                  const apptStartHour = appt.startTime.getHours();
                  const apptStartMinutes = appt.startTime.getMinutes();
                  const apptEndHour = appt.endTime.getHours();
                  const duration =
                    (apptEndHour - apptStartHour) * 60 +
                    appt.endTime.getMinutes() -
                    apptStartMinutes;
                  const top =
                    (apptStartHour - startHour) * rowHeight +
                    (apptStartMinutes / 60) * rowHeight;
                  const height = (duration / 60) * rowHeight;

                  if (apptStartHour < startHour || apptEndHour > endHour)
                    return null;

                  let bgColor = "bg-yellow-100 border-yellow-300";
                  const now = new Date();
                  if (isBefore(appt.endTime, now))
                    bgColor = "bg-green-100 border-green-300";
                  else if (isAfter(appt.startTime, now))
                    bgColor = "bg-yellow-100 border-yellow-300";
                  else bgColor = "bg-orange-200 border-orange-300";

                  return (
                    <div
                      key={appt.id}
                      className={`absolute left-1 right-1 px-2 py-1 text-[11px] rounded-md border shadow-sm text-gray-700 ${bgColor}`}
                      style={{ top: `${top}px`, height: `${height}px` }}
                    >
                      {appt.title}
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
