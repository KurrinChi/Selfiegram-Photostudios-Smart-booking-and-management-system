import React from "react";

interface ModalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const ModalDialog: React.FC<ModalDialogProps> = ({
  isOpen,
  onClose,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Translucent dark overlay */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal content */}
      <div
        className="relative z-10 w-full max-w-sm mx-auto bg-white rounded-xl shadow-xl p-6 animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export default ModalDialog;
