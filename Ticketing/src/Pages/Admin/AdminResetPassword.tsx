import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaLock, FaArrowLeft } from "react-icons/fa";
import Swal from "sweetalert2";
import Image from "../../assets/back.jpg"; // Assuming your background image path


interface LocationState {
  resetToken?: string;
  email?: string;
}

const AdminResetPass = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  // Prefer state values, fallback to localStorage for persistence on refresh
  const resetToken = state?.resetToken || localStorage.getItem("resetToken") || "";
  const email = state?.email || localStorage.getItem("resetEmail") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If missing token or email, show error and redirect
    if (!resetToken || !email) {
      Swal.fire("Error", "Missing reset token or email", "error").then(() => {
        navigate("/admin-forgot");
      });
    } else {
      // Save token and email in localStorage to survive page refresh
      localStorage.setItem("resetToken", resetToken);
      localStorage.setItem("resetEmail", email);
    }
  }, [resetToken, email, navigate]);

  const validatePassword = (password: string): string[] => {
    const errors = [];
    if (password.length < 8) errors.push("Password must be at least 8 characters long.");
    if (!/[A-Z]/.test(password)) errors.push("Password must contain at least one uppercase letter.");
    if (!/[a-z]/.test(password)) errors.push("Password must contain at least one lowercase letter.");
    if (!/\d/.test(password)) errors.push("Password must include at least one number.");
    if (!/[!@#$%^&*]/.test(password)) errors.push("Password must have at least one special character (!@#$%^&*).");
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setError("Please fill in both fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const validationErrors = validatePassword(newPassword);
    if (validationErrors.length > 0) {
      setError(validationErrors.join(" "));
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reset_token: resetToken,
          new_password: newPassword,
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoading(false);
        setError(data.error || "Failed to reset password");
        return;
      }

      setLoading(false);

      Swal.fire({
        title: "Password Reset Successful!",
        text: "You can now login with your new password.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: "swal2-text-black",
        },
      });

      setNewPassword("");
      setConfirmPassword("");

      // Cleanup localStorage after showing success and navigating away
      setTimeout(() => {
        localStorage.removeItem("resetToken");
        localStorage.removeItem("resetEmail");
        navigate("/admin-login");
      }, 2000);
    } catch (err) {
      setLoading(false);
      setError("Network error: Unable to reset password");
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
      <div className="relative z-10 bg-white shadow-xl rounded-xl p-12 w-3/5 ">
        {/* Back to Login */}
        <button
          onClick={() => navigate("/login")}
          className="flex items-center text-blue-600 hover:underline mb-4"
        >
          <FaArrowLeft className="mr-2" />
          Back to Login
        </button>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
          Reset Password
        </h1>
        <p className="text-gray-600 mb-6">Enter your new password below.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>

          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>

          {/* Password criteria */}
          <div className="text-green-800 text-sm mt-1 space-y-1 mb-4 font-jura">
            <p>Password must be:</p>
            <ul className="list-disc pl-5">
              <li>Be at least 8 characters long</li>
              <li>Contain at least one uppercase letter</li>
              <li>Contain at least one lowercase letter</li>
              <li>Include at least one number</li>
              <li>Have at least one special character (!@#$%^&*)</li>
            </ul>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg font-medium transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminResetPass;
