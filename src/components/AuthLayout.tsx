import React from "react";
import { motion } from "framer-motion";
import ImageCard from "./ImageCard";

interface AuthLayoutProps {
  children: React.ReactNode;
  reverse?: boolean;
  images?: {
    src: string;
    label: string;
    className: string;
  }[];
}

const AuthLayout = ({ children, reverse = false, images = [] }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center font-sf overflow-hidden">
      <div
        className={`w-full max-w-full flex flex-col md:flex-row ${
          reverse ? "md:flex-row-reverse" : ""
        } bg-white`}
      >
        {/* Animated Image Panel */}
        <motion.div
          initial={{ x: reverse ? 300 : -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: reverse ? -300 : 300, opacity: 0 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="w-full md:w-1/2 flex items-center justify-center bg-white p-3 sm:p-6 rounded-2xl overflow-hidden"
        >
          {/* Inner gray padded panel */}
          <div className="w-full h-full bg-[#212121] rounded-xl p-2 sm:p-4 flex items-center justify-center">

            <div className="relative w-full max-w-[500px] h-[600px] mx-auto hidden sm:block">
              {images.map((image, index) => (
                <motion.div
                  key={index}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    delay: 0.2 + index * 0.15,
                    duration: 0.6,
                    ease: "easeOut",
                  }}
                  className={`absolute ${image.className} max-w-[60%] sm:max-w-[50%] md:max-w-[40%] lg:max-w-[35%] xl:max-w-[30%]`}
                  style={{ transformOrigin: "center" }}
                >
                  <ImageCard
                    src={image.src}
                    label={image.label}
                    className="w-full h-auto object-contain"
                  />
                </motion.div>
              ))}
            </div>

            {/* Mobile version */}
            <div className="sm:hidden flex flex-col items-center justify-center gap-4">
              {images.map((image, index) => (
                <motion.div
                  key={index}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    delay: 0.2 + index * 0.15,
                    duration: 0.6,
                    ease: "easeOut",
                  }}
                  className="w-[70%] max-w-xs"
                >
                  <ImageCard
                    src={image.src}
                    label={image.label}
                    className="w-full h-auto object-contain"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Animated Form Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full md:w-1/2 p-10 md:p-20 flex flex-col justify-center"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
