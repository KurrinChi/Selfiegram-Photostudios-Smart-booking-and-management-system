import { useEffect, useRef, useState } from "react";
import FAQDialog from "./FAQ.tsx";
import TermsDialog from "./TermsDialog.tsx";

interface ClientFooterProps {
  logoX?: number;
  infoX?: number;
  socialX?: number;
}

const ClientFooter = ({ logoX = 0, infoX = 0 }: ClientFooterProps) => {
  const [openFAQ, setOpenFAQ] = useState(false);
  const [openTerms, setOpenTerms] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.2 }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current);
    };
  }, []);

  return (
    <footer className="bg-[#212121] text-white py-10 mt-auto">
      <div
        ref={containerRef}
        className="mx-auto flex flex-col md:flex-row relative px-6 md:px-10 gap-8 md:gap-4 max-w-7xl"
      >
        {/* Logo */}
        <div
          className={`flex justify-center md:justify-start flex-[5] transform transition-all duration-700 ease-out delay-100
            ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
          style={{ transform: `translateX(${logoX}px)` }}
        >
          <img
            src="/slfg.svg"
            alt="Selfie Gram Logo"
            className="w-16 md:w-20 invert"
          />
        </div>

        {/* Resources */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h5 className="font-semibold mb-3 text-gray-300">Resources</h5>
          <div className="flex flex-col gap-2 text-gray-300 text-sm">
            <button
              onClick={() => setOpenFAQ(true)}
              className="text-left hover:text-white transition-all duration-300 hover:underline"
            >
              FAQs
            </button>
            <button
              onClick={() => setOpenTerms(true)}
              className="text-left hover:text-white transition-all duration-300 hover:underline"
            >
              Terms & Agreements
            </button>
          </div>
        </div>

        {/* Contact Info */}
        <div
          className={`flex-[2] text-sm text-center md:text-left transform transition-all duration-700 ease-out delay-300
            ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
          style={{ transform: `translateX(${infoX}px)` }}
        >
          <p className="mb-1">
            3rd Floor Kim Kar Building F Estrella St., Malolos, Philippines
          </p>
          <p className="mb-1">0968 885 6035</p>
          <p>selfiegrammalolos@gmail.com</p>
        </div>
      </div>

      {/* FAQ Modal */}
      {openFAQ && (
        <div className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden relative">
            <FAQDialog onClose={() => setOpenFAQ(false)} />
          </div>
        </div>
      )}

      {/* Terms Modal */}
      {openTerms && (
        <div className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden relative">
            <TermsDialog
              isOpen={openTerms}
              onClose={() => setOpenTerms(false)}
            />
          </div>
        </div>
      )}
    </footer>
  );
};

export default ClientFooter;
