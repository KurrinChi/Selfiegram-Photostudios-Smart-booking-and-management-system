import React from "react";
import { format, parse } from "date-fns";
import { CheckCircle } from "lucide-react";

interface ModalRequestedDialogProps {
   isOpen: boolean;
  onClose: () => void;
  data: {
    id: string;
    reason: string;
    bookingDate: string;
    bookingTime: string;
    transactionDate: string;
    bookingId: string;
    totalAmount: number;
    packageName: string;
  } | null;
}

const ModalRequestedDialog: React.FC<ModalRequestedDialogProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  if (!isOpen || !data) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
 const getBookingLabel = (bookingID: string, packageName: string) => {
    const acronym = packageName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
    return `${acronym}#${bookingID}`;
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-white text-gray-900 rounded-lg shadow-md max-w-lg w-full p-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="text-green-500 w-6 h-6" />
          <h1 className="text-lg font-bold">Cancellation Requested</h1>
        </div>

       {/* Request Date */}
        <div className="mb-4 text-sm text-gray-500">
        <span className="font-semibold">Request Date: </span>
        {new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })}
        </div>
        
         
        {/* Booking ID */}
            <div className="mb-2 text-sm text-gray-500">
            <span className="font-semibold">Booking ID: </span>
            {getBookingLabel(data.bookingId, data.packageName)}
            </div>

               {/* PackageName*/}
            <div className="mb-2 text-sm text-gray-500">
            <span className="font-semibold">{data.packageName}</span>
            </div>

                {/* Total Amount */}
            <div className="mb-2 text-sm text-gray-500">
            <span className="font-semibold">Total Amount: </span>
            ₱{data.totalAmount.toFixed(2)}
            </div>

            {/* Booking Date */}
            <div className="mb-2 text-sm text-gray-500">
            <span className="font-semibold">Booking Date: </span>
            {formatDate(data.bookingDate)}
            </div>

            {/* Booking Time */}
            <div className="mb-4 text-sm text-gray-500">
            <span className="font-semibold">Booking Time: </span>
            {data.bookingTime}
            </div>

        {/* Message */}
        <p className="mb-4 text-sm text-gray-700">
          Your appointment cancellation request has been submitted successfully. We will notify you once it has been processed.
        </p>

        {/* Reason */}
        <div className="mb-6 text-sm">
          <label className="block font-medium mb-1">Reason</label>
          <textarea
            value={data.reason}
            disabled
            className="w-full border rounded-md px-3 py-2 bg-gray-100 resize-none"
            rows={4}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          <button
             onClick={() => {
                onClose();
                window.location.reload(); // refreshes the page
              }}
            className="px-6 py-2 border rounded-md text-sm hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalRequestedDialog;
