import React from 'react';
import { format } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faCalendarAlt, 
  faPesoSign, 
  faClipboardList
} from '@fortawesome/free-solid-svg-icons';

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
      value: `PHP ${data.summary.totalSales?.toLocaleString() ?? "0"}`,
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
    <div className="dashboard-report max-w-6xl mx-auto p-10 bg-white" style={{ fontFamily: '"Inter", system-ui, sans-serif' }}>
      {/* Header Section */}
      <div className="mb-10 pb-8 border-b-[3px] border-[#212121] relative">
        {/* Decorative accent line */}
        <div className="absolute top-0 left-0 w-24 h-1 bg-[#212121]"></div>
        
        <div className="flex items-start justify-between mt-4">
          <div className="flex items-start gap-5">
            <div className="relative">
              <img 
                src="/slfg.svg" 
                alt="Selfigram Logo" 
                className="h-20 w-20"
              />
              {/* Subtle shadow accent */}
              <div className="absolute -bottom-1 -right-1 w-20 h-20 bg-gray-100 -z-10 rounded-sm"></div>
            </div>
            <div className="pt-1">
              <h1 className="text-3xl font-extrabold text-[#212121] tracking-tight mb-2 leading-tight">
                SELFIGRAM PHOTOSTUDIOS
              </h1>
              <div className="text-[11px] text-gray-600 leading-relaxed space-y-0.5">
                <p className="font-medium">3rd Floor Kim Kar Building F Estrella St., Malolos, Philippines</p>
                <div className="flex items-center gap-3">
                  <span className="font-medium">0968 885 6035</span>
                  <span className="text-gray-400">•</span>
                  <span className="font-medium">selfiegrammalolos@gmail.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#212121] mb-3 tracking-tight">
              Dashboard Reportssssssssssssssssssssssssssssssss
            </h2>
            <div className="text-[11px] text-gray-600 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 font-semibold uppercase tracking-wider">Period:</span>
                <span className="font-bold text-[#212121]">{data.dateRange.formattedRange}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 font-semibold uppercase tracking-wider">Generated:</span>
                <span className="font-medium">{format(new Date(data.reportGenerated), 'MMMM dd, yyyy • h:mm a')}</span>
              </div>
            </div>
          </div>
          
          {/* Report ID Badge */}
          <div className="bg-[#212121] text-white px-4 py-2 text-[10px] font-bold tracking-wider">
            RPT-{format(new Date(data.reportGenerated), 'yyyyMMdd')}
          </div>
        </div>
      </div>

      {/* Summary Overview */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-6 bg-[#212121]"></div>
          <h3 className="text-[13px] font-extrabold text-[#212121] uppercase tracking-[2px]">
            Executive Summary
          </h3>
        </div>
        
        <div className="grid grid-cols-2 gap-5">
          {summaryCards.map((card, idx) => (
            <div
              key={card.label}
              className="group relative overflow-hidden"
            >
              {/* Card border frame effect */}
              <div className="absolute inset-0 border-2 border-gray-200 group-hover:border-gray-300 transition-colors"></div>
              <div className="absolute top-0 left-0 w-full h-0.5 bg-[#212121]"></div>
              
              <div className="relative p-5 bg-white">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-500 mb-2 uppercase tracking-[1.5px] font-bold">
                      {card.label}
                    </p>
                    <h3 className="text-3xl font-extrabold text-[#212121] tracking-tight leading-none">
                      {card.value}
                    </h3>
                  </div>
                  <div className="ml-4 mt-1">
                    <FontAwesomeIcon
                      icon={card.icon}
                      className="text-2xl text-gray-300"
                    />
                  </div>
                </div>
                
                {!data.summary.hasDateRange && (
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    <span className={`text-base font-bold ${card.trend.up ? 'text-[#212121]' : 'text-gray-400'}`}>
                      {card.trend.up ? "↑" : "↓"}
                    </span>
                    <span className="text-[11px] text-gray-600 font-semibold">
                      {card.trend.value}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">vs last week</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Income */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-6 bg-[#212121]"></div>
          <h3 className="text-[13px] font-extrabold text-[#212121] uppercase tracking-[2px]">
            Revenue Analysis
          </h3>
          <div className="flex-1 h-px bg-gray-200 ml-4"></div>
        </div>
        
        <div className="border-2 border-gray-200 overflow-hidden">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-[#212121] text-white">
                <th className="text-left py-3 px-5 font-bold uppercase tracking-[1px]">Week Period</th>
                <th className="text-right py-3 px-5 font-bold uppercase tracking-[1px]">Gross Income</th>
              </tr>
            </thead>
            <tbody>
              {data.weeklyIncome.slice(-8).map((week, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-5 text-gray-700 font-semibold">{week.week}</td>
                  <td className="py-3 px-5 text-right text-[#212121] font-bold">
                    PHP {week.income.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 border-t-2 border-[#212121]">
                <td className="py-4 px-5 font-extrabold text-[#212121] uppercase tracking-wide">Total Revenue</td>
                <td className="py-4 px-5 text-right font-extrabold text-[#212121] text-[13px]">
                  PHP {data.weeklyIncome.slice(-8).reduce((sum, week) => sum + week.income, 0).toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Package Performance */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-6 bg-[#212121]"></div>
          <h3 className="text-[13px] font-extrabold text-[#212121] uppercase tracking-[2px]">
            Package Performance
          </h3>
          <div className="flex-1 h-px bg-gray-200 ml-4"></div>
        </div>
        
        <div className="border-2 border-gray-200 overflow-hidden">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-[#212121] text-white">
                <th className="text-left py-3 px-4 font-bold uppercase tracking-[1px]">Package</th>
                <th className="text-center py-3 px-4 font-bold uppercase tracking-[1px]">Bookings</th>
                <th className="text-right py-3 px-4 font-bold uppercase tracking-[1px]">Revenue</th>
                <th className="text-center py-3 px-4 font-bold uppercase tracking-[1px]">Share</th>
                <th className="text-center py-3 px-4 font-bold uppercase tracking-[1px]">Rating</th>
                <th className="text-center py-3 px-4 font-bold uppercase tracking-[1px]">Trend</th>
              </tr>
            </thead>
            <tbody>
              {data.packages.map((pkg, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-[#212121] font-bold">{pkg.name}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-block bg-gray-100 px-3 py-1 rounded-sm font-bold text-[#212121]">
                      {pkg.totalBooking}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-[#212121]">{pkg.revenue}</td>
                  <td className="py-3 px-4 text-center font-semibold text-gray-700">{pkg.bookingPct}</td>
                  <td className="py-3 px-4 text-center font-semibold text-gray-700">
                    {pkg.rating ? `${pkg.rating.toFixed(1)}/5` : "N/A"}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 font-bold ${pkg.trendPositive ? 'text-[#212121]' : 'text-gray-400'}`}>
                      <span className="text-sm">{pkg.trendPositive ? "↑" : "↓"}</span>
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
      <div className="pt-8 border-t-2 border-gray-200">
        <div className="text-center space-y-2">
          <p className="text-[10px] text-gray-500 font-semibold tracking-wide">
            This report was automatically generated by Selfigram Photostudios Dashboard System
          </p>
          <div className="flex items-center justify-center gap-3 text-[10px] text-gray-400">
            <span>© 2025 Selfigram Photostudios</span>
            <span>•</span>
            <span>All Rights Reserved</span>
            <span>•</span>
            <span className="font-mono">ID: RPT-{format(new Date(data.reportGenerated), 'yyyyMMdd-HHmmss')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardReport;
