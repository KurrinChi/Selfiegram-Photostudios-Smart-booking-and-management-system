import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import mockPackages from "../data/mockPackages.json";

interface Package {
  id: string;
  title: string;
  price: number;
  tags: string[];
  duration: string;
  description: string;
  images: string[];
}

const initialFavoriteIds = ["pkg-001", "pkg-005", "pkg-006", "pkg-014"];

const ClientFavoritePageContent: React.FC = () => {
  const navigate = useNavigate();
  const [imageIndexMap, setImageIndexMap] = useState<Record<string, number>>(
    {}
  );
  const [fadingImages, setFadingImages] = useState<Record<string, boolean>>({});
  const [favoriteIds, setFavoriteIds] = useState<string[]>(initialFavoriteIds);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const allPackages = mockPackages as Package[];
  const favoritePackages = allPackages.filter((pkg) =>
    favoriteIds.includes(pkg.id)
  );

  useEffect(() => {
    const timers = favoritePackages.map((pkg) => {
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
  }, [favoritePackages]);

  const getTagClass = (tag: string) => {
    const map: Record<string, string> = {
      "Self Shoot": "bg-blue-200 text-blue-800",
      Graduation: "bg-red-200 text-red-800",
      Studio: "bg-yellow-200 text-yellow-800",
      Photoshoot: "bg-cyan-200 text-cyan-800",
    };
    return map[tag] || "bg-gray-100 text-gray-700";
  };

  const removeFromFavorites = (id: string) => {
    setFavoriteIds((prev) => prev.filter((pkgId) => pkgId !== id));
    setConfirmingId(null);
  };

  return (
    <div className="p-4 overflow-y-auto max-h-160 rounded-3xl transition-all duration-300">
      <h1 className="text-2xl font-semibold mb-6">Your Favorite Packages</h1>

      {/* Modal */}
      {confirmingId && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-80">
            <h2 className="text-lg font-semibold mb-2 text-center">
              Remove from Favorites?
            </h2>
            <p className="text-sm text-gray-600 mb-4 text-center">
              Are you sure you want to remove this package from your favorites?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmingId(null)}
                className="px-4 py-2 text-sm border rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => removeFromFavorites(confirmingId)}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {favoritePackages.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoritePackages.map((pkg) => {
            const currentImgIdx = imageIndexMap[pkg.id] ?? 0;
            const isFading = fadingImages[pkg.id];

            return (
              <div
                key={pkg.id}
                className="relative bg-white rounded-xl shadow-sm transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 hover:shadow-xl p-2 overflow-hidden group"
              >
                {/* Heart button with confirm */}
                <button
                  onClick={() => setConfirmingId(pkg.id)}
                  className="absolute top-4 right-4 z-10"
                >
                  <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                </button>

                <div className="relative z-0 h-100 rounded-md overflow-hidden">
                  <img
                    src={pkg.images[currentImgIdx]}
                    className={`w-full h-full object-cover transition-opacity duration-500 ease-in-out ${
                      isFading ? "opacity-0" : "opacity-100"
                    }`}
                    alt={pkg.title}
                  />
                  <div className="absolute bottom-2 w-full flex justify-center gap-1">
                    {pkg.images.map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 w-2 rounded-full ${
                          i === currentImgIdx
                            ? "bg-black"
                            : "bg-gray-300 scale-60"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="p-3 space-y-2">
                  <div className="font-medium text-sm">{pkg.title}</div>
                  <div className="text-gray-500 text-xs">
                    ₱{pkg.price.toFixed(2)}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {pkg.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`px-2 py-0.5 rounded-full text-[10px] ${getTagClass(
                          tag
                        )}`}
                      >
                        {tag}
                      </span>
                    ))}
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
      ) : (
        <div className="w-full py-20 text-center text-gray-500 border border-dashed border-gray-300 rounded-md">
          You don’t have any favorites yet.
        </div>
      )}
    </div>
  );
};

export default ClientFavoritePageContent;
