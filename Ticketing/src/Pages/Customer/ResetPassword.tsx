import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaLock, FaArrowLeft } from "react-icons/fa";
import Swal from "sweetalert2";
import Image from "../../assets/back.jpg"; // Assuming your background image path

const ResetPass = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setError("Please fill in both fields.");
      setSuccess(null);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setSuccess(null);
      return;
    }

    // Validate each requirement separately
    const errors = [];
    if (newPassword.length < 8) {
      errors.push("Password must be at least 8 characters long.");
    }
    if (!/[A-Z]/.test(newPassword)) {
      errors.push("Password must contain at least one uppercase letter.");
    }
    if (!/[a-z]/.test(newPassword)) {
      errors.push("Password must contain at least one lowercase letter.");
    }
    if (!/\d/.test(newPassword)) {
      errors.push("Password must include at least one number.");
    }
    if (!/[!@#$%^&*]/.test(newPassword)) {
      errors.push("Password must have at least one special character (!@#$%^&*).");
    }

    if (errors.length > 0) {
      setError(errors.join(" "));
      setSuccess(null);
      return;
    }

    // If all criteria pass
    setError(null);
    Swal.fire({
      title: "Password Reset Successful!",
      text: "Now you can login by entering your new password",
      icon: "info",
      timer: 1500,
      showConfirmButton: false,
      customClass: {
        popup: "swal2-text-black",
        confirmButton: "swal2-confirm-button",
        cancelButton: "swal2-cancel-button",
      },
    });

    // Clear the fields
    setNewPassword("");
    setConfirmPassword("");

    // Redirect to login after 2 seconds
    setTimeout(() => navigate("/login"), 2000);
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
          {success && <p className="text-green-600 text-sm">{success}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPass;
