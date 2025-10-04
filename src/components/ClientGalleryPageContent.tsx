// ClientGalleryPageContent.tsx
import React, { useEffect, useState } from "react";
import ChatWidget from "./ChatWidget";
import { Edit, X, Heart } from "lucide-react";
import JSZip from "jszip";
import { fetchWithAuth } from "../utils/fetchWithAuth"; // adjust path if needed

/* ----------------------------- Types ----------------------------- */
type ImageItem = {
  id: string;
  url: string;
  date: string; // formatted display date, e.g. "October 1, 2025"
  edited?: boolean;
  isFavorite?: boolean;
  bookingID?: number;
  packageName?: string; // raw package name from backend
  categoryTitle?: string; // "BookingID: PackageName"
};

type GroupImage = {
  id: string;
  url: string;
  edited?: boolean;
  isFavorite?: boolean;
};

type PackageGroup = {
  packageName: string;
  images: GroupImage[];
};

type DateGroup = {
  date: string;
  packages: PackageGroup[];
};

/* --------------------------- Constants --------------------------- */
const TABS = ["Gallery", "Favorites"];

/* --------------------------- Component --------------------------- */
const ClientGalleryPageContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("Gallery");
  const [galleryData, setGalleryData] = useState<DateGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<null | {
    id: string;
    url: string;
  }>(null);
  const [openPackageMap, setOpenPackageMap] = useState<Record<string, boolean>>(
    {}
  ); // key: `${date}__${packageName}`

  const API_URL = import.meta.env.VITE_API_URL;
  const userID = localStorage.getItem("userID");

  /* ------------------------- Fetch & Group ------------------------- */
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const res = await fetchWithAuth(`${API_URL}/api/user-images/${userID}`);
        if (!res.ok) throw new Error("Failed to fetch images");
        const data = await res.json();

        const mapped: ImageItem[] = (data || []).map((img: any) => ({
          id: String(img.imageID),
          url: `${API_URL}/api/proxy-image?path=${encodeURIComponent(
            (img.filePath || "").replace(/^\/storage\//, "")
          )}`,
          date: new Date(img.uploadDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          edited: img.tag === "edited",
          isFavorite: img.isFavorite === 1 || img.isFavorite === true,
          bookingID: img.bookingID ?? img.booking_id ?? undefined,
          packageName: img.packageName ?? undefined,
          categoryTitle:
            img && getBookingLabel(img.bookingID ?? img.booking_id, img.packageName)
            ? `${getBookingLabel(img.bookingID ?? img.booking_id, img.packageName)}${img.packageName ? `: ${img.packageName}` : ""}`
            : undefined,
        }));

        const grouped = groupByDateAndPackage(mapped);
        setGalleryData(grouped);

        // default: collapse packages for minimal UI
        const initialOpen: Record<string, boolean> = {};
        grouped.forEach((dg) =>
          dg.packages.forEach(
            (pg) => (initialOpen[`${dg.date}__${pg.packageName}`] = false)
          )
        );
        setOpenPackageMap(initialOpen);
      } catch (err) {
        console.error("Error fetching images:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [API_URL, userID]);

  const groupByDateAndPackage = (images: ImageItem[]): DateGroup[] => {
    const byDate: Record<string, ImageItem[]> = {};
    images.forEach((img) => {
      const k = img.date;
      if (!byDate[k]) byDate[k] = [];
      byDate[k].push(img);
    });

    const dateGroups: DateGroup[] = Object.entries(byDate).map(
      ([date, imgs]) => {
        const byPackage: Record<string, GroupImage[]> = {};
        imgs.forEach((img) => {
          const pkg = img.categoryTitle ?? "Uncategorized";
          if (!byPackage[pkg]) byPackage[pkg] = [];
          byPackage[pkg].push({
            id: img.id,
            url: img.url,
            edited: img.edited,
            isFavorite: img.isFavorite,
          });
        });

        const packages: PackageGroup[] = Object.entries(byPackage).map(
          ([packageName, images]) => ({ packageName, images })
        );
        return { date, packages };
      }
    );

    // sort dates (newest first) where possible
    dateGroups.sort((a, b) => {
      const ta = Date.parse(a.date) || 0;
      const tb = Date.parse(b.date) || 0;
      return tb - ta;
    });

    return dateGroups;
  };

    const getBookingLabel = (bookingID: number, packageName?: string) => {
  if (!packageName) return `#${bookingID}`; // fallback if packageName is missing
  const acronym = packageName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  return `${acronym}#${bookingID}`;
};

  /* --------------------------- Actions ---------------------------- */
  const toggleFavorite = async (id: string) => {
    try {
      const res = await fetchWithAuth(
        `${API_URL}/api/user-images/favorite/${id}`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error("Failed to toggle favorite");
      const data = await res.json();
      setGalleryData((prev) =>
        prev.map((dg) => ({
          ...dg,
          packages: dg.packages.map((pg) => ({
            ...pg,
            images: pg.images.map((img) =>
              img.id === id ? { ...img, isFavorite: data.isFavorite } : img
            ),
          })),
        }))
      );
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  const fetchImageUrl = async (filename: string) => {
    const response = await fetchWithAuth(
      `${API_URL}/api/image-url/${filename}`
    );
    if (!response.ok) throw new Error("Failed to fetch image url");
    const data = await response.json();
    return data.url;
  };

  const handleEdit = async (filename: string) => {
    try {
      const imageUrl = await fetchImageUrl(filename);
      window.location.href = `/edit?url=${encodeURIComponent(imageUrl)}`;
    } catch (err) {
      console.error("Failed to open editor:", err);
    }
  };

  const handleSelectImage = (id: string) => {
    setSelectedImages((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDownloadSelected = async () => {
    if (selectedImages.length === 0) return;
    const zip = new JSZip();
    const folder = zip.folder("selected-images");
    try {
      const imagePromises = selectedImages.map(async (id) => {
        const img = galleryData
          .flatMap((dg) => dg.packages.flatMap((pg) => pg.images))
          .find((i) => i.id === id);
        if (img) {
          const response = await fetch(img.url);
          if (!response.ok) {
            console.error("Failed to fetch", img.url);
            return;
          }
          const blob = await response.blob();
          folder?.file(img.url.split("/").pop() || `image-${id}.jpg`, blob);
        }
      });

      await Promise.all(imagePromises);
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(zipBlob);
      link.download = "selected-images.zip";
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Error while downloading selected images:", error);
    }
  };

  const togglePackageOpen = (date: string, packageName: string) => {
    const key = `${date}__${packageName}`;
    setOpenPackageMap((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  /* --------------------------- Filters ---------------------------- */
  const filteredData =
    activeTab === "Favorites"
      ? galleryData
          .map((dg) => ({
            date: dg.date,
            packages: dg.packages
              .map((pg) => ({
                packageName: pg.packageName,
                images: pg.images.filter((img) => img.isFavorite),
              }))
              .filter((pg) => pg.images.length > 0),
          }))
          .filter((dg) => dg.packages.length > 0)
      : activeTab === "Edited"
      ? galleryData
          .map((dg) => ({
            date: dg.date,
            packages: dg.packages.map((pg) => ({
              packageName: pg.packageName,
              images: pg.images.filter((img) => img.edited),
            })),
          }))
          .filter((dg) => dg.packages.some((pg) => pg.images.length > 0))
      : galleryData;

  const isSelected = (id: string) => selectedImages.includes(id);

  /* ----------------------------- Render ---------------------------- */
  if (loading) {
    return (
      <div className="p-4 font-sans">
        <div className="w-full min-h-[65vh] flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-slate-900 rounded-full animate-spin mb-5" />
          <p className="text-sm text-slate-600 tracking-wide">Loading your gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 font-sans relative">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex gap-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm px-3 py-1 rounded-full transition-colors duration-120 border ${
                activeTab === tab
                  ? "bg-slate-900 text-white border-transparent"
                  : "bg-white text-slate-700 border-slate-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {selectedImages.length > 0 && (
            <div className="text-sm text-slate-600">
              {selectedImages.length} selected
            </div>
          )}
          {selectedImages.length > 0 && (
            <button
              onClick={handleDownloadSelected}
              className="text-sm px-3 py-1 bg-slate-900 text-white rounded-md"
            >
              Download
            </button>
          )}
        </div>
      </div>

      {/* Empty state */}
      {!loading && filteredData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500">
          <p className="text-lg font-medium mb-2">No photos yet</p>
          <p className="text-sm max-w-xs">
            Book a photo session now to start capturing memories.
          </p>
        </div>
      ) : (
        filteredData.map((dateGroup) => (
          <section key={dateGroup.date} className="mb-6">
            {/* Packages */}
            <div className="space-y-4">
              {dateGroup.packages.map((pkg) => {
                const key = `${dateGroup.date}__${pkg.packageName}`;
                const open = !!openPackageMap[key];
                const total = pkg.images.length;
                const selectedCount = pkg.images.filter((i) =>
                  selectedImages.includes(i.id)
                ).length;

                return (
                  <div
                    key={key}
                    className="rounded-md bg-white shadow-sm overflow-hidden"
                  >
                    {/* Package header - date on the left, chevron on right */}
                    <div
                      className="flex items-center justify-between px-4 py-3 cursor-pointer"
                      onClick={() =>
                        togglePackageOpen(dateGroup.date, pkg.packageName)
                      }
                    >
                      <div className="flex items-center gap-3">
                        {/* package name and counts */}
                        <div>
                          <div className="text-sm font-medium text-slate-800">
                            {pkg.packageName}
                          </div>
                          <div className="text-xs text-slate-400">
                            {total} photos{" "}
                            {selectedCount > 0 && `• ${selectedCount} selected`}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div
                          className={`transition-transform ${
                            open ? "rotate-180" : "rotate-0"
                          }`}
                        >
                          <svg
                            className="w-4 h-4 text-slate-500"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path
                              d="M6 9l6 6 6-6"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>

                      {/* DATE (now inside header, left side) */}
                      <div className="text-sm text-slate-500 w-[160px] truncate">
                        {dateGroup.date}
                      </div>
                    </div>

                    {/* Images grid */}
                    {open && (
                      <div className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 bg-white">
                        {pkg.images.map((img) => {
                          const selected = isSelected(img.id);
                          return (
                            <div
                              key={img.id}
                              onClick={() => handleSelectImage(img.id)}
                              className={`relative rounded-md overflow-hidden bg-slate-50 cursor-pointer border ${
                                selected
                                  ? "ring-2 ring-slate-900 border-transparent"
                                  : "border-transparent"
                              }`}
                            >
                              <img
                                src={img.url}
                                alt=""
                                className="w-full h-44 object-cover"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewImage({ id: img.id, url: img.url });
                                }}
                              />

                              {/* top-right action pills */}
                              <div className="absolute inset-0 flex items-start justify-end p-2 pointer-events-none">
                                <div className="pointer-events-auto flex gap-2">
                                  <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite(img.id);
                                  }}
                                  className="p-1 bg-white rounded-full shadow-sm"
                                  aria-label="Toggle favorite"
                                >
                                  {img.isFavorite ? (
                                    <Heart className="w-4 h-4 text-pink-500 fill-pink-500" /> // solid pink
                                  ) : (
                                    <Heart className="w-4 h-4 text-slate-400" /> // outline gray
                                  )}
                                </button>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEdit(img.id);
                                    }}
                                    className="p-1 bg-white rounded-full shadow-sm"
                                    aria-label="Edit image"
                                  >
                                    <Edit className="w-4 h-4 text-slate-500" />
                                  </button>
                                </div>
                              </div>

                              {/* bottom-left small indicator */}
                              <div className="absolute left-2 bottom-2">
                                <div
                                  className={`w-4 h-4 rounded-sm border ${
                                    selected
                                      ? "bg-slate-900 border-transparent"
                                      : "bg-white border-slate-200"
                                  }`}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))
      )}

      {/* Preview modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-2 right-2 z-10 bg-white rounded-full p-1 shadow"
            >
              <X className="w-5 h-5 text-slate-700" />
            </button>
            <img
              src={previewImage.url}
              alt=""
              className="w-full h-full object-contain rounded-md"
            />
          </div>
        </div>
      )}
      <ChatWidget />
    </div>
  );
};

export default ClientGalleryPageContent;
