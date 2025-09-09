import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

interface Package {
  id: string;
  title: string;
  price: number;
  duration: string;
  description: string;
  tags: string[];
  images: string[]; 
  status: number; // 1 for active, 0 for archived
}

const API_URL = import.meta.env.VITE_API_URL;

const EditPackagePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState<Package | null>(null);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState(0);
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [coverImage, setCoverImage] = useState<string>("");
  const [carouselImages, setCarouselImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const response = await fetchWithAuth(`${API_URL}/api/admin/packages/${id}`);
        const data = await response.json();
        setPkg(data);
        setTitle(data.title);
        setPrice(data.price);
        setDuration(data.duration);
        setDescription(data.description);
        setTags(data.tags);
        setCoverImage(data.images[0] || "");
        setCarouselImages(data.images || []);
      } catch (error) {
        console.error("Failed to fetch package:", error);
        setPkg(null); // Ensure the state is cleared if the fetch fails
      }
    };

    if (id) fetchPackage();
  }, [id]);

  const handleCarouselImageChange = (index: number, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const updated = [...carouselImages];
      updated[index] = reader.result as string;
      setCarouselImages(updated);
    };
    reader.readAsDataURL(file);
  };

  const addNewTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedPackage = {
      ...pkg!,
      title,
      price,
      duration,
      description,
      tags,
      images: carouselImages,
    };
    // Send the updated package to the server (implement API call here)
    console.log("Updated Package:", updatedPackage);
    alert("Package updated successfully!");
    navigate("/admin/packages");
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
        {/* Left - Cover and Carousel */}
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
                    onClick={() => document.getElementById(`file-input-${idx}`)?.click()}
                  >
                    <img
                      src={img}
                      alt={`Image ${idx + 1}`}
                      className="w-30 h-25 object-cover rounded-md"
                    />
                    <div className="absolute inset-0 bg-black opacity-0 hover:opacity-70 flex items-center justify-center rounded-md transition">
                      <span className="text-white text-sm">Change Image {idx + 1}</span>
                    </div>
                  </div>
                  <input
                    id={`file-input-${idx}`}
                    type="file"
                    onChange={(e) =>
                      e.target.files && handleCarouselImageChange(idx, e.target.files[0])
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
          <div>
            <label className="block text-sm font-bold">Package Name</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-bold">
                Category Label
              </label>
              <input
                value={tags[0]}
                onChange={(e) => setTags([e.target.value, ...tags.slice(1)])}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold">Duration</label>
              <input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold">Price</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-bold">Tags</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-200 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add new tag"
                className="px-3 py-2 border rounded-md text-sm"
              />
              <button
                type="button"
                onClick={addNewTag}
                className="px-4 py-2 bg-gray-800 text-white text-sm rounded-md"
              >
                Add Tag
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-auto">
            <button
              type="button"
              onClick={() => navigate("/admin/packages")}
              className="px-4 py-2 border rounded-md text-sm hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-black text-white rounded-md text-sm hover:opacity-80 transition"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPackagePage;
