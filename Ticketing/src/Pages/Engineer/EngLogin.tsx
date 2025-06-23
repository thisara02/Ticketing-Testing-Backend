import { FaEnvelope, FaLock } from "react-icons/fa";
import Logo from "../../assets/logo.png";
import SecurityImage from "../../assets/eng-logo.jpg";
import BgImage from "../../assets/engback.jpg"; 
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";// Update to your background image path
import axios from "axios";
import { useState } from "react";

const EngLogin = () => {
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
    const response = await axios.post("http://localhost:5000/api/engineer/login", {
      email,
      password,
    });

    // On success: save token, engineer info to localStorage or context
    localStorage.setItem("engToken", response.data.token);
    localStorage.setItem("engName", response.data.eng.name);
    localStorage.setItem("engDesignation", response.data.eng.designation);
    localStorage.setItem("engMobile", response.data.eng.mobile);

    navigate("/eng-dash");
  } catch (err: any) {
  if (err.response) {
    const message = err.response.data?.message || "Error occurred";
    const attemptsLeft = err.response.data?.attempts_left;

    if (err.response.status === 403) {
      setError(message); // Account locked
    } else if (err.response.status === 401) {
      setError(
        `${message}${attemptsLeft !== undefined ? ` (${attemptsLeft} attempts left)` : ""}`
      );
    } else {
      setError("Server error, please try again later");
    }
  } else {
    setError("Network error");
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

            <p className="text-center text-xl text-green-500 font-semibold pt-4 pb-4 font-jura">
              Cyber Security Operations Portal
            </p>
            <h2 className="text-center text-3xl font-jura font-bold text-gray-800 pb-4">
               Engineer Login Portal
            </h2>
            <p className="text-left text-sm text-gray-500 mb-6 font-jura">
              Please sign in to continue
            </p>

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
              <a href="/eng-forgot" className="text-green-900 text-sm hover:underline font-jura">
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

export default EngLogin;
