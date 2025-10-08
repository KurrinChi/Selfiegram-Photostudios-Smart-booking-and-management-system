import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Paperclip, X } from "lucide-react";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import { toast, ToastContainer } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

interface PackageType {
  id: string | number;
  name: string;
}

interface Addon {
  addOnID: string;
  addOn: string;
}

interface BackgroundType {
  setID: string | number;
  setName: string;
}

const AddPackagePage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState<string>("");
  const [carouselImages, setCarouselImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Package types from backend
  const [packageTypes, setPackageTypes] = useState<PackageType[]>([]);
  const [typesLoading, setTypesLoading] = useState(false);
  const [typesError, setTypesError] = useState<string | null>(null);

  // Addons
  const [addons, setAddons] = useState<Addon[]>([]); // all available addons
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]); // addonIDs chosen
  const [addonsError, setAddonsError] = useState<string | null>(null);

  // Background type
  const [backgroundTypes, setBackgroundTypes] = useState<BackgroundType[]>([]);
  const [selectedBackground, setSelectedBackground] = useState<string>("");
  const [backgroundError, setBackgroundError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBackgroundTypes = async () => {
      try {
        const res = await fetchWithAuth(`${API_URL}/api/admin/package-sets`);
        if (!res.ok) throw new Error(`Failed to fetch background types: ${res.status}`);
        const data = await res.json();
        setBackgroundTypes(data);
      } catch (err) {
        console.error(err);
        setBackgroundError("Failed to load background types.");
      }
    };

    fetchBackgroundTypes();
  }, []);

  useEffect(() => {
    const fetchTypes = async () => {
      setTypesLoading(true);
      setTypesError(null);
      try {
        const res = await fetchWithAuth(`${API_URL}/api/admin/package-types`);
        if (!res.ok) throw new Error(`Failed to fetch types: ${res.status}`);
        const data = await res.json();
        setPackageTypes(data);
      } catch (err) {
        console.error(err);
        setTypesError("Failed to load package types.");
      } finally {
        setTypesLoading(false);
      }
    };
    fetchTypes();
  }, []);

  useEffect(() => {
    const fetchAddons = async () => {
      try {
        const res = await fetchWithAuth(`${API_URL}/api/admin/addons`);
        if (!res.ok) throw new Error("Failed to fetch addons");
        const data = await res.json();
        const addonsArray = Array.isArray(data)
          ? data
          : Array.isArray(data.data)
            ? data.data
            : [];
        setAddons(addonsArray);
      } catch (err) {
        console.error(err);
        setAddonsError("Failed to load addons");
      }
    };
    fetchAddons();
  }, []);

  const handleCarouselImagesUpload = (files: FileList) => {
    const fileArray = Array.from(files);
    const readers = fileArray.map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        })
    );
    Promise.all(readers).then((imgs) => {
      setCarouselImages((prev) => {
        // Set the first image as the cover image
        const newImages = [...prev, ...imgs];
        setCoverImage(newImages[0]); // Automatically set the first image as cover
        return newImages;
      });
    });
  };


  const removeCarouselImage = (idx: number) => {
    setCarouselImages((prev) => {
      // Remove the image at the given index
      const newImages = prev.filter((_, i) => i !== idx);

      // Update the cover image if the first image was removed
      if (idx === 0) {
        if (newImages.length > 0) {
          // Set the next image as cover
          setCoverImage(newImages[0]);
        } else {
          // If no images are left, reset cover image
          setCoverImage("");
        }
      }

      return newImages;
    });
  };

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Package name is required.";
    if (!price || price <= 0) newErrors.price = "Price must be greater than 0.";
    if (!duration.trim()) newErrors.duration = "Duration is required.";
    if (!description.trim()) newErrors.description = "Description is required.";
    if (!coverImage) {
      newErrors.coverImage = "Cover image is required. The first carousel image will be used as cover.";
    }
    if (carouselImages.length < 2) {
      newErrors.carouselImages = "At least 2 images are required.";
    }
    if (!selectedBackground) newErrors.background = "Background selection is required.";
    if (tags.length === 0) newErrors.tags = "Select at least one package type.";
    if (selectedAddons.length === 0) newErrors.addons = "Select at least one add-on.";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    setErrors({});

    const formData = new FormData();
    formData.append('title', title);
    formData.append('price', price.toString());
    formData.append('duration', duration);
    formData.append('description', description);
    formData.append('background', selectedBackground);

    // Tags
    tags.forEach(tag => formData.append('tags[]', tag));

    // Addons
    selectedAddons.forEach(addonID => formData.append('addons[]', addonID));

    // ✅ Wait for all carousel image blobs to be fetched and appended
    const blobPromises = carouselImages.map(async (img, idx) => {
      const res = await fetch(img);
      const blob = await res.blob();
      formData.append('images[]', blob, `carouselImage-${idx}.jpg`);
    });

    await Promise.all(blobPromises);

    // Send the form data
    try {
      const res = await fetchWithAuth(`${API_URL}/api/admin/add-package`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Server error:", errorText);
        throw new Error('Failed to create package');
      }

      navigate("/admin/packages", {
        state: { toast: { type: "success", message: "Package added successfully!" } },
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to create package");
    }
  };



  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link to="/admin/packages" className="hover:underline">
          Packages
        </Link>{" "}
        / New Package
      </nav>

      <div className="bg-white shadow-md rounded-lg p-6 flex flex-col lg:flex-row gap-8">
        {/* Left - Cover & Carousel */}
        <div className="flex-shrink-0 w-full lg:w-1/3 space-y-6">
          {/* Cover */}
          <div>
            <h4 className="text-sm font-medium mb-2">Cover Image *</h4>
            {coverImage ? (
              <img
                src={coverImage}
                alt="Cover"
                className="rounded-md object-cover w-full aspect-square mb-2"
              />
            ) : (
              <div className="w-full aspect-square bg-gray-100 border-2 border-dashed rounded-md flex items-center justify-center text-gray-400">
                Upload a cover
              </div>
            )}
            {errors.coverImage && (
              <p className="text-xs text-red-500 mt-1">{errors.coverImage}</p>
            )}
          </div>

          {/* Carousel */}
          <div>
            <h4 className="text-sm font-medium">Carousel Images</h4>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {carouselImages.map((img, idx) => (
                <div
                  key={idx}
                  className="relative w-full aspect-square rounded-md overflow-hidden"
                >
                  <img
                    src={img}
                    alt={`Carousel ${idx}`}
                    className="object-cover w-full h-full"
                  />
                  <button
                    type="button"
                    onClick={() => removeCarouselImage(idx)}
                    className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full p-1 
                              transform transition-all duration-200 ease-in-out
                              hover:bg-opacity-80 hover:scale-110 hover:rotate-12 active:scale-95"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            <input
              id="carousel-upload"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) =>
                e.target.files && handleCarouselImagesUpload(e.target.files)
              }
            />
            <button
              type="button"
              onClick={() =>
                document.getElementById("carousel-upload")?.click()
              }
              className="flex items-center gap-2 bg-[#212121] text-white px-4 py-2 rounded-md text-sm
                        transform transition-all duration-200 ease-in-out
                        hover:bg-black hover:scale-105 hover:shadow-md active:scale-95"
            >
              <Paperclip size={16} /> Attach Carousel
            </button>
            {errors.carouselImages && (
              <p className="text-xs text-red-500 mt-1">{errors.carouselImages}</p>
            )}
          </div>
        </div>

        {/* Right - Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="md:col-span-2">
            <label className="block text-sm font-medium">Package Name *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              className={`w-full px-3 py-2 border rounded-md text-sm ${errors.title ? "border-red-500" : ""
                }`}
              placeholder="e.g., Premium Wedding Package"
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">
              Duration (minutes) *
            </label>
            <input
              type="number"
              min={30}
              max={300}
              step={30}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md text-sm ${errors.duration ? "border-red-500" : ""
                }`}
              placeholder="e.g., 60"
            />

            {errors.duration && (
              <p className="text-xs text-red-500 mt-1">{errors.duration}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Price *</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              min={1}
              className={`w-full px-3 py-2 border rounded-md text-sm ${errors.price ? "border-red-500" : ""
                }`}
              placeholder="e.g., 1500"
            />
            {errors.price && (
              <p className="text-xs text-red-500 mt-1">{errors.price}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              maxLength={500}
              className={`w-full px-3 py-2 border rounded-md text-sm ${errors.description ? "border-red-500" : ""
                }`}
              placeholder="Describe the package details..."
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-1">{errors.description}</p>
            )}
          </div>

          {/* Background Selection */}
          <div className="md:col-span-2">
            <h4 className="text-sm font-medium mb-2">Background Selection</h4>
            {typesLoading ? (
              <p className="text-xs text-gray-500 mt-1">Loading...</p>
            ) : backgroundError ? (
              <p className="text-xs text-red-500 mt-1">{backgroundError}</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {backgroundTypes.map((bg) => (
                  <button
                    type="button"
                    key={bg.setID}
                    onClick={() => setSelectedBackground(bg.setName)}
                    className={`px-3 py-1 rounded-md text-sm border transition-all duration-200
                  ${selectedBackground === bg.setName
                        ? "bg-[#212121] text-white border-[#212121]"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                      }`}
                  >
                    {bg.setName}
                  </button>
                ))}
              </div>
            )}
            {errors.background && (
              <p className="text-xs text-red-500 mt-1">{errors.background}</p>
            )}
          </div>

          {/* Addons */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Add-ons</label>
            {typesLoading ? (
              <p className="text-xs text-gray-500 mt-1">Loading...</p>
            ) : addonsError ? (
              <p className="text-xs text-red-500 mt-1">{addonsError}</p>
            ) : (
              <div className="flex flex-wrap gap-2 mt-1">
                {addons.map((addon) => {
                  const isSelected = selectedAddons.includes(addon.addOnID);
                  return (
                    <button
                      type="button"
                      key={addon.addOnID}
                      onClick={() =>
                        setSelectedAddons((prev) =>
                          prev.includes(addon.addOnID)
                            ? prev.filter((id) => id !== addon.addOnID)
                            : [...prev, addon.addOnID]
                        )
                      }
                      className={`px-3 py-1 rounded-md text-sm border transition-all duration-200
                ${isSelected
                          ? "bg-[#212121] text-white border-[#212121]"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                        }`}
                    >
                      {addon.addOn}
                    </button>
                  );
                })}
              </div>
            )}
            {errors.addons && (
              <p className="text-xs text-red-500 mt-1">{errors.addons}</p>
            )}
          </div>

          {/* Package Types */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">
              Package Types
            </label>
            {typesLoading ? (
              <p className="text-xs text-gray-500 mt-1">Loading...</p>
            ) : typesError ? (
              <p className="text-xs text-red-500 mt-1">{typesError}</p>
            ) : (
              <div className="flex flex-wrap gap-2 mt-1">
                {packageTypes.map((type) => (
                  <button
                    type="button"
                    key={type.id}
                    onClick={() => toggleTag(type.name)}
                    className={`px-3 py-1 rounded-md text-sm border transition-all duration-200
                  ${tags.includes(type.name)
                        ? "bg-[#212121] text-white border-[#212121]"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                      }`}
                  >
                    {type.name}
                  </button>
                ))}
              </div>
            )}
            {errors.tags && (
              <p className="text-xs text-red-500 mt-1">{errors.tags}</p>
            )}
          </div>

          {/* Actions */}
          <div className="md:col-span-2 flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => navigate("/admin/packages")}
              className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-black text-white rounded-md text-sm hover:bg-gray-900"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default AddPackagePage;
