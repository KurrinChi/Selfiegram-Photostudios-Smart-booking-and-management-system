// TermsDialog.tsx
import React from "react";
interface TermsDialogProps {
  isOpen: boolean;
  onClose?: () => void;
   theme?: "dark" | "light";
}
const TermsDialog: React.FC<TermsDialogProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <section className="relative bg-white py-10 px-6 md:px-12 h-[80vh] max-h-[80vh] overflow-y-auto m-10">
      {/* X Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
      >
        ✕
      </button>

      <div className="max-w-4xl mx-auto">
        <img src="/slfg.svg" alt="logo" className="w-20 h-20 m-5 mx-auto" />
        <h2 className="text-4xl font-bold mb-6 text-center">
          Terms & Agreements
        </h2>

        <p className="text-gray-600 mb-6 text-center">
          Please read these terms carefully before making a booking. By using
          our system and services, you agree to abide by the following rules and
          conditions.
        </p>

        <div className="space-y-6 text-gray-700 leading-relaxed">
          <div>
            <h3 className="font-semibold text-lg mb-2">1. Booking Process</h3>
            <p>
              All studio sessions must be booked through our online system. You
              must select a package, preferred date, and time. Bookings are only
              confirmed upon receipt of payment or deposit.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">2. Payment and Fees</h3>
            <p>
              We accept GCash, Maya, bank transfers, and QR payments. You may
              choose to pay in full, partially, or settle remaining balance in
              the studio. Prices shown during booking are final, with no hidden
              fees.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">
              3. Cancellations & Rescheduling
            </h3>
            <p>
              Clients may cancel or reschedule their bookings within the allowed
              timeframe specified in the system. Failure to show up without
              notice may result in forfeiture of payment or deposit.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">4. Studio Rules</h3>
            <ul className="list-disc list-inside">
              <li>Arrive on time for your scheduled session.</li>
              <li>
                Handle all equipment and props with care. Damages may incur
                additional charges.
              </li>
              <li>
                Follow staff instructions at all times for safety and order.
              </li>
              <li>
                Smoking and alcohol are strictly prohibited in the studio.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">5. Data Privacy</h3>
            <p>
              Your personal information is collected solely for booking,
              communication, and transaction purposes. We will not share your
              data with third parties without consent.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">
              6. System and Account Usage
            </h3>
            <p>
              Customers are required to maintain their account credentials
              securely. Sharing of login details is discouraged. Lost passwords
              can be reset via the "Forgot Password" option.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">7. Liability</h3>
            <p>
              The studio is not liable for lost or damaged personal belongings.
              We are also not responsible for technical issues caused by
              third-party services beyond our control.
            </p>
          </div>

          <p className="text-sm text-gray-500 mt-8">
            By proceeding with a booking, you acknowledge that you have read,
            understood, and agreed to these Terms & Agreements.
          </p>
        </div>
      </div>
    </section>
  );
};

export default TermsDialog;
