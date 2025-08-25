import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ModalDialog from "./ModalForgetPasswordDialog";

const LoginForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showModal, setShowModal] = useState(false); // For OTP modal
  const [showPasswordModal, setShowPasswordModal] = useState(false); // For new password modal
  const [newPassword, setNewPassword] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email, 
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        console.log("Login successful:", data.user);
        
        //store userid
        localStorage.setItem("token", data.token);
        localStorage.setItem("userID", data.user.userID);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("userType", JSON.stringify(data.user.userType));
        console.log("Saving user to localStorage:", data.user);
        console.log("saving userID to localStorage:", data.user.userID);

        const userType = data.user.userType;
        console.log("User Type:", userType);

        // Redirect based on usertype
        switch (userType) {
          case "Admin":
            navigate("/admin/dashboard");
            break;
          case "Customer":
            navigate("/client/home");
            break;
          case "Staff":
            alert("Redirecting to staff page...");
            //navigate("/staff/dashboard");
            break;
          default:
            navigate("/"); // fallback
        }
      } else {
        alert(data.message || "Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto text-[#111] font-sf relative">
      <img src="/slfg.svg" alt="logo" className="w-28 mb-6 mx-auto" />
      <h3 className="text-s font-bold mb-2 text-left">Login to Account</h3>
      <h2 className="text-2xl font-bold text-left mb-2">
        Seize Great Moments at Selfiegram
      </h2>
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
          required
        />
        {/* Login Password Input with Eye Toggle */}
        <div className="relative">
          <input
            type={showLoginPassword ? "text" : "password"}
            name="password"
            placeholder="Enter your password"
            className="w-full px-4 py-3 rounded-xl bg-[#f7f7f7] border border-gray-300 pr-12 focus:outline-none focus:ring-2 focus:ring-[#111]"
            onChange={handleChange}
            value={formData.password}
            required
          />
          <button
            type="button"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={() => setShowLoginPassword((prev) => !prev)}
          >
            <i
              className={`fas ${showLoginPassword ? "fa-eye-slash" : "fa-eye"}`}
            />
          </button>
        </div>

        <div
          onClick={() => setShowModal(true)}
          className="text-left ml-2 text-sm text-gray-500 hover:underline cursor-pointer"
        >
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
        Don’t have an account?{" "}
        <Link
          to="/register"
          className="text-[#111] font-semibold underline hover:text-[#333]"
        >
          Register
        </Link>
      </p>

      {/* OTP Modal */}
      <ModalDialog isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="text-center">
          <div className="text-[#212121] mb-2">
            <i className="fas fa-envelope text-2xl" />
          </div>
          <h2 className="font-bold text-lg">Forgot Password.</h2>
          <p className="text-sm text-gray-500 mt-1">
            We’ve sent a code to <strong>example@email.com</strong>
          </p>
        </div>

        {/* OTP inputs */}
        <div className="flex justify-center gap-2 mt-6">
          {[0, 1, 2, 3].map((_, i) => (
            <input
              key={i}
              maxLength={1}
              className="w-12 h-12 text-center text-xl border border-gray-300 rounded-lg"
              placeholder="-"
            />
          ))}
        </div>

        <div className="text-center mt-3 text-xs text-gray-500">
          Didn’t get a code?{" "}
          <button className="text-blue-500 hover:underline">
            Click to resend.
          </button>
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={() => setShowModal(false)}
            className="px-6 py-2 border border-gray-300 text-sm rounded-md hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              setShowModal(false);
              setShowPasswordModal(true);
            }}
            className="px-6 py-2 bg-[#212121] text-white text-sm rounded-md hover:bg-gray-400"
          >
            Confirm
          </button>
        </div>
      </ModalDialog>

      <ModalDialog
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      >
        <div className="text-center">
          <div className="text-2xl mb-4">
            <i className="fas fa-sign-in-alt" />
          </div>
          <h2 className="font-bold text-lg">Log in to your account</h2>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back! Please enter your new password.
          </p>

          {/* New Password Input with Eye Toggle */}
          <div className="relative mt-4">
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="********"
              className="w-full px-4 py-3 rounded-xl bg-[#f7f7f7] border border-gray-300 pr-12"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowNewPassword((prev) => !prev)}
            >
              <i
                className={`fas ${showNewPassword ? "fa-eye-slash" : "fa-eye"}`}
              />
            </button>
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setShowPasswordModal(false)}
              className="px-6 py-2 border border-gray-300 text-sm rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                console.log("New password set:", newPassword);
                setShowPasswordModal(false);
              }}
              className="px-6 py-2 bg-[#212121] text-white text-sm rounded-md hover:bg-gray-400"
            >
              Confirm
            </button>
          </div>
        </div>
      </ModalDialog>
    </div>
  );
};

export default LoginForm;
