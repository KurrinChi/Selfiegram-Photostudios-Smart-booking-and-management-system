import React, { useState, useRef, useEffect } from "react";
import { X, Upload, Trash2 } from "lucide-react";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export interface BookingSummary {
  id: number;
  packageID: number;
  userID: number | string;
  username: string;
  packageName: string;
  customerName: string | null;
  dateTime: string;
  bookingStartTime: string;
  bookingEndTime: string;
}

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking?: BookingSummary;
}

interface ImageItem {
  id: string;
  url: string;
  isNew?: boolean;
  file?: File;
}

const API_URL = import.meta.env.VITE_API_URL;

const GalleryModal: React.FC<GalleryModalProps> = ({
  isOpen,
  onClose,
  booking,
}) => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "single" | "bulk"; ids: string[] } | null>(null);

  // Fetch already uploaded images when modal opens
  useEffect(() => {
    if (isOpen && booking) {
      fetchImagesForBooking(booking.userID as number);
    } else {
      setImages([]);
      setMultiSelectMode(false);
      setSelectedImages([]);
    }
  }, [isOpen, booking]);

  const fetchImagesForBooking = async (userID: number) => {
    try {
      const res = await fetchWithAuth(`${API_URL}/api/admin/images/${userID}`);
      if (!res.ok) throw new Error("Failed to fetch images");
      const data: { id: string; url: string }[] = await res.json();

      // Map API data to ImageItem[]
      const existingImages = data.map((img) => ({
        id: img.id,
        url: img.url,
        isNew: false,
      }));

      setImages(existingImages);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load images.");
    }
  };

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: ImageItem[] = Array.from(files).map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
      isNew: true,
      file,
    }));

    setImages((prev) => [...prev, ...newImages]);
    e.target.value = "";
  };

  const deleteImages = async (imageIDs: string[]) => {
    const res = await fetchWithAuth(`${API_URL}/api/admin/images/delete`, {
      method: "DELETE",
      body: JSON.stringify({ imageIDs }),
    });

    if (!res.ok) throw new Error("Failed to delete images");
    return res.json();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setUploading(true);
      await deleteImages(deleteTarget.ids);

      setImages((prev) => prev.filter((img) => !deleteTarget.ids.includes(img.id)));
      setSelectedImages((prev) => prev.filter((i) => !deleteTarget.ids.includes(i)));

      if (deleteTarget.type === "bulk") {
        setMultiSelectMode(false);
        toast.success(`${deleteTarget.ids.length} image(s) deleted successfully!`);
      } else {
        toast.success("Image deleted successfully!");
      }
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete image(s).");
    } finally {
      setUploading(false);
      setDeleteTarget(null);
    }
  };

  // Single delete
  const handleRemove = (id: string) => {
    const target = images.find((img) => img.id === id);

    if (target?.isNew) {
      // remove before upload
      setImages((prev) => prev.filter((img) => img.id !== id));
      toast.info("Image removed before upload.");
    } else {
      // Existing image, confirm delete
      setDeleteTarget({ type: "single", ids: [id] });
    }
  };

  // Bulk delete 
  const handleRemoveSelected = async () => {
    if (selectedImages.length === 0) return;

    const newImages = images.filter(
      (img) => selectedImages.includes(img.id) && img.isNew
    );
    const existingImages = images.filter(
      (img) => selectedImages.includes(img.id) && !img.isNew
    );

    // remove before upload
    if (newImages.length > 0) {
      setImages((prev) =>
        prev.filter((img) => !newImages.some((n) => n.id === img.id))
      );
      toast.info(`${newImages.length} image(s) removed before upload.`);
    }

    // If existing images, confirm delete
    if (existingImages.length > 0) {
      setDeleteTarget({
        type: "bulk",
        ids: existingImages.map((img) => img.id),
      });
    }
    // Reset selections
    setSelectedImages([]);
    setMultiSelectMode(false);
  };

  // Unchanged toggle select
  const toggleSelect = (id: string) => {
    if (!multiSelectMode) return;
    setSelectedImages((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Upload images
  const handleConfirmUpload = async () => {
    if (!booking) return;

    const newImages = images.filter((img) => img.isNew && img.file);

    if (newImages.length === 0) return;

    setUploading(true);

    try {
      for (const img of newImages) {
        const formData = new FormData();
        formData.append("file", img.file!);
        formData.append("userID", booking.userID.toString());
        formData.append("packageID", booking.packageID.toString());

        const res = await fetchWithAuth(`${API_URL}/api/admin/upload`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error("Failed to upload image");
        }

        const uploadedImage = await res.json();

        setImages((prev) =>
          prev.map((image) =>
            image.id === img.id
              ? { id: uploadedImage.id, url: uploadedImage.fileUrl, isNew: false }
              : image
          )
        );
      }
      toast.success("Image uploaded successfully!", { autoClose: 2800 });
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      console.error(error);
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const getBookingLabel = (bookingID: number, packageName: string) => {
    const acronym = packageName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
    return `${acronym}#${bookingID}`;
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
              ID: {getBookingLabel(booking.id, booking.packageName)} •{" "}
              {booking.packageName ?? "N/A"} •
              {booking.dateTime
                ? " " + new Date(booking.dateTime).toLocaleDateString("en-US")
                : ""}
            </p>
          )}

          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
            disabled={uploading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls */}
        <div className="flex gap-2 p-4 border-b items-center">
          <button
            className="flex items-center gap-2 px-3 py-1 rounded-md bg-black text-white hover:opacity-90 disabled:opacity-50"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="w-4 h-4" /> Select Images
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
            disabled={uploading}
          />

          <button
            className="px-3 py-1 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            onClick={handleConfirmUpload}
            disabled={
              uploading || images.filter((img) => img.isNew).length === 0
            }
          >
            Confirm Upload
          </button>

          {multiSelectMode ? (
            <>
              <button
                className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300"
                onClick={() => {
                  setMultiSelectMode(false);
                  setSelectedImages([]);
                }}
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                className="flex items-center gap-2 px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                onClick={handleRemoveSelected}
                disabled={selectedImages.length === 0 || uploading}
              >
                <Trash2 className="w-4 h-4" /> Remove Selected (
                {selectedImages.length})
              </button>
            </>
          ) : (
            <button
              className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300"
              onClick={() => setMultiSelectMode(true)}
              disabled={images.length === 0 || uploading}
            >
              Multiple Select
            </button>
          )}
        </div>

        {/* Gallery Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* No images at all */}
          {images.length === 0 ? (
            <p className="text-gray-500 text-center mt-20">
              No photos uploaded yet.
            </p>
          ) : (
            <>
              {/* Pending Upload Section */}
              {images.some((img) => img.isNew) && (
                <>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Pending Upload</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {images
                      .filter((img) => img.isNew)
                      .map((img) => {
                        const selected = selectedImages.includes(img.id);
                        return (
                          <div
                            key={img.id}
                            className={`relative rounded-lg overflow-hidden border cursor-pointer group ${multiSelectMode && selected
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
                                disabled={uploading}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </>
              )}

              {/* Existing Images Section */}
              {images.some((img) => !img.isNew) && (
                <>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 mt-6">Uploaded</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                    {images
                      .filter((img) => !img.isNew)
                      .map((img) => {
                        const selected = selectedImages.includes(img.id);
                        return (
                          <div
                            key={img.id}
                            className={`relative rounded-lg overflow-hidden border cursor-pointer group ${multiSelectMode && selected
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
                                disabled={uploading}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteTarget && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full text-center animate-fadeIn space-y-4">
              <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-red-100">
                <Trash2 className="text-red-600" />
              </div>
              <h2 className="text-lg font-semibold mb-4">
                {deleteTarget.type === "bulk" ? "Delete Selected Images" : "Delete Image"}
              </h2>
              <p className="text-sm text-gray-600">
                {deleteTarget.type === "bulk"
                  ? `Are you sure you want to delete ${deleteTarget.ids.length} selected image(s)?`
                  : "Are you sure you want to delete this image?"}{" "}
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 text-sm rounded-md bg-gray-100 hover:bg-gray-200"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 text-sm rounded-md bg-red-500 text-white hover:bg-red-600"
                  disabled={uploading}
                >
                  {uploading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default GalleryModal;
