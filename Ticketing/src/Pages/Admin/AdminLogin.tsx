import { useState } from "react";
import { FaEnvelope, FaLock } from "react-icons/fa";
import Logo from "../../assets/logo.png";
import SecurityImage from "../../assets/img1.jpg";
import BgImage from "../../assets/admin-login.jpg";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

const AdminLogin = () => {
  const navigate = useNavigate();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle login
  const handleLogin = async () => {
  setError("");
  if (!email || !password) {
    setError("Please enter email and password");
    return;
  }

  setLoading(true);
  try {
    const response = await axios.post("http://localhost:5000/api/admin/login", {
      email,
      password,
    });

    if (response.data.bypass_otp) {
      // Maintainer: direct login
      localStorage.setItem("adminToken", response.data.token);
      localStorage.setItem("adminName", response.data.admin.name);
      localStorage.setItem("adminMobile", response.data.admin.mobile);
      navigate("/admin-dash");
    } else {
      // Normal admin: go to OTP verification page
      localStorage.setItem("pendingAdminId", response.data.admin_id);
      navigate("/admin-otp");
    }
  } catch (err: any) {
    if (err.response && err.response.status === 401) {
      setError("Invalid email or password");
    } else {
      setError("Server error, please try again later");
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.4 }}
      className="flex h-screen w-screen"
    >
      <div
        className="w-screen h-screen bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url(${BgImage})` }}
      >
        {/* Fullscreen Card */}
        <div className="flex w-full h-full lg:h-[75%] lg:w-[90%] xl:w-[60%] 2xl:w-[60%] bg-white  rounded-lg shadow-lg overflow-hidden">
          {/* Left Panel - Login */}
          <div className="w-full lg:w-3/5 flex items-center justify-center p-4 bg-white">
            <div className="w-full max-w-md">
              <div className="flex justify-center mt-4 pb-2">
                <img src={Logo} alt="LankaCom" className="h-14" />
              </div>

              <p className="text-center text-xl text-blue-500 font-semibold pt-4 pb-4 font-jura">
                Cyber Security Operations Portal
              </p>
              <h2 className="text-center text-3xl font-jura font-bold text-gray-800 pb-4">
                Admin Dashboard
              </h2>
              <p className="text-left text-sm text-gray-500 mb-6 font-jura">
                Please sign in to continue
              </p>

              {/* Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleLogin();
                }}
                className="space-y-4 "
              >
                <div className="relative text-black">
                  <span className="absolute left-3 top-3 text-gray-400">
                    <FaEnvelope />
                  </span>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 font-jura"
                    autoComplete="username"
                  />
                </div>

                <div className="relative text-black">
                  <span className="absolute left-3 top-3 text-gray-400">
                    <FaLock />
                  </span>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 font-jura"
                    autoComplete="current-password"
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-sm font-jura">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-2 rounded text-white font-jura ${
                    loading
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 transition"
                  }`}
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>

              <div className="text-center mt-4">
                <a
                  href="/admin-forgot"
                  className="text-blue-500 text-sm hover:underline font-jura"
                >
                  Forgot Password?
                </a>
              </div>
            </div>
          </div>

          {/* Right Panel - Image */}
          <div className="hidden lg:block lg:w-1/2">
            <img
              src={SecurityImage}
              alt="Security"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminLogin;
