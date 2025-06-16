import React from "react";

interface ImageCardProps {
  src: string;
  label: string;
  className?: string;
}

const ImageCard: React.FC<ImageCardProps> = ({ src, label, className }) => {
  return (
    <div className={`w-56 md:w-64 bg-white rounded-3xl shadow-2xl overflow-hidden transform ${className}`}>
      <img src={src} alt={label} className="w-full h-auto object-cover" />
      <p className="text-center text-black font-semibold mt-2 mb-3 text-lg">{label}</p>
    </div>
  );
};

export default ImageCard;
