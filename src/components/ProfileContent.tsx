import React, { useState } from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProfileContents: React.FC = () => {
  const navigate = useNavigate();

  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: "user01",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthdate: "",
    gender: "Male",
  });

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    toast.success("Profile updated successfully!");
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto bg-white rounded-xl shadow-lg transition-all duration-300">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Photo */}
        <div className="flex flex-col items-center md:items-start">
          <label
            htmlFor="photoUpload"
            className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden mb-3 border-2 border-dashed border-gray-300 hover:border-black transition-all duration-300 cursor-pointer"
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="object-cover w-full h-full"
              />
            ) : (
              <i className="fas fa-camera text-gray-400 text-xl" />
            )}
          </label>
          <input
            id="photoUpload"
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />
          <label className="text-sm font-medium text-gray-700">
            Upload Photo
          </label>
        </div>

        {/* Username (readonly) */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Username
          </label>
          <input
            type="text"
            value={formData.username}
            readOnly
            className="w-full rounded-lg bg-gray-100 border border-gray-300 px-4 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 cursor-not-allowed"
          />
        </div>

        {/* First Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            First Name
          </label>
          <input
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Enter your first name"
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black transition"
          />
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Last Name
          </label>
          <input
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Enter your last name"
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black transition"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Your Email
          </label>
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black transition"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black transition"
          />
        </div>

        {/* Birthdate */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Date of Birth
          </label>
          <input
            name="birthdate"
            value={formData.birthdate}
            onChange={handleChange}
            type="date"
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black transition"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Gender
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black transition"
          >
            <option>Male</option>
            <option>Female</option>
            <option>Non-binary</option>
            <option>Other</option>
          </select>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-10 flex flex-col md:flex-row justify-center md:justify-end gap-4">
        <button
          onClick={handleSave}
          className="bg-black text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-all duration-300 shadow-md hover:scale-[1.02]"
        >
          Save Changes
        </button>
        <button
          onClick={handleLogout}
          className="bg-gray-500 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-gray-600 transition-all duration-300 shadow-md hover:scale-[1.02]"
        >
          Log Out
        </button>
      </div>

      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default ProfileContents;
