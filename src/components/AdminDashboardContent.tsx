// components/AdminDashboardContents.tsx
// -----------------------------------------------------------------------------
// Uses **Recharts** for charts and **react‑date-range** for the date picker.
// Install deps:
//   npm i recharts react-date-range date-fns
// -----------------------------------------------------------------------------
import React, { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  faUser,
  faCalendarAlt,
  faPesoSign,
  faClipboardList,
  faArrowUp,
  faArrowDown,
  faSearch,
  faStar as fasStar,
} from "@fortawesome/free-solid-svg-icons";
import { faStar as farStar } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DateRange } from "react-date-range";
import { startOfWeek, subWeeks, endOfWeek } from "date-fns";
import { subDays } from "date-fns";
import { format } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import axios from "axios";
import { useEffect } from "react";


// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
interface SummaryCard {
  label: string;
  value: string | number;
  icon: any;
  trend: { value: string; up: boolean };
}

interface PackageRow {
  name: string;
  totalBooking: number;
  revenue: string;
  bookingPct: string;
  rating: number;
  trend: string;
  trendPositive: boolean;
}

interface Trend {
  value: string; 
  up: boolean; 
}

interface SummaryData {
  totalUsers: number;
  totalBookings: number;
  totalSales: number;
  totalAppointments: number;
  salesTrend: Trend;
  userTrend: Trend; 
  scheduleTrend: Trend; 
  appointmentsTrend: Trend; 
}

interface WeeklyIncome {
  week: string;
  income: number;
}

interface PackageRow {
  name: string;
  totalBooking: number;
  revenue: string;
  bookingPct: string;
  rating: number;
  trend: string;
  trendPositive: boolean;
}

// -----------------------------------------------------------------------------
// Static Demo Data (replace w/ API)
// -----------------------------------------------------------------------------


const today = new Date();
const thisMonday = startOfWeek(today, { weekStartsOn: 1 });
const startOfLastWeek = startOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });
const endOfLastWeek = endOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });
const grossIncomeWeeklyData = Array.from({ length: 16 }, (_, i) => {
  const start = subWeeks(thisMonday, i);
  return {
    week: format(start, "MMM d yyyy"),
    income: 6000 + Math.floor(Math.random() * 8000),
  };
}).reverse();

// -----------------------------------------------------------------------------
// Helper Components
// -----------------------------------------------------------------------------
const TrendArrow: React.FC<{ up: boolean }> = ({ up }) => (
  <FontAwesomeIcon icon={up ? faArrowUp : faArrowDown} className={up ? "text-green-500" : "text-red-500"} />
);

