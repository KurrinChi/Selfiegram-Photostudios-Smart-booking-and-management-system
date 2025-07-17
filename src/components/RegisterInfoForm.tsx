import React from "react";
import { useNavigate } from "react-router-dom";
import '@fortawesome/fontawesome-free/css/all.min.css';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const step1Data = JSON.parse(localStorage.getItem("registerStep1") || "{}");

    if (!formData.fname || !formData.lname || !formData.email || !step1Data.username) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/register", {
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
        alert("Registered successfully!");
        navigate("/");
      } else {
        alert(data.message || "Registration failed.");
      }
    } catch (error) {
      console.error("Register error:", error);
      alert("Something went wrong.");
    }
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
            />
            <input
              type="text"
              name="lname"
              placeholder="Last Name"
              value={formData.lname}
              onChange={handleChange}
              className="w-1/2 p-3 border border-gray-300 rounded-xl"
            />
          </div>

    
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


          
     <select
        name="gender"
        value={formData.gender}
        onChange={handleChange}
        className={`w-full p-3 border border-gray-300 rounded-xl bg-white ${
          formData.gender === "" ? "text-gray-400" : "text-black"
        }`}
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
          className={`w-full p-3 border border-gray-300 rounded-xl ${
            !formData.birthday ? "text-gray-400" : "text-black"
          }`}
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
