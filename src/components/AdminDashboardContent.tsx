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
import { subDays, format } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import "../styles/print.css";
import axios from "axios";
import { useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import DashboardReportPDF from "./DashboardReportPDF";

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
// Static Demo Data (replace w/ API) - keeping for reference
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// Helper Components
// -----------------------------------------------------------------------------
const TrendArrow: React.FC<{ up: boolean }> = ({ up }) => (
  <FontAwesomeIcon
    icon={up ? faArrowUp : faArrowDown}
    className={up ? "text-green-500" : "text-red-500"}
  />
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
    hasDateRange: false,
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

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Summary cards - only send date params if user has actively changed the range
    const params = isDefaultRange ? {} : { startDate: start, endDate: end };

    console.log("Dashboard API call:", {
      isDefaultRange,
      params,
      startDate: start,
      endDate: end,
    });

    axios
      .get<SummaryData>(`${API_URL}/api/admin/summary`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((r) => {
        console.log("Dashboard API response:", r.data);
        setSummaryData(r.data);
      })
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
  }, [range, isDefaultRange, start, end]);

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
      trend: summaryData?.hasDateRange
        ? { value: "—", up: true } // Neutral when date range is selected
        : summaryData?.userTrend ?? { value: "0%", up: true },
    },
    {
      label: "Total Schedule", // This shows bookings from today onwards
      value: summaryData?.totalBookings ?? 0,
      icon: faClipboardList,
      trend: summaryData?.hasDateRange
        ? { value: "—", up: true } // Neutral when date range is selected
        : summaryData?.scheduleTrend ?? { value: "0%", up: true },
    },
    {
      label: "Total Sales",
      value: `₱ ${summaryData?.totalSales?.toLocaleString() ?? "0"}`,
      icon: faPesoSign,
      trend: summaryData?.hasDateRange
        ? { value: "—", up: true } // Neutral when date range is selected
        : summaryData?.salesTrend ?? { value: "0%", up: true },
    },
    {
      label: "Total Appointments", // This shows all bookings (overall count)
      value: summaryData?.totalAppointments ?? 0,
      icon: faCalendarAlt,
      trend: summaryData?.hasDateRange
        ? { value: "—", up: true } // Neutral when date range is selected
        : summaryData?.appointmentsTrend ?? { value: "0%", up: true },
    },
  ];

  const [search, setSearch] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

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
      console.log("API URL:", `${API_URL}/api/admin/report-data`);
      console.log("Request params:", params);
      console.log("Token:", token ? "Present" : "Missing");

      // Try test endpoint first for debugging
      let response;
      try {
        // First try the real endpoint
        response = await axios.get(`${API_URL}/api/admin/report-data`, {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (mainError) {
        console.warn("Main endpoint failed, trying test endpoint:", mainError);
        // Fallback to test endpoint
        response = await axios.get(`${API_URL}/api/test-report`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      console.log("Report data fetched successfully:", response.data);

      // Cast to any for flexible handling
      const rawData = response.data as any;

      // Check if server returned an error
      if (rawData.error) {
        throw new Error(`Server error: ${rawData.message || rawData.error}`);
      }

      // Validate the response data structure
      if (!rawData || !rawData.summary) {
        console.error("Invalid response structure:", rawData);
        throw new Error(
          "Invalid report data structure received from server. Check console for details."
        );
      }

      // Ensure all required properties exist
      const reportDataWithDefaults = {
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
          address: "Your Studio Address",
          phone: "Your Phone Number",
          email: "info@selfiegram.com",
          ...rawData.companyInfo,
        },
      };

      setReportData(reportDataWithDefaults);

      // Wait for component to render and then generate PDF
      // Use requestAnimationFrame for better timing
      await new Promise((resolve) => {
        requestAnimationFrame(() => {
          setTimeout(resolve, 2000); // Increased timeout
        });
      });

      console.log("Starting PDF generation...");
      const reportElement = document.getElementById("dashboard-report");

      if (!reportElement) {
        throw new Error("Report element not found");
      }

      console.log("Generating canvas from report element...");

      let canvas;

      // Create a comprehensive CSS reset to eliminate all problematic styles
      const cssReset = `
        #dashboard-report, #dashboard-report * {
          all: unset !important;
          display: block !important;
          box-sizing: border-box !important;
          font-family: system-ui, -apple-system, sans-serif !important;
          color: rgb(0, 0, 0) !important;
          background-color: rgb(255, 255, 255) !important;
          background-image: none !important;
          border: none !important;
          outline: none !important;
          text-decoration: none !important;
          list-style: none !important;
        }
        
        #dashboard-report {
          width: 800px !important;
          min-height: 1000px !important;
          padding: 30px !important;
          margin: 0 auto !important;
          font-size: 14px !important;
          line-height: 1.6 !important;
          page-break-inside: avoid !important;
        }
        
        #dashboard-report h1 { font-size: 24px !important; font-weight: bold !important; margin-bottom: 10px !important; }
        #dashboard-report h2 { font-size: 20px !important; font-weight: bold !important; margin-bottom: 8px !important; }
        #dashboard-report h3 { font-size: 16px !important; font-weight: bold !important; margin-bottom: 6px !important; }
        #dashboard-report p { margin-bottom: 8px !important; }
        #dashboard-report table { width: 100% !important; border-collapse: collapse !important; margin-bottom: 20px !important; }
        #dashboard-report th, #dashboard-report td { 
          padding: 8px !important; 
          border: 1px solid rgb(209, 213, 219) !important; 
          text-align: left !important; 
        }
        #dashboard-report th { 
          background-color: rgb(249, 250, 251) !important; 
          font-weight: bold !important; 
        }
        #dashboard-report .grid { display: flex !important; flex-wrap: wrap !important; gap: 16px !important; }
        #dashboard-report .card { 
          flex: 1 !important; 
          min-width: 200px !important; 
          padding: 16px !important; 
          border: 1px solid rgb(209, 213, 219) !important; 
          border-radius: 8px !important; 
        }
        #dashboard-report .text-center { text-align: center !important; }
        #dashboard-report .font-bold { font-weight: bold !important; }
        #dashboard-report .text-sm { font-size: 14px !important; }
        #dashboard-report .text-xs { font-size: 12px !important; }
        #dashboard-report .text-lg { font-size: 18px !important; }
        #dashboard-report .text-xl { font-size: 20px !important; }
        #dashboard-report .text-2xl { font-size: 24px !important; }
        #dashboard-report .mb-4 { margin-bottom: 16px !important; }
        #dashboard-report .mb-6 { margin-bottom: 24px !important; }
        #dashboard-report .mt-4 { margin-top: 16px !important; }
        #dashboard-report .text-gray-500 { color: rgb(107, 114, 128) !important; }
        #dashboard-report .text-gray-600 { color: rgb(75, 85, 99) !important; }
        #dashboard-report .text-gray-700 { color: rgb(55, 65, 81) !important; }
        #dashboard-report .text-green-600 { color: rgb(5, 150, 105) !important; }
        #dashboard-report .text-red-600 { color: rgb(220, 38, 38) !important; }
        #dashboard-report .text-amber-400 { color: rgb(251, 191, 36) !important; }
        #dashboard-report svg { display: inline-block !important; width: 16px !important; height: 16px !important; }
      `;

      // Create and insert the style element
      const styleElement = document.createElement("style");
      styleElement.setAttribute("data-html2canvas", "true");
      styleElement.innerHTML = cssReset;
      document.head.appendChild(styleElement);

      try {
        // Wait a bit for styles to apply
        await new Promise((resolve) => setTimeout(resolve, 500));

        // First attempt with comprehensive CSS override
        canvas = await html2canvas(reportElement, {
          scale: 1.2,
          backgroundColor: "#ffffff",
          logging: true,
          useCORS: false,
          allowTaint: false,
          foreignObjectRendering: false,
          imageTimeout: 15000,
          removeContainer: true,
          ignoreElements: (element) => {
            // Ignore any elements that might cause issues
            return element.tagName === "STYLE" || element.tagName === "SCRIPT";
          },
          onclone: (clonedDoc: Document) => {
            // Remove all existing stylesheets and add only our safe CSS
            const existingStyles = clonedDoc.querySelectorAll(
              'style, link[rel="stylesheet"]'
            );
            existingStyles.forEach((style) => style.remove());

            // Add our safe CSS reset
            const safeStyle = clonedDoc.createElement("style");
            safeStyle.innerHTML = cssReset;
            clonedDoc.head.appendChild(safeStyle);
          },
        });

        console.log("Canvas generated successfully with CSS override");
      } catch (colorError) {
        console.warn(
          "First canvas attempt failed, trying minimal approach:",
          colorError
        );

        try {
          // Fallback: Create a completely isolated copy of the element with inline styles
          const clonedElement = reportElement.cloneNode(true) as HTMLElement;
          clonedElement.id = "dashboard-report-isolated";

          // Apply inline styles to every element to bypass CSS parsing issues
          const applyInlineStyles = (element: HTMLElement) => {
            element.style.cssText = `
              color: rgb(0, 0, 0) !important;
              background-color: rgb(255, 255, 255) !important;
              font-family: system-ui, -apple-system, sans-serif !important;
              box-sizing: border-box !important;
              display: block !important;
            `;

            // Apply specific styles based on class names
            if (element.className) {
              if (element.className.includes("text-gray-500"))
                element.style.color = "rgb(107, 114, 128)";
              if (element.className.includes("text-gray-600"))
                element.style.color = "rgb(75, 85, 99)";
              if (element.className.includes("text-green-600"))
                element.style.color = "rgb(5, 150, 105)";
              if (element.className.includes("text-red-600"))
                element.style.color = "rgb(220, 38, 38)";
              if (element.className.includes("font-bold"))
                element.style.fontWeight = "bold";
            }

            // Recursively apply to children
            Array.from(element.children).forEach((child) => {
              if (child instanceof HTMLElement) {
                applyInlineStyles(child);
              }
            });
          };

          applyInlineStyles(clonedElement);

          // Temporarily add the isolated element to the DOM
          clonedElement.style.cssText = `
            position: fixed !important;
            top: -10000px !important;
            left: -10000px !important;
            width: 210mm !important;
            min-height: 297mm !important;
            background-color: white !important;
            padding: 20px !important;
            z-index: -1000 !important;
          `;

          document.body.appendChild(clonedElement);

          // Generate canvas from the isolated element
          canvas = await html2canvas(clonedElement, {
            scale: 1,
            backgroundColor: "#ffffff",
            logging: false,
            useCORS: false,
            allowTaint: false,
          });

          // Remove the temporary element
          document.body.removeChild(clonedElement);

          console.log("Canvas generated successfully with isolated element");
        } catch (fallbackError) {
          console.error(
            "Both canvas attempts failed, generating text-based PDF:",
            fallbackError
          );

          // Remove the temporary element if it exists
          const isolatedElement = document.getElementById(
            "dashboard-report-isolated"
          );
          if (isolatedElement) {
            document.body.removeChild(isolatedElement);
          }

          // Ultimate fallback: Generate a simple text-based PDF
          const pdf = new jsPDF("p", "mm", "a4");

          // Add header
          pdf.setFontSize(20);
          pdf.text("Selfiegram Dashboard Report", 20, 20);

          pdf.setFontSize(12);
          pdf.text(
            `Report Period: ${
              isDefaultRange
                ? "All Time"
                : `${format(range[0].startDate, "MMM dd, yyyy")} - ${format(
                    range[0].endDate,
                    "MMM dd, yyyy"
                  )}`
            }`,
            20,
            35
          );
          pdf.text(`Generated: ${format(new Date(), "PPP p")}`, 20, 45);

          let yPos = 60;

          // Add summary data
          pdf.setFontSize(16);
          pdf.text("Summary", 20, yPos);
          yPos += 15;

          pdf.setFontSize(10);
          pdf.text(
            `Total Users: ${reportDataWithDefaults?.summary?.totalUsers || 0}`,
            20,
            yPos
          );
          yPos += 10;
          pdf.text(
            `Total Bookings: ${
              reportDataWithDefaults?.summary?.totalBookings || 0
            }`,
            20,
            yPos
          );
          yPos += 10;
          pdf.text(
            `Total Sales: ₱${
              reportDataWithDefaults?.summary?.totalSales?.toLocaleString() ||
              "0"
            }`,
            20,
            yPos
          );
          yPos += 10;
          pdf.text(
            `Total Appointments: ${
              reportDataWithDefaults?.summary?.totalAppointments || 0
            }`,
            20,
            yPos
          );
          yPos += 20;

          // Add packages
          if (
            reportDataWithDefaults.packages &&
            reportDataWithDefaults.packages.length > 0
          ) {
            pdf.setFontSize(16);
            pdf.text("Top Packages", 20, yPos);
            yPos += 15;

            pdf.setFontSize(10);
            reportDataWithDefaults.packages.slice(0, 10).forEach((pkg: any) => {
              pdf.text(
                `${pkg.name}: ${pkg.totalBooking} bookings, ${pkg.revenue}`,
                20,
                yPos
              );
              yPos += 10;
              if (yPos > 270) {
                pdf.addPage();
                yPos = 20;
              }
            });
          }

          const timestamp = format(new Date(), "yyyyMMdd-HHmmss");
          const dateRange = isDefaultRange
            ? "AllTime"
            : `${format(range[0].startDate, "yyyyMMdd")}-${format(
                range[0].endDate,
                "yyyyMMdd"
              )}`;
          const filename = `Selfiegram-Dashboard-${dateRange}-${timestamp}-TextOnly.pdf`;

          pdf.save(filename);
          setReportData(null);
          return; // Exit early for fallback
        }
      }

      console.log("Canvas generated successfully, creating PDF...");

      const imgData = canvas.toDataURL("image/png", 0.9); // Added quality parameter
      const pdf = new jsPDF("p", "mm", "a4");

      // Calculate dimensions to fit the content
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // Better scaling calculation
      const widthRatio = pdfWidth / imgWidth;
      const heightRatio = pdfHeight / imgHeight;
      const ratio = Math.min(widthRatio, heightRatio) * 0.95; // 95% to add margins

      const scaledWidth = imgWidth * ratio;
      const scaledHeight = imgHeight * ratio;
      const imgX = (pdfWidth - scaledWidth) / 2;
      const imgY = 10; // Top margin

      // Check if content exceeds one page
      if (scaledHeight > pdfHeight - 20) {
        // Multi-page handling
        let yPosition = 0;
        let pageNumber = 1;

        while (yPosition < imgHeight) {
          if (pageNumber > 1) {
            pdf.addPage();
          }

          const remainingHeight = imgHeight - yPosition;
          const pageContentHeight = Math.min(
            pdfHeight - 20,
            remainingHeight * ratio
          );

          pdf.addImage(
            imgData,
            "PNG",
            imgX,
            imgY,
            scaledWidth,
            pageContentHeight
          );

          yPosition += (pdfHeight - 20) / ratio;
          pageNumber++;
        }
      } else {
        // Single page
        pdf.addImage(imgData, "PNG", imgX, imgY, scaledWidth, scaledHeight);
      }

      // Generate filename with timestamp
      const timestamp = format(new Date(), "yyyyMMdd-HHmmss");
      const dateRange = isDefaultRange
        ? "AllTime"
        : `${format(range[0].startDate, "yyyyMMdd")}-${format(
            range[0].endDate,
            "yyyyMMdd"
          )}`;
      const filename = `Selfiegram-Dashboard-${dateRange}-${timestamp}.pdf`;

      console.log("Saving PDF...", filename);
      pdf.save(filename);

      console.log("PDF generated and downloaded successfully!");

      // Clean up
      try {
        if (document.head.contains(styleElement)) {
          document.head.removeChild(styleElement);
        }
      } catch (e) {
        console.warn("Style cleanup warning:", e);
      }
      setReportData(null);
    } catch (error) {
      console.error("Error generating report:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to generate report: ${errorMessage}. Please try again.`);
    } finally {
      // Ensure cleanup of any temporary elements
      try {
        const styleElement = document.querySelector(
          'style[data-html2canvas="true"]'
        ) as HTMLStyleElement;
        if (styleElement && document.head.contains(styleElement)) {
          document.head.removeChild(styleElement);
        }

        const isolatedElement = document.getElementById(
          "dashboard-report-isolated"
        );
        if (isolatedElement && document.body.contains(isolatedElement)) {
          document.body.removeChild(isolatedElement);
        }
      } catch (cleanupError) {
        console.warn("Cleanup error (non-critical):", cleanupError);
      }

      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="space-y-8 p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative">
        <h1 className="text-lg font-semibold pl-12 sm:pl-0  ">Dashboard</h1>

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
          <div className="flex items-center gap-2 ml-auto">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="flex items-center justify-between p-4 bg-white shadow rounded-lg"
          >
            <div>
              <p className="text-xs text-gray-500 mb-1">{card.label}</p>
              <h2 className="text-lg font-semibold">{card.value}</h2>
              <p className="text-[10px] flex items-center gap-1 mt-1">
                {card.trend.value !== "—" && <TrendArrow up={card.trend.up} />}
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

              <Tooltip formatter={(v: number) => `₱ ${v.toLocaleString()}`} />
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
      <div className="bg-white shadow rounded-lg p-4 overflow-x-auto">
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
                  ? parseFloat(row.revenue.replace("₱", "").replace(",", ""))
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
                          row.trendPositive ? "text-green-500" : "text-red-500"
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
  );
};

export default AdminDashboardContents;
