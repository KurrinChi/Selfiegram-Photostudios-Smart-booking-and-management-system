// components/AdminDashboardContents.tsx
// -----------------------------------------------------------------------------
// Uses **Recharts** for charts and **react‑date-range** for the date picker.
// Install deps:
//   npm i recharts react-date-range date-fns
// -----------------------------------------------------------------------------
import React, { useMemo, useState, useEffect } from "react";
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
  faStarHalfAlt,
  faStar as fasStar,
} from "@fortawesome/free-solid-svg-icons";
import { faStar as farStar } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DateRange } from "react-date-range";
import { subDays, format } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import "../styles/print.css";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import CenteredLoader from "./CenteredLoader";
import { toast } from "react-toastify";

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
  hasDateRange: boolean;
  salesTrend: Trend;
  userTrend: Trend;
  scheduleTrend: Trend;
  appointmentsTrend: Trend;
}

interface WeeklyIncome {
  week: string;
  income: number;
}

// -----------------------------------------------------------------------------
// Helper Components
// -----------------------------------------------------------------------------
const TrendArrow: React.FC<{ up: boolean }> = ({ up }) => (
  <FontAwesomeIcon
    icon={up ? faArrowUp : faArrowDown}
    className={up ? "text-green-500" : "text-red-500"}
  />
);

