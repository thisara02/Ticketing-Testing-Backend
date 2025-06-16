import { useState, useEffect } from "react";
import Sidebar from "../../components/AdminSide";
import Navbar from "../../components/AdminNav";
import {
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  BriefcaseIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  KeyIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

interface Engineer {
  id: number;
  name: string;
  email: string;
  designation: string;
  mobile: string;
}

const AdminCreateEng = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    designation: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  useEffect(() => {
    fetchEngineers();
  }, []);

  const fetchEngineers = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/engineer", {
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch engineers");
      }

      const data = await res.json();
      setEngineers(data.engineers || []);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to fetch engineers.",
        timer: 2000,
        showConfirmButton: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { name, email, designation, mobile, password, confirmPassword } = formData;

    if (!name || !email || !designation || !mobile || !password || !confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please fill in all required fields.",
        timer: 1000,
        showConfirmButton: false,
      });
      return;
    }

    if (password.length < 8) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Password must be at least 8 characters long.",
        timer: 1000,
        showConfirmButton: false,
      });
      return;
    }

    if (password !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Passwords do not match.",
        timer: 1000,
        showConfirmButton: false,
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/engineer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, designation, mobile, password, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create engineer");
      }

      if (data.engineer) {
        setEngineers((prev) => [...prev, data.engineer]);
      }

      Swal.fire({
        icon: "success",
        title: "Engineer Created Successfully!",
        timer: 1500,
        showConfirmButton: false,
      });

      setFormData({
        name: "",
        email: "",
        designation: "",
        mobile: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Something went wrong while creating engineer.",
        timer: 2000,
        showConfirmButton: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEngineer = async (id: number) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This engineer will be permanently deleted! This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete!",
      cancelButtonText: "Cancel",
      didOpen: () => {
        const confirmBtn = Swal.getConfirmButton();
        const cancelBtn = Swal.getCancelButton();

        if (confirmBtn) {
          confirmBtn.style.backgroundColor = "#dc2626";
          confirmBtn.style.color = "#fff";
          confirmBtn.style.border = "none";
          confirmBtn.style.padding = "8px 16px";
          confirmBtn.style.borderRadius = "4px";
          confirmBtn.style.cursor = "pointer";
        }
        if (cancelBtn) {
          cancelBtn.style.backgroundColor = "#6b7280";
          cancelBtn.style.color = "#fff";
          cancelBtn.style.border = "none";
          cancelBtn.style.padding = "8px 16px";
          cancelBtn.style.borderRadius = "4px";
          cancelBtn.style.cursor = "pointer";
        }
      },
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/engineer/${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to delete engineer");
        }

        setEngineers((prev) => prev.filter((eng) => eng.id !== id));

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Engineer has been deleted.",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Something went wrong while deleting engineer.",
          timer: 2000,
          showConfirmButton: false,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      <div className="flex-shrink-0">
        <Sidebar isOpen={isSidebarOpen} />
      </div>

      <div className="flex-1 flex flex-col h-screen min-h-0">
        <div className="flex-shrink-0">
          <Navbar toggleSidebar={toggleSidebar} />
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-100 p-8">
          {/* Form Section */}
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8 font-jura mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-center gap-2">
              <UserIcon className="h-8 w-8 text-green-500" />
              Create Engineer Profile
            </h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-black">
              {/* Name */}
              <div className="relative">
                <label className="block mb-2 font-medium text-gray-700">Full Name</label>
                <UserIcon className="h-5 w-5 text-gray-400 absolute left-3 top-11 pointer-events-none" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 pl-10 border rounded focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                />
              </div>

              {/* Email */}
              <div className="relative">
                <label className="block mb-2 font-medium text-gray-700">Email</label>
                <EnvelopeIcon className="h-5 w-5 text-gray-400 absolute left-3 top-11 pointer-events-none" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 pl-10 border rounded focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                />
              </div>

              {/* Designation */}
              <div className="relative">
                <label className="block mb-2 font-medium text-gray-700">Designation</label>
                <BriefcaseIcon className="h-5 w-5 text-gray-400 absolute left-3 top-11 pointer-events-none" />
                <input
                  type="text"
                  name="designation"
                  required
                  value={formData.designation}
                  onChange={handleChange}
                  className="w-full p-3 pl-10 border rounded focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                />
              </div>

              {/* Mobile */}
              <div className="relative">
                <label className="block mb-2 font-medium text-gray-700">Mobile</label>
                <DevicePhoneMobileIcon className="h-5 w-5 text-gray-400 absolute left-3 top-11 pointer-events-none" />
                <input
                  type="text"
                  name="mobile"
                  required
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full p-3 pl-10 border rounded focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <label className="block mb-2 font-medium text-gray-700">Password</label>
                <KeyIcon className="h-5 w-5 text-gray-400 absolute left-3 top-11 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-3 pl-10 border rounded focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute top-10 right-3 text-gray-500 hover:text-gray-800"
                >
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <label className="block mb-2 font-medium text-gray-700">Confirm Password</label>
                <KeyIcon className="h-5 w-5 text-gray-400 absolute left-3 top-11 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full p-3 pl-10 border rounded focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute top-10 right-3 text-gray-500 hover:text-gray-800"
                >
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>

              {/* Submit Button */}
              <div className="md:col-span-2 flex justify-center mt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`font-semibold px-6 py-3 rounded transition duration-300 ${
                    loading ? "bg-green-300 cursor-not-allowed" : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {loading ? "Processing..." : "Create Engineer"}
                </button>
              </div>
            </form>
          </div>

          {/* Engineers List Section */}
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 font-jura">
            <h3 className="text-xl font-bold mb-4 text-green-600">Registered Engineers</h3>
            {loading && engineers.length === 0 ? (
              <p className="text-gray-500">Loading engineers...</p>
            ) : engineers.length === 0 ? (
              <p className="text-gray-500">No engineers registered yet.</p>
            ) : (
              <ul className="space-y-4">
                {engineers.map((eng) => (
                  <li
                    key={eng.id}
                    className="flex items-center justify-between border-b pb-2 text-gray-700"
                  >
                    <div>
                      <p className="font-semibold">{eng.name}</p>
                      <p className="text-sm">
                        {eng.email} | {eng.designation} | {eng.mobile}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteEngineer(eng.id)}
                      disabled={loading}
                      className="text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                      <TrashIcon className="h-5 w-5" />
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCreateEng;
