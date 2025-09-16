import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface ModalOnRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

const ModalOnRequestDialog: React.FC<ModalOnRequestDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  return (
    
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-white text-gray-900 rounded-lg shadow-md max-w-lg w-full p-6">
        {/* Header */}
        <div className="flex flex-col gap-1 mb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold">Cancel Appointment</h1>
          </div>
          <p className="text-sm text-gray-500">
           Reason for Appointment Cancellation (No refund will be issued for the PHP 200 down payment. In case of cancellation, any refundable amount will exclude this down payment.)
          </p>
        </div>

        {/* Reason Textarea */}
        <div className="mb-6 text-sm">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border rounded-md px-3 py-2 bg-gray-50 resize-none"
            rows={4}
            placeholder="Type your reason here..."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-6 py-2 border rounded-md text-sm hover:bg-gray-100"
          >
            Cancel
          </button>
        <button
              onClick={() => {
                if (reason.trim() === "") {
                  toast.error("Please fill in all required fields");
                  return;
                }
                onSubmit(reason);
              }}
              className="px-6 py-2 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition"
            >
              Submit
            </button>
        </div>
      </div>
        {/* Toast Container */}
      <ToastContainer position="bottom-right" />
    </div>
    
  );
};

export default ModalOnRequestDialog;
