import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { fetchWithAuth } from "../utils/fetchWithAuth";

interface Package {
  id: string;
  title: string;
  price: number;
  tags: string[];
  images?: string[];
}

const API_URL = import.meta.env.VITE_API_URL;

const ClientPackagePageContent: React.FC = () => {
  const [allPackages, setAllPackages] = useState<Package[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [imageIndexMap, setImageIndexMap] = useState<Record<string, number>>({});
  const [fadingImages, setFadingImages] = useState<Record<string, boolean>>({});
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchFavorites = async () => {
   const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user?.userID;
    console.log("LocalStorage user:", user);

    if (!userId) {
      console.warn("No user ID found in localStorage.");
      return;
    }

    try {
      const res = await fetchWithAuth(`${API_URL}/api/favorites/user/${userId}`);
      const data = await res.json();
      console.log("Fetched favorites from backend:", data);

      if (Array.isArray(data)) {
        const idSet = new Set(data.map((id) => id.toString()));
        console.log("Converted favorite ID set:", idSet);
        setFavoriteIds(idSet);
      } else {
        console.error("Unexpected response for favorites:", data);
      }
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
    }
  };

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetchWithAuth(`${API_URL}/api/packages`);
        const data = await response.json();
        setAllPackages(data);
      } catch (error) {
        console.error("Failed to fetch packages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
    fetchFavorites();
  }, []);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleFavorite = async (packageId: string) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.userID;

  if (!userId) {
    alert("Please log in to favorite packages.");
    return;
  }

  const idStr = packageId.toString();
  const isAlreadyFavorite = favoriteIds.has(idStr);

  const url = isAlreadyFavorite
    ? `${API_URL}/api/favorites/remove`
    : `${API_URL}/api/favorites/add`;

  try {
    const response = await fetchWithAuth(url, {
      method: "POST", // keep it POST for both add/remove if backend expects it
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userID: userId,
        packageID: packageId,
      }),
    });

    const data = await response.json();
    console.log("Favorite toggle response:", data);

    if (data.success) {
      setFavoriteIds((prev) => {
        const newSet = new Set(prev);
        if (isAlreadyFavorite) {
          newSet.delete(idStr); 
        } else {
          newSet.add(idStr); 
        }
        return newSet;
      });
    } else {
      console.error("Favorite update failed:", data.message);
    }
  } catch (error) {
    console.error("Error in toggleFavorite:", error);
  }
};


  const allTags = Array.from(new Set(allPackages.flatMap((pkg) => pkg.tags)));

  const filtered = allPackages.filter((pkg) => {
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((tag) => pkg.tags?.includes(tag));
    const lowerQuery = searchQuery.toLowerCase();
    const matchesSearch =
      pkg.title.toLowerCase().includes(lowerQuery) ||
      pkg.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
      pkg.price.toString() === searchQuery;

    return matchesTags && matchesSearch;
  });

  useEffect(() => {
    const timers = filtered.map((pkg) => {
      const delay = 3000 + Math.random() * 2000;
      return setInterval(() => {
        setFadingImages((prev) => ({ ...prev, [pkg.id]: true }));
        setTimeout(() => {
          setImageIndexMap((prev) => {
            const current = prev[pkg.id] ?? 0;
            const images = pkg.images ?? [];
            const next = (current + 1) % images.length;
            return { ...prev, [pkg.id]: next };
          });
          setFadingImages((prev) => ({ ...prev, [pkg.id]: false }));
        }, 200);
      }, delay);
    });

    return () => timers.forEach(clearInterval);
  }, [filtered]);

  const getTagClass = (tag: string, selected: boolean) => {
    const colorMap: Record<string, string> = {
      "Self Shoot": "bg-blue-200 text-blue-800 border-blue-300",
      Graduation: "bg-red-200 text-red-800 border-red-300",
      Studio: "bg-yellow-200 text-yellow-800 border-yellow-300",
      Photoshoot: "bg-cyan-200 text-cyan-800 border-cyan-300",
    };
    return selected
      ? colorMap[tag]
      : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100";
  };

  const getTagPillClass = (tag: string) => {
    const colorMap: Record<string, string> = {
      "Self Shoot": "bg-blue-200 text-blue-800",
      Graduation: "bg-red-200 text-red-800",
      Studio: "bg-yellow-200 text-yellow-800",
      Photoshoot: "bg-cyan-200 text-cyan-800",
    };
    return colorMap[tag] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="p-4 overflow-y-auto max-h-300 rounded-3xl transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold">Available Packages</h1>
        <div className="flex flex-wrap gap-3 items-center text-xs">
          <div className="relative">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-2 top-2.5 text-gray-400 text-sm"
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="pl-7 pr-3 py-2 border rounded-md w-48 text-sm"
            />
          </div>

          <div className="relative text-sm z-50">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1 px-3 py-2 border rounded-md hover:bg-gray-100"
            >
              Filter By <ChevronDown size={16} />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border rounded-md shadow-md p-2 flex flex-wrap gap-2 z-50">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`text-xs px-3 py-1 rounded-full border font-medium transition ${getTagClass(
                      tag,
                      selectedTags.includes(tag)
                    )}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading packages...</div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((pkg) => {
            const currentImgIdx = imageIndexMap[pkg.id] ?? 0;
            const isFading = fadingImages[pkg.id];
            const isFav = favoriteIds.has(pkg.id.toString());
            
            return (
              <div
                key={pkg.id}
                className="relative bg-white rounded-xl shadow-sm transition-all duration-300 transform hover:-translate-y-2 hover:scale-102 hover:shadow-xl p-2 overflow-hidden group"
              >
                <motion.button
  onClick={() => toggleFavorite(pkg.id)}
  whileTap={{ scale: 5 }}
  className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center transition"
>
  <Heart
    className={`w-5 h-5 transition-colors ${
      isFav ? "text-red-500 fill-red-500" : "text-gray-600"
    }`}
  />
  <AnimatePresence>
    {isFav && (
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
          className="w-full h-full text-red-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * 360) / 8;
            const x1 = 50 + 20 * Math.cos((angle * Math.PI) / 180);
            const y1 = 50 + 20 * Math.sin((angle * Math.PI) / 180);
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
    )}
  </AnimatePresence>
</motion.button>


                <div className="relative z-0 h-100 rounded-md overflow-hidden bg-gray-100">
                  <img
                    src={
                      pkg.images && pkg.images.length > 0
                        ? pkg.images[currentImgIdx]
                        : "/slfg-placeholder 2.png"
                    }
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/slfg-placeholder 2.png";
                    }}
                    className={`w-full h-full object-cover transition-opacity duration-500 ease-in-out ${
                      isFading ? "opacity-0" : "opacity-100"
                    }`}
                    alt="Package"
                  />
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 bg-white/60 px-2 py-1 rounded-full backdrop-blur-sm">
                    {(pkg.images?.length ? pkg.images : ["/slfg-placeholder 2.png"]).map(
                      (img, i) => (
                        <img
                          key={i}
                          src={img}
                          onClick={() =>
                            setImageIndexMap((prev) => ({ ...prev, [pkg.id]: i }))
                          }
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/slfg-placeholder 2.png";
                          }}
                          className={`w-6 h-6 object-cover rounded-full border-2 cursor-pointer transition ${
                            i === currentImgIdx
                              ? "border-black"
                              : "border-transparent opacity-60"
                          }`}
                          alt={`Thumb ${i + 1}`}
                        />
                      )
                    )}
                  </div>
                </div>

                <div className="p-3 space-y-2">
                  <div className="font-medium text-sm">{pkg.title}</div>
                  <div className="text-gray-500 text-xs">
                    ₱{Number(pkg.price).toFixed(2)}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(pkg.tags ?? []).map((tag) => (
                      <span
                        key={tag}
                        className={`px-2 py-0.5 rounded-full text-[10px] ${getTagPillClass(tag)}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => navigate(`select/${pkg.id}`)}
                    className="mt-2 w-full py-2 text-xs bg-gray-100 rounded-md hover:bg-gray-200 transition"
                  >
                    SELECT
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="w-full py-20 text-center text-gray-500 border border-dashed border-gray-300 rounded-md">
          No packages found with the selected filters or search query.
        </div>
      )}
    </div>
  );
};

export default ClientPackagePageContent;
