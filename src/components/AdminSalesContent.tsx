// AdminSalesContent.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  format,
  parseISO,
  isWithinInterval,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import TransactionModal from "../components/AdminModalTransactionDialog";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { DateRange } from "react-date-range";
import type { Range } from "react-date-range";
import CenteredLoader from "./CenteredLoader";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Sale {
  transactionID: number;
  customerName: string;
  package: string;
  transactionDate: string;
  bookingDate: string;
  time: string;
  downPayment: number;
  balance: number;
  totalAmount: number;
  price: number;
  email: string;
  address: string;
  contactNo: string;
  paymentStatus: "Completed" | "Pending" | "Cancelled";
  rating: number;
  feedback: string;
  status: number;
  paymentStatusValue: number;
  selectedAddOns?: string;
  selectedConcepts?: string;
}

const getBookingLabel = (transactionID: number, packageName: string) => {
  const acronym = (packageName || "")
    .split(" ")
    .map((word) => word[0] ?? "")
    .join("")
    .toUpperCase();
  return `${acronym}#${transactionID}`;
};

type PortalDateRangePickerProps = {
  open: boolean;
  anchorRef: React.RefObject<HTMLElement | null>;
  ranges: Range[];
  onChange: (item: any) => void;
  onClose?: () => void;
  maxDate?: Date;
  months?: number;
};

const PortalDateRangePicker: React.FC<PortalDateRangePickerProps> = ({
  open,
  anchorRef,
  ranges,
  onChange,
  onClose,
  maxDate,
  months = 1,
}) => {
  const [pos, setPos] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  useEffect(() => {
    if (!open) return;

    const updatePos = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      const viewportWidth = document.documentElement.clientWidth;
      const preferredWidth = Math.min(360, viewportWidth - 16); // keep margin
      // keep left within viewport
      let left = rect.left + window.scrollX;
      if (left + preferredWidth > window.scrollX + viewportWidth - 8) {
        left = window.scrollX + viewportWidth - preferredWidth - 8;
      }
      if (left < window.scrollX + 8) left = window.scrollX + 8;
      const top = rect.bottom + window.scrollY + 8;
      setPos({ top, left, width: preferredWidth });
    };

    updatePos();
    window.addEventListener("resize", updatePos);
    window.addEventListener("scroll", updatePos, { passive: true });

    return () => {
      window.removeEventListener("resize", updatePos);
      window.removeEventListener("scroll", updatePos);
    };
  }, [open, anchorRef]);

  if (typeof document === "undefined" || !open || !pos) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        width: pos.width,
        zIndex: 99999,
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        background: "white",
        borderRadius: 8,
        padding: 8,
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <DateRange
        ranges={ranges}
        onChange={onChange}
        moveRangeOnFirstSelection={false}
        rangeColors={["#000"]}
        months={months}
        direction="horizontal"
        className="w-full"
        maxDate={maxDate ?? new Date()}
      />

      <div className="mt-2 flex gap-2 justify-end">
        <button
          onClick={() => onClose && onClose()}
          className="px-3 py-1 bg-black text-white rounded text-xs"
        >
          Done
        </button>
      </div>
    </div>,
    document.body
  );
};

