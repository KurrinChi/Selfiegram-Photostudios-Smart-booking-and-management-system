import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  onClose?: () => void;
}

const faqs: FAQItem[] = [
  {
    question: "How do I book a studio session?",
    answer:
      "You can book online by logging into your account, selecting a package, choosing a date and time slot, entering your personal details, and confirming your booking.",
  },
  {
    question: "Can I reschedule or cancel a booking?",
    answer:
      "Yes. Customers can reschedule or cancel appointments online within the allowed timeframe. The system updates your booking immediately.",
  },
  {
    question: "What payment options are available?",
    answer:
      "We support multiple payment methods such as GCash, Maya, online banking, and QR payments. You may choose full, partial, or in-studio payment.",
  },
  {
    question: "Do I receive proof of payment?",
    answer:
      "Yes. Digital receipts and payment confirmations are automatically sent after each transaction.",
  },
  {
    question: "How does the system prevent double bookings?",
    answer:
      "The admin dashboard approves and manages requests while real-time scheduling ensures no overlapping reservations.",
  },
  {
    question: "Will I get reminders about my booking?",
    answer:
      "Yes. The system sends automated reminders via email so you don’t miss your appointment.",
  },
  {
    question: "Is my account secure?",
    answer:
      "Yes. Secure authentication methods are used, and 2FA may be enforced for added protection.",
  },
  {
    question: "Can I view my past bookings and payments?",
    answer:
      "Yes. You can access your booking history, payment records, and even submit feedback through your account.",
  },
  {
    question: "Do I need to create an account to book?",
    answer:
      "Yes. Creating an account ensures secure access, personalized offers, and easy tracking of your bookings and payments.",
  },
  {
    question: "What happens if I forget my password?",
    answer:
      "You can reset your password using the 'Forgot Password' option. A verification code will be sent to your email for recovery.",
  },
  {
    question: "Are there any additional fees?",
    answer:
      "No hidden fees are applied. The total price is shown upfront during the booking process, depending on the package and payment option you choose.",
  },
  {
    question: "Can staff see their schedules in the system?",
    answer:
      "Yes. Staff members can view their assigned bookings and prepare for upcoming sessions through their dashboard.",
  },
  {
    question: "How are reports generated?",
    answer:
      "Admins can generate automated reports on bookings, payments, customer trends, and revenue for business tracking.",
  },
  {
    question: "What devices can I use for booking?",
    answer:
      "The system is web-based and works on desktops, laptops, tablets, and most mobile devices with internet access.",
  },
];

interface FAQDialogProps {
  onClose?: () => void;
}

const FAQDialog: React.FC<FAQDialogProps> = ({ onClose }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative bg-white py-10 px-6 md:px-12 h-[80vh] max-h-[80vh] flex flex-col overflow-y-auto">
      {/* 🔥 X Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>
      )}

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start flex-1">
        {/* Left Side */}
        <div>
          <img src="/slfg.svg" alt="logo" className="w-20 h-20 m-5 mx-auto" />
          <h2 className="text-4xl font-bold mb-4">
            Any questions? We got you.
          </h2>
          <p className="text-gray-600 mb-6">
            Here are the most common questions about our booking system, rules,
            and processes.
          </p>
        </div>

        {/* Right Side (Accordion FAQ) */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border-b border-gray-200 pb-4 cursor-pointer"
              onClick={() => toggleFAQ(index)}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-800 text-lg">
                  {faq.question}
                </h3>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </div>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-3 text-gray-600"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQDialog;
