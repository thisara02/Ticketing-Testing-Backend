import { useState } from "react";
import { FaEnvelope, FaKey } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Image from "../../assets/back.jpg"; 

const ForgotPass = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error] = useState<string | null>(null);
  const [success] = useState<string | null>(null);
  const [showOtpSection, setShowOtpSection] = useState(false);

  const handleSendOtp = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/customers/forgot-password/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.error || "Cannot send OTP",
          showConfirmButton: false,
          timer: 2000 // Auto-close after 2 seconds
        });
        return;
      }
      Swal.fire({
        icon: "success",
        title: "OTP Sent!",
        text: "Check your inbox.",
        showConfirmButton: false,
        timer: 2000
      });

      setShowOtpSection(true);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Server error",
        showConfirmButton: false,
        timer: 2000
      });
    }
  };


    const navigate = useNavigate();

    const handleVerifyOtp = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/customers/forgot-password/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "OTP verified",
          showConfirmButton: false,
          timer: 2000,
        });
        // Navigate with resetToken
        // After successful OTP verification:
        localStorage.setItem("resetEmail", email);
        navigate("/reset-pass", {
          state: {
            resetToken: data.resetToken,
            email: email   // ✅ pass email here too
          },
        });
      } else if (res.status === 401) {
        Swal.fire({
          icon: "info",
          title: "Invalid OTP",
          text: data.error,
          showConfirmButton: false,
          timer: 2000,
        });
      } else if (res.status === 403) {
        Swal.fire({
          icon: "info",
          title: "Expired OTP",
          text: "Please request again",
          showConfirmButton: false,
          timer: 2000,
        });
        setTimeout(() => navigate("/login"), 2000);
      } else {
        Swal.fire({
          icon: "info",
          title: "Error",
          text: data.error || "Verification failed",
          showConfirmButton: false,
          timer: 2000,
        });
      }
    } catch {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Server error",
          showConfirmButton: false,
          timer: 2000,
        });
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

export default ForgotPass;
