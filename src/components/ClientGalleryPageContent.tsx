import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp, Download, Edit, X, Heart } from "lucide-react";
import GalleryModal from "./GalleryModal";

const groupImagesByDate = (
  images: { id: string; url: string; date: string; edited?: boolean }[]
) => {
  const grouped: Record<
    string,
    { id: string; url: string; edited?: boolean }[]
  > = {};
  images.forEach((img) => {
    if (!grouped[img.date]) grouped[img.date] = [];
    grouped[img.date].push({ id: img.id, url: img.url, edited: img.edited });
  });
  return Object.entries(grouped).map(([date, imgs]) => ({
    date,
    images: imgs,
  }));
};

const galleryImports = import.meta.glob(
  "/public/sflg photos/*.{jpg,jpeg,png}",
  {
    eager: true,
    as: "url",
  }
);

const editedImports = import.meta.glob("/public/sflg edited/*.{jpg,jpeg,png}", {
  eager: true,
  as: "url",
});

const TABS = ["Gallery", "Edited", "Favorites"];

const ClientGalleryPageContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Gallery");
  const [galleryData, setGalleryData] = useState<
    { date: string; images: { id: string; url: string; edited?: boolean }[] }[]
  >([]);
  const [editedData, setEditedData] = useState<
    { date: string; images: { id: string; url: string; edited?: boolean }[] }[]
  >([]);
  const [expandedDates, setExpandedDates] = useState<string[]>([]);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<null | {
    id: string;
    url: string;
  }>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const lastSelectedRef = useRef<string | null>(null);

  useEffect(() => {
    const images = Object.entries(galleryImports).map(([path, url], index) => {
      const fileDate = new Date();
      const dateString = fileDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      return {
        id: `g-${index}`,
        url: url as string,
        date: dateString,
      };
    });
    setGalleryData(groupImagesByDate(images));
  }, []);

  useEffect(() => {
    const images = Object.entries(editedImports).map(([path, url], index) => {
      const fileDate = new Date();
      const dateString = fileDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      return {
        id: `e-${index}`,
        url: url as string,
        date: dateString,
        edited: true,
      };
    });
    setEditedData(groupImagesByDate(images));
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreviewImage(null);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const toggleDate = (date: string) => {
    setExpandedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    );
  };

  const toggleImageSelection = (id: string, e?: React.MouseEvent) => {
    if (e?.shiftKey && lastSelectedRef.current) {
      const allImages = (
        activeTab === "Edited" ? editedData : galleryData
      ).flatMap((g) => g.images);
      const startIndex = allImages.findIndex(
        (img) => img.id === lastSelectedRef.current
      );
      const endIndex = allImages.findIndex((img) => img.id === id);
      if (startIndex !== -1 && endIndex !== -1) {
        const [from, to] =
          startIndex < endIndex
            ? [startIndex, endIndex]
            : [endIndex, startIndex];
        const range = allImages.slice(from, to + 1).map((img) => img.id);
        const unique = Array.from(new Set([...selectedImages, ...range]));
        setSelectedImages(unique);
        return;
      }
    }
    lastSelectedRef.current = id;
    setSelectedImages((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const downloadSelected = () => {
    const data = activeTab === "Edited" ? editedData : galleryData;
    selectedImages.forEach((id) => {
      const image = data.flatMap((g) => g.images).find((img) => img.id === id);
      if (image) {
        const a = document.createElement("a");
        a.href = image.url;
        a.download = image.url.split("/").pop() || "image.jpg";
        a.click();
      }
    });
  };

  const handleToggleMultiSelect = () => {
    if (multiSelectMode && selectedImages.length > 0) {
      if (!confirm("Clear all selected images?")) return;
    }
    setMultiSelectMode((prev) => !prev);
    setSelectedImages([]);
  };

  const filteredData =
    activeTab === "Favorites"
      ? galleryData
          .map((group) => ({
            date: group.date,
            images: group.images.filter((img) => favorites.includes(img.id)),
          }))
          .filter((group) => group.images.length > 0)
      : activeTab === "Edited"
      ? editedData
      : galleryData;

  return (
    <div className="p-4 font-sf animate-fadeIn">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm px-4 py-1 rounded-full border transition-all duration-200 ${
                activeTab === tab
                  ? "bg-black text-white border-black"
                  : "text-black border-gray-300 hover:border-black"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {filteredData.length > 0 &&
          activeTab === "Gallery" &&
          (multiSelectMode ? (
            <div className="flex gap-2">
              <button
                className="text-sm px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
                onClick={handleToggleMultiSelect}
              >
                Cancel
              </button>
              <button
                className="text-sm px-3 py-1 rounded-md bg-black text-white hover:opacity-90"
                onClick={downloadSelected}
                disabled={selectedImages.length === 0}
              >
                <Download className="inline w-4 h-4 mr-1" />
                Download ({selectedImages.length})
              </button>
              <button
                className="text-sm px-3 py-1 rounded-md bg-pink-100 text-pink-800 hover:bg-pink-200"
                onClick={() => selectedImages.forEach(toggleFavorite)}
              >
                <Heart className="inline w-4 h-4 mr-1" />
                Favorite
              </button>
            </div>
          ) : (
            <button
              className="text-sm px-3 py-1 rounded-md bg-black text-white hover:opacity-90"
              onClick={handleToggleMultiSelect}
            >
              Multiple Select
            </button>
          ))}
      </div>

      {filteredData.length === 0 ? (
        <div className="text-center text-gray-500 mt-20">
          <p className="text-lg font-medium mb-2">
            {activeTab === "Favorites"
              ? "No favorites yet"
              : activeTab === "Edited"
              ? "No edited photos yet"
              : "No photos yet"}
          </p>
          <p className="text-sm">
            {activeTab === "Favorites"
              ? "Click the heart icon to add favorites."
              : activeTab === "Edited"
              ? "Try editing a photo to see it here."
              : "Book a photo session now to start capturing memories!"}
          </p>
        </div>
      ) : (
        filteredData.map((group) => (
          <div key={group.date} className="mb-6">
            <button
              className="flex justify-between items-center w-full text-left font-medium text-lg mb-2"
              onClick={() => toggleDate(group.date)}
            >
              <span>{group.date}</span>
              {expandedDates.includes(group.date) ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {expandedDates.includes(group.date) && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {group.images.map((img) => {
                  const selected = selectedImages.includes(img.id);
                  const isFav = favorites.includes(img.id);
                  return (
                    <div
                      key={img.id}
                      className={`relative rounded-lg overflow-hidden cursor-pointer transition-all duration-500 ease-in-out transform hover:scale-[1.03] flex items-center justify-center bg-white ${
                        multiSelectMode && selected
                          ? "ring-2 ring-blue-500"
                          : ""
                      }`}
                      onClick={(e) =>
                        multiSelectMode
                          ? toggleImageSelection(img.id, e)
                          : setPreviewImage(img)
                      }
                    >
                      <img
                        src={img.url}
                        alt=""
                        className="max-w-full max-h-full object-contain"
                      />
                      {!multiSelectMode && isFav && (
                        <Heart
                          className="absolute top-2 right-2 w-5 h-5 text-pink-500"
                          fill="currentColor"
                        />
                      )}
                      {multiSelectMode && selected && (
                        <div className="absolute top-2 right-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))
      )}

      {previewImage && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center"
          tabIndex={0}
          ref={modalRef}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>

            <img
              src={previewImage.url}
              alt=""
              className="object-contain max-h-full max-w-full rounded-xl transition-all duration-300"
            />

            <div className="absolute top-4 right-16 flex gap-2">
              <button
                onClick={() =>
                  window.open(`/edit/${previewImage.id}`, "_blank")
                }
                className="text-sm px-3 py-1 rounded-md bg-white/80 text-black hover:bg-white"
              >
                <Edit className="w-4 h-4 inline mr-1" /> Edit
              </button>
              <a
                href={previewImage.url}
                download
                className="text-sm px-3 py-1 rounded-md bg-white/80 text-black hover:bg-white"
              >
                <Download className="w-4 h-4 inline mr-1" /> Download
              </a>
              <button
                onClick={() => toggleFavorite(previewImage.id)}
                className={`text-sm px-3 py-1 rounded-md ${
                  favorites.includes(previewImage.id)
                    ? "bg-pink-100 text-pink-800"
                    : "bg-white/80 text-black hover:bg-white"
                }`}
              >
                <Heart className="w-4 h-4 inline mr-1" /> Favorite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientGalleryPageContent;
