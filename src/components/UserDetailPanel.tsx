import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
import TransactionModal from "./ModalTransactionDialog"; // Ensure this is the correct path

interface Appointment {
  package: string;
  date: string;
  time: string;
  status: "Pending" | "Done";
  rating: number;
}

interface UserDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onExited?: () => void;
  user: {
    name: string;
    username: string;
    age: number;
    birthday: string;
    address: string;
    email: string;
    contact: string;
    appointments: Appointment[];
  } | null;
}

const UserDetailPanel: React.FC<UserDetailPanelProps> = ({
  isOpen,
  onClose,
  onExited,
  user,
}) => {
  const [selectedTransaction, setSelectedTransaction] =
    useState<Appointment | null>(null);

  const transactionData =
    selectedTransaction && user
      ? {
          id: user.username + "-" + selectedTransaction.package,
          customerName: user.name,
          email: user.email,
          address: user.address,
          contact: user.contact,
          package: selectedTransaction.package,
          date: selectedTransaction.date,
          time: selectedTransaction.time,
          subtotal: 399,
          paidAmount: 399,
          feedback: "Thank you! Will book again.",
          rating: selectedTransaction.rating,
        }
      : null;

  return createPortal(
    <AnimatePresence>
      {isOpen && user && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed inset-0 z-40 bg-black"
            onClick={onClose}
          />

          <motion.aside
            key="panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onAnimationComplete={(definition) => {
              if (definition === "exit" && onExited) onExited();
            }}
            className="fixed inset-y-0 right-0 w-full max-w-md z-50 bg-[#1C1C1E] text-white shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 sticky top-0 bg-[#1C1C1E] z-10">
              <h2 className="text-lg font-semibold">Account Details</h2>
              <button
                onClick={onClose}
                className="text-2xl leading-none hover:text-red-400"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-6 space-y-8">
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-full bg-zinc-700 flex items-center justify-center text-4xl select-none">
                  🧑🏻
                </div>
                <div className="text-center">
                  <p className="text-base font-medium">{user?.name}</p>
                  <p className="text-xs text-zinc-400">{user?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <StatBox
                  label="Appointments"
                  value={user?.appointments.length || 0}
                />
                <StatBox
                  label="Cancellations"
                  value={
                    user?.appointments.filter((a) => a.status === "Pending")
                      .length || 0
                  }
                />
              </div>

              <div className="space-y-3">
                <InfoRow label="Username" value={`@${user?.username}`} />
                <div className="grid grid-cols-2 gap-3">
                  <InfoRow label="Age" value={user?.age.toString() || "-"} />
                  <InfoRow label="Birthday" value={user?.birthday || "-"} />
                </div>
                <InfoRow label="Address" value={user?.address || "-"} />
                <div className="grid grid-cols-2 gap-3">
                  <InfoRow label="Contact" value={user?.contact || "-"} />
                  <InfoRow label="Email" value={user?.email || "-"} />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold mb-1">
                  Appointment History
                </h3>
                {user?.appointments.length ? (
                  user.appointments.map((appt, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-zinc-800 rounded-md px-4 py-3 text-xs cursor-pointer hover:bg-zinc-700"
                      onClick={() => setSelectedTransaction(appt)}
                    >
                      <div className="space-y-0.5">
                        <p className="font-medium text-white">{appt.package}</p>
                        <p className="text-zinc-400">
                          {appt.date} | {appt.time}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={`text-xs ${
                            appt.status === "Done"
                              ? "text-green-400"
                              : "text-yellow-400"
                          }`}
                        >
                          {appt.status}
                        </span>
                        <RatingStars rating={appt.rating} />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-zinc-500 text-xs">
                    No appointments yet.
                  </p>
                )}
              </div>

              <button
                onClick={onClose}
                className="w-full py-2 bg-zinc-700 hover:bg-zinc-600 rounded-md text-sm mt-6"
              >
                Close Panel
              </button>
            </div>

            {/* Transaction Modal */}
            {transactionData && (
              <TransactionModal
                isOpen={!!selectedTransaction}
                onClose={() => setSelectedTransaction(null)}
                data={transactionData}
              />
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

const InfoRow: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[11px] uppercase tracking-wider text-zinc-400">
      {label}
    </span>
    <span className="bg-zinc-800 rounded-md p-2 text-sm break-words">
      {value}
    </span>
  </div>
);

const StatBox: React.FC<{ label: string; value: number }> = ({
  label,
  value,
}) => (
  <div className="bg-zinc-800 rounded-lg p-4 text-center">
    <p className="text-2xl font-bold">{value.toString().padStart(3, "0")}</p>
    <p className="text-xs text-zinc-400">{label}</p>
  </div>
);

const RatingStars: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex gap-0.5">
    {rating === 0 ? (
      <span className="text-zinc-500">No Rating</span>
    ) : (
      [...Array(rating)].map((_, i) => (
        <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
      ))
    )}
  </div>
);

export default UserDetailPanel;
