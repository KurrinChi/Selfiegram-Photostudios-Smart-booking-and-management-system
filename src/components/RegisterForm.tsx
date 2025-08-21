import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;


    // Load saved data from localStorage when component mounts
  useEffect(() => {
    const savedData = localStorage.getItem("registerStep1");
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newData = { ...formData, [e.target.name]: e.target.value };
    setFormData(newData);
    localStorage.setItem("registerStep1", JSON.stringify(newData)); // save live while typing
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

    // Check if username exists in the database
    try {
      const res = await fetch(
        `${API_URL}/api/check-username?username=${encodeURIComponent(
          formData.username
        )}`
      );
      const data = await res.json();

      if (data.exists) {
        toast.error("Username already taken. Please choose another one.");
        return;
      }
    } catch (error) {
      console.error("Error checking username:", error);
      toast.error("Could not check username. Please try again.");
      return;
    }

  // Password strength regex: At least 8 chars, 1 uppercase, 1 number, 1 special char
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    if (!passwordRegex.test(formData.password)) {
      toast.error(
        "Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 number, and 1 special character."
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    
  navigate("/register-info");
  };

  return (
    <div className="w-full max-w-md mx-auto text-[#111] font-sf">
      <img src="/slfg.svg" alt="logo" className="w-28 mb-6 mx-auto" />
      <h3 className="text-s font-bold mb-2 text-left">Create Account</h3>
      <h2 className="text-2xl font-bold mb--10 text-left">Seize Great Moments at Selfiegram</h2>
      <p className="mb-8 text-gray-600 text-left">
        Start capturing unforgettable moments together!
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          type="text"
          name="username"
          placeholder="Enter your username"
          className="w-full px-4 py-3 rounded-xl bg-[#f7f7f7] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#111]"
          onChange={handleChange}
          value={formData.username}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          className="w-full px-4 py-3 rounded-xl bg-[#f7f7f7] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#111]"
          onChange={handleChange}
          value={formData.password}
          required
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm your password"
          className="w-full px-4 py-3 rounded-xl bg-[#f7f7f7] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#111]"
          onChange={handleChange}
          value={formData.confirmPassword}
          required
        />

        <button
          type="submit"
          className="w-full py-3 bg-[#E2E1E1] text-[#4E4E4E] rounded-xl font-semibold hover:bg-[#333] hover:text-[#E2E1E1] transition-colors"
        >
          Next
        </button>
      </form>

      <p className="text-sm mt-6 text-center text-gray-600">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-[#111] font-semibold underline hover:text-[#333]"
          onClick={() => {
            localStorage.removeItem("registerStep1");
            localStorage.removeItem("registerStep2");
          }}
        >
          Login
        </Link>
      </p>
    </div>
  );
};

export default RegisterForm;