const StarRating: React.FC<{ value: number }> = ({ value }) => (
  <div className="flex gap-1">
    {Array.from({ length: 5 }).map((_, idx) => {
      const full = idx + 1 <= Math.floor(value);
      const half = !full && idx + 0.5 <= value;
      return (
        <FontAwesomeIcon
          key={idx}
          icon={full ? fasStar : half ? faStarHalfAlt : farStar}
          className="text-amber-400 text-xs"
        />
      );
    })}
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
    hasDateRange: false,
    salesTrend: { value: "0%", up: true },
    userTrend: { value: "0%", up: true },
    scheduleTrend: { value: "0%", up: true },
    appointmentsTrend: { value: "0%", up: true },
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  const [range, setRange] = useState([
    {
      startDate: subDays(new Date(), 7),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const [isDefaultRange, setIsDefaultRange] = useState(true);
  const [grossIncomeWeeklyData, setGrossIncomeWeeklyData] = useState<
    WeeklyIncome[]
  >([]);
  const [packageRows, setPackageRows] = useState<PackageRow[]>([]);
  const { startDate, endDate } = range[0];
  const start = format(startDate, "yyyy-MM-dd");
  const end = format(endDate, "yyyy-MM-dd");
  const [pendingRange, setPendingRange] = useState(range);


  // Loading state
  const [loading, setLoading] = useState(true);

  // ADD THIS: Missing state declaration

  useEffect(() => {
    // Wait until both start and end dates exist
    if (!range[0].startDate || !range[0].endDate) return;

    setLoading(true);
    const token = localStorage.getItem("token");

    const params = isDefaultRange ? {} : { startDate: start, endDate: end };

    const fetchSummary = axios.get<SummaryData>(
      `${API_URL}/api/admin/summary`,
      {
        params,
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const fetchWeeklyIncome = axios.get<WeeklyIncome[]>(
      `${API_URL}/api/admin/gross-income-weekly`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const fetchPackages = axios.get<PackageRow[]>(
      `${API_URL}/api/admin/packages`,
      {
        params: { startDate: start, endDate: end },
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    Promise.all([fetchSummary, fetchWeeklyIncome, fetchPackages])
      .then(([summaryRes, weeklyRes, packagesRes]) => {
        setSummaryData(summaryRes.data);
        setGrossIncomeWeeklyData(weeklyRes.data);
        setPackageRows(packagesRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [range, isDefaultRange, start, end]);

  //Summary Cards
  const summaryCards: SummaryCard[] = [
    {
      label: "Total User",
      value: summaryData?.totalUsers ?? 0,
      icon: faUser,
      trend: summaryData?.hasDateRange
        ? { value: "—", up: true }
        : summaryData?.userTrend ?? { value: "0%", up: true },
    },
    {
      label: "Total Schedule",
      value: summaryData?.totalBookings ?? 0,
      icon: faClipboardList,
      trend: summaryData?.hasDateRange
        ? { value: "—", up: true }
        : summaryData?.scheduleTrend ?? { value: "0%", up: true },
    },
    {
      label: "Total Sales",
      value: `₱ ${summaryData?.totalSales?.toLocaleString() ?? "0"}`,
      icon: faPesoSign,
      trend: summaryData?.hasDateRange
        ? { value: "—", up: true }
        : summaryData?.salesTrend ?? { value: "0%", up: true },
    },
    {
      label: "Total Appointments",
      value: summaryData?.totalAppointments ?? 0,
      icon: faCalendarAlt,
      trend: summaryData?.hasDateRange
        ? { value: "—", up: true }
        : summaryData?.appointmentsTrend ?? { value: "0%", up: true },
    },
  ];

  const [search, setSearch] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const filteredRows = useMemo(
    () =>
      search
        ? packageRows.filter((r) =>
          r.name.toLowerCase().includes(search.toLowerCase())
        )
        : packageRows,
    [search, packageRows]
  );

  const tableCell = "py-3 px-4 text-xs whitespace-nowrap";

  const generateProfessionalPDF = (data: any) => {
    const pdf = new jsPDF("p", "mm", "a4");

    // Colors
    const primaryColor: [number, number, number] = [31, 41, 55];
    const successColor: [number, number, number] = [16, 185, 129];
    const errorColor: [number, number, number] = [239, 68, 68];

    let yPosition = 25;
    const leftMargin = 20;
    const rightMargin = 190;
    const pageWidth = 210;
    const pageHeight = 297;

    const checkPageBreak = (neededSpace: number) => {
      if (yPosition + neededSpace > pageHeight - 20) {
        pdf.addPage();
        yPosition = 25;
      }
    };

    // Header
    pdf.setFillColor(...primaryColor);
    pdf.rect(0, 0, pageWidth, 40, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont("helvetica", "bold");
    pdf.text(data.companyInfo.name, leftMargin, 20);

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(data.companyInfo.address, leftMargin, 28);
    pdf.text(
      `${data.companyInfo.phone} | ${data.companyInfo.email}`,
      leftMargin,
      34
    );

    yPosition = 55;

    // Report Title and Info
    pdf.setTextColor(...primaryColor);
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text("Dashboard Analytics Report", leftMargin, yPosition);

    yPosition += 12;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(75, 85, 99);
    pdf.text(`Report Period: ${data.dateRange.formattedRange}`, leftMargin, yPosition);
    pdf.text(
      `Generated: ${format(new Date(data.reportGenerated), "PPP p")}`,
      rightMargin - 60,
      yPosition
    );

    yPosition += 18;

    // Executive Summary
    pdf.setTextColor(...primaryColor);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Executive Summary", leftMargin, yPosition);

    yPosition += 10;

    const summaryItems = [
      {
        label: "Total Users",
        value: data.summary.totalUsers.toLocaleString(),
        trend: data.summary.userTrend,
      },
      {
        label: "Total Bookings",
        value: data.summary.totalBookings.toLocaleString(),
        trend: data.summary.scheduleTrend,
      },
      {
        label: "Total Sales",
        value: `PHP ${data.summary.totalSales.toLocaleString()}`,
        trend: data.summary.salesTrend,
      },
      {
        label: "Total Appointments",
        value: data.summary.totalAppointments.toLocaleString(),
        trend: data.summary.appointmentsTrend,
      },
    ];

    const cardWidth = 80;
    const cardHeight = 25;
    const cardSpacing = 10;

    summaryItems.forEach((item, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = leftMargin + col * (cardWidth + cardSpacing);
      const y = yPosition + row * (cardHeight + cardSpacing);

      pdf.setFillColor(249, 250, 251);
      pdf.setDrawColor(209, 213, 219);
      pdf.rect(x, y, cardWidth, cardHeight, "FD");

      pdf.setTextColor(75, 85, 99);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.text(item.label, x + 5, y + 8);

      pdf.setTextColor(...primaryColor);
      pdf.setFontSize(15);
      pdf.setFont("helvetica", "bold");
      pdf.text(String(item.value), x + 5, y + 16);

      if (!data.summary.hasDateRange && item.trend) {
        const trendColor = item.trend.up ? successColor : errorColor;
        pdf.setTextColor(...trendColor);
        pdf.setFontSize(8);
        pdf.text(
          `${item.trend.up ? "UP" : "DOWN"} ${item.trend.value}`,
          x + 5,
          y + 22
        );
      }
    });

    yPosition += 75;

    // Weekly Income Table
    if (data.weeklyIncome && data.weeklyIncome.length > 0) {
      checkPageBreak(80);

      pdf.setTextColor(...primaryColor);
      pdf.setFontSize(13);
      pdf.setFont("helvetica", "bold");
      pdf.text("Weekly Income Analysis", leftMargin, yPosition);

      yPosition += 8;

      const weeklyData = data.weeklyIncome
        .slice(-10)
        .map((week: any) => [week.week, `PHP ${week.income.toLocaleString()}`]);

      autoTable(pdf, {
        startY: yPosition,
        head: [["Week Period", "Income"]],
        body: weeklyData,
        margin: { left: leftMargin, right: leftMargin },
        styles: { font: "helvetica", fontSize: 9, cellPadding: 4 },
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        columnStyles: { 1: { halign: "right" } },
      });

      yPosition = (pdf as any).lastAutoTable.finalY + 12;
    }

    // Package Performance Table
    if (data.packages && data.packages.length > 0) {
      pdf.setTextColor(...primaryColor);
      pdf.setFontSize(13);
      pdf.text("Package Performance Analysis", leftMargin, yPosition);
      yPosition += 8;

      const packageData = data.packages.map((pkg: any) => [
        pkg.name,
        pkg.totalBooking.toLocaleString(),
        `PHP ${Number(
          String(pkg.revenue).replace(/[^\d.-]/g, "")
        ).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        pkg.bookingPct,
        pkg.rating ? `${pkg.rating.toFixed(1)}/5` : "N/A",
        `${pkg.trendPositive ? "UP" : "DOWN"} ${pkg.trend}`,
      ]);

      autoTable(pdf, {
        startY: yPosition,
        head: [
          ["Package Name", "Bookings", "Revenue", "Share %", "Rating", "Trend"],
        ],
        body: packageData,
        margin: { left: leftMargin, right: leftMargin },
        styles: { font: "helvetica", fontSize: 8, cellPadding: 3 },
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { halign: "center" },
          2: { halign: "right" },
          3: { halign: "center" },
          4: { halign: "center" },
          5: { halign: "center" },
        },
        didParseCell: (data: any) => {
          if (data.column.index === 5 && data.section === "body") {
            data.cell.styles.textColor = data.cell.raw.includes("UP")
              ? successColor
              : errorColor;
          }
        },
      });

      yPosition = (pdf as any).lastAutoTable.finalY + 15;
    }

    // Insights Section
    pdf.setTextColor(...primaryColor);
    pdf.setFontSize(13);
    pdf.text("Key Performance Insights", leftMargin, yPosition);

    yPosition += 10;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(55, 65, 81);

    const insights: string[] = [];
    if (data.summary.totalSales > 0 && data.summary.totalBookings > 0) {
      const avg = (data.summary.totalSales / data.summary.totalBookings).toFixed(2);
      insights.push(`• Average revenue per booking: PHP ${Number(avg).toLocaleString()}`);
    }
    if (data.packages && data.packages.length > 0) {
      const top = data.packages.reduce((a: any, b: any) =>
        b.totalBooking > a.totalBooking ? b : a
      );
      insights.push(`• Most popular package: ${top.name} (${top.totalBooking} bookings)`);
    }
    if (data.weeklyIncome && data.weeklyIncome.length >= 2) {
      const [prev, curr] = data.weeklyIncome.slice(-2);
      const growth = ((curr.income - prev.income) / prev.income) * 100;
      insights.push(`• Week-over-week growth: ${growth.toFixed(1)}%`);
    }
    insights.push(`• Total system users: ${data.summary.totalUsers}`);
    insights.push(`• Active appointment slots: ${data.summary.totalBookings}`);

    insights.forEach((line) => {
      pdf.text(line, leftMargin, yPosition);
      yPosition += 6;
    });

    // Footer
    const footerY = pageHeight - 20;
    pdf.setDrawColor(209, 213, 219);
    pdf.line(leftMargin, footerY - 5, rightMargin, footerY - 5);
    pdf.setTextColor(107, 114, 128);
    pdf.setFontSize(8);
    pdf.text("Generated by Selfiegram Dashboard System", leftMargin, footerY);

    const timestamp = format(new Date(), "yyyyMMdd-HHmmss");
    const fileName = `Selfiegram-Dashboard-${timestamp}.pdf`;

    toast.success(`Report successfully exported as ${fileName}`);

    return pdf;
  };


  const handleExport = async () => {
    setIsGeneratingReport(true);

    try {
      const token = localStorage.getItem("token");
      const params = isDefaultRange ? {} : { startDate: start, endDate: end };

      console.log("Fetching report data...");

      // Try to fetch data
      let response;
      try {
        response = await axios.get(`${API_URL}/api/admin/report-data`, {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (mainError) {
        console.warn("Main endpoint failed, trying test endpoint:", mainError);
        response = await axios.get(`${API_URL}/api/test-report`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      const rawData = response.data as any;

      if (rawData.error) {
        throw new Error(`Server error: ${rawData.message || rawData.error}`);
      }

      if (!rawData || !rawData.summary) {
        throw new Error("Invalid report data structure received from server.");
      }

      // Prepare data with defaults
      const reportData = {
        ...rawData,
        summary: {
          totalUsers: 0,
          totalBookings: 0,
          totalSales: 0,
          totalAppointments: 0,
          hasDateRange: false,
          salesTrend: { value: "0%", up: true },
          userTrend: { value: "0%", up: true },
          scheduleTrend: { value: "0%", up: true },
          appointmentsTrend: { value: "0%", up: true },
          ...rawData.summary,
        },
        weeklyIncome: rawData.weeklyIncome || [],
        packages: rawData.packages || [],
        companyInfo: {
          name: "Selfiegram Photo Studios",
          address: "Malolos, Bulacan",
          phone: "+63 912 345 6789",
          email: "info@selfiegram.com",
          ...rawData.companyInfo,
        },
        dateRange: {
          start: start,
          end: end,
          hasCustomRange: !isDefaultRange,
          formattedRange: isDefaultRange
            ? "All Time Data"
            : `${format(range[0].startDate, "MMM dd, yyyy")} - ${format(
              range[0].endDate,
              "MMM dd, yyyy"
            )}`,
        },
        reportGenerated: new Date().toISOString(),
      };

      console.log("Generating professional PDF...");

      // Generate PDF using autoTable
      const pdf = generateProfessionalPDF(reportData);

      // Generate filename
      const timestamp = format(new Date(), "yyyyMMdd-HHmmss");
      const dateRange = isDefaultRange
        ? "AllTime"
        : `${format(range[0].startDate, "yyyyMMdd")}-${format(
          range[0].endDate,
          "yyyyMMdd"
        )}`;
      const filename = `Selfiegram-Dashboard-${dateRange}-${timestamp}.pdf`;

      // Save the PDF
      pdf.save(filename);

      console.log("Professional PDF generated and downloaded successfully!");
    } catch (error) {
      console.error("Error generating report:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to generate report: ${errorMessage}. Please try again.`);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="space-y-8 p-5 relative">
      {loading ? (
        <CenteredLoader message="Loading dashboard..." />
      ) : (
        <div className="relative">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative">
            <h1 className="text-lg font-semibold pl-12 sm:pl-0">Dashboard</h1>

            {/* Date Range Picker */}
            <div className="flex items-center gap-2">
              <div className="relative text-xs">
                <button
                  onClick={() => setPickerOpen((prev) => !prev)}
                  className="border px-3 py-2 rounded-md bg-white shadow-sm hover:bg-gray-100 transition"
                >
                  {isDefaultRange
                    ? "Select Date Range"
                    : `${format(range[0].startDate, "MMM dd yyyy")} — ${format(
                      range[0].endDate,
                      "MMM dd yyyy"
                    )}`}
                </button>
                {pickerOpen && (
                  <div className="absolute right-0 z-20 mt-2 bg-white shadow-lg rounded-md p-3">
                    <DateRange
                      ranges={pendingRange}
                      onChange={(item) => {
                        const { startDate, endDate, key } = item.selection;
                        const newRange = [
                          {
                            startDate: startDate ?? new Date(),
                            endDate: endDate ?? new Date(),
                            key: key ?? "selection",
                          },
                        ];
                        setPendingRange(newRange);
                      }}
                      moveRangeOnFirstSelection={false}
                      rangeColors={["#000"]}
                      maxDate={new Date()}
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={() => {
                          setRange(pendingRange);
                          setIsDefaultRange(false);
                          setPickerOpen(false);
                        }}
                        className="text-xs bg-black text-white px-3 py-1 rounded hover:bg-gray-800 transition"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* Reset Button */}
              {!isDefaultRange && (
                <button
                  onClick={() => {
                    setRange([
                      {
                        startDate: subDays(new Date(), 7),
                        endDate: new Date(),
                        key: "selection",
                      },
                    ]);
                    setIsDefaultRange(true);
                    setPickerOpen(false);
                  }}
                  className="px-3 py-2 text-xs bg-red-100 text-red-600 hover:bg-red-200 rounded-md transition"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {summaryCards.map((card) => (
              <div
                key={card.label}
                className="flex items-center justify-between p-4 bg-white shadow rounded-lg"
              >
                <div>
                  <p className="text-xs text-gray-500 mb-1">{card.label}</p>
                  <h2 className="text-lg font-semibold">{card.value}</h2>
                  <p className="text-[10px] flex items-center gap-1 mt-1">
                    {card.trend.value !== "—" && (
                      <TrendArrow up={card.trend.up} />
                    )}
                    <span
                      className={
                        card.trend.value === "—"
                          ? "text-gray-500"
                          : card.trend.up
                            ? "text-green-500"
                            : "text-red-500"
                      }
                    >
                      {card.trend.value === "—"
                        ? "— Trend unavailable for custom range"
                        : `${card.trend.value} ${card.trend.up ? "Up" : "Down"
                        } from past week`}
                    </span>
                  </p>
                </div>
                <FontAwesomeIcon
                  icon={card.icon}
                  className="text-2xl text-gray-400"
                />
              </div>
            ))}
          </div>

          {/* Gross Income Chart - Weekly */}
          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-4">
              Weekly Gross Income (Past 4 Months)
            </h3>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={grossIncomeWeeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="week"
                    className="text-[10px]"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={1}
                  />

                  {/* Y-Axis formatting logic */}
                  <YAxis
                    tickFormatter={(v) => {
                      const allAboveThousand = grossIncomeWeeklyData.every(
                        (d) => d.income > 1000
                      );
                      return allAboveThousand ? `${(v / 1000).toFixed(1)}K` : v;
                    }}
                    className="text-xs"
                  />
                  <Tooltip
                    formatter={(v: number) => `₱ ${v.toLocaleString()}`}
                  />
                  <Bar
                    dataKey="income"
                    fill="#1f2937"
                    radius={[4, 4, 0, 0]}
                    barSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Package Table */}
          <div className="bg-white shadow rounded-lg p-4 overflow-x-auto mt-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Package Details</h3>
              <div className="relative text-gray-400 text-xs">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search packages..."
                  className="border pl-8 pr-2 py-1 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                />
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-2 top-1.5 text-gray-400 text-xs"
                />
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
                    <td colSpan={6} className="text-center py-2">
                      No packages found
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row, i) => {
                    // Ensure revenue is parsed correctly by removing '₱' and commas
                    const parsedRevenue = row.revenue
                      ? parseFloat(
                        row.revenue.replace("₱", "").replace(",", "")
                      )
                      : 0;

                    // Ensure that the revenue is valid before formatting
                    const formattedRevenue = parsedRevenue
                      ? "₱" + parsedRevenue.toLocaleString()
                      : "₱0.00";

                    return (
                      <tr key={i} className="border-t">
                        <td className={tableCell}>{row.name}</td>
                        <td className={tableCell}>{row.totalBooking}</td>
                        <td className={tableCell}>{formattedRevenue}</td>
                        <td className={tableCell}>{row.bookingPct}</td>
                        <td className={tableCell}>
                          <StarRating value={row.rating} />
                        </td>
                        <td className={tableCell}>
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] ${row.trendPositive
                              ? "text-green-500"
                              : "text-red-500"
                              }`}
                          >
                            <FontAwesomeIcon
                              icon={row.trendPositive ? faArrowUp : faArrowDown}
                            />
                            {row.trend} vs last week
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {/* Export Button*/}
          <div className="flex justify-end mt-8">
            <button
              onClick={handleExport}
              disabled={isGeneratingReport}
              className={`px-5 py-2 rounded-md text-xs font-semibold transition focus:outline-none flex items-center gap-2 ${isGeneratingReport
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-800 hover:scale-[1.02]"
                }`}
            >
              {isGeneratingReport && (
                <svg
                  className="animate-spin h-3 w-3 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              {isGeneratingReport ? "Generating PDF..." : "Export Data"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardContents;
