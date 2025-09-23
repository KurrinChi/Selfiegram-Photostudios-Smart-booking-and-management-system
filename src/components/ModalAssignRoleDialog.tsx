import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface UserProfile {
  profilePicture?: string;
  fname: string;
  lname: string;
  username: string;
  email: string;
  address: string;
  contactNo: string;
  birthday: string;
  gender: string;
  userType: "Admin" | "Staff";
}

const ModalAssignRoleDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [profile, setProfile] = useState<UserProfile>({
    profilePicture: "",
    fname: "",
    lname: "",
    username: "",
    email: "",
    address: "",
    contactNo: "",
    birthday: "",
    gender: "",
    userType: "Staff",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Updated profile:", profile);
    onClose();
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
                    onChange={handleChange}
                    placeholder="09XXXXXXXXX"
                    className="mt-1 w-full border rounded px-3 py-2 text-sm"
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
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Gender</label>
                  <select
                    name="gender"
                    value={profile.gender}
                    onChange={handleChange}
                    className="mt-1 w-full border rounded px-3 py-2 text-sm"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Occupation */}
              <div>
                <label className="text-sm text-gray-600">Occupation</label>
                <select
                  name="userType"
                  value={profile.userType}
                  onChange={handleChange}
                  className="mt-1 w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="Staff">Staff</option>
                  <option value="Customer">Customer</option>
                </select>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-2 bg-black text-white rounded-md hover:opacity-80 text-sm font-medium"
              >
                Add Profile
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalAssignRoleDialog;
