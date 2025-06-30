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
  return (
    <footer className="bg-[#212121] text-white py-10 mt-auto">
      <div className=" mx-auto flex flex-row relative px-10">
        {/* Logo */}
        <div
          className="flex-[5]"
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
          className="flex-[2] text-sm"
          style={{ transform: `translateX(${infoX}px)` }}
        >
          <p>3rd Floor Kim Kar Building F Estrella St., Malolos, Philippines</p>
          <p>0968 885 6035</p>
          <p>selfiegrammalolos@gmail.com</p>
        </div>

        {/* Social Icons */}
        <div
          className="flex-[1] flex gap-4 items-center justify-end"
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
