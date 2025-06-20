// pages/AddPackagePage.tsx
import React, { useState } from "react";

const AddPage = () => {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]); // use preview URLs

  const handleTagChange = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ title, price, tags, images });
    // Add API logic or state update
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Add New Package</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full border rounded px-3 py-2"
        />
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price"
          type="number"
          className="w-full border rounded px-3 py-2"
        />

        <div className="flex flex-wrap gap-2">
          {["Self Shoot", "Studio", "Graduation", "Photoshoot"].map((tag) => (
            <label key={tag} className="text-sm flex items-center gap-1">
              <input
                type="checkbox"
                checked={tags.includes(tag)}
                onChange={() => handleTagChange(tag)}
              />
              {tag}
            </label>
          ))}
        </div>

        <input
          type="file"
          multiple
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            const urls = files.map((file) => URL.createObjectURL(file));
            setImages(urls);
          }}
        />

        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded-md hover:opacity-80"
        >
          Save Package
        </button>
      </form>
    </div>
  );
};

export default AddPage;
