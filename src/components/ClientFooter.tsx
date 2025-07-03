import { useEffect, useRef, useState } from "react";
import { Facebook, Instagram, Mail } from "lucide-react";

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

        {/* Social Icons */}
        <div
          className={`flex-[1] flex gap-4 items-center justify-end transform transition-all duration-700 ease-out delay-500
            ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
          style={{ transform: `translateX(${socialX}px)` }}
        >
          <Facebook className="w-5 h-5" />
          <Instagram className="w-5 h-5" />
          <Mail className="w-5 h-5" />
        </div>
      </div>
    </footer>
  );
};

export default ClientFooter;
