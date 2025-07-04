import React, { useState } from "react";
import { Eye, Trash2 } from "lucide-react";
import ModalTransactionDialog from "./ModalTransactionDialog";

type HistoryItem = {
  id: string;
  packageName: string;
  dateTime: string;
  price: string;
  image?: string;
  feedback: number | null; // null = no rating
};

const mockHistoryData: HistoryItem[] = [
  {
    id: "SFO#0005",
    packageName: "Selfie for ONE",
    dateTime: "02.2.25 1:00PM",
    price: "₱379.00",
    image: "/avatars/avatar1.jpg",
    feedback: null,
  },
  {
    id: "SFO#0004",
    packageName: "Selfie for ONE",
    dateTime: "01.4.25 12:00PM",
    price: "₱379.00",
    image: "/avatars/avatar2.jpg",
    feedback: null,
  },
  {
    id: "SQG#0003",
    packageName: "Squad Groupie",
    dateTime: "12.2.24 1:00PM",
    price: "₱699.00",
    image: "/avatars/squad1.jpg",
    feedback: 4,
  },
  {
    id: "SQG#0002",
    packageName: "Squad Groupie",
    dateTime: "10.3.24 10:00AM",
    price: "₱699.00",
    image: "/avatars/squad2.jpg",
    feedback: 4,
  },
  {
    id: "SQG#0001",
    packageName: "Squad Groupie",
    dateTime: "06.8.24 1:00PM",
    price: "₱699.00",
    image: "/avatars/squad3.jpg",
    feedback: 4,
  },
  {
    id: "SFO#0003",
    packageName: "Selfie for ONE",
    dateTime: "04.5.24 2:00PM",
    price: "₱379.00",
    image: "/avatars/avatar2.jpg",
    feedback: 4,
  },
  {
    id: "SFO#0002",
    packageName: "Selfie for ONE",
    dateTime: "01.7.24 5:00PM",
    price: "₱379.00",
    image: "/avatars/avatar1.jpg",
    feedback: 4,
  },
  // Add more to test pagination
  ...Array.from({ length: 5 }).map((_, i) => ({
    id: `SFO#00${6 + i}`,
    packageName: "Selfie for ONE",
    dateTime: `03.${i + 1}.24 3:00PM`,
    price: "₱379.00",
    image: "",
    feedback: i % 2 === 0 ? 4 : null,
  })),
];

const ITEMS_PER_PAGE = 7;

const ClientHistoryPageContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<HistoryItem | null>(null);

  const totalPages = Math.ceil(mockHistoryData.length / ITEMS_PER_PAGE);

  const paginatedData = mockHistoryData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleView = (item: HistoryItem) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleDelete = (item: HistoryItem) => {
    setItemToDelete(item);
  };

  const confirmDelete = () => {
    // In real case, call API here
    const index = mockHistoryData.findIndex((i) => i.id === itemToDelete?.id);
    if (index !== -1) {
      mockHistoryData.splice(index, 1);
    }
    setItemToDelete(null);
  };

  return (
    <div className="p-4 animate-fadeIn">
      <h1 className="text-2xl font-semibold mb-4">History</h1>
      <div className="bg-white rounded-2xl shadow-md overflow-x-auto">
        <table className="min-w-full table-auto text-left text-sm">
          <thead className="bg-gray-50 text-gray-700 font-semibold">
            <tr>
              <th className="p-4">Package Name</th>
              <th className="p-4">Date & Time</th>
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
                <td className="p-4 flex items-center gap-3">
                  <img
                    src={item.image || "/slfg-placeholder.png"}
                    onError={(e) =>
                      ((e.target as HTMLImageElement).src =
                        "/slfg-placeholder.png")
                    }
                    className="w-10 h-10 object-cover rounded-full"
                    alt="avatar"
                  />
                  {item.packageName}
                </td>
                <td className="p-4">{item.dateTime}</td>
                <td className="p-4">{item.price}</td>
                <td className="p-4">{item.id}</td>
                <td className="p-4">
                  {item.feedback === null ? (
                    <em className="text-gray-400">No Rating Yet</em>
                  ) : (
                    <StarRating rating={item.feedback} />
                  )}
                </td>
                <td className="p-4 text-center flex gap-2 justify-center">
                  <button
                    className="text-gray-600 hover:text-blue-500 transition"
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

      {/* View Modal */}
      {showModal && selectedItem && (
        <ModalTransactionDialog
          isOpen={showModal}
          data={{
            id: selectedItem.id,
            customerName: "N/A",
            email: "N/A",
            address: "N/A",
            contact: "N/A",
            package: selectedItem.packageName,
            date: selectedItem.dateTime.split(" ")[0] || "",
            time: selectedItem.dateTime.split(" ")[1] || "",
            subtotal: Number(selectedItem.price.replace(/[^\d.]/g, "")) || 0,
            paidAmount: Number(selectedItem.price.replace(/[^\d.]/g, "")) || 0,
            feedback:
              selectedItem.feedback !== null
                ? String(selectedItem.feedback)
                : "",
            rating: selectedItem.feedback ?? 0,
          }}
          onClose={() => setShowModal(false)}
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

// -------------------------
// Embedded StarRating Component
// -------------------------
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

// -------------------------
// Tailwind Animations (add to tailwind.config.js)
// -------------------------
/*
extend: {
  animation: {
    fadeIn: 'fadeIn 0.3s ease-out',
  },
  keyframes: {
    fadeIn: {
      '0%': { opacity: '0', transform: 'scale(0.95)' },
      '100%': { opacity: '1', transform: 'scale(1)' },
    },
  },
}
*/
