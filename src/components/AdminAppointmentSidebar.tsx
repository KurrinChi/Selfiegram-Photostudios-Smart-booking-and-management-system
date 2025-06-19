import React, { useState } from 'react';
import {
  format,
  startOfWeek,
  endOfWeek,
  isSameDay,
  isWithinInterval,
  isToday
} from 'date-fns';
import {
  Bell,
  Info,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

type NotificationType = 'info' | 'alert' | 'reminder' | 'success';

type Notification = {
  id: number;
  type: NotificationType;
  icon: React.ElementType;
  message: string;
};

const notifications: Notification[] = [
  { id: 1, type: 'info', icon: Info, message: 'New package added to system.' },
  { id: 2, type: 'alert', icon: AlertCircle, message: 'Payment gateway delay alert.' },
  { id: 3, type: 'reminder', icon: Bell, message: 'Reminder: Upcoming booking today.' },
  { id: 4, type: 'success', icon: CheckCircle, message: 'Appointment successfully completed.' },
];

const notificationStyles: Record<NotificationType, string> = {
  info: 'bg-blue-100 text-blue-700',
  alert: 'bg-red-100 text-red-700',
  reminder: 'bg-yellow-100 text-yellow-700',
  success: 'bg-green-100 text-green-700',
};

const AdminAppointmentSidebar: React.FC<{
  currentDate: Date;
  onDateChange: (date: Date) => void;
}> = ({ currentDate, onDateChange }) => {
  const [minimized, setMinimized] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const getWeekOfMonth = (date: Date) => {
    const first = new Date(date.getFullYear(), date.getMonth(), 1);
    return Math.ceil((date.getDate() + first.getDay()) / 7);
  };

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });

  return (
    <div className={`h-full flex flex-col bg-white border-r ${collapsed ? 'w-12' : 'w-full md:w-80'} transition-all duration-300 ease-in-out`}>
      {/* Mobile toggle button */}
      <button
        className="absolute top-2 left-2 z-30 md:hidden bg-gray-100 rounded-full p-1 shadow"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>

      {!collapsed && (
        <div className="flex flex-col h-full p-4 md:p-6">
          {/* Top summary */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold">
              Selected: {format(currentDate, 'eeee, MMM d')}
            </h2>
            <p className="text-sm text-gray-500">
              Week {getWeekOfMonth(currentDate)} of {format(currentDate, 'MMMM')}
            </p>

            {/* Date Picker */}
            <div className="mt-3">
              {/* Mobile: compact date input */}
              <div className="block md:hidden">
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  value={format(currentDate, 'yyyy-MM-dd')}
                  onChange={(e) => onDateChange(new Date(e.target.value))}
                />
              </div>

              {/* Desktop: calendar */}
              <div className="hidden md:block bg-white p-2 rounded-md" style={{ filter: 'grayscale(100%)' }}>
                <DayPicker
                  mode="single"
                  selected={currentDate}
                  onSelect={(date) => date && onDateChange(date)}
                  captionLayout="label"
                  modifiers={{
                    week: (d) => isWithinInterval(d, { start: weekStart, end: weekEnd }),
                    selected: (d) => isSameDay(d, currentDate),
                    today: (d) => isToday(d),
                  }}
                  modifiersClassNames={{
                    week: 'bg-gray-200',
                    selected: 'bg-gray-800 text-white',
                    today: 'font-bold text-black bg-gray-100 rounded-xl',
                  }}
                  classNames={{
                    caption: 'text-sm text-black',
                    dropdown: 'text-black z-30',
                    day: 'text-sm',
                    nav_button: 'text-black hover:bg-gray-100 p-1 rounded',
                    nav_icon: 'stroke-black fill-black w-4 h-4',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Notification Tray */}
          <div className="flex items-center justify-between mb-2 mt-4">
            <h3 className="text-md font-semibold">Notifications</h3>
            <button
              className="text-sm text-black hover:underline"
              onClick={() => setMinimized(!minimized)}
            >
              {minimized ? 'Expand' : 'Minimize'}
            </button>
          </div>

          {!minimized && (
            <div className="max-h-64 md:max-h-80 overflow-y-auto space-y-2 pr-1">
              {notifications.map((note) => (
                <div
                  key={note.id}
                  className={`flex items-start gap-2 p-3 rounded ${notificationStyles[note.type]}`}
                >
                  <note.icon className="w-5 h-5 mt-1" />
                  <p className="text-sm leading-snug">{note.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminAppointmentSidebar;
