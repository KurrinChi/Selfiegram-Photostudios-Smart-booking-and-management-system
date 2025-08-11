import React, { useEffect, useMemo, useState } from "react";
import { format, parse, isWithinInterval } from "date-fns";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import TransactionModal from "../components/AdminModalTransactionDialog";

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
}

const getBookingLabel = (transactionID: number, packageName: string) => {
    const acronym = packageName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
    return `${acronym}#${transactionID}`;
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
  const [range, setRange] = useState<[{ startDate: Date; endDate: Date; key: string }]>([
    {
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-12-31"),
      key: "selection",
    },
  ]);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${API_URL}/api/sales`)
      .then((res) => res.json())
      .then((data) => {
        const parsedData: Sale[] = data.map((item: any) => ({
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
          paymentStatus: item.paymentStatus,
          email: item.customerEmail,
          address: item.customerAddress,
          contactNo: item.customerContactNo,
          feedback: item.feedback,
          rating: Number(item.rating),
        }));
        setSales(parsedData);
      });
  }, []);

  const packages = Array.from(new Set(sales.map((s) => s.package)));

  const filtered = useMemo(() => {
    return sales.filter((s) => {
      const matchesSearch =
        s.transactionID.toString().toLowerCase().includes(search.toLowerCase()) ||
        s.customerName.toLowerCase().includes(search.toLowerCase()) ||
        s.package.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || s.paymentStatus === statusFilter;

      const matchesPackage =
        packageFilter === "All" || s.package === packageFilter;

      const saleDate = parse(s.transactionDate, "yyyy-MM-dd", new Date());
      const matchesDate = isWithinInterval(saleDate, {
        start: range[0].startDate,
        end: range[0].endDate,
      });

      return matchesSearch && matchesStatus && matchesPackage && matchesDate;
    });
  }, [sales, search, statusFilter, packageFilter, range]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleExport = () => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const totalPayment = filtered.reduce((acc, s) => acc + s.downPayment, 0);
  const pendingCount = filtered.filter((s) => s.paymentStatus === "Pending").length;
  const completedCount = filtered.filter((s) => s.paymentStatus === "Completed").length
  const cancelledCount = filtered.filter((s) => s.paymentStatus === "Cancelled").length

  const htmlContent = `
    <html>
      <head>
        <title>Sales Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h2 { text-align: center;  margin: 0; padding: 0; }
          h5 { text-align: center;  margin: 0; padding: 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
          th, td { border: 1px solid #ccc; padding: 6px; text-align: left; vertical-align: top; }
          th { background-color: #f2f2f2; text-align: center;}
          tfoot td { font-weight: bold; }
          .summary { margin: 2px 0 5px 0; font-size: 13px }
          .summary p { margin: 2px 0; padding: 0; }
        </style>
      </head>
      <body>
        <h2>Sales Report</h2>
        <h5>${format(range[0].startDate, "MMM dd yyyy")} - ${format(range[0].endDate, "MMM dd yyyy")}</h5>
        <div class="summary">
          <p><strong>Completed:</strong> ${completedCount}</p>
          <p><strong>Pending:</strong> ${pendingCount}</p>
          <p><strong>Cancelled:</strong> ${cancelledCount}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer Name</th>
              <th>Email</th>
              <th>Contact No.</th>
              <th>Package</th>
              <th>Date</th>
              <th>Payment</th>
              <th>Balance</th>
              <th>Total Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${filtered
              .map(
                (s) => `
              <tr>
                <td>${getBookingLabel(s.transactionID, s.package)}</td>
                <td>${s.customerName}</td>
                <td>${s.email || "-"}</td>
                <td>${s.contactNo || "-"}</td>
                <td>${s.package}</td>
                <td>${format(parse(s.transactionDate, "yyyy-MM-dd", new Date()), "MMMM d, yyyy")}</td>
                <td>${s.downPayment.toFixed(2)}</td>
                <td>${s.balance.toFixed(2)}</td>
                <td>${s.totalAmount.toFixed(2)}</td>
                <td>${s.paymentStatus}</td>
              </tr>`
              )
              .join("")}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="9" style="text-align:right">TOTAL PAYMENT:</td>
              <td colspan="2">${totalPayment.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
};


  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold">Sales</h1>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-black text-white text-sm rounded-md hover:opacity-80 transition"
        >
          Export Data
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 text-xs items-center">
        <div className="relative">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-2 top-2.5 text-gray-400 text-sm"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="pl-7 pr-3 py-2 border rounded-md w-48"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-2 py-2 border rounded-md"
        >
          <option>All</option>
          <option>Completed</option>
          <option>Pending</option>
          <option>Cancelled</option>
        </select>

        <select
          value={packageFilter}
          onChange={(e) => setPackageFilter(e.target.value)}
          className="px-2 py-2 border rounded-md"
        >
          <option>All</option>
          {packages.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>

        <div className="relative text-xs">
          <button
            onClick={() => setPickerOpen((prev) => !prev)}
            className="border px-3 py-2 rounded-md bg-white shadow-sm hover:bg-gray-100 transition"
          >
            {format(range[0].startDate, "MMM dd yyyy")} —{" "}
            {format(range[0].endDate, "MMM dd yyyy")}
          </button>
          {pickerOpen && (
            <div className="fixed z-20 mt-2 bg-white shadow-lg rounded-md p-3">
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
                }}
                moveRangeOnFirstSelection={false}
                rangeColors={["#000"]}
                maxDate={new Date("2025-12-31")}
              />
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full text-xs">
          <thead className="bg-gray-100 text-left text-gray-600">
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Customer Name</th>
              <th className="px-4 py-2">Package</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Payment</th>
              <th className="px-4 py-2">Balance</th>
              <th className="px-4 py-2">Total Amount</th>
              <th className="px-4 py-2">Payment Status</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((s, idx) => (
              <tr
                key={idx}
                className="border-t hover:bg-gray-50 cursor-pointer"
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
                  })
                }
              >
                <td className="px-4 py-2 whitespace-nowrap">{getBookingLabel(s.transactionID, s.package)}</td>
                <td className="px-4 py-2">{s.customerName}</td>
                <td className="px-4 py-2">{s.package}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <br />
                  {format(parse(s.transactionDate, "yyyy-MM-dd", new Date()), "MMMM d, yyyy")}
                  <br />
                  <br />
                </td>
                <td className="px-4 py-2">{Number(s.downPayment).toFixed(2)}</td>
                <td className="px-4 py-2">{Number(s.balance).toFixed(2)}</td>
                <td className="px-4 py-2">{Number(s.totalAmount).toFixed(2)}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded-md text-xs font-medium ${
                      s.paymentStatus === "Completed"
                        ? "bg-green-100 text-green-600"
                        : s.paymentStatus === "Cancelled"
                          ? "bg-red-100 text-red-600"
                          : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {s.paymentStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between text-xs mt-4">
        <span>
          Showing {(page - 1) * pageSize + 1}-
          {Math.min(page * pageSize, filtered.length)} of {filtered.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            {"<"}
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-2 py-1 rounded ${
                page === i + 1 ? "bg-black text-white" : "border"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            {">"}
          </button>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="px-2 py-1 border rounded"
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}/Page
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={selectedSale !== null}
        data={selectedSale}
        onClose={() => setSelectedSale(null)}
      />
    </div>
  );
};

export default AdminSalesContent;
