import React from 'react';
import { format } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faCalendarAlt, 
  faPesoSign, 
  faClipboardList,
  faArrowUp,
  faArrowDown,
  faStar as fasStar
} from '@fortawesome/free-solid-svg-icons';
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons';

interface ReportData {
  reportGenerated: string;
  dateRange: {
    start: string;
    end: string;
    hasCustomRange: boolean;
    formattedRange: string;
  };
  summary: {
    totalUsers: number;
    totalBookings: number;
    totalSales: number;
    totalAppointments: number;
    hasDateRange: boolean;
    salesTrend: { value: string; up: boolean };
    userTrend: { value: string; up: boolean };
    scheduleTrend: { value: string; up: boolean };
    appointmentsTrend: { value: string; up: boolean };
  };
  weeklyIncome: Array<{
    week: string;
    income: number;
  }>;
  packages: Array<{
    name: string;
    totalBooking: number;
    revenue: string;
    bookingPct: string;
    rating: number;
    trend: string;
    trendPositive: boolean;
  }>;
  companyInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
}

interface DashboardReportProps {
  data: ReportData;
}

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

const TrendArrow: React.FC<{ up: boolean }> = ({ up }) => (
  <FontAwesomeIcon
    icon={up ? faArrowUp : faArrowDown}
    className={up ? "text-green-500" : "text-red-500"}
  />
);

const DashboardReport: React.FC<DashboardReportProps> = ({ data }) => {
  const summaryCards = [
    {
      label: "Total Users",
      value: data.summary.totalUsers,
      icon: faUser,
      trend: data.summary.userTrend,
    },
    {
      label: "Total Schedule",
      value: data.summary.totalBookings,
      icon: faClipboardList,
      trend: data.summary.scheduleTrend,
    },
    {
      label: "Total Sales",
      value: `₱ ${data.summary.totalSales?.toLocaleString() ?? "0"}`,
      icon: faPesoSign,
      trend: data.summary.salesTrend,
    },
    {
      label: "Total Appointments",
      value: data.summary.totalAppointments,
      icon: faCalendarAlt,
      trend: data.summary.appointmentsTrend,
    },
  ];

  return (
    <div className="dashboard-report max-w-4xl mx-auto p-8 bg-white">
      {/* Header */}
      <div className="text-center mb-8 border-b pb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {data.companyInfo.name}
        </h1>
        <p className="text-gray-600 mb-1">{data.companyInfo.address}</p>
        <p className="text-gray-600 mb-1">{data.companyInfo.phone} | {data.companyInfo.email}</p>
        <h2 className="text-xl font-semibold text-gray-700 mt-4">
          Dashboard Report
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          Report Period: {data.dateRange.formattedRange}
        </p>
        <p className="text-xs text-gray-400">
          Generated on: {format(new Date(data.reportGenerated), 'PPP p')}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Summary Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
            >
              <div>
                <p className="text-sm text-gray-600 mb-1">{card.label}</p>
                <h3 className="text-xl font-semibold text-gray-800">{card.value}</h3>
                {!data.summary.hasDateRange && (
                  <p className="text-xs flex items-center gap-1 mt-2 text-gray-500">
                    <TrendArrow up={card.trend.up} />
                    <span className={card.trend.up ? "text-green-600" : "text-red-600"}>
                      {card.trend.value} {card.trend.up ? "Up" : "Down"} from past week
                    </span>
                  </p>
                )}
              </div>
              <FontAwesomeIcon
                icon={card.icon}
                className="text-3xl text-gray-400"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Income Chart Data */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Weekly Gross Income (Last 4 Months)</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-200 px-4 py-2 text-left">Week</th>
                <th className="border border-gray-200 px-4 py-2 text-right">Income</th>
              </tr>
            </thead>
            <tbody>
              {data.weeklyIncome.slice(-8).map((week, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="border border-gray-200 px-4 py-2">{week.week}</td>
                  <td className="border border-gray-200 px-4 py-2 text-right">
                    ₱{week.income.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-100 font-semibold">
              <tr>
                <td className="border border-gray-200 px-4 py-2">Total</td>
                <td className="border border-gray-200 px-4 py-2 text-right">
                  ₱{data.weeklyIncome.slice(-8).reduce((sum, week) => sum + week.income, 0).toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Package Details */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Package Performance</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-200 px-4 py-2 text-left">Package Name</th>
                <th className="border border-gray-200 px-4 py-2 text-center">Total Bookings</th>
                <th className="border border-gray-200 px-4 py-2 text-right">Revenue</th>
                <th className="border border-gray-200 px-4 py-2 text-center">Booking %</th>
                <th className="border border-gray-200 px-4 py-2 text-center">Avg Rating</th>
                <th className="border border-gray-200 px-4 py-2 text-center">Trend</th>
              </tr>
            </thead>
            <tbody>
              {data.packages.map((pkg, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="border border-gray-200 px-4 py-2">{pkg.name}</td>
                  <td className="border border-gray-200 px-4 py-2 text-center">{pkg.totalBooking}</td>
                  <td className="border border-gray-200 px-4 py-2 text-right">{pkg.revenue}</td>
                  <td className="border border-gray-200 px-4 py-2 text-center">{pkg.bookingPct}</td>
                  <td className="border border-gray-200 px-4 py-2 text-center">
                    <div className="flex justify-center">
                      <StarRating value={pkg.rating || 0} />
                    </div>
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-center">
                    <span className={`inline-flex items-center gap-1 ${
                      pkg.trendPositive ? "text-green-600" : "text-red-600"
                    }`}>
                      <FontAwesomeIcon
                        icon={pkg.trendPositive ? faArrowUp : faArrowDown}
                        className="text-xs"
                      />
                      {pkg.trend}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          This report was automatically generated by {data.companyInfo.name} Dashboard System
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Report ID: RPT-{format(new Date(data.reportGenerated), 'yyyyMMdd-HHmmss')}
        </p>
      </div>
    </div>
  );
};

export default DashboardReport;