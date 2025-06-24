import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

const AdminOtp = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const handleVerifyOtp = async () => {
    const adminId = localStorage.getItem("pendingAdminId");
    setError("");

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/admin/verify-otp", {
        admin_id: adminId,
        otp,
      });

      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("adminName", res.data.admin.name);
      localStorage.setItem("adminMobile", res.data.admin.mobile);
      navigate("/admin-dash");
    } catch (err: any) {
      if (err.response && err.response.status === 403) {
        setError("OTP expired. Please try logging in again.");
      } else {
        setError("Invalid OTP or server error.");
      }
    }
  };

  return (
    <div className="w-screen h-screen bg-gray-100 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm bg-white p-8 rounded-xl shadow-lg border"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4 font-jura">
          OTP Verification
        </h2>
        <p className="text-sm text-center text-gray-500 mb-6 font-jura">
          Enter the 6-digit code sent to your email
        </p>
        <input
          type="text"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-md text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 font-jura"
          placeholder="------"
        />
        {error && (
          <p className="text-red-500 text-sm mt-3 text-center font-jura">{error}</p>
        )}
        <button
          onClick={handleVerifyOtp}
          className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition duration-200 font-jura"
        >
          Verify OTP
        </button>
      </motion.div>
    </div>
  );
};

export default AdminOtp;
