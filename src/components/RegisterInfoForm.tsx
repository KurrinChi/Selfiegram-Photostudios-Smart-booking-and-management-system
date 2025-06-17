import React from "react";
import { useNavigate } from "react-router-dom";
import '@fortawesome/fontawesome-free/css/all.min.css';


const RegisterInfoForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    address: "",
    contact: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      alert("Please fill in all required fields.");
      return;
    }

    // Proceed to the next step or send data to backend
    navigate("/next-step"); // 🔁 Replace with actual next route
  };

  return (
    <div className="relative w-full max-w-md mx-auto text-[#111] font-sf px-4 py-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 text-[#4E4E4E] font-semibold hover:underline"
        >
        <i className="fas fa-left-long"></i>  
        </button>


      {/* Title and Description */}
      <div className="mt-12"> {/* push content down to avoid overlap with back button */}
        <h2 className="text-2xl font-bold mb-2 text-left">Create an account</h2>
        <p className="mb-8 text-gray-600 text-left">
          Fill up your personal information.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-xl"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-xl"
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-xl"
          />
          <input
            type="text"
            name="contact"
            placeholder="Contact Number"
            value={formData.contact}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-xl"
          />

          <button
            type="submit"
            className="w-full py-3 bg-[#E2E1E1] text-[#4E4E4E] rounded-xl font-semibold hover:bg-[#333] hover:text-[#E2E1E1] transition-colors"
          >
            Next
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterInfoForm;
