import React, { useMemo, useState } from "react";
import { format, parse, isWithinInterval } from "date-fns";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import TransactionModal from "../components/ModalTransactionDialog";

interface Sale {
  id: string;
  customerName: string;
  package: string;
  date: string;
  time: string;
  downPayment: number;
  paidBalance: number;
  totalAmount: number;
  paymentStatus: "Completed" | "Pending";
}

const mockSales: Sale[] = Array.from({ length: 78 }, (_, i) => ({
  id: `S${i % 2 === 0 ? "FO" : "FT"}#${(i + 1).toString().padStart(3, "0")}`,
  customerName: "Ian Conception",
  package: i % 2 === 0 ? "Selfie for ONE" : "Selfie for TWO",
  date: `2025-04-${(18 + (i % 10)).toString().padStart(2, "0")}`,
  time: "1:00 NN - 1:30 pm",
  downPayment: 200,
  paidBalance: i % 3 === 0 ? 200 : 399,
  totalAmount: 399,
  paymentStatus: i % 3 === 0 ? "Pending" : "Completed",
}));

const AdminSalesContent: React.FC = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [packageFilter, setPackageFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [range, setRange] = useState([
    {
      startDate: new Date("2025-04-18"),
      endDate: new Date("2025-04-27"),
      key: "selection",
    },
  ]);

  const packages = Array.from(new Set(mockSales.map((s) => s.package)));

  const filtered = useMemo(() => {
    return mockSales.filter((s) => {
      const matchesSearch =
        s.id.toLowerCase().includes(search.toLowerCase()) ||
        s.customerName.toLowerCase().includes(search.toLowerCase()) ||
        s.package.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || s.paymentStatus === statusFilter;

      const matchesPackage =
        packageFilter === "All" || s.package === packageFilter;

      const saleDate = parse(s.date, "yyyy-MM-dd", new Date());
      const matchesDate = isWithinInterval(saleDate, {
        start: range[0].startDate,
        end: range[0].endDate,
      });

      return matchesSearch && matchesStatus && matchesPackage && matchesDate;
    });
  }, [search, statusFilter, packageFilter, range]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold">Sales</h1>
        <button className="px-4 py-2 bg-black text-white text-sm rounded-md hover:opacity-80 transition">
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

        {/* Date Range Picker */}
        <div className="relative text-xs">
          <button
            onClick={() => setPickerOpen((prev) => !prev)}
            className="border px-3 py-2 rounded-md bg-white shadow-sm hover:bg-gray-100 transition"
          >
            {format(range[0].startDate, "MMM dd yyyy")} —{" "}
            {format(range[0].endDate, "MMM dd yyyy")}
          </button>
          {pickerOpen && (
            <div className="absolute z-20 mt-2 bg-white shadow-lg rounded-md p-3">
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

      {/* Table Variant A: Scrollable Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full text-xs">
          <thead className="bg-gray-100 text-left text-gray-600">
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Customer Name</th>
              <th className="px-4 py-2">Package</th>
              <th className="px-4 py-2">Date & Time</th>
              <th className="px-4 py-2">Down Payment</th>
              <th className="px-4 py-2">Paid Balance</th>
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
                    id: s.id,
                    customerName: s.customerName,
                    email: "ian@example.com",
                    address: "123 Sample Street",
                    contact: "09171234567",
                    package: s.package,
                    date: s.date,
                    time: s.time,
                    subtotal: s.totalAmount,
                    paidAmount: s.downPayment + s.paidBalance,
                    feedback: "Great experience!",
                    rating: s.paidBalance < s.totalAmount ? 4 : 5,
                  })
                }
              >
                <td className="px-4 py-2 whitespace-nowrap">{s.id}</td>
                <td className="px-4 py-2">{s.customerName}</td>
                <td className="px-4 py-2">{s.package}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  {format(
                    parse(s.date, "yyyy-MM-dd", new Date()),
                    "MMMM d, yyyy"
                  )}
                  <br />[{s.time}]
                </td>
                <td className="px-4 py-2">{s.downPayment.toFixed(2)}</td>
                <td className="px-4 py-2">{s.paidBalance.toFixed(2)}</td>
                <td className="px-4 py-2">{s.totalAmount.toFixed(2)}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded-md text-xs font-medium ${
                      s.paymentStatus === "Completed"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
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

      {/* Pagination Controls */}
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
