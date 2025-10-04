// page/client/HomePage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as fasStar, faStarHalfAlt } from "@fortawesome/free-solid-svg-icons";
import { faStar as farStar } from "@fortawesome/free-regular-svg-icons";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import FeedbackSection from "./FeedbackSection";
import CenteredLoader from "./CenteredLoader"; // shared loader
import ChatWidget from "./ChatWidget";
interface Package {
  id: string;
  title: string;
  price: number;
  image: string | null;
  rating: number;
}

interface Feedback {
  id: number;
  username: string;
  profilePic: string | null;
  packageName: string;
  bookingDate: string;
  bookingTime: string;
  feedback: string;
  rating: number;
}

const API_URL = import.meta.env.VITE_API_URL;

const slides = [
  {
    id: 1,
    title: "Seize Great Moments at Selfiegram",
    subtitle: "Start capturing unforgettable moments together!",
    button: "Gallery →",
    route: "/client/gallery",
    bg: "/banner1.png",
  },
  {
    id: 2,
    title: "Begin Your Seamless Booking with SelfieGram",
    subtitle:
      "SelfieGram is here to provide you with a seamless studio scheduling experience.",
    button: "Get Started →",
    route: "/client/packages",
    bg: "",
  },
];

const ClientHomepageContent = () => {
  const navigate = useNavigate();
  const [slideIndex, setSlideIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [packages, setPackages] = useState<Package[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true); // loading state for feedback section

  const SLIDE_DURATION = 0.5;
  const SLIDE_INTERVAL = 10000;

  useEffect(() => {
    const fetchTopPackages = async () => {
      try {
        const res = await fetchWithAuth(`${API_URL}/api/top-selling-packages`);
        const data = await res.json();
        setPackages(
          data.map((pkg: any) => ({
            id: pkg.id,
            title: pkg.title,
            price: parseFloat(pkg.price),
            image: pkg.image,
            rating: parseFloat(pkg.rating) || 0,
          }))
        );
      } catch (err) {
        console.error("Failed to fetch top packages:", err);
      } finally {
        // no package-specific loader currently displayed
      }
    };

    const fetchFeedbacks = async () => {
      try {
        const res = await fetchWithAuth(`${API_URL}/api/feedbacks`);
        const data = await res.json();

        console.log("Feedback data from backend:", data);

        setFeedbacks(
          data.map((fb: any) => ({
            id: fb.id,
            username: fb.username,
            profilePic: fb.user_image,
            packageName: fb.package_name,
            bookingDate: fb.bookingDate,
            bookingTime: fb.booking_time,
            feedback: fb.feedback,
            rating: fb.rating,
          }))
        );
      } catch (err) {
        console.error("Failed to fetch feedbacks:", err);
      } finally {
        setLoadingFeedbacks(false);
      }
    };

    fetchTopPackages();
    fetchFeedbacks();
  }, []);

  const paginate = (newIndex: number) => {
    const next = (newIndex + slides.length) % slides.length;
    setDirection(next > slideIndex ? 1 : -1);
    setSlideIndex(next);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      paginate(slideIndex + 1);
    }, SLIDE_INTERVAL);
    return () => clearInterval(interval);
  }, [slideIndex]);

  const current = slides[slideIndex];

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <div className="space-y-10 px-4 sm:px-8 py-8">
      {/* Carousel */}
      <div className="relative w-full overflow-hidden rounded-2xl shadow-md h-64 sm:h-96">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={current.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: SLIDE_DURATION }}
            className="absolute inset-0 w-full h-full"
          >
            {current.id === 2 ? (
              <div className="w-full h-full bg-[#212121]" />
            ) : (
              <img
                src={current.bg}
                className="w-full h-full object-center object-cover"
                alt="Banner"
              />
            )}
            <div className="absolute inset-0 bg-black/30 z-0" />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 flex flex-col justify-center items-start px-6 sm:px-12 z-10">
          <motion.h2
            key={current.id + "-title"}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: SLIDE_DURATION }}
            className="text-white text-xl sm:text-3xl font-bold"
          >
            {current.title}
          </motion.h2>
          <motion.p
            key={current.subtitle + "-subtitle"}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: SLIDE_DURATION, delay: 0.1 }}
            className="text-white text-sm sm:text-base mt-2"
          >
            {current.subtitle}
          </motion.p>
          <motion.button
            onClick={() => navigate(current.route)}
            className="mt-4 px-5 py-2 bg-white text-black rounded-md text-sm font-medium hover:bg-gray-200 transition"
            whileTap={{ scale: 0.95 }}
          >
            {current.button}
          </motion.button>
        </div>
      </div>

      {/* Top Selling Packages */}
      <div className="max-w-6xl mx-auto">
        <h3 className="text-xl sm:text-2xl font-semibold mb-4">
          Top Selling Packages
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <motion.div
              key={pkg.id}
              className="bg-white rounded-xl shadow hover:shadow-xl transition p-4 flex flex-col"
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate(`/client/packages/select/${pkg.id}`)}
            >
              <div className="relative">
                {pkg.image ? (
                  <img
                    src={`${API_URL}/storage/${pkg.image?.split("storage/")[1]}`}
                    alt={pkg.title}
                    className="w-full h-60 object-cover rounded-lg mb-3"
                  />
                ) : (
                  <div className="w-full h-60 bg-gray-200 rounded-lg mb-3 flex items-center justify-center text-gray-500">
                    No Image
                  </div>
                )}
              </div>
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-semibold">{pkg.title}</h4>
                <p className="text-gray-600 text-sm">
                  ₱{pkg.price.toFixed(2)}
                </p>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const full = i + 1 <= Math.floor(pkg.rating);
                    const half = !full && i + 0.5 <= pkg.rating;
                    return (
                      <FontAwesomeIcon
                        key={i}
                        icon={full ? fasStar : half ? faStarHalfAlt : farStar}
                        className="text-amber-400 text-sm"
                      />
                    );
                  })}
                  <span className="ml-1 text-xs text-gray-500">({pkg.rating.toFixed(1)})</span>
                </div>
                <button className="mt-2 w-full py-2 text-xs bg-gray-100 rounded-md hover:bg-gray-200">
                  BOOK NOW
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Feedback Section with loader positioned below packages */}
      <div className="max-w-6xl mx-auto">
        {loadingFeedbacks ? (
          <CenteredLoader message="Loading..." minHeightClass="min-h-[40vh]" />
        ) : feedbacks.length > 0 ? (
          <FeedbackSection feedbacks={feedbacks} />
        ) : (
          <div className="w-full min-h-[30vh] flex items-center justify-center text-sm text-gray-500">
            No feedback available yet.
          </div>
        )}
      </div>
      <ChatWidget />
    </div>
  );
};

export default ClientHomepageContent;
