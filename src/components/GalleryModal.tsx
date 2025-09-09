// components/GalleryModal.tsx
import React, { useState, useRef, useEffect } from "react";
import { X, Upload, Trash2 } from "lucide-react";

// 👇 Add this type (adjust fields as needed for your API)
export interface BookingSummary {
  id: number | string;
  packageName: string;
  customerName?: string | null;
  dateTime?: string; // ISO string, e.g. "2025-01-24T10:00:00Z"
  bookingStartTime?: string; // e.g. "10:00:00"
  bookingEndTime?: string; // e.g. "12:00:00"
}

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking?: BookingSummary; // 👈 NEW
}

interface ImageItem {
  id: string;
  url: string;
}

const GalleryModal: React.FC<GalleryModalProps> = ({
  isOpen,
  onClose,
  booking,
}) => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setMultiSelectMode(false);
      setSelectedImages([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: ImageItem[] = Array.from(files).map((file, index) => ({
      id: `img-${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);
  };

  const handleRemove = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    setSelectedImages((prev) => prev.filter((i) => i !== id));
  };

  const handleRemoveSelected = () => {
    setImages((prev) => prev.filter((img) => !selectedImages.includes(img.id)));
    setSelectedImages([]);
    setMultiSelectMode(false);
  };

  const toggleSelect = (id: string) => {
    if (!multiSelectMode) return;
    setSelectedImages((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-4xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">
            Gallery {booking ? `– ${booking.customerName}` : ""}
          </h2>
          {booking && (
            <p className="text-xs text-gray-500 mt-1">
              ID: {booking.id} • {booking.packageName ?? "N/A"} •
              {booking.dateTime
                ? " " + new Date(booking.dateTime).toLocaleDateString("en-US")
                : ""}
            </p>
          )}

          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls */}
        <div className="flex gap-2 p-4 border-b">
          <button
            className="flex items-center gap-2 px-3 py-1 rounded-md bg-black text-white hover:opacity-90"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4" /> Upload
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />

          {multiSelectMode ? (
            <>
              <button
                className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300"
                onClick={() => {
                  setMultiSelectMode(false);
                  setSelectedImages([]);
                }}
              >
                Cancel
              </button>
              <button
                className="flex items-center gap-2 px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                onClick={handleRemoveSelected}
                disabled={selectedImages.length === 0}
              >
                <Trash2 className="w-4 h-4" /> Remove Selected (
                {selectedImages.length})
              </button>
            </>
          ) : (
            <button
              className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300"
              onClick={() => setMultiSelectMode(true)}
              disabled={images.length === 0}
            >
              Multiple Select
            </button>
          )}
        </div>

        {/* Gallery Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {images.length === 0 ? (
            <p className="text-gray-500 text-center mt-20">
              No photos uploaded yet.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((img) => {
                const selected = selectedImages.includes(img.id);
                return (
                  <div
                    key={img.id}
                    className={`relative rounded-lg overflow-hidden border cursor-pointer group ${
                      multiSelectMode && selected
                        ? "ring-2 ring-blue-500"
                        : "hover:shadow-md"
                    }`}
                    onClick={() => toggleSelect(img.id)}
                  >
                    <img
                      src={img.url}
                      alt=""
                      className="w-full h-40 object-cover"
                    />
                    {!multiSelectMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(img.id);
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GalleryModal;