const AdminSalesContent: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [packageFilter, setPackageFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [range, setRange] = useState<Range[]>([
    {
      startDate: startOfMonth(new Date()),
      endDate: endOfMonth(new Date()),
      key: "selection",
    },
  ]);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    setLoading(true);
    fetchWithAuth(`${API_URL}/api/sales`)
      .then((res) => res.json())
      .then((data) => {
        const parsedData: Sale[] = (data || []).map((item: any) => ({
          transactionID: item.transactionID,
          customerName: item.customerName,
          package: item.package,
          transactionDate: item.transactionDate,
          bookingDate: item.bookingDate,
          time: item.time,
          downPayment: Number(item.downPayment),
          balance: Number(item.balance),
          totalAmount: Number(item.totalAmount),
          price: Number(item.price),
          paymentStatus: item.paymentStatusLabel,
          email: item.customerEmail,
          address: item.customerAddress,
          contactNo: item.customerContactNo,
          feedback: item.feedback,
          rating: Number(item.rating),
          status: Number(item.status),
          paymentStatusValue: Number(item.paymentStatus),
          selectedAddOns: item.selectedAddOns || '',
          selectedConcepts: item.selectedConcepts || '',
        }));

        // Debug: Log first 3 sales with their add-ons and concepts
        console.log('🔍 AdminSalesContent - API Response Sample:', parsedData.slice(0, 3).map(s => ({
          id: s.transactionID,
          selectedAddOns: s.selectedAddOns,
          selectedConcepts: s.selectedConcepts,
        })));

        setSales(parsedData);
      })
      .catch((err) => console.error("Failed fetching sales:", err))
      .finally(() => setLoading(false));
  }, [API_URL]);

  // unique packages
  const packages = Array.from(new Set(sales.map((s) => s.package))).filter(
    Boolean
  );

  // reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, packageFilter, range]);

  const filtered = useMemo(() => {
    return sales.filter((s) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        s.transactionID.toString().toLowerCase().includes(q) ||
        s.customerName.toLowerCase().includes(q) ||
        s.package.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "All" || s.paymentStatus === statusFilter;
      const matchesPackage =
        packageFilter === "All" || s.package === packageFilter;

      let saleDate: Date;
      if (s.transactionDate) {
        try {
          saleDate = parseISO(s.transactionDate);
        } catch {
          saleDate = new Date(s.transactionDate);
        }
      } else {
        saleDate = new Date();
      }

      const hasStart = Boolean(range[0]?.startDate);
      const hasEnd = Boolean(range[0]?.endDate);

      const matchesDate =
        hasStart && hasEnd
          ? isWithinInterval(saleDate, {
            start: range[0].startDate as Date,
            end: range[0].endDate as Date,
          })
          : true;

      return matchesSearch && matchesStatus && matchesPackage && matchesDate;
    });
  }, [sales, search, statusFilter, packageFilter, range]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const pickerButtonRef = useRef<HTMLButtonElement | null>(null);

  const handleExport = async () => {
  if (filtered.length === 0) {
    toast.warn("No sales data available to export.");
    return;
  }

  setIsGeneratingReport(true);

  setTimeout(async () => {
    try {
      const pdf = new jsPDF("l", "mm", "a4");

      // --- Colors ---
      const primaryColor: [number, number, number] = [31, 41, 55];
      const successColor: [number, number, number] = [16, 185, 129];
      const warningColor: [number, number, number] = [234, 179, 8];
      const errorColor: [number, number, number] = [239, 68, 68];

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const leftMargin = 10;
      const rightMargin = pageWidth - 10;
      let y = 25;

      const checkPageBreak = (needed: number) => {
        if (y + needed > pageHeight - 20) {
          pdf.addPage();
          y = 25;
        }
      };

      // --- Header ---
      pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.rect(0, 0, pageWidth, 30, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("Sales Report", leftMargin, 18);

      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.text("Selfiegram Photo Studios - Malolos, Bulacan", leftMargin, 24);
      pdf.text(`Generated: ${format(new Date(), "PPP p")}`, leftMargin, 28);

      y = 45;

      // --- Section Title ---
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(13);
      pdf.text("Sales Records", leftMargin, y);
      y += 8;

      // --- Table Data ---
      const peso = (value: number): string =>
        `P${value.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

      const salesData = filtered.map((s) => [
        getBookingLabel(s.transactionID, s.package),
        s.customerName,
        s.email || "N/A",
        s.contactNo || "N/A",
        s.package,
        format(parseISO(s.transactionDate), "MMM dd, yyyy"),
        peso(s.downPayment),
        peso(s.balance),
        peso(s.totalAmount),
        s.paymentStatus,
      ]);

      // --- Table (landscape adjusted widths) ---
      autoTable(pdf, {
        startY: y,
        head: [
          [
            "Booking ID",
            "Customer",
            "Email",
            "Contact",
            "Package",
            "Date",
            "Payment",
            "Balance",
            "Total",
            "Status",
          ],
        ],
        body: salesData,
        styles: {
          font: "helvetica",
          fontSize: 8,
          cellPadding: 2,
          overflow: "linebreak",
          lineColor: [230, 230, 230],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 25 },
          2: { cellWidth: 40 },
          3: { cellWidth: 25 },
          4: { cellWidth: 22 },
          5: { cellWidth: 25 },
          6: { cellWidth: 25, halign: "right" },
          7: { cellWidth: 25, halign: "right" },
          8: { cellWidth: 25, halign: "right" },
          9: { cellWidth: 25, halign: "center" },
        },
        margin: { left: leftMargin, right: leftMargin },
        tableWidth: "auto",
      });

      y =
        (pdf as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable
          ?.finalY ?? y + 10;
      checkPageBreak(50);

      // --- Summary Section ---
      const totalAmount = filtered.reduce((sum, s) => sum + s.totalAmount, 0);
      const totalDown = filtered.reduce((sum, s) => sum + s.downPayment, 0);
      const totalBalance = filtered.reduce((sum, s) => sum + s.balance, 0);

      const statusCounts = {
        Completed: filtered.filter((s) => s.paymentStatus === "Completed").length,
        Pending: filtered.filter((s) => s.paymentStatus === "Pending").length,
        Cancelled: filtered.filter((s) => s.paymentStatus === "Cancelled").length,
      };

      y += 15;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.text("Summary Report", leftMargin, y);
      y += 6;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Total Sales Amount: ${peso(totalAmount)}`, leftMargin, y);
      y += 5;
      pdf.text(`Total Downpayment: ${peso(totalDown)}`, leftMargin, y);
      y += 5;
      pdf.text(`Total Balance: ${peso(totalBalance)}`, leftMargin, y);
      y += 8;

      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.text("Booking Status Breakdown", leftMargin, y);
      y += 6;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);

      pdf.setTextColor(successColor[0], successColor[1], successColor[2]);
      pdf.text(`Completed: ${statusCounts.Completed}`, leftMargin, y);
      y += 5;

      pdf.setTextColor(warningColor[0], warningColor[1], warningColor[2]);
      pdf.text(`Pending: ${statusCounts.Pending}`, leftMargin, y);
      y += 5;

      pdf.setTextColor(errorColor[0], errorColor[1], errorColor[2]);
      pdf.text(`Cancelled: ${statusCounts.Cancelled}`, leftMargin, y);
      y += 10;

      // --- Footer ---
      pdf.setDrawColor(209, 213, 219);
      pdf.line(leftMargin, pageHeight - 10, rightMargin, pageHeight - 10);
      pdf.setTextColor(107, 114, 128);
      pdf.setFontSize(8);
      pdf.text("Generated by Selfiegram Admin System", leftMargin, pageHeight - 5);

      const timestamp = format(new Date(), "yyyyMMdd-HHmmss");
      pdf.save(`Selfiegram-Sales-Report-${timestamp}.pdf`);

      toast.success("Sales report exported successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate sales report.");
    } finally {
      setIsGeneratingReport(false);
    }
  }, 1000);
};




  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-lg sm:text-xl font-semibold pl-12 sm:pl-0">
          Sales
        </h1>
      </div>

      {/* Filters */}
      <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
        <div className="relative w-full sm:w-64">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-2 top-2.5 text-gray-400 text-sm"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="pl-7 pr-3 py-2 border rounded-md w-full"
          />
        </div>

        <div className="relative w-full sm:w-auto">
          <button
            onClick={() => setFiltersOpen((prev) => !prev)}
            className="flex items-center justify-between w-full sm:w-auto border px-3 py-2 rounded-md bg-gray-50 hover:bg-gray-100 text-xs"
          >
            Filters
            <motion.span
              animate={{ rotate: filtersOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="ml-2"
            >
              <ChevronDown size={16} />
            </motion.span>
          </button>

          <AnimatePresence>
            {filtersOpen && (
              <motion.div
                initial={{ opacity: 0, scaleY: 0.95 }}
                animate={{ opacity: 1, scaleY: 1 }}
                exit={{ opacity: 0, scaleY: 0.95 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="absolute left-1/2 -translate-x-1/2 mt-2 w-full sm:w-auto origin-top z-40"
              >
                <div className="p-3 bg-white rounded-md shadow-lg grid gap-4 text-xs">
                  <div className="grid gap-3 sm:flex sm:items-center sm:gap-4">
                    <label className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 w-full sm:w-auto">
                      <span className="font-medium">Status:</span>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-2 py-2 border rounded-md w-full sm:w-auto"
                      >
                        <option value="All">All</option>
                        <option value="Completed">Completed</option>
                        <option value="Pending">Pending</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </label>

                    <label className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 w-full sm:w-auto">
                      <span className="font-medium">Package:</span>
                      <select
                        value={packageFilter}
                        onChange={(e) => setPackageFilter(e.target.value)}
                        className="px-2 py-2 border rounded-md w-full sm:w-auto"
                      >
                        <option value="All">All</option>
                        {packages.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="relative w-full">
                    <button
                      type="button"
                      ref={pickerButtonRef}
                      onClick={() => setPickerOpen((prev) => !prev)}
                      className="w-full border px-3 py-2 rounded-md bg-white shadow-sm hover:bg-gray-100 transition text-left"
                    >
                      {format(range[0].startDate ?? new Date(), "MMM dd yyyy")}{" "}
                      — {format(range[0].endDate ?? new Date(), "MMM dd yyyy")}
                    </button>

                    <PortalDateRangePicker
                      open={pickerOpen}
                      anchorRef={pickerButtonRef}
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
                      }}
                      onClose={() => setPickerOpen(false)}
                      maxDate={new Date()}
                      months={1}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Table container */}
      <div className="bg-white rounded-2xl shadow-md flex flex-col h-[calc(90vh-70px)]">
        {/* Scrollable table */}
        <div className="overflow-auto flex-1">
          <table className="min-w-full table-auto text-left text-sm border-collapse">
            <thead className="bg-gray-50 text-gray-700 font-semibold">
              <tr className="h-[40px]">
                <th className="px-4 py-2 text-xs">ID</th>
                <th className="px-4 py-2 text-xs">Customer Name</th>
                <th className="px-4 py-2 text-xs">Package</th>
                <th className="px-4 py-2 text-xs">Date</th>
                <th className="px-4 py-2 text-xs">Payment</th>
                <th className="px-4 py-2 text-xs">Balance</th>
                <th className="px-4 py-2 text-xs">Total Amount</th>
                <th className="px-4 py-2 text-xs">Payment Status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center text-gray-500 py-10 text-sm"
                  >
                    <CenteredLoader message="Loading sales..." />
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center text-gray-400 py-10 text-sm"
                  >
                    No sales found.
                  </td>
                </tr>
              ) : (
                paginated.map((s, idx) => (
                  <tr
                    key={idx}
                    onClick={() =>
                      setSelectedSale({
                        id: s.transactionID,
                        customerName: s.customerName,
                        email: s.email,
                        address: s.address,
                        contact: s.contactNo,
                        package: s.package,
                        bookingDate: s.bookingDate,
                        transactionDate: s.transactionDate,
                        time: s.time,
                        subtotal: s.totalAmount,
                        price: s.price,
                        balance: s.balance,
                        feedback: s.feedback,
                        rating: s.rating,
                        status: s.status,
                        paymentStatus: s.paymentStatusValue,
                        selectedAddOns: s.selectedAddOns,
                        selectedConcepts: s.selectedConcepts,
                      })
                    }
                    className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer transition"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                      {getBookingLabel(s.transactionID, s.package)}
                    </td>
                    <td className="px-6 py-4 text-sm">{s.customerName}</td>
                    <td className="px-6 py-4 text-sm">{s.package}</td>
                    <td className="px-6 py-4 text-sm">
                      {format(parseISO(s.transactionDate), "MMMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4 text-sm">{s.downPayment.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm">{s.balance.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm">{s.totalAmount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-medium ${s.paymentStatus === "Completed"
                          ? "bg-green-100 text-green-700"
                          : s.paymentStatus === "Cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                          }`}
                      >
                        {s.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination at bottom like Gallery */}
        <div className="flex justify-between items-center gap-3 px-4 py-10 bg-gray-50 text-sm rounded-b-2xl">
          {/* Showing count */}
          <span className="text-gray-600">
            Showing {(page - 1) * pageSize + 1} -{" "}
            {Math.min(page * pageSize, filtered.length)} of {filtered.length}
          </span>

          {/* Rows per page + Prev/Next */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
                >
                  &lt;
                </button>
                <div className="text-xs text-gray-600">
                  {page} / {totalPages}
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
                >
                  &gt;
                </button>
              </div>

              <label htmlFor="pageSize" className="text-gray-600 text-xs">
                Rows per page:
              </label>
              <select
                id="pageSize"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="border rounded-md px-2 py-1 text-xs"
              >
                {[5, 10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>

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
        </div>
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={selectedSale !== null}
        data={selectedSale}
        onClose={() => setSelectedSale(null)}
        onSaved={() => {
          // Refresh sales data after payment
          fetchWithAuth(`${API_URL}/api/sales`)
            .then((res) => res.json())
            .then((data) => {
              const parsedData: Sale[] = (data || []).map((item: any) => ({
                transactionID: item.transactionID,
                customerName: item.customerName,
                package: item.package,
                transactionDate: item.transactionDate,
                bookingDate: item.bookingDate,
                time: item.time,
                downPayment: Number(item.downPayment),
                balance: Number(item.balance),
                totalAmount: Number(item.totalAmount),
                price: Number(item.price),
                paymentStatus: item.paymentStatusLabel,
                email: item.customerEmail,
                address: item.customerAddress,
                contactNo: item.customerContactNo,
                feedback: item.feedback,
                rating: Number(item.rating),
                status: Number(item.status),
                paymentStatusValue: Number(item.paymentStatus),
                selectedAddOns: item.selectedAddOns || '',
                selectedConcepts: item.selectedConcepts || '',
              }));
              setSales(parsedData);
            })
            .catch((err) => console.error("Failed refreshing sales:", err));
        }}
      />
    </div>
  );
};

export default AdminSalesContent;
