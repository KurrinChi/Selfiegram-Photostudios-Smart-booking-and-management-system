import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Archive, Pen, RefreshCw } from "lucide-react";

interface Package {
  id: string;
  title: string;
  price: number;
  tags: string[];
  images?: string[];
  status: number; // 1 for active, 0 for archived
}

const API_URL = import.meta.env.VITE_API_URL;

const AdminPackageContent: React.FC = () => {
  const [allPackages, setAllPackages] = useState<Package[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [imageIndexMap, setImageIndexMap] = useState<Record<string, number>>(
    {}
  );
  const [fadingImages, setFadingImages] = useState<Record<string, boolean>>({});
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmArchive, setConfirmArchive] = useState<Package | null>(null); // modal state

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetchWithAuth(
          `${API_URL}/api/admin/packages-all`
        );
        const data = await response.json();
        setAllPackages(data);
      } catch (error) {
        console.error("Failed to fetch packages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
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

  const toggleArchive = async (pkg: Package) => {
    if (!pkg) return;

    const newStatus = pkg.status === 1 ? 0 : 1;

    try {
      const response = await fetchWithAuth(
        `${API_URL}/api/admin/packages/${pkg.id}/archive`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setAllPackages((prevPackages) =>
          prevPackages.map((p) =>
            p.id === pkg.id ? { ...p, status: data.newStatus } : p
          )
        );
        toast.success(data.message);
      } else {
        toast.error(data.message || "Failed to update package status.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while updating package status.");
    }
  };

  const handleArchiveClick = (pkg: Package) => {
    setConfirmArchive(pkg); // open modal
  };

  const confirmArchiveAction = async () => {
    if (confirmArchive) {
      await toggleArchive(confirmArchive);
      setConfirmArchive(null); // close modal
    }
  };

  return (
    <div className="p-4 overflow-y-auto max-h-230 rounded-3xl transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-lg sm:text-xl font-semibold pl-12 sm:pl-0">
          Available Packages
        </h1>
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
          <button
            onClick={() => navigate("add")}
            className="bg-black text-white px-4 py-2 rounded-md text-sm hover:opacity-80 transition"
          >
            Add New Package
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">
          Loading packages...
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((pkg) => {
            const currentImgIdx = imageIndexMap[pkg.id] ?? 0;
            const isFading = fadingImages[pkg.id];

            return (
              <div
                key={pkg.id}
                className="relative bg-white rounded-xl shadow-sm transition-all duration-300 transform hover:-translate-y-2 hover:scale-102 hover:shadow-xl p-2 overflow-hidden group"
              >
                <div className="relative z-0 h-100 rounded-md overflow-hidden bg-gray-100">
                  <img
                    src={
                      pkg.images && pkg.images.length > 0
                        ? pkg.images[currentImgIdx]
                        : "/slfg-placeholder 2.png"
                    }
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/slfg-placeholder 2.png";
                    }}
                    className={`w-full h-full object-cover transition-opacity duration-500 ease-in-out ${isFading ? "opacity-0" : "opacity-100"
                      }`}
                    alt="Package"
                  />
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 bg-white/60 px-2 py-1 rounded-full backdrop-blur-sm">
                    {(pkg.images?.length
                      ? pkg.images
                      : ["/slfg-placeholder 2.png"]
                    ).map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        onClick={() =>
                          setImageIndexMap((prev) => ({ ...prev, [pkg.id]: i }))
                        }
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/slfg-placeholder 2.png";
                        }}
                        className={`w-6 h-6 object-cover rounded-full border-2 cursor-pointer transition ${i === currentImgIdx
                            ? "border-black"
                            : "border-transparent opacity-60"
                          }`}
                        alt={`Thumb ${i + 1}`}
                      />
                    ))}
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
                        className={`px-2 py-0.5 rounded-full text-[10px] ${getTagPillClass(
                          tag
                        )}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="absolute top-4 right-4 flex gap-3 ">
                    <button
                      onClick={() => handleArchiveClick(pkg)}
                      className=" p-2 rounded-md font-bold backdrop-blur-md bg-gray-100 border border-white/20 shadow-md hover:bg-gray-200 transition"
                      title={
                        pkg.status === 1
                          ? "Archive Package"
                          : "Unarchive Package"
                      }
                    >
                      {pkg.status === 1 ? (
                        <Archive className="text-red-400" />
                      ) : (
                        <RefreshCw className="text-green-400" />
                      )}
                    </button>
                    <button
                      onClick={() => navigate(`edit/${pkg.id}`)}
                      className=" p-2 rounded-md  font-bold backdrop-blur-md bg-gray-100 border border-white/20 shadow-md hover:bg-gray-200 transition"
                      title="Edit Package"
                    >
                      <Pen className="text-black-700" />
                    </button>
                  </div>
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

      {/* ✅ Archive Confirmation Modal */}
      {confirmArchive && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 text-center space-y-4">
            <div
              className={`mx-auto w-12 h-12 flex items-center justify-center rounded-full ${confirmArchive.status === 1 ? "bg-red-100" : "bg-green-100"
                }`}
            >
              {confirmArchive.status === 1 ? (
                <Archive className="text-red-600" />
              ) : (
                <RefreshCw className="text-green-600" />
              )}
            </div>
            <h2 className="text-lg font-semibold">
              {confirmArchive.status === 1 ? "Archive Package" : "Unarchive Package"}
            </h2>
            <p className="text-sm text-gray-600">
              {confirmArchive.status === 1 ? "Are you sure you want to archive" : "Are you sure you want to unarchive"}{" "}
              <span className="font-semibold">{confirmArchive.title}</span>?{" "}
              {confirmArchive.status === 1 ? "This package will not be available to customers." : "This package will be available to customers."}
            </p>
            <div className="flex justify-between gap-4 pt-4">
              <button
                onClick={() => setConfirmArchive(null)}
                className="w-full py-2 border rounded-md text-sm hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmArchiveAction}
                className={`w-full py-2 text-white text-sm rounded-md ${confirmArchive.status === 1
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                  }`}
              >
                {confirmArchive.status === 1 ? "Archive" : "Unarchive"}
              </button>
            </div>
          </div>
        </div>
      )}


      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default AdminPackageContent;
