// ChatDetails.tsx
import React from "react";

const ChatDetails: React.FC = () => {
  return (
    <div className="w-1/4 p-6 bg-white overflow-y-auto">
      <button className="mb-4 w-full bg-gray-200 py-2 rounded-lg text-sm font-medium">
        Upload Photo
      </button>
      <div className="mb-6">
        <h3 className="text-sm font-semibold mb-2">Photos and Videos</h3>
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <img
              key={i}
              src="https://via.placeholder.com/60"
              alt=""
              className="w-16 h-16 rounded-lg object-cover"
            />
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-semibold mb-2">Shared Links</h3>
        <ul className="text-xs text-blue-600 space-y-1">
          <li className="underline">Selected Package</li>
          <li className="underline">Selected Package</li>
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Appointments</h3>
        {[...Array(2)].map((_, i) => (
          <div key={i} className="text-xs bg-gray-100 p-2 rounded-xl mt-2">
            <p className="font-semibold">Package Name</p>
            <p>Client Name</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatDetails;
