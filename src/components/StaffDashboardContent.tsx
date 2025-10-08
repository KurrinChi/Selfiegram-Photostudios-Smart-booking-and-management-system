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

const generateProfessionalPDF = async (data: any) => {
  const pdf = new jsPDF("p", "mm", "a4");

  // Monochrome color palette
  const primaryBlack: [number, number, number] = [33, 33, 33];
  const darkGray: [number, number, number] = [102, 102, 102];
  const mediumGray: [number, number, number] = [153, 153, 153];
  const lightGray: [number, number, number] = [245, 245, 245];
  const borderGray: [number, number, number] = [208, 208, 208];
  const white: [number, number, number] = [255, 255, 255];

  let yPosition = 18;
  const leftMargin = 20;
  const rightMargin = 190;
  const pageWidth = 210;
  const pageHeight = 297;

  const checkPageBreak = (neededSpace: number) => {
    if (yPosition + neededSpace > pageHeight - 25) {
      pdf.addPage();
      yPosition = 18;
      return true;
    }
    return false;
  };

  // Helper function to convert SVG to PNG via Canvas
  const loadSvgAsImage = (svgPath: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext("2d");
        
        if (ctx) {
          ctx.drawImage(img, 0, 0, 200, 200);
          const dataUrl = canvas.toDataURL("image/png");
          resolve(dataUrl);
        } else {
          reject(new Error("Could not get canvas context"));
        }
      };
      
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = svgPath;
    });
  };

  // ===== COMPACT HEADER SECTION =====
  pdf.setFillColor(...primaryBlack);
  pdf.rect(0, 0, pageWidth, 2, "F");

  yPosition = 12;

  // Load and add logo from public/slfg.svg
  try {
    const logoDataUrl = await loadSvgAsImage("/slfg.svg");
    pdf.addImage(logoDataUrl, "PNG", leftMargin, yPosition, 18, 18);
  } catch (error) {
    console.error("Failed to load logo:", error);
    // Fallback: draw placeholder box with "LOGO" text
    pdf.setDrawColor(...borderGray);
    pdf.setLineWidth(0.3);
    pdf.rect(leftMargin, yPosition, 18, 18);
    
    pdf.setTextColor(...mediumGray);
    pdf.setFontSize(6);
    pdf.text("LOGO", leftMargin + 6, yPosition + 10);
  }

  const textStartX = leftMargin + 22;

  pdf.setTextColor(...primaryBlack);
  pdf.setFontSize(18);
  pdf.text("SELFIGRAM PHOTOSTUDIOS", textStartX, yPosition + 6);

  pdf.setFontSize(8);
  pdf.setTextColor(...darkGray);
  pdf.text(
    "3rd Floor Kim Kar Building F Estrella St., Malolos, Philippines",
    textStartX,
    yPosition + 11
  );

  pdf.setFontSize(7);
  pdf.setTextColor(...mediumGray);
  pdf.text(
    "0968 885 6035  •  selfiegrammalolos@gmail.com",
    textStartX,
    yPosition + 15
  );

  yPosition += 22;

  pdf.setDrawColor(...primaryBlack);
  pdf.setLineWidth(0.8);
  pdf.line(leftMargin, yPosition, rightMargin, yPosition);

  yPosition += 10;

  // ===== COMPACT REPORT HEADER =====
  pdf.setTextColor(...primaryBlack);
  pdf.setFontSize(16);
  pdf.text("DASHBOARD REPORT", leftMargin, yPosition);

  const reportId = `RPT-${format(new Date(data.reportGenerated), "yyyyMMdd")}`;
  const idWidth = pdf.getTextWidth(reportId) + 8;
  pdf.setFillColor(...primaryBlack);
  pdf.rect(rightMargin - idWidth, yPosition - 5, idWidth, 7, "F");
  pdf.setTextColor(...white);
  pdf.setFontSize(7);
  pdf.text(reportId, rightMargin - idWidth + 4, yPosition - 1);

  yPosition += 7;

  pdf.setFontSize(8);
  pdf.setTextColor(...darkGray);

  const periodLabel = "Period:";
  const periodLabelWidth = pdf.getTextWidth(periodLabel);
  pdf.text(periodLabel, leftMargin, yPosition);

  pdf.setTextColor(...primaryBlack);
  pdf.text(
    data.dateRange.formattedRange,
    leftMargin + periodLabelWidth + 2,
    yPosition
  );

  yPosition += 4;

  pdf.setTextColor(...darkGray);
  const generatedLabel = "Generated:";
  const generatedLabelWidth = pdf.getTextWidth(generatedLabel);
  pdf.text(generatedLabel, leftMargin, yPosition);

  pdf.setTextColor(...primaryBlack);
  pdf.text(
    format(new Date(data.reportGenerated), "MMM dd, yyyy • h:mm a"),
    leftMargin + generatedLabelWidth + 2,
    yPosition
  );

  yPosition += 12;

  // ===== COMPACT EXECUTIVE SUMMARY =====
  pdf.setFillColor(...primaryBlack);
  pdf.rect(leftMargin - 4, yPosition - 3, 2, 5, "F");

  pdf.setTextColor(...primaryBlack);
  pdf.setFontSize(10);
  pdf.text("EXECUTIVE SUMMARY", leftMargin + 2, yPosition);

  pdf.setDrawColor(...lightGray);
  pdf.setLineWidth(0.4);
  pdf.line(leftMargin + 45, yPosition - 1, rightMargin, yPosition - 1);

  yPosition += 8;

  const summaryItems = [
    {
      label: "TOTAL USERS",
      value: data.summary.totalUsers.toLocaleString(),
      trend: data.summary.userTrend,
    },
    {
      label: "TOTAL SCHEDULE",
      value: data.summary.totalBookings.toLocaleString(),
      trend: data.summary.scheduleTrend,
    },
    {
      label: "TOTAL SALES",
      value: `PHP ${data.summary.totalSales.toLocaleString()}`,
      trend: data.summary.salesTrend,
    },
    {
      label: "TOTAL APPOINTMENTS",
      value: data.summary.totalAppointments.toLocaleString(),
      trend: data.summary.appointmentsTrend,
    },
  ];

  const cardWidth = 83;
  const cardHeight = 24;
  const cardSpacing = 4;

  summaryItems.forEach((item, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = leftMargin + col * (cardWidth + cardSpacing);
    const y = yPosition + row * (cardHeight + cardSpacing + 2);

    pdf.setDrawColor(...borderGray);
    pdf.setLineWidth(0.3);
    pdf.rect(x, y, cardWidth, cardHeight);

    pdf.setFillColor(...primaryBlack);
    pdf.rect(x, y, cardWidth, 1.2, "F");

    pdf.setTextColor(...darkGray);
    pdf.setFontSize(6.5);
    pdf.text(item.label, x + 3, y + 5);

    pdf.setTextColor(...primaryBlack);
    pdf.setFontSize(14);
    pdf.text(String(item.value), x + 3, y + 13);

    if (!data.summary.hasDateRange && item.trend) {
      const trendSymbol = item.trend.up ? "↑" : "↓";

      pdf.setFontSize(8);
      pdf.setTextColor(...primaryBlack);
      pdf.text(trendSymbol, x + 3, y + 20);

      pdf.setFontSize(6.5);
      pdf.setTextColor(...darkGray);
      pdf.text(`${item.trend.value}`, x + 7, y + 20);

      pdf.setTextColor(...mediumGray);
      pdf.text(
        "vs last week",
        x + 7 + pdf.getTextWidth(item.trend.value) + 1.5,
        y + 20
      );
    }
  });

  yPosition += (cardHeight + cardSpacing + 2) * 2 + 6;

  // ===== COMPACT REVENUE ANALYSIS =====
  if (data.weeklyIncome && data.weeklyIncome.length > 0) {
    checkPageBreak(70);

    pdf.setFillColor(...primaryBlack);
    pdf.rect(leftMargin - 4, yPosition - 3, 2, 5, "F");

    pdf.setTextColor(...primaryBlack);
    pdf.setFontSize(10);
    pdf.text("REVENUE ANALYSIS", leftMargin + 2, yPosition);

    pdf.setDrawColor(...lightGray);
    pdf.setLineWidth(0.4);
    pdf.line(leftMargin + 40, yPosition - 1, rightMargin, yPosition - 1);

    yPosition += 7;

    const weeklyData = data.weeklyIncome
      .slice(-10)
      .map((week: any) => [week.week, `PHP ${week.income.toLocaleString()}`]);

    autoTable(pdf, {
      startY: yPosition,
      head: [["Week Period", "Gross Income"]],
      body: weeklyData,
      foot: [
        [
          "TOTAL REVENUE",
          `PHP ${data.weeklyIncome
            .slice(-10)
            .reduce((sum: number, week: any) => sum + week.income, 0)
            .toLocaleString()}`,
        ],
      ],
      margin: { left: leftMargin, right: leftMargin },
      styles: {
        fontSize: 8,
        cellPadding: { top: 3, right: 4, bottom: 3, left: 4 },
        lineColor: borderGray,
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: primaryBlack,
        textColor: white,
        fontSize: 8,
        halign: "left",
        cellPadding: { top: 4, right: 4, bottom: 4, left: 4 },
      },
      bodyStyles: {
        textColor: primaryBlack,
        fillColor: white,
      },
      footStyles: {
        fillColor: lightGray,
        textColor: primaryBlack,
        fontSize: 8,
        lineWidth: 0.6,
        lineColor: primaryBlack,
        cellPadding: { top: 4, right: 4, bottom: 4, left: 4 },
      },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { halign: "right" },
      },
    });

    yPosition = (pdf as any).lastAutoTable.finalY + 10;
  }

  // ===== COMPACT PACKAGE PERFORMANCE (ALL CENTERED EXCEPT PACKAGE) =====
  if (data.packages && data.packages.length > 0) {
    checkPageBreak(70);

    pdf.setFillColor(...primaryBlack);
    pdf.rect(leftMargin - 4, yPosition - 3, 2, 5, "F");

    pdf.setTextColor(...primaryBlack);
    pdf.setFontSize(10);
    pdf.text("PACKAGE PERFORMANCE", leftMargin + 2, yPosition);

    pdf.setDrawColor(...lightGray);
    pdf.setLineWidth(0.4);
    pdf.line(leftMargin + 48, yPosition - 1, rightMargin, yPosition - 1);

    yPosition += 7;

    const packageData = data.packages.map((pkg: any) => [
      pkg.name,
      pkg.totalBooking.toLocaleString(),
      pkg.revenue,
      pkg.bookingPct,
      pkg.rating ? `${pkg.rating.toFixed(1)}/5` : "N/A",
      `${pkg.trendPositive ? "↑" : "↓"} ${pkg.trend}`,
    ]);

    autoTable(pdf, {
      startY: yPosition,
      head: [["Package", "Bookings", "Revenue", "Share", "Rating", "Trend"]],
      body: packageData,
      margin: { left: leftMargin, right: leftMargin },
      styles: {
        fontSize: 8,
        cellPadding: { top: 3.5, right: 3, bottom: 3.5, left: 3 },
        lineColor: borderGray,
        lineWidth: 0.2,
        valign: "middle",
        halign: "center",
      },
      headStyles: {
        fillColor: primaryBlack,
        textColor: white,
        fontSize: 8,
        fontStyle: "bold",
        halign: "center",
        cellPadding: { top: 4.5, right: 3, bottom: 4.5, left: 3 },
      },
      bodyStyles: {
        textColor: primaryBlack,
        fillColor: white,
        fontSize: 8,
        halign: "center",
      },
      columnStyles: {
        0: { 
          cellWidth: 48, 
          halign: "left",
          fontStyle: "bold",
          textColor: primaryBlack 
        },
        1: { 
          cellWidth: 24, 
          halign: "center", 
          fontStyle: "bold",
          textColor: primaryBlack 
        },
        2: { 
          cellWidth: 32, 
          halign: "center",
          fontStyle: "bold",
          textColor: primaryBlack 
        },
        3: { 
          cellWidth: 22, 
          halign: "center",
          textColor: darkGray 
        },
        4: { 
          cellWidth: 20, 
          halign: "center",
          textColor: darkGray 
        },
        5: { 
          cellWidth: 20, 
          halign: "center", 
          fontStyle: "bold",
          textColor: primaryBlack 
        },
      },
      alternateRowStyles: {
        fillColor: [252, 252, 252],
      },
    });

    yPosition = (pdf as any).lastAutoTable.finalY + 10;
  }

  // ===== COMPACT KEY INSIGHTS =====
  checkPageBreak(40);

  pdf.setFillColor(...primaryBlack);
  pdf.rect(leftMargin - 4, yPosition - 3, 2, 5, "F");

  pdf.setTextColor(...primaryBlack);
  pdf.setFontSize(10);
  pdf.text("KEY INSIGHTS", leftMargin + 2, yPosition);

  pdf.setDrawColor(...lightGray);
  pdf.setLineWidth(0.4);
  pdf.line(leftMargin + 30, yPosition - 1, rightMargin, yPosition - 1);

  yPosition += 8;

  const insights: string[] = [];
  if (data.summary.totalSales > 0 && data.summary.totalBookings > 0) {
    const avg = (data.summary.totalSales / data.summary.totalBookings).toFixed(2);
    insights.push(
      `Average revenue per booking: PHP ${Number(avg).toLocaleString()}`
    );
  }
  if (data.packages && data.packages.length > 0) {
    const top = data.packages.reduce((a: any, b: any) =>
      b.totalBooking > a.totalBooking ? b : a
    );
    insights.push(
      `Most popular package: ${top.name} with ${top.totalBooking} bookings`
    );
  }
  if (data.weeklyIncome && data.weeklyIncome.length >= 2) {
    const [prev, curr] = data.weeklyIncome.slice(-2);
    const growth = ((curr.income - prev.income) / prev.income) * 100;
    insights.push(
      `Week-over-week revenue growth: ${growth > 0 ? "+" : ""}${growth.toFixed(1)}%`
    );
  }
  insights.push(`Total registered users in system: ${data.summary.totalUsers}`);
  insights.push(
    `Active appointment schedule count: ${data.summary.totalBookings}`
  );

  pdf.setFontSize(8);
  pdf.setTextColor(...darkGray);

  insights.forEach((line) => {
    pdf.setFillColor(...primaryBlack);
    pdf.circle(leftMargin + 1.5, yPosition - 1.2, 0.7, "F");

    pdf.text(line, leftMargin + 5, yPosition);
    yPosition += 5;
  });

  // ===== COMPACT FOOTER =====
  const footerY = pageHeight - 15;

  pdf.setDrawColor(...borderGray);
  pdf.setLineWidth(0.3);
  pdf.line(leftMargin, footerY - 7, rightMargin, footerY - 7);

  pdf.setTextColor(...mediumGray);
  pdf.setFontSize(6.5);
  pdf.text(
    "This report was automatically generated by Selfigram Photostudios Dashboard System",
    leftMargin,
    footerY - 3
  );

  pdf.setFontSize(6.5);
  pdf.text("© 2025 Selfigram Photostudios", leftMargin, footerY + 1);

  pdf.text("•", leftMargin + 46, footerY + 1);

  pdf.text("All Rights Reserved", leftMargin + 49, footerY + 1);

  pdf.text("•", leftMargin + 78, footerY + 1);

  pdf.setTextColor(...darkGray);
  const reportIdFull = `ID: RPT-${format(new Date(), "yyyyMMdd-HHmmss")}`;
  pdf.text(
    reportIdFull,
    rightMargin - pdf.getTextWidth(reportIdFull),
    footerY + 1
  );

  const timestamp = format(new Date(), "yyyyMMdd-HHmmss");
  const fileName = `Selfigram-Report-${timestamp}.pdf`;

  toast.success(`Report successfully exported as ${fileName}`);

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
      (await
        // Save the PDF
        pdf).save(filename);

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
