import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import mockPackages from "../../data/mockPackages.json";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

interface Package {
  id: string;
  title: string;
  price: number;
  duration: string;
  description: string;
  tags: string[];
  images: string[];
}

const SelectPackagePage = () => {
  const { id } = useParams();
  const [pkg, setPkg] = useState<Package | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (!id) return;
    const found = (mockPackages as Package[]).find((p) => p.id === id);
    setPkg(found ?? null);
  }, [id]);

  if (!pkg)
    return <div className="p-4 text-sm text-gray-500">Package not found.</div>;

  const timeSlots = [
    "9:00 AM",
    "10:30 AM",
    "12:00 PM",
    "1:30 PM",
    "3:00 PM",
    "4:30 PM",
  ];
  const deposit = 200;
  const remaining = pkg.price - deposit;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <h1 className="text-xl font-bold text-gray-800">Select Package</h1>

      {/* Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left - Image */}
        <div className="col-span-1">
          <img
            src={pkg.images[0]}
            alt="Cover"
            className="rounded-lg w-full h-auto object-cover"
          />
          <div className="grid grid-cols-3 gap-2 mt-2">
            {pkg.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                className="rounded border border-gray-200 object-cover h-20 w-full"
                alt={`thumb-${idx}`}
              />
            ))}
          </div>
        </div>

        {/* Right - Details */}
        <div className="col-span-2 space-y-6">
          {/* Package Info */}
          <div className="bg-white p-4 rounded shadow">
            <div className="text-xs text-gray-500 mb-1">{pkg.tags[0]}</div>
            <h2 className="text-2xl font-semibold text-gray-800">
              {pkg.title}
            </h2>
            <p className="text-gray-500 text-sm">₱{pkg.price.toFixed(2)}</p>

            <ul className="list-disc list-inside text-sm mt-3 space-y-1">
              {pkg.description.split("\n").map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>

          {/* Calendar + Timeslots */}
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-sm font-medium mb-2">Select Date & Time</h3>
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="border rounded-md p-2"
            />
            {selectedDate && (
              <div className="mt-4">
                <h4 className="text-xs text-gray-600 mb-1">
                  Available Time Slots
                </h4>
                <div className="flex flex-wrap gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedTime(slot)}
                      className={`px-3 py-1 text-xs rounded-md border transition ${
                        selectedTime === slot
                          ? "bg-black text-white"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Personal Details Form */}
          <div className="bg-white p-4 rounded shadow space-y-3">
            <h3 className="text-sm font-medium">Personal Details</h3>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="w-full px-3 py-2 border rounded text-sm"
              required
            />
            <input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Contact No."
              className="w-full px-3 py-2 border rounded text-sm"
              required
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-3 py-2 border rounded text-sm"
              required
            />
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Address"
              className="w-full px-3 py-2 border rounded text-sm"
              required
            />
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
              required
            >
              <option value="">Select Mode of Payment</option>
              <option value="GCash">GCash</option>
              <option value="Cash">Cash</option>
            </select>
            <label className="flex items-center text-sm gap-2">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              I agree to the Terms and Conditions
            </label>
          </div>

          {/* Payment Summary and Action */}
          <div className="bg-white p-4 rounded shadow text-sm">
            <div className="flex justify-between mb-2">
              <span>Deposit</span>
              <span className="font-medium">₱{deposit.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-4">
              <span>Remaining Balance</span>
              <span className="font-medium">₱{remaining.toFixed(2)}</span>
            </div>
            <div className="flex gap-3">
              <button
                className="w-full bg-black text-white py-2 rounded-md disabled:opacity-50"
                disabled={!agreed}
                onClick={() => {
                  /* navigate('/success') */
                }}
              >
                Confirm with Deposit
              </button>
              <button
                className="w-full bg-gray-200 text-black py-2 rounded-md disabled:opacity-50"
                disabled={!agreed}
                onClick={() => {
                  /* navigate('/success') */
                }}
              >
                Full Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectPackagePage;
