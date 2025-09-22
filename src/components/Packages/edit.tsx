import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import { toast, ToastContainer } from "react-toastify";


interface PackageImage {
  id: number;
  path: string;
}

interface Package {
  id: string;
  title: string;
  price: number;
  duration: number;
  description: string;
  tags: string[];
  images: PackageImage[];
  status: number;
  addons?: { addOnID: string; addOn: string }[];
  backgroundType?: string;
}

interface PackageType {
  id: string | number;
  name: string;
}

interface BackgroundType {
  setID: string | number;
  setName: string;
}

interface Addon {
  addOnID: string;
  addOn: string;
}

const API_URL = import.meta.env.VITE_API_URL;

const EditPackagePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState<Package | null>(null);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [duration, setDuration] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState<string | undefined>("");
  const [carouselImages, setCarouselImages] = useState<PackageImage[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
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
    const fetchPackage = async () => {
      try {
        const response = await fetchWithAuth(
          `${API_URL}/api/admin/packages/${id}`
        );
        const data = await response.json();
        setPkg(data);
        setTitle(data.title);
        setPrice(data.price);
        setDuration(data.duration);
        setDescription(data.description);
        setTags(data.tags || []);
        if (data.images && data.images.length > 0) {
          setCoverImage(data.images[0].path);
          setCarouselImages(data.images);
        } else {
          setCoverImage(undefined);
          setCarouselImages([]);
        }
        if (data.addons) {
          setSelectedAddons(data.addons.map((a: Addon) => a.addOnID));
        }
        if (data.backgroundType) {
          setSelectedBackground(data.backgroundType); // wrap in array
        }
      } catch (error) {
        console.error("Failed to fetch package:", error);
        setPkg(null);
      }
    };

    if (id) fetchPackage();
  }, [id]);

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

  const handleCarouselImageChange = (index: number, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setCarouselImages((prev) => {
        const updated = [...prev];
        if (updated[index] && updated[index].id) {
          updated[index] = { ...updated[index], path: reader.result as string };
        }
        return updated;
      });
    };
    reader.readAsDataURL(file);

    setNewFiles((prev) => {
      const updatedFiles = [...prev];
      updatedFiles[index] = file;
      return updatedFiles;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", title.trim());
    formData.append("price", price === "" ? "0" : String(price));
    formData.append("duration", String(duration));
    formData.append("description", description.trim());

    tags.forEach((tag, idx) => {
      formData.append(`tags[${idx}]`, tag);
    });

    formData.append("background", selectedBackground);

    selectedAddons.forEach((id, idx) => {
      formData.append(`addons[${idx}]`, id);
    });

    newFiles.forEach((file, idx) => {
      if (file) {
        formData.append(`images[${idx}]`, file);

        if (pkg?.images[idx]?.id) {
          formData.append(`imageIDs[${idx}]`, String(pkg.images[idx].id));
        }
      }
    });

    try {
      const response = await fetchWithAuth(
        `${API_URL}/api/admin/update-package/${pkg?.id}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error("Backend error:", result);
        toast.error(
          `Failed to update package: ${result.message || "Unknown error"}`
        );
        return;
      }
      navigate("/admin/packages", { state: { toast: { type: "success", message: "Package updated successfully!" } } });
    } catch (error) {
      console.error("Network error:", error);
      toast.error("An error occurred while updating the package.");
    }
  };

  if (!pkg) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto drop-shadow-xl">
      <nav className="text-sm text-black mb-6">
        <Link to="/admin/packages" className="hover:underline text-gray-400">
          Packages
        </Link>{" "}
        / Edit {pkg.title}
      </nav>

      <div className="bg-white shadow rounded-lg p-6 flex flex-col lg:flex-row gap-6">
        {/* Left - Images */}
        <div className="flex-shrink-0 w-full lg:w-1/3">
          <img
            src={coverImage}
            alt="Cover"
            className="rounded-md object-cover w-full mb-3"
          />
          <div className="mt-4 bg-gray-50 p-3 rounded">
            <h1 className="text-center font-semibold mb-5">Images</h1>
            <ul className="flex flex-wrap gap-5 m-1">
              {carouselImages.map((img, idx) => (
                <li key={idx} className="flex items-center gap-2 text-gray-600">
                  <div
                    className="relative cursor-pointer"
                    onClick={() =>
                      document.getElementById(`file-input-${idx}`)?.click()
                    }
                  >
                    <img
                      src={img.path}
                      alt={`Image ${idx + 1}`}
                      className="w-30 h-25 object-cover rounded-md"
                    />
                    <div className="absolute inset-0 bg-black opacity-0 hover:opacity-70 flex items-center justify-center rounded-md transition">
                      <span className="text-white text-sm">
                        Change Image {idx + 1}
                      </span>
                    </div>
                  </div>
                  <input
                    id={`file-input-${idx}`}
                    type="file"
                    onChange={(e) =>
                      e.target.files &&
                      handleCarouselImageChange(idx, e.target.files[0])
                    }
                    className="hidden"
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right - Form */}
        <form onSubmit={handleSubmit} className="flex-1 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-bold">Package Name</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              className="w-full px-3 py-2 border rounded-md text-sm"
              placeholder="e.g., Premium Wedding Package"
            />
          </div>

          {/* Duration + Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold">Duration (minutes)</label>
              <input
                type="number"
                min={30}
                max={300}
                step={30}
                value={duration}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d*$/.test(val)) {
                    setDuration(val === "" ? "" : Number(val));
                  }
                }}
                className="w-full px-3 py-2 border rounded-md text-sm"
                placeholder="e.g., 60"
              />
            </div>

            <div>
              <label className="block text-sm font-bold">Price</label>
              <input
                type="number"
                min={1}
                value={price}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d*$/.test(val)) {
                    setPrice(val === "" ? "" : Number(val));
                  }
                }}
                className="w-full px-3 py-2 border rounded-md text-sm"
                placeholder="e.g., 1500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              maxLength={500}
              className="w-full px-3 py-2 border rounded-md text-sm"
              placeholder="Describe the package details..."
            />
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
          </div>

          {/* Addons */}
          <div>
            <label className="block text-sm font-medium">Add-ons</label>
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
          </div>

          {/* Tags from package_types */}
          <div>
            <label className="block text-sm font-medium">Package Types</label>
            {typesLoading ? (
              <p className="text-xs text-gray-500 mt-1">Loading...</p>
            ) : typesError ? (
              <p className="text-xs text-red-500 mt-1">{typesError}</p>
            ) : (
              <div className="flex flex-wrap gap-2 mt-1">
                {packageTypes.map((type, id) => (
                  <button
                    type="button"
                    key={id}
                    onClick={() =>
                      setTags((prev) =>
                        prev.includes(type.name)
                          ? prev.filter((t) => t !== type.name)
                          : [...prev, type.name]
                      )
                    }
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default EditPackagePage;
