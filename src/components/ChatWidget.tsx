// src/components/ChatWidget.tsx
import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Check } from "lucide-react";
import pusher from "../utils/pusher"; // local real-time subscription

const inquiryOptions = [
  { value: "pricing", label: "Pricing & Packages" },
  { value: "promotions", label: "Promotions / Discounts" },
  { value: "account", label: "Account / Technical Support" },
  { value: "payment", label: "Payment & Billing" },
  { value: "other", label: "General" },
];

// Set to true if you want to force a full page reload after a successful submit (useful only for debugging)
const FORCE_RELOAD_AFTER_SUBMIT = true; // toggle to false when real-time test is done
// Unified dialog visibility duration (ms)
const DIALOG_DURATION_MS = 6000; // 6 seconds
const PROGRESS_SECONDS = DIALOG_DURATION_MS / 1000; // keep progress bar in sync

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  // Must be one of: pricing | promotions | account | payment | other
  const [inquiry, setInquiry] = useState<string>("other");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Autofill name/email from stored user object or API (token-based)
  useEffect(() => {
    let aborted = false;
    const API_URL = (import.meta as any).env?.VITE_API_URL || '';
    const token = localStorage.getItem('token');
    const storedUserJson = localStorage.getItem('user');
    // 1. Immediate optimistic fill from stored user blob (if present)
    if (storedUserJson) {
      try {
        const u = JSON.parse(storedUserJson);
        if (u) {
          const fullName = u.fname && u.lname ? `${u.fname} ${u.lname}`.trim() : '';
          if (!name) {
            if (fullName) setName(fullName);
            else if (u.username) setName(u.username);
          }
          if (!email && u.email) setEmail(u.email);
        }
      } catch {/* ignore parse error */}
    }

    const userID = localStorage.getItem('userID');
    if (!userID || !token || !API_URL) {
      // Nothing more we can do (either not logged in or env not set)
      return;
    }

    // 2. Verified fetch for freshest data
    (async () => {
      try {
        const resp = await fetch(`${API_URL}/api/users/${userID}`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!resp.ok) return; // silently ignore
        const data = await resp.json();
        if (aborted || !data) return;
        const fullName = data.fname && data.lname ? `${data.fname} ${data.lname}`.trim() : '';
        if (fullName && !name) setName(fullName);
        else if (data.username && !name) setName(data.username);
        if (data.email && !email) setEmail(data.email);
      } catch {/* ignore network error */}
    })();
    return () => { aborted = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showDialog, setShowDialog] = useState(false); 
  const [, setBroadcastReceived] = useState(false); // real-time confirmation
  const closeTimerRef = useRef<number | null>(null);

  const clearCloseTimer = () => {
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const scheduleClose = (action: 'reload' | 'hide') => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      if (action === 'reload') {
        window.location.reload();
      } else {
        setShowDialog(false);
      }
      closeTimerRef.current = null;
    }, DIALOG_DURATION_MS);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const API_URL = (import.meta as any).env?.VITE_API_URL || '';
    const token = localStorage.getItem('token');
    const userID = localStorage.getItem('userID');

    if (!token || !userID) {
      alert('You must be logged in to send a message.');
      return;
    }

    if (!message.trim()) {
      alert('Please enter a message.');
      return;
    }

    // Ensure inquiry value is valid for backend enum
    const allowed = new Set(['pricing','promotions','account','payment','other']);
    const inquiryOptions = allowed.has(inquiry) ? inquiry : 'other';

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: message.trim(),
          inquiryOptions,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        console.error('Message submit failed', errJson || res.statusText);
        alert(errJson?.message || 'Failed to send message');
        return;
      }

      setSuccess(true);
      setMessage(''); // only clear message; keep name/email
      setInquiry('other');
      setShowDialog(true);
      // Start a single timer only once here; broadcast will not create a second one.
      if (FORCE_RELOAD_AFTER_SUBMIT) {
        scheduleClose('reload');
      } else {
        scheduleClose('hide');
      }
    } catch (err) {
      console.error('Network / submit error', err);
      alert('Failed to send. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Local Pusher subscription for immediate real-time feedback (option 2)
  useEffect(() => {
    const userID = localStorage.getItem('userID');
    if (!userID) return;
    const channelName = `private-user.${userID}`;
    const channel = pusher.subscribe(channelName);
    const handler = (data: any) => {
      // Ensure the notification corresponds to the system confirmation we expect
      if (data?.notification?.title === 'Message Successfully Sent to our Staff!') {
        setBroadcastReceived(true);
        setSuccess(true);
        // Don't reschedule close if already scheduled; just ensure dialog is open.
        setShowDialog(true);
      }
    };
    channel.bind('message.sent', handler);
    return () => {
      channel.unbind('message.sent', handler);
      pusher.unsubscribe(channelName);
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Contact Button */}
      <button
        onClick={() => setIsOpen((p) => !p)}
        aria-expanded={isOpen}
        aria-controls="contact-widget"
        className="w-14 h-14 rounded-full bg-[#212121] text-white flex items-center justify-center shadow-lg hover:bg-gray-800 transition"
      >
        <MessageCircle size={24} />
      </button>

      {/* Contact Form */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="contact-widget"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.22 }}
            className="absolute bottom-16 right-0 w-100 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col"
          >
            {/* Header */}
            <div className="font-semibold px-4 py-3 bg-[#f8f8f8] flex items-center justify-between gap-3">
              <span>Contact Us</span>
            </div>

            {/* Success banner */}
            {success && (
              <div className="px-4 py-2 text-sm text-green-700 bg-green-50">
                Message sent — we'll get back to you soon!
              </div>
            )}

            {/* Contact Form Fields */}
            <form onSubmit={handleSubmit} className="flex-1 p-4 space-y-3">
              {/* Inquiry (rounded-rectangle "radio" buttons) */}
              <div>
                <div className="flex flex-wrap gap-2">
                  {inquiryOptions.map((opt) => (
                    <div key={opt.value} className="flex items-center">
                      {/* visually-hidden radio used as peer */}
                      <input
                        id={`inquiry-${opt.value}`}
                        type="radio"
                        name="inquiry"
                        value={opt.value}
                        className="peer sr-only"
                        checked={inquiry === opt.value}
                        onChange={() => setInquiry(opt.value)}
                      />
                      {/* label styled as rounded rectangle; changes when peer (input) is checked */}
                      <label
                        htmlFor={`inquiry-${opt.value}`}
                        className="cursor-pointer select-none px-3 py-2 rounded-lg border text-sm transition
                          peer-checked:bg-[#212121] peer-checked:text-white
                          border-gray-200 text-gray-700"
                      >
                        {opt.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <input
                  id="contact-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  placeholder="Your name"
                  readOnly
                  className="mt-1 w-full px-3 py-2 border border-slate-100 rounded text-sm outline-none bg-gray-50"
                  title="Name is taken from your account profile"
                />
              </div>

              {/* Email */}
              <div>
                <input
                  id="contact-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="you@example.com"
                  readOnly
                  className="mt-1 w-full px-3 py-2 border border-slate-100 rounded text-sm outline-none bg-gray-50"
                  title="Email is taken from your account profile"
                />
              </div>

              {/* Message */}
              <div>
                <textarea
                  id="contact-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Message..."
                  rows={4}
                  className="mt-1 w-full px-3 py-2 border border-slate-100 rounded px-3 py-2 text-sm outline-none resize-none"
                />
              </div>

              {/* Send Button */}
              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-2 text-sm rounded-md transition ${
                  submitting ? "bg-gray-400 text-white cursor-not-allowed" : "bg-[#212121] text-white hover:bg-gray-900"
                }`}
              >
                {submitting ? "Sending..." : "Send"}
              </button>
            </form>
          </motion.div>
        )}
        
      </AnimatePresence>
       <AnimatePresence>
  {showDialog && (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-sm text-center relative"
      >
        {/* Checkmark animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="mx-auto mb-4 w-16 h-16 flex items-center justify-center rounded-full bg-green-100"
        >
          <Check className="text-green-600 w-10 h-10" />
        </motion.div>

        {/* Message */}
        <p className="text-gray-700 text-sm mb-6">
          Your message has been sent to our Customer Support Staff.  
          Please wait and check your inbox for our response. Thank you for contacting us at SelfieGram!
        </p>


        {/* Progress Bar */}
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: PROGRESS_SECONDS, ease: "linear" }}
          className="absolute bottom-0 left-0 h-1 bg-green-500 rounded-b-lg"
        ></motion.div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
    </div>
    
  );
};

export default ChatWidget;
