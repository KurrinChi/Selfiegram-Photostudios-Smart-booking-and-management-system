import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

const RegisterInfoForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = React.useState({
    fname: "",
    lname: "",
    email: "",
    address: "",
    contact: "",
    gender: "",
    birthday: "",
  });

  // Load saved data from localStorage when component mounts
  useEffect(() => {
    const savedData = localStorage.getItem("registerStep2");
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const newData = { ...formData, [e.target.name]: e.target.value };
    setFormData(newData);
    localStorage.setItem("registerStep2", JSON.stringify(newData)); // save live while typing
  };

  const [isSubmitting, setIsSubmitting] = React.useState(false); // <-- Loading state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // prevent double-click
    const step1Data = JSON.parse(localStorage.getItem("registerStep1") || "{}");

    if (!formData.fname || !formData.lname || !formData.email || !step1Data.username) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const phoneRegex = /^09\d{9}$/;
    if (!phoneRegex.test(formData.contact)) {
      toast.error("Please enter a valid Philippine mobile number (e.g., 09123456789).");
      return;
    }
    setIsSubmitting(true); // <-- Start loading
    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          username: step1Data.username,
          password: step1Data.password,
          password_confirmation: step1Data.confirmPassword,
          fname: formData.fname,
          lname: formData.lname,
          email: formData.email,
          address: formData.address,
          contactNo: formData.contact,
          gender: formData.gender,
          birthday: formData.birthday,
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        toast.success(
          "Registered successfully! Please check your email to proceed with log in.",
          {
            autoClose: 7000,
            onClose: () => {
              localStorage.removeItem("registerStep1");
              localStorage.removeItem("registerStep2");
              navigate("/");
            },
          }
        );
      } else {
        toast.error(data.message || "Registration failed.");
      }
    } catch (error) {
      console.error("Register error:", error);
      toast.error("Something went wrong.");
    } finally {
      setIsSubmitting(false); // <-- Stop loading
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto text-[#111] font-sf px-4 py-6">
      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 shadow-md"
      >
        <i className="fas fa-arrow-left" />
      </button>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-2 text-left">Create an account</h2>
        <p className="mb-8 text-gray-600 text-left">Fill up your personal information.</p>


        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="flex gap-2">
            <input
              type="text"
              name="fname"
              placeholder="First Name"
              value={formData.fname}
              onChange={handleChange}
              className="w-1/2 p-3 border border-gray-300 rounded-xl"
              required
            />
            <input
              type="text"
              name="lname"
              placeholder="Last Name"
              value={formData.lname}
              onChange={handleChange}
              className="w-1/2 p-3 border border-gray-300 rounded-xl"
              required
            />
          </div>


          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-xl"
            required
          />


          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-xl"
            required
          />


          <input
            type="text"
            name="contact"
            placeholder="Contact Number"
            value={formData.contact}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-xl"
            required
          />



          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className={`w-full p-3 border border-gray-300 rounded-xl bg-white ${formData.gender === "" ? "text-gray-400" : "text-black"
              }`}
            required
          >
            <option value="" disabled>
              Select Gender
            </option>
            <option value="Female" className="text-black">
              Female
            </option>
            <option value="Male" className="text-black">
              Male
            </option>
            <option value="Prefer not to say" className="text-black">
              Prefer not to say
            </option>
          </select>


          <input
            type="date"
            name="birthday"
            value={formData.birthday}
            onChange={handleChange}
            className={`w-full p-3 border border-gray-300 rounded-xl ${!formData.birthday ? "text-gray-400" : "text-black"
              }`}
            required
          />

          <button
            type="submit"
            disabled={isSubmitting} // <-- Disable when submitting
            className={`w-full py-3 rounded-xl font-semibold transition-colors ${isSubmitting
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#E2E1E1] text-[#4E4E4E] hover:bg-[#333] hover:text-[#E2E1E1]"
              }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                Submitting...
              </span>
            ) : (
              "Submit"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterInfoForm;
