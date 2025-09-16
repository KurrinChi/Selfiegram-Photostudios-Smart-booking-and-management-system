import { useEffect, useRef, useState } from "react";
import FAQDialog from "./FAQ.tsx";
import TermsDialog from "./TermsDialog.tsx";

interface ClientFooterProps {
  logoX?: number;
  infoX?: number;
  socialX?: number;
}

const ClientFooter = ({
  logoX = 0,
  infoX = 0,
  socialX = 0,
}: ClientFooterProps) => {
  // Add this
  const [] = useState(false);
  const [openFAQ, setOpenFAQ] = useState(false);
  const [openTerms, setOpenTerms] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      {
        threshold: 0.2,
      }
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
        className="mx-auto flex flex-row relative px-10 gap-4"
      >
        {/* Logo */}
        <div
          className={`flex-[5] transform transition-all duration-700 ease-out delay-100
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
            className="w-20 ml-2 invert"
          />
        </div>

        {/* Resources & Contact Info */}
        <div className="flex flex-col mr-10">
          <h5 className="font-semibold mb-3 text-gray-300">Resources</h5>
          <div className="flex flex-col gap-2 text-gray-300 text-sm">
            <button
              onClick={() => setOpenFAQ(true)}
              className="hover:text-white text-left transition-all duration-300 hover:underline"
            >
              FAQs
            </button>

            <button
              onClick={() => setOpenTerms(true)}
              className="hover:text-white text-left transition-all duration-300 hover:underline"
            >
              Terms & Agreements
            </button>
          </div>
        </div>

        {/* Contact Info */}
        <div
          className={`flex-[2] text-sm transform transition-all duration-700 ease-out delay-300
            ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
          style={{ transform: `translateX(${infoX}px)` }}
        >
          <p>3rd Floor Kim Kar Building F Estrella St., Malolos, Philippines</p>
          <p>0968 885 6035</p>
          <p>selfiegrammalolos@gmail.com</p>
        </div>
      </div>
      {openFAQ && (
        <div className="fixed inset-0 z-1000 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden relative">
            <FAQDialog onClose={() => setOpenFAQ(false)} />
          </div>
        </div>
      )}

      {openTerms && (
        <div className="fixed inset-0 z-1000 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden relative">
            <TermsDialog onClose={() => setOpenTerms(false)} />
          </div>
        </div>
      )}
    </footer>
  );
};

export default ClientFooter;
