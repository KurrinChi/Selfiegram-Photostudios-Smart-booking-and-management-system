import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

const ReceiptPage = () => {
  const { bookingID } = useParams();
  console.log("Booking ID:", bookingID);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

   useEffect(() => {
    axios
      .get(`${API_URL}/api/receipt/${bookingID}`, { withCredentials: false })
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.response) {
          console.error("Backend responded with:", err.response.data);
        } else if (err.request) {
          console.error("No response received:", err.request);
        } else {
          console.error("Error setting up request:", err.message);
        }
        setError(true);
        setLoading(false);
      });

  }, [bookingID]);

    const getBookingLabel = (bookingID: string, packageName: string) => {
    const acronym = packageName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
    return `${acronym}#${bookingID}`;
  };

   const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
 const formatTime = (time: string) => {
    const date = new Date(`1970-01-01T${time}`);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };
  if (loading) return <p className="text-center mt-10">Loading receipt...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">Failed to load receipt.</p>;
  if (!data) return <p className="text-center mt-10">Receipt not found.</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 print:bg-white">
      <div className="bg-white max-w-xl mx-auto p-6 rounded-lg shadow-lg print:shadow-none print:max-w-full print:p-0">
  <div className="flex items-center justify-between mb-2">

    <div>
      <h1 className="text-lg font-bold mb-1 italic">SELFIEGRAM PHOTOSTUDIOS</h1>
      <p className="text-sm">3rd Floor Kim Kar Building F Estrella St., Malolos, Philippines</p>
      <p className="text-sm">0968 885 6035</p>
      <p className="text-sm mb-0">selfiegrammalolos@gmail.com</p>
    </div>

    <img src="/slfg.svg" alt="Selfie Gram Logo" className="w-20 h-auto ml-4" />
  </div>
        <hr className="my-4 border-t border-gray-300" />
        <h1 className="text-lg font-bold mb-1">{data.packageName}</h1>
       <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-sm font-bold text-gray-500">Booking ID:</span>
                        <span>{getBookingLabel(data.bookingID, data.packageName)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>Transaction Date</span>
                        <span>{formatDate(data.date)}</span>
                         </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Name</span>
                        <span>{data.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Email</span>
                        <span>{data.customerEmail}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Contact No</span>
                        <span>{data.customerContactNo}</span>
                    </div>
                    <hr className="my-4 border-t border-gray-300" />
                    <h2 className="font-semibold mb-2">Order Summary</h2>

                    <div className="flex justify-between">
                        <span>{data.packageName}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Booking Date</span>
                        <span>{formatDate(data.bookingDate)}</span>
                    </div>
                  
                    <div className="flex justify-between">
                        <span>Booking Time</span>
                        <span>{formatTime(data.bookingStartTime)} - {formatTime(data.bookingEndTime)}</span>
                    </div>
                    <hr className="my-4 border-t border-gray-300" />
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>₱{isNaN(Number(data.subTotal)) ? '0.00' : Number(data.subTotal).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Paid Amount</span>
                        <span>₱{isNaN(Number(data.receivedAmount)) ? '0.00' : Number(data.receivedAmount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Pending Balance</span>
                        <span>₱{isNaN(Number(data.rem)) ? '0.00' : Number(data.rem).toFixed(2)}</span>
                    </div>
                    <hr className="my-4 border-t border-gray-300" />
                     <div className="flex justify-between">
                        <span className="text-lg text-gray-900">Total Amount</span>
                        <span  className="text-lg font-bold">₱{isNaN(Number(data.total)) ? '0.00' : Number(data.total).toFixed(2)}</span>
                    </div>
                      
                    </div>

        <div className="mt-6 flex justify-end print:hidden">
        <button
            onClick={() => window.print()}
            className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
        >
            Print
        </button>
        </div>
      </div>
    </div>
  );
}

export default ReceiptPage;
