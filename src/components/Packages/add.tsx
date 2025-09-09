import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Paperclip, X } from "lucide-react";

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

  const availableTags = [
    { id: "", label: "Wedding", color: "bg-pink-100" },
    { id: "birthday", label: "Birthday", color: "bg-blue-100" },
    { id: "corporate", label: "Corporate", color: "bg-green-100" },
    { id: "outdoor", label: "Outdoor", color: "bg-yellow-100" },
  ];

  const handleCoverImageChange = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => setCoverImage(reader.result as string);
    reader.readAsDataURL(file);
  };

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
    Promise.all(readers).then((imgs) =>
      setCarouselImages((prev) => [...prev, ...imgs])
    );
  };

  const removeCarouselImage = (idx: number) => {
    setCarouselImages(carouselImages.filter((_, i) => i !== idx));
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
    if (!coverImage) newErrors.coverImage = "Cover image is required.";
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    setErrors({});

    const newPkg = {
      title,
      price,
      duration,
      description,
      tags,
      images: [coverImage, ...carouselImages],
    };
    console.log("Package created:", newPkg);
    alert("Package added successfully!");
    navigate("/admin/packages");
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

            <input
              id="cover-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                e.target.files && handleCoverImageChange(e.target.files[0])
              }
            />
            <button
              type="button"
              onClick={() => document.getElementById("cover-upload")?.click()}
              className="mt-2 flex items-center gap-2 bg-[#212121] text-white px-4 py-2 rounded-md text-sm
                          transition-all duration-200 ease-in-out
                        hover:bg-black hover:scale-105 hover:shadow-md active:scale-95"
            >
              <Paperclip size={16} /> Attach Cover
            </button>
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
              className={`w-full px-3 py-2 border rounded-md text-sm ${
                errors.title ? "border-red-500" : ""
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
              className={`w-full px-3 py-2 border rounded-md text-sm ${
                errors.duration ? "border-red-500" : ""
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
              className={`w-full px-3 py-2 border rounded-md text-sm ${
                errors.price ? "border-red-500" : ""
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
              className={`w-full px-3 py-2 border rounded-md text-sm ${
                errors.description ? "border-red-500" : ""
              }`}
              placeholder="Describe the package details..."
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-1">{errors.description}</p>
            )}
          </div>

          {/* Tags Checklist */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Tags</label>
            <div className="flex flex-wrap gap-3">
              {availableTags.map((tag) => (
                <label
                  key={tag.id}
                  className={`flex items-center gap-2 px-3 py-1 border rounded-full cursor-pointer text-sm ${tag.color}`}
                >
                  <input
                    type="checkbox"
                    checked={tags.includes(tag.label)}
                    onChange={() => toggleTag(tag.label)}
                  />
                  {tag.label}
                </label>
              ))}
            </div>
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
    </div>
  );
};

export default AddPackagePage;
