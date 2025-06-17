import { useState } from "react";
import { Link } from "react-router-dom";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // validate and submit
    console.log(formData);
  };

  return (
    <div className="w-full max-w-md mx-auto text-[#111] font-sf">
      <img src="/slfg.svg" alt="logo" className="w-28 mb-6 mx-auto" />
      <h3 className="text-s font-bold mb-2 text-left">Login to Account</h3>
      <h2 className="text-2xl font-bold text-left mb-2">Seize Great Moments at Selfiegram</h2>
      <p className="mb-8 text-gray-600 text-left">
        Start capturing unforgettable moments together!
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          className="w-full px-4 py-3 rounded-xl bg-[#f7f7f7] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#111]"
          onChange={handleChange}
          value={formData.email}
        />
        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          className="w-full px-4 py-3 rounded-xl bg-[#f7f7f7] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#111]"
          onChange={handleChange}
          value={formData.password}
        />

        <div className="text-left ml-2 text-sm text-gray-500 hover:underline cursor-pointer">
          Forgot Password?
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-[#E2E1E1] text-[#4E4E4E] rounded-xl font-semibold hover:bg-[#333] hover:text-[#E2E1E1] transition-colors"
        >
          Login
        </button>
      </form>

      <p className="text-sm mt-6 text-center text-gray-600">
        Don’t have an account?{' '}
        <Link
          to="/register"
          className="text-[#111] font-semibold underline hover:text-[#333]"
        >
          Register
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;
