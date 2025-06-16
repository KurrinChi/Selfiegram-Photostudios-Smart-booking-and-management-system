import React from "react";
import ImageCard from "./ImageCard";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center font-sf">
      <div className="w-full h-full max-w-full grid grid-cols-1 md:grid-cols-2 bg-white shadow-2xl overflow-hidden">

        {/* Left - Image Cards */}
        <div className="relative flex items-center justify-center bg-[#212121] p-10 rounded-2xl left-2 right-2">
          <div className="relative w-full max-w-[500px] h-[600px]">
            <ImageCard
              src="/slfg-placeholder.png"
              label="Seize"
              className="absolute bottom-[50%] right-[50%] rotate-[-10deg] z-10 w-[60%]"
            />
            <ImageCard
              src="/slfg-placeholder.png"
              label="Great"
              className="absolute top-[20%] left-[50%] rotate-[5deg] z-20 w-[60%]"
            />
            <ImageCard
              src="/slfg-placeholder.png"
              label="Moment"
              className="absolute top-[50%] left-[0%] rotate-[10deg] z-30 w-[60%]"
            />
          </div>
        </div>

        {/* Right - Form or Page */}
        <div className="p-20 flex flex-col justify-center">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
