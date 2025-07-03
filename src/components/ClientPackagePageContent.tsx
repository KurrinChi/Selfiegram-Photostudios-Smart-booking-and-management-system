import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import mockPackages from "../data/mockPackages.json";

interface Package {
  id: string;
  title: string;
  price: number;
  tags: string[];
  images: string[];
}

const allPackages: Package[] = mockPackages as Package[];
const allTags = Array.from(new Set(allPackages.flatMap((pkg) => pkg.tags)));

const ClientPackagePageContent: React.FC = () => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [imageIndexMap, setImageIndexMap] = useState<Record<string, number>>(
    {}
  );
  const [fadingImages, setFadingImages] = useState<Record<string, boolean>>({});
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filtered = allPackages.filter((pkg) => {
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((tag) => pkg.tags.includes(tag));
    const lowerQuery = searchQuery.toLowerCase();
    const matchesSearch =
      pkg.title.toLowerCase().includes(lowerQuery) ||
      pkg.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
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
            const next = (current + 1) % pkg.images.length;
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
    <div className="p-4 overflow-y-auto max-h-160 rounded-3xl transition-all duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold">Available Packages</h1>
        <div className="flex flex-wrap gap-3 items-center text-xs">
          {/* Search Bar */}
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

          {/* Filter Tags Dropdown */}
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

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((pkg) => {
            const currentImgIdx = imageIndexMap[pkg.id] ?? 0;
            const isFading = fadingImages[pkg.id];

            return (
              <div
                key={pkg.id}
                className="relative bg-white rounded-xl shadow-sm transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 hover:shadow-xl p-2 overflow-hidden group"
              >
                <div className="relative z-0 h-100 rounded-md overflow-hidden">
                  <img
                    src={pkg.images[currentImgIdx]}
                    className={`w-full h-full object-cover transition-opacity duration-500 ease-in-out ${
                      isFading ? "opacity-0" : "opacity-100"
                    }`}
                    alt="Package"
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
                        className={`px-2 py-0.5 rounded-full text-[10px] ${getTagPillClass(
                          tag
                        )}`}
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
