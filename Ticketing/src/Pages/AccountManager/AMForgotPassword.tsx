import { useState } from "react";
import { FaEnvelope, FaKey } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Image from "../../assets/back.jpg"; 

const AMForgotPass = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error] = useState<string | null>(null);
  const [success] = useState<string | null>(null);
  const [showOtpSection, setShowOtpSection] = useState(false);

  const handleSendOtp = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/accountmanager/forgot-password/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) {
      Swal.fire("Error", data.error || "Cannot send OTP", "error");
      return;
    }
    Swal.fire("OTP Sent!", "Check your inbox.", "success");
    setShowOtpSection(true);
  } catch (err) {
    Swal.fire("Error", "Server error", "error");
  }
};


  const navigate = useNavigate();

  const handleVerifyOtp = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/accountmanager/forgot-password/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();
    if (res.ok) {
      Swal.fire("Success", "OTP verified", "success");
      // Navigate with resetToken
      // After successful OTP verification:
      localStorage.setItem("resetEmail", email);
      navigate("/am-reset", {
        state: {
          resetToken: data.resetToken,
          email: email   // ✅ pass email here too
        },
      });
    } else if (res.status === 401) {
      Swal.fire("Invalid OTP", data.error, "error");
    } else if (res.status === 403) {
      Swal.fire("Expired OTP", "Please request again", "warning");
      setTimeout(() => navigate("/am-login"), 2000);
    } else {
      Swal.fire("Error", data.error || "Verification failed", "error");
    }
  } catch {
    Swal.fire("Error", "Server error", "error");
  }
};


  return (
    <div className="relative min-h-screen w-screen flex items-center justify-center font-jura">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${Image})` }}
      ></div>

      {/* Overlay with opacity */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Main content */}
      <div className="relative z-10 bg-white shadow-xl rounded-xl p-8 w-3/5">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
          Forgot Password
        </h1>
        <p className="text-gray-600 mb-6">
          Enter your email to receive an OTP for password reset.
        </p>

        {/* Email Section */}
        <div className="space-y-4">
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              readOnly={showOtpSection} // Make readonly after OTP is sent
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                showOtpSection ? "bg-gray-100" : "bg-white"
              } border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition text-black`}
            />
          </div>

          {!showOtpSection && (
            <button
              type="button"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
              onClick={handleSendOtp}
            >
              Send Verification Code
            </button>
          )}
        </div>

        {/* OTP Section (conditionally shown) */}
        {showOtpSection && (
          <div className="mt-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Verify OTP</h2>
            <div className="relative">
              <FaKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>
            <button
              type="button"
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-medium"
              onClick={handleVerifyOtp}
            >
              Verify OTP
            </button>
          </div>
        )}

        {/* Feedback */}
        {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
        {success && <p className="text-green-600 text-sm mt-4">{success}</p>}
      </div>
    </div>
  );
};

export default AMForgotPass;
