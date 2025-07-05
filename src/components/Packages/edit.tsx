import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import mockPackages from "../../data/mockPackages.json";

interface Package {
  id: string;
  title: string;
  price: number;
  duration: string;
  description: string;
  tags: string[];
  images: string[];
}

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
    if (!id) return;
    const found = (mockPackages as Package[]).find((p) => p.id === id);
    if (found) {
      setPkg(found);
      setTitle(found.title);
      setPrice(found.price);
      setDuration(found.duration);
      setDescription(found.description);
      setTags(found.tags);
      setCoverImage(found.images[0]);
      setCarouselImages(found.images);
    }
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

  const handleCoverImageChange = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => setCoverImage(reader.result as string);
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
    // Here you'd normally update state or save via API
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
          <input
            type="file"
            onChange={(e) =>
              e.target.files && handleCoverImageChange(e.target.files[0])
            }
          />

          <div className="mt-4 bg-gray-50 p-3 rounded">
            <h4 className="text-xs font-semibold mb-2">Carousel Images</h4>
            <ul className="text-xs mb-2">
              {carouselImages.map((img, idx) => (
                <li key={idx} className="truncate text-gray-600 mb-1">
                  Image {idx + 1}
                </li>
              ))}
            </ul>
            <div className="space-y-2">
              {carouselImages.map((_, idx) => (
                <input
                  key={idx}
                  type="file"
                  onChange={(e) =>
                    e.target.files &&
                    handleCarouselImageChange(idx, e.target.files[0])
                  }
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right - Form */}
        <form onSubmit={handleSubmit} className="flex-1 space-y-4">
          <div>
            <label className="block text-sm font-medium">Package Name</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium">
                Category Label
              </label>
              <input
                value={tags[0]}
                onChange={(e) => setTags([e.target.value, ...tags.slice(1)])}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Duration</label>
              <input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Price</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Tags</label>
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

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => navigate("/admin/packages")}
              className="px-4 py-2 border rounded-md text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-black text-white rounded-md text-sm"
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
