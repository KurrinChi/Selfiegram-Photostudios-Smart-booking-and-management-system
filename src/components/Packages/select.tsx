import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Link and useNavigate imported here
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { isToday, isSameDay } from "date-fns";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

interface Package {
  id: string;
  title: string;
  price: number;
  duration: string;
  description: string;
  tags: string[];
  images: string[];
}
const API_URL = import.meta.env.VITE_API_URL;
const SelectPackagePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
    const fetchPackage = async () => {
      try {
        const response = await fetchWithAuth(`${API_URL}/api/packages/${id}`);
        const data = await response.json();
        setPkg(data);
      } catch (error) {
        console.error("Failed to fetch package:", error);
        setPkg(null);
      }
    };

    if (id) fetchPackage();
  }, [id]);

  if (!pkg)
    return <div className="p-4 text-sm text-gray-500">Package not found.</div>;

  const timeSlots = Array.from({ length: 23 }, (_, i) => {
    const hour = 9 + Math.floor(i / 2);
    const min = i % 2 === 0 ? "00" : "30";
    const meridian = hour < 12 ? "AM" : "PM";
    const formatted =
      (hour > 12 ? hour - 12 : hour).toString().padStart(2, "0") +
      ":" +
      min +
      " " +
      meridian;
    return formatted;
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-10 drop-shadow-xl">
      {/* 👉 Breadcrumb embedded here */}
      <nav className="text-sm text-black mb-6">
        <button
          onClick={() => navigate(-1)}
          className="hover:underline text-gray-400"
        >
          Back
        </button>{" "}
        / Book {pkg.title}
      </nav>

      {/* Top Section */}
      <div className="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3 flex-shrink-0">
          <img
            src={pkg.images[0]}
            alt="Cover"
            className="rounded-xl object-cover w-full aspect-square"
          />
        </div>

        <div className="md:w-2/3 space-y-3">
          <span className="uppercase tracking-wide text-xs text-gray-400">
            {pkg.tags[0]}
          </span>
          <h2 className="text-3xl font-semibold text-gray-800">{pkg.title}</h2>
          <p className="text-lg text-gray-600 font-medium">PHP {pkg.price}</p>
          <ul className="list-disc list-inside text-sm text-gray-700 mt-3 space-y-1">
            {pkg.description.split("\n").map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Date & Time Section */}
      <div className="bg-white rounded-xl shadow p-6 space-y-6">
        <div className="flex flex-col lg:flex-row justify-center ml-20 mr-20">
          <div className="lg:w-1/2">
            <div
              className="hidden md:block bg-white p-4 rounded-xl"
              style={{ filter: "grayscale(100%)" }}
            >
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                captionLayout="label"
                modifiers={{
                  selected: (d) =>
                    !!selectedDate && isSameDay(d, selectedDate!),
                  today: (d) => isToday(d),
                }}
                modifiersClassNames={{
                  selected: "bg-gray-800 text-white",
                  today: "font-bold text-black bg-gray-100 rounded-xl",
                }}
                classNames={{
                  caption: "text-sm text-black",
                  dropdown: "text-black z-30",
                  day: "text-sm",
                  nav_button: "text-black hover:bg-gray-100 p-1 rounded",
                  nav_icon: "stroke-black fill-black w-4 h-4",
                }}
              />
            </div>
          </div>

          {/* Timeslots */}
          <div className="lg:w-1/2">
            <h4 className="text-sm text-gray-700 mb-2 font-medium">
              Available Time Slots
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedTime(slot)}
                  className={`py-2 px-3 text-sm rounded-md transition text-center ${
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
        </div>
      </div>

      <div className="bg-neutral-900 text-white rounded-xl p-5 ">
        <h3 className="text-lg font-semibold">Add Ons</h3>

        <div className="grid grid-cols-3 md:grid-cols-2 gap-4"></div>
      </div>

      {/* Personal Details Section */}
      <div className="bg-neutral-900 text-white rounded-xl shadow p-6 space-y-6">
        <h3 className="text-lg font-semibold">Personal Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="w-full px-4 py-3 rounded bg-neutral-800 border border-neutral-700 text-sm placeholder-gray-400"
          />
          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Contact No."
            className="w-full px-4 py-3 rounded bg-neutral-800 border border-neutral-700 text-sm placeholder-gray-400"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-3 rounded bg-neutral-800 border border-neutral-700 text-sm placeholder-gray-400"
          />
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Address"
            className="w-full px-4 py-3 rounded bg-neutral-800 border border-neutral-700 text-sm placeholder-gray-400"
          />
          <select
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
            className="col-span-1 md:col-span-2 w-full px-4 py-3 rounded bg-neutral-800 border border-neutral-700 text-sm text-white"
          >
            <option value="">Select Mode of Payment</option>
            <option value="GCash">GCash</option>
            <option value="Cash">Cash</option>
          </select>
        </div>

        <div className="text-sm space-y-4">
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1"
            />
            <span>
              <strong>I agree</strong> to pay PHP 200 down payment to confirm
              booking. The remaining balance is due on the day of the photoshoot
              or service.
            </span>
          </label>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              className="w-full bg-black text-white py-3 rounded-md disabled:opacity-50"
              disabled={!agreed}
              onClick={() => {
                if (agreed) console.log("Confirmed with deposit");
              }}
            >
              Confirm with Deposit
            </button>
            <button
              className="w-full bg-white text-black py-3 rounded-md disabled:opacity-50"
              disabled={!agreed}
              onClick={() => {
                if (agreed) console.log("Full payment");
              }}
            >
              Full Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectPackagePage;
