import { useEffect, useState } from "react";
import axios from "axios";
import { Eye, Trash2 } from "lucide-react";
import ModalTransactionDialog from "./ModalTransactionDialog"; // adjust path if needed
import GalleryModal from "./GalleryModal"; // adjust path if needed
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const ITEMS_PER_PAGE = 5;
const API_URL = import.meta.env.VITE_API_URL;

const AdminGalleryContent = () => {
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [itemToDelete, setItemToDelete] = useState<any | null>(null);
  // Removed unused rawBookingMap state
  const [search, setSearch] = useState(""); // Added search state
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchHistory = async () => {
    try {
      const user_id = localStorage.getItem("userID");
      const token = localStorage.getItem("token");
      console.log(user_id);
      const response = await axios.get(
        `${API_URL}/api/booking/history/${user_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data as any[];

      const formatted = data.map((item: any) => ({
        id: item.bookingID,
        packageName: item.packageName,
        image: null,
        dateTime: item.dateTime,
        price: `₱${parseFloat(item.price).toFixed(2)}`,
        feedback: item.feedback ?? null,
        rating: item.rating ?? null,
        status: item.status,
        paymentStatus: item.paymentStatus,
        paidAmount: item.paidAmount,
        pendingBalance: item.pendingBalance,
      }));

      // Removed rawMap and setRawBookingMap since rawBookingMap is unused
      setHistoryData(formatted);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  };

  //useEffect(() => {
  //  fetchHistory();
  //}, []);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const user_id = localStorage.getItem("userID");
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${API_URL}/api/booking/history/${user_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = response.data as any[];

        const formatted = data.map((item: any) => ({
          id: item.bookingID,
          packageName: item.packageName,
          image: null,
          dateTime: item.dateTime,
          price: `₱${parseFloat(item.price).toFixed(2)}`,
          feedback: item.feedback ?? null,
          rating: item.rating ?? null,
          status: item.status,
          paymentStatus: item.paymentStatus,
          paidAmount: item.paidAmount,
          pendingBalance: item.pendingBalance,
        }));

        setHistoryData(formatted);
      } catch (error) {
        console.error(
          "Failed to fetch history, using placeholder data:",
          error
        );

        // ✅ Temporary placeholder data
        const placeholderData = [
          {
            id: 1,
            packageName: "Basic",
            dateTime: new Date().toISOString(),
            price: "₱1500.00",
            feedback: "Great service!",
            rating: 4,
            status: "Completed",
            paymentStatus: "Paid",
            paidAmount: "₱1500.00",
            pendingBalance: "₱0.00",
          },
          {
            id: 2,
            packageName: "Premium",
            dateTime: new Date().toISOString(),
            price: "₱3000.00",
            feedback: null,
            rating: 0,
            status: "Pending",
            paymentStatus: "Unpaid",
            paidAmount: "₱0.00",
            pendingBalance: "₱3000.00",
          },
          {
            id: 3,
            packageName: "Deluxe",
            dateTime: new Date().toISOString(),
            price: "₱5000.00",
            feedback: "Absolutely worth it!",
            rating: 5,
            status: "Completed",
            paymentStatus: "Paid",
            paidAmount: "₱5000.00",
            pendingBalance: "₱0.00",
          },
          {
            id: 4,
            packageName: "Basic",
            dateTime: new Date().toISOString(),
            price: "₱1500.00",
            feedback: null,
            rating: 3,
            status: "Completed",
            paymentStatus: "Paid",
            paidAmount: "₱1500.00",
            pendingBalance: "₱0.00",
          },
          {
            id: 5,
            packageName: "Premium",
            dateTime: new Date().toISOString(),
            price: "₱3000.00",
            feedback: "Needs improvement.",
            rating: 2,
            status: "Cancelled",
            paymentStatus: "Refunded",
            paidAmount: "₱0.00",
            pendingBalance: "₱0.00",
          },
        ];

        setHistoryData(placeholderData);
      }
    };

    fetchHistory();
  }, []);

  const paginatedData = historyData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const totalPages = Math.ceil(historyData.length / ITEMS_PER_PAGE);
  const token = localStorage.getItem("token");

  const handleView = async (item: any) => {
    try {
      const response = await axios.get(`${API_URL}/api/booking/${item.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const fullData = response.data;

      const mergedItem = {
        ...item,
        ...(typeof fullData === "object" && fullData !== null ? fullData : {}),
      };

      setSelectedItem(mergedItem);
      setShowModal(true);
    } catch (error) {
      console.error("Failed to fetch full booking data:", error);
    }
  };

  const handleDelete = (item: any) => {
    setItemToDelete(item);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${API_URL}/api/booking/${itemToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setHistoryData((prev) =>
        prev.filter((item) => item.id !== itemToDelete.id)
      );

      setItemToDelete(null);
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };
  const formatTime = (time: string) => {
    const date = new Date(`1970-01-01T${time}`);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getBookingLabel = (bookingID: number, packageName: string) => {
    const acronym = packageName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
    return `${acronym}#${bookingID}`;
  };

  return (
    <div className="p-4 animate-fadeIn">
      <h1 className="text-2xl font-semibold mb-4 ml-5">History</h1>

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
          className="px-2 pr-4 py-2 border rounded-md"
        >
          <option>Filter By:</option>
          <option>Most Recent</option>
          <option>Package</option>
          <option>Client</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-md overflow-x-auto h-[calc(100vh-20vh)]">
        <table className="min-w-full table-auto text-left text-sm">
          <thead className="bg-gray-50 text-gray-700 font-semibold">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Package Name</th>
              <th className="p-4">Date</th>
              <th className="p-4">Time</th>
              <th className="p-4">Customer Name</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, idx) => (
              <tr
                key={idx}
                className="border-t border-gray-100 hover:bg-gray-50 transition-all"
              >
                {/* ID */}
                <td className="p-4">
                  {getBookingLabel(item.id, item.packageName)}
                </td>

                {/* Package Name */}
                <td className="p-4">{item.packageName}</td>

                {/* Date */}
                <td className="p-4">{formatDate(item.dateTime)}</td>

                {/* Time */}
                <td className="p-4">
                  {item.bookingStartTime && item.bookingEndTime
                    ? `${formatTime(item.bookingStartTime)} - ${formatTime(
                        item.bookingEndTime
                      )}`
                    : "N/A"}
                </td>

                {/* Customer Name */}
                <td className="p-4">
                  {item.customerName ? (
                    item.customerName
                  ) : (
                    <em className="text-gray-400">N/A</em>
                  )}
                </td>

                {/* Action buttons */}
                <td className="p-4 text-center flex gap-2 justify-center">
                  <button
                    className="text-gray-600 hover:text-blue-700 transition"
                    onClick={() => handleView(item)}
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    className="text-gray-600 hover:text-red-500 transition"
                    onClick={() => handleDelete(item)}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-end items-center gap-2 px-4 py-3 bottom-0">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
          >
            &lt;
          </button>
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
      {showModal && (
        <GalleryModal isOpen={showModal} onClose={() => setShowModal(false)} />
      )}

      {/* Delete Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full animate-fadeIn">
            <h2 className="text-lg font-semibold mb-4">
              Are you sure you want to delete this history item?
            </h2>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 text-sm rounded-md bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm rounded-md bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGalleryContent;
