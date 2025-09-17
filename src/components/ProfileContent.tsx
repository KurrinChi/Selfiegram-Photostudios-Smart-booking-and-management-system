import React, { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchWithAuth } from "../utils/fetchWithAuth";

const API_URL = import.meta.env.VITE_API_URL;

const ProfileContents: React.FC = () => {
  const navigate = useNavigate();
  const localUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(localUser.photoUrl || null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState({
    username: localUser.username || "",
    firstName: localUser.fname || "",
    lastName: localUser.lname || "",
    email: localUser.email || "",
    phone: localUser.contactNo || "",
    birthday: localUser.birthday || "",
    gender: localUser.gender || "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      const userID = localStorage.getItem("userID");
      if (!userID) {
        toast.error("User not logged in");
        window.location.href = "/";
        return;
      }

      try {
        const response = await fetchWithAuth(`${API_URL}/api/users/${userID}`);
        const data = await response.json();

        if (!response.ok || !data || data.message === "User not found") {
          throw new Error("Invalid user data");
        }
        setFormData({
          username: data.username || "",
          firstName: data.fname || "",
          lastName: data.lname || "",
          email: data.email || "",
          phone: data.contactNo || "",
          birthday: data.birthday || "",
          gender: data.gender || "",
        });
          console.log("profilePicture", data.profilePicture);
      
        localStorage.setItem("user", JSON.stringify(data));

        
          if (data.profilePicture) {
          setPreviewUrl(data.profilePicture);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error("Failed to load user profile");
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
  console.log("previewUrl:", previewUrl);
}, [previewUrl]);

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
   const file = e.target.files?.[0];
  if (file) {
    setPhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);  
    };
    reader.readAsDataURL(file);
  }
};
  const validateForm = () => {
  const newErrors: { [key: string]: string } = {};

  if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
  if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";


  if (!formData.phone.trim()) {
    newErrors.phone = "Contact number is required";
  } else if (!/^\d{11}$/.test(formData.phone)) {
    newErrors.phone = "Enter valid contact number";
  }

  if (!formData.birthday.trim()) newErrors.birthday = "Date of birth is required";
  if (!formData.gender.trim()) newErrors.gender = "Gender is required";

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
  const userID = localStorage.getItem("userID");
    if (!validateForm()) {
    toast.error("Please fill the correct details.");
    return;
  }
   if (!userID) {
    toast.error("User not logged in.");
    return;
  }

  const form = new FormData();
  form.append("fname", formData.firstName);
  form.append("lname", formData.lastName);
  form.append("email", formData.email);
  form.append("contactNo", formData.phone);
  form.append("birthday", formData.birthday);
  form.append("gender", formData.gender);
  if (photo) {
    form.append("photo", photo); // attach file
  }

  // Spoof method for Laravel
  form.append("_method", "PUT");

  try {
    const response = await fetchWithAuth(`${API_URL}/api/users/${userID}`, {
      method: "POST", // Laravel will treat this as PUT
      body: form,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update profile.");
    }

    localStorage.setItem("user", JSON.stringify(data.user));
    toast.success("Profile updated successfully!");
  } catch (error) {
    console.error("Update error:", error);
    toast.error("Error updating profile.");
  }
};

  const handleLogout = async () => {
  try {
    await fetchWithAuth(`${API_URL}/api/logout`, {
      method: "POST",
    });
  } catch (error) {
    console.error("Logout request failed:", error);
  } finally {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
  }
};

 console.log("previewUrl:", previewUrl);


  return (
    <div className="p-10 transition-all duration-300">
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
          <span className="text-gray-400 text-sm"></span>
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
          {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
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
          {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
        </div>

      {/* Email */}
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            readOnly
            placeholder="Enter your email"
            className="w-full rounded-lg bg-gray-100 border border-gray-300 px-4 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 cursor-not-allowed"
          />
          <div className="h-4 mt-1">
            {errors.email ? (
              <p className="text-red-500 text-xs">{errors.email}</p>
            ) : (
              <p className="text-xs invisible">No error</p> // Reserve space
            )}
          </div>
        </div>

       
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
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>

        {/* Birthdate */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Date of Birth
          </label>
          <input
            name="birthday"
            value={formData.birthday}
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
