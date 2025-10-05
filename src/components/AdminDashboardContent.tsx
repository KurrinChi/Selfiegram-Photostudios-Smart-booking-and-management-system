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
import DashboardReportPDF from "./DashboardReportPDF";
import CenteredLoader from "./CenteredLoader";

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

  // Loading state
  const [loading, setLoading] = useState(true);

  // ADD THIS: Missing state declaration
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
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
  const [reportData, setReportData] = useState<any>(null);

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

  const handlePreview = () => {
    // Create mock data based on current dashboard data
    const mockReportData = {
      reportGenerated: new Date().toISOString(),
      dateRange: {
        start: isDefaultRange ? subDays(new Date(), 7).toDateString() : start,
        end: isDefaultRange ? new Date().toDateString() : end,
        hasCustomRange: !isDefaultRange,
        formattedRange: isDefaultRange
          ? "Last 7 days"
          : `${format(range[0].startDate, "MMM dd, yyyy")} - ${format(
              range[0].endDate,
              "MMM dd, yyyy"
            )}`,
      },
      summary: {
        totalUsers: summaryData?.totalUsers || 1250,
        totalBookings: summaryData?.totalBookings || 89,
        totalSales: summaryData?.totalSales || 145750,
        totalAppointments: summaryData?.totalAppointments || 156,
        hasDateRange: !isDefaultRange,
        salesTrend: summaryData?.salesTrend || { value: "15.5%", up: true },
        userTrend: summaryData?.userTrend || { value: "8.2%", up: true },
        scheduleTrend: summaryData?.scheduleTrend || {
          value: "12.8%",
          up: false,
        },
        appointmentsTrend: summaryData?.appointmentsTrend || {
          value: "6.4%",
          up: true,
        },
      },
      weeklyIncome:
        grossIncomeWeeklyData.length > 0
          ? grossIncomeWeeklyData
          : [
              { week: "Aug 05 - Aug 11", income: 18500 },
              { week: "Aug 12 - Aug 18", income: 22300 },
              { week: "Aug 19 - Aug 25", income: 19750 },
              { week: "Aug 26 - Sep 01", income: 25100 },
              { week: "Sep 02 - Sep 08", income: 28900 },
              { week: "Sep 09 - Sep 15", income: 31200 },
            ],
      packages:
        packageRows.length > 0
          ? packageRows
          : [
              {
                name: "Birthday Package Elite",
                totalBooking: 15,
                revenue: "₱45,000",
                bookingPct: "16.9%",
                rating: 5,
                trend: "12%",
                trendPositive: true,
              },
              {
                name: "Graduation Premium",
                totalBooking: 12,
                revenue: "₱36,000",
                bookingPct: "13.5%",
                rating: 4,
                trend: "8%",
                trendPositive: true,
              },
            ],
      companyInfo: {
        name: "Selfiegram Photo Studios",
        address: "Malolos, Bulacan",
        phone: "+63 912 345 6789",
        email: "info@selfiegram.com",
      },
    };

    setReportData(mockReportData);
    setShowPreview(true);
  };

  const generateProfessionalPDF = (data: any) => {
    const pdf = new jsPDF("p", "mm", "a4");

    // Company colors and styling
    const primaryColor: [number, number, number] = [31, 41, 55]; // Gray-800
    const successColor: [number, number, number] = [16, 185, 129]; // Green-500
    const errorColor: [number, number, number] = [239, 68, 68]; // Red-500

    let yPosition = 25;
    const leftMargin = 20;
    const rightMargin = 190;
    const pageWidth = 210;
    const pageHeight = 297;

    // Helper function to add a new page if needed
    const checkPageBreak = (neededSpace: number) => {
      if (yPosition + neededSpace > pageHeight - 20) {
        pdf.addPage();
        yPosition = 25;
        return true;
      }
      return false;
    };

    // Header Section
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
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.text("Dashboard Analytics Report", leftMargin, yPosition);

    yPosition += 15;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(75, 85, 99);
    pdf.text(
      `Report Period: ${data.dateRange.formattedRange}`,
      leftMargin,
      yPosition
    );
    pdf.text(
      `Generated: ${format(new Date(data.reportGenerated), "PPP p")}`,
      rightMargin - 60,
      yPosition
    );

    yPosition += 20;

    // Summary Cards Section
    checkPageBreak(60);

    pdf.setTextColor(...primaryColor);
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Executive Summary", leftMargin, yPosition);

    yPosition += 10;

    // Draw summary cards in a 2x2 grid
    const cardWidth = 80;
    const cardHeight = 25;
    const cardSpacing = 10;

    const summaryItems = [
      {
        label: "Total Users",
        value: data.summary.totalUsers,
        trend: data.summary.userTrend,
      },
      {
        label: "Total Bookings",
        value: data.summary.totalBookings,
        trend: data.summary.scheduleTrend,
      },
      {
        label: "Total Sales",
        value: `₱${data.summary.totalSales?.toLocaleString() || "0"}`,
        trend: data.summary.salesTrend,
      },
      {
        label: "Total Appointments",
        value: data.summary.totalAppointments,
        trend: data.summary.appointmentsTrend,
      },
    ];

    summaryItems.forEach((item, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = leftMargin + col * (cardWidth + cardSpacing);
      const y = yPosition + row * (cardHeight + cardSpacing);

      // Card background
      pdf.setFillColor(249, 250, 251);
      pdf.setDrawColor(209, 213, 219);
      pdf.rect(x, y, cardWidth, cardHeight, "FD");

      // Card content
      pdf.setTextColor(75, 85, 99);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.text(item.label, x + 5, y + 8);

      pdf.setTextColor(...primaryColor);
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text(String(item.value), x + 5, y + 16);

      // Trend indicator (only if not custom date range)
      if (!data.summary.hasDateRange && item.trend) {
        const trendColor = item.trend.up ? successColor : errorColor;
        pdf.setTextColor(...trendColor);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        const trendText = `${item.trend.up ? "↑" : "↓"} ${item.trend.value}`;
        pdf.text(trendText, x + 5, y + 22);
      }
    });

    yPosition += 60;

    // Weekly Income Table
    if (data.weeklyIncome && data.weeklyIncome.length > 0) {
      checkPageBreak(80);

      pdf.setTextColor(...primaryColor);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Weekly Income Analysis", leftMargin, yPosition);

      yPosition += 10;

      const weeklyData = data.weeklyIncome
        .slice(-10)
        .map((week: any) => [week.week, `₱${week.income.toLocaleString()}`]);

      autoTable(pdf, {
        startY: yPosition,
        head: [["Week Period", "Income"]],
        body: weeklyData,
        margin: { left: leftMargin, right: leftMargin },
        styles: {
          fontSize: 9,
          cellPadding: 4,
        },
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251],
        },
        columnStyles: {
          1: { halign: "right", fontStyle: "bold" },
        },
      });

      yPosition = (pdf as any).lastAutoTable.finalY + 15;
    }

    // Package Performance Table
    if (data.packages && data.packages.length > 0) {
      checkPageBreak(80);

      pdf.setTextColor(...primaryColor);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Package Performance Analysis", leftMargin, yPosition);

      yPosition += 10;

      const packageData = data.packages.map((pkg: any) => [
        pkg.name,
        String(pkg.totalBooking),
        pkg.revenue,
        pkg.bookingPct,
        pkg.rating ? "★".repeat(Math.floor(pkg.rating)) : "N/A",
        `${pkg.trendPositive ? "↑" : "↓"} ${pkg.trend}`,
      ]);

      autoTable(pdf, {
        startY: yPosition,
        head: [
          ["Package Name", "Bookings", "Revenue", "Share %", "Rating", "Trend"],
        ],
        body: packageData,
        margin: { left: leftMargin, right: leftMargin },
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251],
        },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { halign: "center" },
          2: { halign: "right", fontStyle: "bold" },
          3: { halign: "center" },
          4: { halign: "center" },
          5: { halign: "center" },
        },
        didParseCell: function (data: any) {
          // Color the trend column based on direction
          if (data.column.index === 5 && data.section === "body") {
            const trend = data.cell.raw;
            if (trend.includes("↑")) {
              data.cell.styles.textColor = successColor;
            } else if (trend.includes("↓")) {
              data.cell.styles.textColor = errorColor;
            }
          }
        },
      });

      yPosition = (pdf as any).lastAutoTable.finalY + 15;
    }

    // Key Insights Section
    checkPageBreak(50);

    pdf.setTextColor(...primaryColor);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Key Performance Insights", leftMargin, yPosition);

    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(55, 65, 81);

    const insights = [];

    if (data.summary.totalSales > 0) {
      const avgPerBooking =
        data.summary.totalBookings > 0
          ? (data.summary.totalSales / data.summary.totalBookings).toFixed(0)
          : 0;
      insights.push(
        `• Average revenue per booking: ₱${Number(
          avgPerBooking
        ).toLocaleString()}`
      );
    }

    if (data.packages && data.packages.length > 0) {
      const topPackage = data.packages.reduce(
        (max: any, pkg: any) =>
          pkg.totalBooking > max.totalBooking ? pkg : max,
        data.packages[0]
      );
      insights.push(
        `• Most popular package: ${topPackage.name} (${topPackage.totalBooking} bookings)`
      );
    }

    if (data.weeklyIncome && data.weeklyIncome.length >= 2) {
      const recent = data.weeklyIncome.slice(-2);
      const growth = (
        ((recent[1].income - recent[0].income) / recent[0].income) *
        100
      ).toFixed(1);
      insights.push(`• Week-over-week growth: ${growth}%`);
    }

    insights.push(
      `• Total system users: ${data.summary.totalUsers.toLocaleString()}`
    );
    insights.push(`• Active appointment slots: ${data.summary.totalBookings}`);

    insights.forEach((insight) => {
      pdf.text(insight, leftMargin, yPosition);
      yPosition += 6;
    });

    // Footer
    const footerY = pageHeight - 20;
    pdf.setDrawColor(209, 213, 219);
    pdf.line(leftMargin, footerY - 5, rightMargin, footerY - 5);

    pdf.setTextColor(107, 114, 128);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.text("Generated by Selfiegram Dashboard System", leftMargin, footerY);
    pdf.text(
      `Page 1 of ${pdf.internal.pages.length - 1}`,
      rightMargin - 20,
      footerY
    );

    return pdf;
  };

  const handleExport = async () => {
    // Add confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to generate a PDF report for the selected date range?\n\n` +
        (isDefaultRange
          ? `Period: All time data`
          : `Period: ${format(range[0].startDate, "MMM dd, yyyy")} - ${format(
              range[0].endDate,
              "MMM dd, yyyy"
            )}`)
    );

    if (!confirmed) return;

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
                  <div className="absolute left-0 z-20 mt-2 bg-white shadow-lg rounded-md p-3">
                    <DateRange
                      ranges={range}
                      onChange={(item) => {
                        const { startDate, endDate, key } = item.selection;
                        setRange([
                          {
                            startDate: startDate ?? new Date(),
                            endDate: endDate ?? new Date(),
                            key: key ?? "selection",
                          },
                        ]);
                        setIsDefaultRange(false); // User has actively changed the range
                      }}
                      moveRangeOnFirstSelection={false}
                      rangeColors={["#000"]}
                      maxDate={new Date()}
                    />
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

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {/* Preview Button */}
                <button
                  onClick={handlePreview}
                  className="px-4 py-2 rounded-md text-xs transition focus:outline-none bg-gray-100 text-gray-700 hover:bg-gray-200 border"
                >
                  Preview Report
                </button>

                {/* Export Button */}
                <button
                  onClick={handleExport}
                  disabled={isGeneratingReport}
                  className={`px-4 py-2 rounded-md text-xs transition focus:outline-none flex items-center gap-2 ${
                    isGeneratingReport
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
                        : `${card.trend.value} ${
                            card.trend.up ? "Up" : "Down"
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
                            className={`inline-flex items-center gap-1 ${
                              row.trendPositive
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            <FontAwesomeIcon
                              icon={row.trendPositive ? faArrowUp : faArrowDown}
                            />
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

          {/* Report Preview Modal */}
          {showPreview && reportData && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowPreview(false);
                  setReportData(null);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setShowPreview(false);
                  setReportData(null);
                }
              }}
            >
              <div className="bg-white rounded-lg max-w-5xl max-h-[90vh] overflow-auto relative shadow-2xl">
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Dashboard Report Preview
                  </h2>
                  <div className="flex gap-3">
                    <button
                      onClick={() => window.print()}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                      title="Print (Ctrl+P)"
                    >
                      🖨️ Print
                    </button>
                    <button
                      onClick={() => {
                        setShowPreview(false);
                        setReportData(null);
                      }}
                      className="px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                      title="Close (Esc)"
                    >
                      ✕ Close
                    </button>
                  </div>
                </div>

                {/* Report Content */}
                <div className="bg-gray-50 p-6">
                  <div className="bg-white rounded-lg shadow-sm">
                    <DashboardReportPDF data={reportData} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Hidden Report Component for PDF Generation */}
          {reportData && !showPreview && (
            <div
              id="dashboard-report"
              style={{
                position: "fixed",
                top: "-10000px",
                left: "-10000px",
                zIndex: -1000,
                opacity: 0,
                pointerEvents: "none",
                backgroundColor: "white",
                width: "210mm",
                minHeight: "297mm",
                fontFamily: "Arial, sans-serif",
                color: "black",
                padding: "20px",
                fontSize: "12px",
                lineHeight: "1.4",
              }}
            >
              <div style={{ width: "800px", margin: "0 auto" }}>
                <DashboardReportPDF data={reportData} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboardContents;
