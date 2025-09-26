import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchWithAuth } from "../utils/fetchWithAuth";

interface Package {
  id: number;
  title: string;
  description: string;
  price: number;
  status: number;
  images: string[];
}

const API_URL = import.meta.env.VITE_API_URL;

const ClientFavoritePageContent: React.FC = () => {
  const fullImagePath = (path: string) =>
    path.startsWith("http") ? path : `${API_URL}/${path}`;

  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Package[]>([]);
  const [imageIndexMap, setImageIndexMap] = useState<Record<number, number>>(
    {}
  );
  const [fadingImages, setFadingImages] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.userID;

  useEffect(() => {
    if (!userId) return;

    fetchWithAuth(`http://127.0.0.1:8000/api/favorites/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("Fetched favorites:", data);
        setFavorites(data);
      })
      .catch((err) => {
        console.error("Failed to fetch favorites:", err.message);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    const timers = favorites.map((pkg) => {
      const delay = 3000 + Math.random() * 2000;
      return setInterval(() => {
        setFadingImages((prev) => ({ ...prev, [pkg.id]: true }));
        setTimeout(() => {
          setImageIndexMap((prev) => {
            const current = prev[pkg.id] ?? 0;
            const next = (current + 1) % pkg.images.length;
            return { ...prev, [pkg.id]: next };
          });
          setFadingImages((prev) => ({ ...prev, [pkg.id]: false }));
        }, 200);
      }, delay);
    });

    return () => timers.forEach(clearInterval);
  }, [favorites]);

  const removeFavorite = async (packageId: number) => {
    setFavorites((prev) => prev.filter((pkg) => pkg.id !== packageId));

    fetchWithAuth(`http://127.0.0.1:8000/api/favorites/remove`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userID: userId,
        packageID: packageId,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to remove favorite");
        return res.json();
      })
      .then((data) => console.log("Removed from favorites:", data))
      .catch((err) => console.error("Remove favorite error:", err));
  };

  return (
    <div className="p-4 overflow-y-auto max-h-300 rounded-3xl transition-all duration-300">
      <h1 className="text-2xl font-semibold mb-6">Your Favorite Packages</h1>

      {loading ? (
        <div className="text-center text-gray-500">Loading favorites...</div>
      ) : favorites.length === 0 ? (
        <div className="text-center text-gray-500 border border-dashed py-20 rounded-md">
          <p className="mb-4">You don't have any favorites yet.</p>
          <button
            onClick={() => navigate("/client/packages")}
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition"
          >
            Select Package Here
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((pkg) => {
            const currentImgIdx = imageIndexMap[pkg.id] ?? 0;
            const isFading = fadingImages[pkg.id];

            return (
              <div
                key={pkg.id}
                className="relative bg-white rounded-xl shadow-sm transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 hover:shadow-xl p-2 overflow-hidden group"
              >
                {/* Favorite Heart icon */}

                <motion.button
                  onClick={() => removeFavorite(pkg.id)}
                  whileTap={{ scale: 5 }}
                  className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center transition"
                >
                  <Heart className="w-5 h-5 fill-pink-500 text-gray-600 transition-colors" />
                  <AnimatePresence>
                    <motion.div
                      key="burst"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1.6, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0"
                    >
                      <svg
                        viewBox="0 0 100 100"
                        className="w-full h-full text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        {Array.from({ length: 8 }).map((_, i) => {
                          const angle = (i * 360) / 8;
                          const x1 =
                            50 + 20 * Math.cos((angle * Math.PI) / 180);
                          const y1 =
                            50 + 20 * Math.sin((angle * Math.PI) / 180);
                          return (
                            <line
                              key={i}
                              x1="50"
                              y1="50"
                              x2={x1}
                              y2={y1}
                              strokeLinecap="round"
                            />
                          );
                        })}
                      </svg>
                    </motion.div>
                  </AnimatePresence>
                </motion.button>

                {/* Image */}
                <div className="relative z-0 h-100 rounded-md overflow-hidden">
                  <img
                    src={
                      pkg.images && pkg.images.length > 0
                        ? fullImagePath(pkg.images[currentImgIdx])
                        : "/slfg-placeholder 2.png"
                    }
                    onError={(e) =>
                      ((e.target as HTMLImageElement).src =
                        "/slfg-placeholder 2.png")
                    }
                    className={`w-full h-full object-cover transition-opacity duration-500 ease-in-out ${
                      isFading ? "opacity-0" : "opacity-100"
                    }`}
                    alt={pkg.title}
                  />

                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 bg-white/60 px-2 py-1 rounded-full backdrop-blur-sm">
                    {(pkg.images ?? ["/slfg-placeholder 2.png"]).map(
                      (img, i) => (
                        <img
                          key={i}
                          src={fullImagePath(img)}
                          className={`w-6 h-6 object-cover rounded-full border-2 cursor-pointer transition ${
                            i === currentImgIdx
                              ? "border-black"
                              : "border-transparent opacity-60"
                          }`}
                          onClick={() =>
                            setImageIndexMap((prev) => ({
                              ...prev,
                              [pkg.id]: i,
                            }))
                          }
                        />
                      )
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="p-3 space-y-2">
                  <div className="font-medium text-sm">{pkg.title}</div>
                  <div className="text-gray-500 text-xs">
                    ₱{Number(pkg.price).toFixed(2)}
                  </div>
                  <button
                    onClick={() =>
                      navigate(`/client/packages/select/${pkg.id}`)
                    }
                    className="mt-2 w-full py-2 text-xs bg-gray-100 rounded-md hover:bg-gray-200 transition"
                  >
                    SELECT
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClientFavoritePageContent;
