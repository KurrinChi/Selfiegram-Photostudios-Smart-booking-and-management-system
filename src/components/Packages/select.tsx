import React from "react";
import { useLocation } from "react-router-dom";

interface Package {
  title: string;
  price: number;
  tags: string[];
  images: string[];
}

const SelectPackagePage = () => {
  const location = useLocation();
  const pkg = location.state as Package;

  if (!pkg) return <div className="p-4">Package not found.</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold">{pkg.title}</h1>
      <p className="text-gray-600">₱{pkg.price.toFixed(2)}</p>

      <div className="flex gap-2 my-2">
        {pkg.tags.map((tag) => (
          <span key={tag} className="bg-gray-200 text-xs px-2 py-1 rounded">
            {tag}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {pkg.images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={`${pkg.title}-${i}`}
            className="rounded shadow"
          />
        ))}
      </div>
    </div>
  );
};

export default SelectPackagePage;
