import React, { useEffect, useState } from "react";
import axios from "axios";
import { Eye, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ModalTransactionDialog from "./ModalTransactionDialog"; // adjust path if needed

const ITEMS_PER_PAGE = 5;
const API_URL = import.meta.env.VITE_API_URL;
const ClientHistoryPageContent = () => {
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [itemToDelete, setItemToDelete] = useState<any | null>(null);
  const [rawBookingMap, setRawBookingMap] = useState<{ [id: number]: any }>({});
  const [loading, setLoading] = useState(false);
  
  const fetchHistory = async () => {
    setLoading(true);
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
        displayPrice: `₱${parseFloat(item.price).toFixed(2)}`, // for table only
        feedback: item.feedback ?? null,
        rating: item.rating ?? null,
        status: item.status,
        paymentStatus: item.paymentStatus,
        subtotal: toNumber(item.subTotal),
        total: toNumber(item.total),
        paidAmount: toNumber(item.receivedAmount),
        pendingBalance: toNumber(item.rem),
        customerName: item.customerName,
        customerEmail: item.customerEmail,
        customerAddress: item.customerAddress,
        customerContactNo: item.customerContactNo,
        bookingDate: item.bookingDate,
        bookingStartTime: item.bookingStartTime,
        bookingEndTime: item.bookingEndTime,
        selectedAddOns: item.selectedAddOns || [],
        selectedConcepts: item.selectedConcepts || []
      }));

      const rawMap: { [id: number]: any } = {};
      data.forEach((item) => {
        rawMap[item.bookingID] = item;
      });

      setRawBookingMap(rawMap);
      setHistoryData(formatted);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    
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
        const response = await axios.get(
          `${API_URL}/api/booking/${item.id}`,
          {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
        );

        const fullData = response.data;

        const mergedItem = {
          ...item,
          ...(typeof fullData === "object" && fullData !== null ? fullData : {}),
    
        };

        setSelectedItem(mergedItem);
        setShowModal(true);
      } catch (error) {
        console.error("Failed to fetch full transaction data:", error);
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
        setHistoryData((prev) => prev.filter((item) => item.id !== itemToDelete.id));

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

const toNumber = (value: any): number => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};


  return (
    <div className="p-4 animate-fadeIn">
  <h1 className="text-2xl font-semibold mb-4">History</h1>
  {loading ? (
    <div className="text-center text-gray-500">Loading history...</div>
  ) : historyData.length === 0 ? (
    <div className="text-center text-gray-500 border border-dashed py-20 rounded-md">
      <p className="mb-4">No transactions made yet.</p>
      <button
        onClick={() => navigate("/client/packages")}
        className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition"
      >
        Book A Package Here
      </button>
    </div>
  ) : (
    <div className="bg-white rounded-2xl shadow-md overflow-x-auto h-[calc(100vh-20vh)]">
      <table className="min-w-full table-auto text-left text-sm">
        <thead className="bg-gray-50 text-gray-700 font-semibold">
          <tr>
            <th className="p-4">Package Name</th>
            <th className="p-4">Transaction Date</th>
            <th className="p-4">Price</th>
            <th className="p-4">ID</th>
            <th className="p-4">Feedback</th>
            <th className="p-4 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((item, idx) => (
            <tr
              key={idx}
              className="border-t border-gray-100 hover:bg-gray-50 transition-all"
            >
              <td className="p-4 flex items-center gap-3">{item.packageName}</td>
              <td className="p-4">{formatDate(item.dateTime)}</td>
              <td className="p-4">{item.displayPrice}</td>
              <td className="p-4">{getBookingLabel(item.id, item.packageName)}</td>
              <td className="p-4">
                {item.rating === null || item.rating === 0 ? (
                  <em className="text-gray-400">No Rating Yet</em>
                ) : (
                  <StarRating rating={item.rating} />
                )}
              </td>
              <td className="p-4 text-center flex gap-2 justify-center">
                <button
                  className="text-gray-600 hover:text-gray-300 transition"
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
      <div className="flex justify-end items-center gap-2 px-4 py-3">
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
  )}


      {/* View Modal */}
      {showModal && selectedItem && (

        <ModalTransactionDialog
  isOpen={showModal}
  data={{
    id: selectedItem.id,
    customerName: selectedItem.customerName || "N/A",
    email: selectedItem.customerEmail || "N/A",
    address: selectedItem.customerAddress || "N/A",
    contact: selectedItem.customerContactNo || "N/A",
    package: selectedItem.packageName,
    bookingDate: selectedItem.bookingDate?.split(" ")[0] || "",
    transactionDate: formatDate(selectedItem.dateTime?.split(" ")[0] || ""),
    time: `${formatTime(selectedItem.bookingStartTime)} - ${formatTime(selectedItem.bookingEndTime)}` || "",
    total: toNumber(selectedItem.total),
    subtotal: toNumber(selectedItem.subTotal),
    paidAmount: toNumber(selectedItem.receivedAmount),
    pendingBalance: toNumber(selectedItem.rem),
    feedback: selectedItem.feedback ?? "",
    rating: selectedItem.rating ?? 0,
    status: selectedItem.status,
    paymentStatus: selectedItem.paymentStatus,
    selectedAddOns: selectedItem.selectedAddOns || [],
    selectedConcepts: selectedItem.selectedConcepts || []
  }}
  onClose={() => setShowModal(false)}
  onSaved={fetchHistory}
      />


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

export default ClientHistoryPageContent;

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const stars = Array(5)
    .fill(null)
    .map((_, i) => (
      <span
        key={i}
        className={`text-xl ${
          i < rating ? "text-yellow-400" : "text-gray-300"
        } hover:scale-110 transition-transform`}
      >
        ★
      </span>
    ));
  return <div className="flex">{stars}</div>;
};
