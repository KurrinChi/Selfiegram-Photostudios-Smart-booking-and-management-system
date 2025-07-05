import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const AddPackagePage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState(0);
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [coverImage, setCoverImage] = useState<string>("");
  const [carouselImages, setCarouselImages] = useState<string[]>([]);

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
    Promise.all(readers).then((imgs) => setCarouselImages(imgs));
  };

  const addNewTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="p-6 max-w-5xl mx-auto drop-shadow-xl">
      <nav className="text-sm text-black mb-6">
        <Link to="/admin/packages" className="hover:underline text-gray-400">
          Packages
        </Link>{" "}
        / New Package
      </nav>

      <div className="bg-white shadow rounded-lg p-6 flex flex-col lg:flex-row gap-6">
        {/* Left - Cover and Carousel */}
        <div className="flex-shrink-0 w-full lg:w-1/3">
          {coverImage ? (
            <img
              src={coverImage}
              alt="Cover"
              className="rounded-md object-cover w-full mb-3"
            />
          ) : (
            <div className="w-full aspect-square bg-gray-200 rounded-md flex items-center justify-center mb-3">
              <span className="text-gray-500">No Image</span>
            </div>
          )}
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
            <input
              type="file"
              multiple
              onChange={(e) =>
                e.target.files && handleCarouselImagesUpload(e.target.files)
              }
            />
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
              placeholder="Insert Here"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium">
                Category Label
              </label>
              <input
                value={tags[0] || ""}
                onChange={(e) => setTags([e.target.value, ...tags.slice(1)])}
                className="w-full px-3 py-2 border rounded-md text-sm"
                placeholder="Insert Here"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Duration</label>
              <input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm"
                placeholder="Insert Here"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Price</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-md text-sm"
                placeholder="Insert Here"
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
              placeholder="Insert Here"
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

export default AddPackagePage;
