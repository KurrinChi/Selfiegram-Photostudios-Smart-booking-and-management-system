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
  basePrice: number;
  price: number;
  isDiscounted: number;
  discount: number;
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
  const [basePrice, setBasePrice] = useState<number | "">("");
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

  //discount
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discount, setDiscount] = useState<number | "">("");

  // Helper: convert minutes to friendly hours/minutes string
  const formatDuration = (mins: number) => {
    if (isNaN(mins) || mins < 0) return '';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const parts: string[] = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (!parts.length) parts.push('0m');
    return parts.join(' ');
  };


  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const response = await fetchWithAuth(`${API_URL}/api/admin/packages/${id}`);
        const data = await response.json();
        setPkg(data);

        setTitle(data.title);
        setBasePrice(data.base_price); // original price
        setPrice(data.price); // discounted or same as base
        setDuration(data.duration);
        setDescription(data.description);
        setTags(data.tags || []);

        const isDiscounted = data.is_discounted === 1 || data.is_discounted === "1";
        setHasDiscount(isDiscounted);
        setDiscount(isDiscounted ? Number(data.discount) : "");

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
          setSelectedBackground(data.backgroundType);
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

  useEffect(() => {
    const base = typeof basePrice === "number" ? basePrice : 0;
    const disc = typeof discount === "number" ? discount : 0;
    setPrice(hasDiscount && disc > 0 ? base - (base * disc) / 100 : base);
  }, [basePrice, discount, hasDiscount]);


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
    formData.append("base_price", String(basePrice)); // original price
    formData.append("price", String(price)); // discounted or same
    formData.append("is_discounted", hasDiscount ? "1" : "0");
    formData.append("discount", hasDiscount ? String(discount) : "0");
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
        toast.error(`Failed to update package: ${result.message || "Unknown error"}`);
        return;
      }

      navigate("/admin/packages", {
        state: { toast: { type: "success", message: "Package updated successfully!" } },
      });
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

          {/* Duration + Price + Discount */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Duration */}
            <div>
              <label className="block text-sm font-bold">Duration (minutes)</label>
              <input
                type="number"
                min={5}
                max={300}
                step={5}
                value={duration}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (!/^\d*$/.test(raw)) return; // ignore invalid
                  if (raw === "") { setDuration(""); return; }
                  let num = Number(raw);
                  if (num > 300) num = 300;
                  if (num < 5) num = 5;
                  // snap to nearest multiple of 5
                  num = Math.round(num / 5) * 5;
                  setDuration(num);
                }}
                onBlur={() => {
                  if (duration === "") return;
                  let num = typeof duration === 'number' ? duration : Number(duration);
                  if (num > 300) num = 300;
                  if (num < 5) num = 5;
                  num = Math.round(num / 5) * 5;
                  setDuration(num);
                }}
                className="w-full px-3 py-2 border rounded-md text-sm"
                placeholder="e.g., 60"
              />
              <p className="mt-1 text-[11px] text-gray-500">Choose between 5 and 300 minutes in 5-minute increments.</p>
              {duration !== "" && (
                <p className="mt-0.5 text-[11px] text-gray-600">≈ {formatDuration(Number(duration))}</p>
              )}
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-bold">Price</label>
              <input
                type="number"
                min={1}
                max={5000}
                value={basePrice}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!/^\d*$/.test(val)) return;
                  if (val === "") { setBasePrice(""); return; }
                  let num = Number(val);
                  if (num < 1) num = 1;
                  if (num > 5000) num = 5000;
                  setBasePrice(num);
                }}
                onBlur={() => {
                  if (basePrice === "") return;
                  let num = typeof basePrice === 'number' ? basePrice : Number(basePrice);
                  if (num < 1) num = 1;
                  if (num > 5000) num = 5000;
                  setBasePrice(num);
                }}
                className="w-full px-3 py-2 border rounded-md text-sm"
                placeholder="e.g., 1500"
              />
              <p className="mt-1 text-[11px] text-gray-500">Maximum allowed base price is ₱5,000.</p>
            </div>

            {/* Discount */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold">Discount %</label>
                <label className="inline-flex items-center cursor-pointer">
                  <span className="mr-2 text-xs text-gray-600">Enable</span>
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={hasDiscount}
                    onChange={(e) => {
                      setHasDiscount(e.target.checked);
                      if (!e.target.checked) setDiscount(""); // reset discount if disabled
                    }}
                  />
                  <div className="w-9 h-5 bg-gray-300 rounded-full peer-checked:bg-black relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-4 after:w-4 after:rounded-full after:transition-all peer-checked:after:translate-x-4" />
                </label>
              </div>

              <input
                type="number"
                min={0}
                max={100}
                value={discount}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!/^\d*$/.test(val)) return;
                  if (val === "") { setDiscount(""); return; }
                  let num = Number(val);
                  if (num < 0) num = 0;
                  if (num > 100) num = 100;
                  setDiscount(num);
                }}
                onBlur={() => {
                  if (discount === "") return;
                  let num = typeof discount === 'number' ? discount : Number(discount);
                  if (num < 0) num = 0;
                  if (num > 100) num = 100;
                  setDiscount(num);
                }}
                disabled={!hasDiscount}
                className={`w-full px-3 py-2 border rounded-md text-sm mt-1 transition ${hasDiscount ? "bg-white" : "bg-gray-100 cursor-not-allowed"}`}
                placeholder="e.g., 10"
              />
              <p className="mt-1 text-[11px] text-gray-500">Discount can be 0–100%.</p>


              {hasDiscount && basePrice !== "" && discount !== "" && (
                <p className="text-xs text-gray-500 mt-1">
                  New Price: ₱{(Number(basePrice) - (Number(basePrice) * Number(discount)) / 100).toFixed(2)}
                </p>
              )}
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
