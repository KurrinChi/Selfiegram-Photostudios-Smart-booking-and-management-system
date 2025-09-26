import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, Edit, X, Heart } from "lucide-react";
import JSZip from "jszip";
import { fetchWithAuth } from "../utils/fetchWithAuth";

const TABS = ["Gallery", "Favorites"];

const ClientGalleryPageContent: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Gallery");
  const [galleryData, setGalleryData] = useState<
    {
      date: string;
      images: {
        id: string;
        url: string;
        edited?: boolean;
        isFavorite?: boolean;
      }[];
    }[]
  >([]);

  const [previewImage, setPreviewImage] = useState<null | {
    id: string;
    url: string;
  }>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const API_URL = import.meta.env.VITE_API_URL;
  const userID = localStorage.getItem("userID");

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetchWithAuth(`${API_URL}/api/user-images/${userID}`);
        if (!res.ok) throw new Error("Failed to fetch images");

        const data = await res.json();

        // Group images by date
        const groupedImages = groupImagesByDate(
          data.map((img: any) => ({
            id: img.imageID,
            url: `${API_URL}/api/proxy-image?path=${encodeURIComponent(
              img.filePath.replace(/^\/storage\//, "")
            )}`,
            date: new Date(img.uploadDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            edited: img.tag === "edited",
            isFavorite: img.isFavorite === 1, // Map isFavorite field
          }))
        );

        setGalleryData(groupedImages);
      } catch (err) {
        console.error("Error fetching images:", err);
      }
    };

    fetchImages();
  }, [userID]);

  const groupImagesByDate = (
    images: {
      id: string;
      url: string;
      date: string;
      edited?: boolean;
      isFavorite?: boolean;
    }[]
  ) => {
    const grouped: Record<
      string,
      { id: string; url: string; edited?: boolean; isFavorite?: boolean }[]
    > = {};
    images.forEach((img) => {
      if (!grouped[img.date]) grouped[img.date] = [];
      grouped[img.date].push({
        id: img.id,
        url: img.url,
        edited: img.edited,
        isFavorite: img.isFavorite,
      });
    });
    return Object.entries(grouped).map(([date, imgs]) => ({
      date,
      images: imgs,
    }));
  };

  const toggleFavorite = async (id: string) => {
    try {
      const res = await fetchWithAuth(
        `${API_URL}/api/user-images/favorite/${id}`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error("Failed to toggle favorite");

      const data = await res.json();

      setGalleryData((prev) =>
        prev.map((group) => ({
          ...group,
          images: group.images.map((img) =>
            img.id === id ? { ...img, isFavorite: data.isFavorite } : img
          ),
        }))
      );
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  // Fixed: Pass image data properly to the editor
  const handleEdit = (img: { id: string; url: string }) => {
    // Extract the relative path from the full URL for the editor
    const relativePath = img.url.replace(API_URL, "");

    // Navigate with both state and URL parameter for maximum compatibility
    navigate(`/client/gallery/edit?url=${encodeURIComponent(relativePath)}`, {
      state: {
        imageUrl: img.url,
        imageId: img.id,
        relativePath: relativePath,
      },
    });
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
        const image = galleryData
          .flatMap((group) => group.images)
          .find((img) => img.id === id);
        if (image) {
          const response = await fetch(image.url);
          if (!response.ok)
            return console.error(`Failed to fetch image with ID: ${id}`);
          const blob = await response.blob();
          folder?.file(image.url.split("/").pop() || `image-${id}.jpg`, blob);
        }
      });

      await Promise.all(imagePromises);
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(zipBlob);
      link.download = "selected-images.zip";
      link.click();
    } catch (error) {
      console.error("Error while downloading selected images:", error);
    }
  };

  /*const handleDeleteSelected = async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/api/user-images/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageIDs: selectedImages }),
      });

      if (!res.ok) throw new Error("Failed to delete images");

      setGalleryData((prev) =>
        prev.map((group) => ({
          ...group,
          images: group.images.filter(
            (img) => !selectedImages.includes(img.id)
          ),
        }))
      );
      setSelectedImages([]);
    } catch (err) {
      console.error("Error deleting images:", err);
    }
  };*/

  const filteredData =
    activeTab === "Favorites"
      ? galleryData
          .map((group) => ({
            date: group.date,
            images: group.images.filter((img) => img.isFavorite),
          }))
          .filter((group) => group.images.length > 0)
      : galleryData;

  return (
    <div className="p-4 font-sf animate-fadeIn">
      {/* Tabs */}
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

        {/* Multi-select actions */}
        {selectedImages.length > 0 && (
          <div className="flex gap-2">
            <button
              className="px-4 py-1 bg-gray-800 text-white rounded-md hover:bg-black"
              onClick={handleDownloadSelected}
            >
              Download
            </button>
            {/* Delete Button 
            <button
              className="px-4 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
              onClick={handleDeleteSelected}
            >
              Delete
            </button>
            */}
          </div>
        )}
      </div>

      {/* Gallery */}
      {filteredData.length === 0 ? (
        <div className="text-center text-gray-500 mt-20">
          <p className="text-lg font-medium mb-2">No photos yet</p>
          <p className="text-sm">
            Book a photo session now to start capturing memories!
          </p>
        </div>
      ) : (
        filteredData.map((group) => (
          <div key={group.date} className="mb-6">
            {/* Date Header */}
            <div className="flex justify-between items-center w-full text-left font-medium text-lg mb-2">
              <span>{group.date}</span>
            </div>

            {expandedDates.includes(group.date) && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {group.images.map((img) => {
                  const isSelected = selectedImages.includes(img.id);
                  return (
                    <div
                      key={img.id}
                      className={`relative rounded-lg overflow-hidden cursor-pointer transition-all duration-500 ease-in-out transform hover:scale-[1.03] flex items-center justify-center bg-white ${
                        isSelected ? "ring-4 ring-black" : ""
                      }`}
                      onClick={() => handleSelectImage(img.id)}
                    >
                      <img
                        src={img.url}
                        alt=""
                        className="max-w-full max-h-full object-contain"
                      />
                      <div className="absolute bottom-2 right-2 flex gap-2">
                        <button
                          className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(img.id);
                          }}
                        >
                          <Heart
                            className={`w-5 h-5 ${
                              img.isFavorite ? "text-pink-500" : "text-gray-500"
                            }`}
                            fill={img.isFavorite ? "currentColor" : "none"}
                          />
                        </button>
                        <button
                          className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(img.id);
                          }}
                        >
                          <Edit className="w-5 h-5 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))
      )}

      {/* Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center"
          tabIndex={0}
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
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientGalleryPageContent;
