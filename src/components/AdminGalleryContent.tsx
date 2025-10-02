import { useEffect, useState } from "react";
import axios from "axios";
import { Upload } from "lucide-react";
import GalleryModal from "./GalleryModal"; // adjust path if needed
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const ITEMS_PER_PAGE = 8;
const API_URL = import.meta.env.VITE_API_URL;

const AdminGalleryContent: React.FC = () => {
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${API_URL}/api/admin/completed-appointments`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        const data = Array.isArray(response.data) ? response.data : [];

        const formatted = data.map((item: any) => ({
          id: item.id,
          userID: item.userID,
          packageID: item.packageID,
          username: item.username,
          packageName: item.package,
          image: null,
          dateTime: item.bookingDate,
          price: `₱${parseFloat(item.price ?? 0).toFixed(2)}`,
          customerName: item.customerName,
          bookingStartTime: item.bookingStartTime,
          bookingEndTime: item.bookingEndTime,
          status: item.status,
        }));

        setHistoryData(formatted);
      } catch (error) {
        console.error(
          "Failed to fetch history, using placeholder data:",
          error
        );
        // optionally setHistoryData with fallback mock data here
      }
    };

    fetchHistory();
  }, []);

  // filtering logic
  const filteredData = historyData
    .filter((item) => {
      if (!search) return true;
      const query = search.toLowerCase();
      // only check stringifiable fields to avoid "[object Object]" matches
      return (
        String(item.id).toLowerCase().includes(query) ||
        String(item.packageName ?? "")
          .toLowerCase()
          .includes(query) ||
        String(item.customerName ?? "")
          .toLowerCase()
          .includes(query) ||
        String(item.username ?? "")
          .toLowerCase()
          .includes(query) ||
        String(item.dateTime ?? "")
          .toLowerCase()
          .includes(query)
      );
    })
    .sort((a, b) => {
      if (statusFilter === "Most Recent") {
        return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
      }
      if (statusFilter === "Package") {
        return (a.packageName ?? "").localeCompare(b.packageName ?? "");
      }
      if (statusFilter === "Customer") {
        return (a.customerName ?? "").localeCompare(b.customerName ?? "");
      }
      return 0;
    });

  // pagination
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const totalPages = Math.max(
    1,
    Math.ceil(filteredData.length / ITEMS_PER_PAGE)
  );

  const handleView = (item: any) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const formatTime = (time?: string) => {
    if (!time) return "N/A";
    const date = new Date(`1970-01-01T${time}`);
    if (Number.isNaN(date.getTime())) return time;
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getBookingLabel = (bookingID: number, packageName: string) => {
    const acronym = (packageName ?? "")
      .split(" ")
      .map((word) => (word ? word[0] : ""))
      .join("")
      .toUpperCase();
    return `${acronym}#${bookingID}`;
  };

  return (
    <div className="p-4 animate-fadeIn">
      <h1 className="text-lg sm:text-xl font-semibold pl-12 sm:pl-2 mb-5">
        Customer Gallery
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 text-xs items-center mb-4">
        <div className="relative">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-2 top-2.5 text-gray-400 text-sm"
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search"
            className="pl-7 pr-3 py-2 border rounded-md w-48 text-sm"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-2 pr-4 py-2 border rounded-md text-sm"
        >
          <option>All</option>
          <option>Most Recent</option>
          <option>Package</option>
          <option>Customer</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-md flex flex-col h-[calc(90vh-70px)]">
        {/* Scrollable table */}
        <div className="overflow-auto flex-1">
          <table className="min-w-full table-auto text-left text-sm border-collapse">
            <thead className="bg-gray-50 text-gray-700 font-semibold">
              <tr className="h-[40px]">
                <th className="px-2 py-1 text-xs">ID</th>
                <th className="px-2 py-1 text-xs">Package Name</th>
                <th className="px-2 py-1 text-xs">Customer Name</th>
                <th className="px-2 py-1 text-xs">Booking Date</th>
                <th className="px-2 py-1 text-xs">Booking Time</th>
                <th className="px-2 py-1 text-xs text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.length === 0 ? (
                <tr className="h-[40px]">
                  <td
                    colSpan={6}
                    className="px-2 text-xs text-center text-gray-400"
                  >
                    No records found.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, idx) => (
                  <tr
                    key={item.id ?? idx}
                    className="border-t border-gray-100 hover:bg-gray-50 transition-all h-[40px]"
                  >
                    <td className="px-2 align-middle text-xs truncate">
                      {getBookingLabel(item.id, item.packageName)}
                    </td>
                    <td className="px-2 align-middle text-xs truncate">
                      {item.packageName ?? ""}
                    </td>
                    <td className="px-2 align-middle text-xs truncate">
                      {item.customerName ?? (
                        <em className="text-gray-400">N/A</em>
                      )}
                    </td>
                    <td className="px-2 align-middle text-xs truncate">
                      {formatDate(item.dateTime)}
                    </td>
                    <td className="px-2 align-middle text-xs truncate">
                      {item.bookingStartTime && item.bookingEndTime
                        ? `${formatTime(item.bookingStartTime)} - ${formatTime(
                            item.bookingEndTime
                          )}`
                        : "N/A"}
                    </td>
                    <td className="px-2 text-center">
                      <div className="flex justify-center items-center">
                        <button
                          onClick={() => handleView(item)}
                          className="p-1 text-gray-600 hover:text-blue-800"
                          title="Upload Photos"
                        >
                          <Upload className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination fixed at bottom */}
        <div className="flex justify-end items-center gap-2 px-4 py-3 ">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
          >
            &lt;
          </button>
          <div className="text-xs text-gray-600">
            {currentPage} / {totalPages}
          </div>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
          >
            &gt;
          </button>
        </div>
      </div>

      {/* Gallery Modal */}
      {showModal && selectedItem && (
        <GalleryModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          booking={selectedItem}
        />
      )}
    </div>
  );
};

export default AdminGalleryContent;