// ⭐ Read‑only star rating (no click interaction)
const StarRating: React.FC<{ value: number }> = ({ value }) => (
  <div className="flex gap-1">
    {Array.from({ length: 5 }).map((_, idx) => (
      <FontAwesomeIcon
        key={idx}
        icon={idx < value ? fasStar : farStar}
        className="text-amber-400 text-xs"
      />
    ))}
  </div>
);

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------
const AdminDashboardContents: React.FC = () => {
  const [summaryData, setSummaryData] = useState<SummaryData>({
    totalUsers: 0,
    totalBookings: 0,
    totalSales: 0,
    totalAppointments: 0,
    salesTrend: {
      value: "0%",
      up: true,
    },
    userTrend: {
      value: "0%",
      up: true,
    },
    scheduleTrend: {
      value: "0%",
      up: true,
    },
    appointmentsTrend: {
      value: "0%",
      up: true,
    },
  });

  const API_URL = import.meta.env.VITE_API_URL;

  const [range, setRange] = useState([
  {
    startDate: subDays(new Date(), 7),
    endDate: new Date(),               
    key: "selection",
  },
]);

  const [grossIncomeWeeklyData, setGrossIncomeWeeklyData] =
  useState<WeeklyIncome[]>([]);
  const [packageRows, setPackageRows] = useState<PackageRow[]>([]); 
  const { startDate, endDate } = range[0];
  const start = format(startDate, "yyyy-MM-dd");
  const end   = format(endDate,   "yyyy-MM-dd");
  
useEffect(() => {
  const token = localStorage.getItem("token");

  // Summary cards
  axios
    .get<SummaryData>(`${API_URL}/api/admin/summary`, {
      params: { startDate: start, endDate: end },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((r) => setSummaryData(r.data))
    .catch((e) => console.error(e));

  // Weekly gross income graph
  axios
    .get<WeeklyIncome[]>(`${API_URL}/api/admin/gross-income-weekly`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => setGrossIncomeWeeklyData(res.data))
    .catch(console.error);
}, [range]);

useEffect(() => {
  const token = localStorage.getItem("token");

  // Package details
  axios
    .get<PackageRow[]>(`${API_URL}/api/admin/packages`, {
      params: { startDate: start, endDate: end },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((r) => {
      console.log(r.data);
      setPackageRows(r.data);
    })
    .catch(console.error);
}, [start, end]);


//Summary Cards for Total User, Total Schedule, Total Sales, and Total Appointments
const summaryCards: SummaryCard[] = [
  { 
    label: "Total User", 
    value: summaryData?.totalUsers ?? 0, 
    icon: faUser, 
    trend: { value: "2%", up: true }
  },
  { 
    label: "Total Schedule", 
    value: summaryData?.totalBookings ?? 0, 
    icon: faClipboardList, 
    trend: { value: "13%", up: true }
  },
  { 
    label: "Total Sales", 
    value: `₱ ${summaryData?.totalSales?.toLocaleString() ?? "0"}`, 
    icon: faPesoSign, 
    trend: { 
      value: summaryData?.salesTrend?.value ?? "0%", 
      up: summaryData?.salesTrend?.up ?? true
    }
  },
  { 
    label: "Total Appointments", 
    value: summaryData?.totalAppointments ?? 0, 
    icon: faCalendarAlt, 
    trend: { 
      value: "18%", 
      up: true
    }
  },
];


  const [search, setSearch] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  const filteredRows = useMemo(() =>
    search
      ? packageRows.filter(r =>
          r.name.toLowerCase().includes(search.toLowerCase())
        )
      : packageRows
  , [search, packageRows]);

  const tableCell = "py-3 px-4 text-xs whitespace-nowrap";

  const handleExport = () => {
    alert(`Exporting data from ${format(range[0].startDate, "PPP")} to ${format(range[0].endDate, "PPP")}`);
  };

  return (
    <div className="space-y-8 p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative">
        <h1 className="text-2xl font-semibold">Dashboard</h1>

        {/* Date Range Picker */}
        <div className="relative text-xs">
          <button
            onClick={() => setPickerOpen(prev => !prev)}
            className="border px-3 py-2 rounded-md bg-white shadow-sm hover:bg-gray-100 transition"
          >
            {format(range[0].startDate, "MMM dd yyyy")} — {format(range[0].endDate, "MMM dd yyyy")}
          </button>
          {pickerOpen && (
            <div className="absolute z-20 mt-2 bg-white shadow-lg rounded-md p-3">
              <DateRange
                ranges={range}
                onChange={item => {
                  const { startDate, endDate, key } = item.selection;
                  setRange([
                    {
                      startDate: startDate ?? new Date(),
                      endDate: endDate ?? new Date(),
                      key: key ?? "selection",
                    },
                  ]);
                }}
                moveRangeOnFirstSelection={false}
                rangeColors={["#000"]}
                maxDate={new Date()}
              />
            </div>
          )}
        </div>

        {/* Export Button */}
        <button
          onClick={handleExport}
          className="ml-auto px-4 py-2 bg-black text-white rounded-md text-xs transition hover:bg-gray-800 hover:scale-[1.02] focus:outline-none"
        >
          Export Data
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map(card => (
          <div key={card.label} className="flex items-center justify-between p-4 bg-white shadow rounded-lg">
            <div>
              <p className="text-xs text-gray-500 mb-1">{card.label}</p>
              <h2 className="text-lg font-semibold">{card.value}</h2>
              <p className="text-[10px] flex items-center gap-1 mt-1">
                <TrendArrow up={card.trend.up} />
                <span className={card.trend.up ? "text-green-500" : "text-red-500"}>{card.trend.value} {card.trend.up ? "Up" : "Down"} from past week</span>
              </p>
            </div>
            <FontAwesomeIcon icon={card.icon} className="text-2xl text-gray-400" />
          </div>
        ))}
      </div>

      {/* Gross Income Chart - Weekly */}
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-4">Weekly Gross Income (Past 4 Months)</h3>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={grossIncomeWeeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="week" className="text-[10px]" angle={-45} textAnchor="end" height={60} interval={1} />
              <YAxis tickFormatter={v => `${v / 1000}K`} className="text-xs" />
              <Tooltip formatter={(v: number) => `₱ ${v.toLocaleString()}`} />
              <Bar dataKey="income" fill="#1f2937" radius={[4, 4, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Package Table */}
      <div className="bg-white shadow rounded-lg p-4 overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Package Details</h3>
          <div className="relative text-gray-400 text-xs">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search packages..."
              className="border pl-8 pr-2 py-1 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
            />
            <FontAwesomeIcon icon={faSearch} className="absolute left-2 top-1.5 text-gray-400 text-xs" />
          </div>
        </div>

          <table className="min-w-full text-left text-xs">
            <thead>
              <tr className="text-gray-500">
                <th className={tableCell}>Package</th>
                <th className={tableCell}>Total Booking</th>
                <th className={tableCell}>Revenue</th>
                <th className={tableCell}>Booking %</th>
                <th className={tableCell}>Avg Client Rating</th>
                <th className={tableCell}>Trend</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-2">No packages found</td>
                </tr>
              ) : (
                filteredRows.map((row, i) => {
                  // Ensure revenue is parsed correctly by removing '₱' and commas
                  const parsedRevenue = row.revenue 
                    ? parseFloat(row.revenue.replace('₱', '').replace(',', '')) 
                    : 0;

                  // Ensure that the revenue is valid before formatting
                  const formattedRevenue = parsedRevenue 
                    ? '₱' + parsedRevenue.toLocaleString() 
                    : '₱0.00';

                  return (
                    <tr key={i} className="border-t">
                      <td className={tableCell}>{row.name}</td>
                      <td className={tableCell}>{row.totalBooking}</td>
                      <td className={tableCell}>{formattedRevenue}</td>
                      <td className={tableCell}>{row.bookingPct}</td>
                      <td className={tableCell}><StarRating value={row.rating} /></td>
                      <td className={tableCell}>
                        <span className={`inline-flex items-center gap-1 ${row.trendPositive ? "text-green-500" : "text-red-500"}`}>
                          <FontAwesomeIcon icon={row.trendPositive ? faArrowUp : faArrowDown} />
                          {row.trend}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
      </div>
    </div>
  );
};

export default AdminDashboardContents;
