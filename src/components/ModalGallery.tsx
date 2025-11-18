import React from "react";
import { Dialog } from "@headlessui/react";
//npm install @headlessui/react

interface ModalGalleryProps {
  open: boolean;
  onClose: () => void;
  images: string[];
  title?: string;
}

const ModalGallery: React.FC<ModalGalleryProps> = ({
  open,
  onClose,
  images,
  title,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="fixed z-50 inset-0 flex items-center justify-center"
    >
      <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
      <div className="relative bg-white rounded-xl p-8 max-w-3xl w-full shadow-xl z-10">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold">{title || "Gallery"}</h2>
          <button className="text-gray-700" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images.map((img, i) => (
            <div
              key={i}
              className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center"
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>
    </Dialog>
  );
};

export default ModalGallery;
