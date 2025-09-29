import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface UserProfile {
  fname: string;
  lname: string;
  username: string;
  email: string;
  address: string;
  contactNo: string;
  birthday: string;
  gender: string;
}

const ModalAssignRoleDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [profile, setProfile] = useState<UserProfile>({
    fname: "",
    lname: "",
    username: "",
    email: "",
    address: "",
    contactNo: "",
    birthday: "",
    gender: "",
  });

  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    fetchWithAuth(`${API_URL}/api/admin/users/create`, {
      method: "POST",
      body: JSON.stringify(profile),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to create profile");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Profile created:", data);
        toast.success("Profile created successfully. Check email for verification.", { autoClose: 4000 });
        setTimeout(() => {
          window.location.reload();
        }, 4000);
        onClose();
      })
      .catch((error) => {
        console.error("Error creating profile:", error);
        toast.error("Failed to create profile", { autoClose: 3000 });
      })
      .finally(() => {
        setLoading(false);
      });

    console.log("created profile:", profile);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="profile-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-lg p-8 relative"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <img src="/slfg.svg" alt="logo" className="mx-auto h-10 mb-3" />
              <h2 className="text-xl font-semibold">Account Setup</h2>
              <p className="text-sm text-gray-500">
                Update user details to complete the profile.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">First Name</label>
                  <input
                    type="text"
                    name="fname"
                    value={profile.fname}
                    onChange={handleChange}
                    placeholder="First Name"
                    className="mt-1 w-full border rounded px-3 py-2 text-sm"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Last Name</label>
                  <input
                    type="text"
                    name="lname"
                    value={profile.lname}
                    onChange={handleChange}
                    placeholder="Last Name"
                    className="mt-1 w-full border rounded px-3 py-2 text-sm"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Username & Email */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={profile.username}
                    onChange={handleChange}
                    placeholder="Username"
                    className="mt-1 w-full border rounded px-3 py-2 text-sm"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    className="mt-1 w-full border rounded px-3 py-2 text-sm"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="text-sm text-gray-600">Address</label>
                <input
                  type="text"
                  name="address"
                  value={profile.address}
                  onChange={handleChange}
                  placeholder="Street, City, Country"
                  className="mt-1 w-full border rounded px-3 py-2 text-sm"
                  required
                  disabled={loading}
                />
              </div>

              {/* Phone, Birthday, Gender */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Phone</label>
                  <input
                    type="text"
                    name="contactNo"
                    value={profile.contactNo}
                    onChange={(e) => {
                      const onlyNums = e.target.value.replace(/\D/g, "");
                      setProfile((prev) => ({ ...prev, contactNo: onlyNums }));
                    }}
                    placeholder="09XXXXXXXXX"
                    className="mt-1 w-full border rounded px-3 py-2 text-sm"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Birthday</label>
                  <input
                    type="date"
                    name="birthday"
                    value={profile.birthday}
                    onChange={handleChange}
                    className="mt-1 w-full border rounded px-3 py-2 text-sm"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Gender</label>
                  <select
                    name="gender"
                    value={profile.gender}
                    onChange={handleChange}
                    className="mt-1 w-full border rounded px-3 py-2 text-sm"
                    required
                    disabled={loading}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className={`w-full py-2 flex justify-center items-center gap-2 text-white rounded-md text-sm font-medium ${loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-black hover:opacity-80"
                  }`}
                disabled={loading}
              >
                {loading && (
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
                {loading ? "Adding..." : "Add Profile"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalAssignRoleDialog;
