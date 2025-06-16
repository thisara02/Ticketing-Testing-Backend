import { useState, useEffect } from "react";
import Sidebar from "../../components/AdminSide";
import Navbar from "../../components/AdminNav";
import {
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  KeyIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

interface Admin {
  id: number;
  name: string;
  email: string;
  mobile: string;
}

const AdminCreateAdmin = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [admins, setAdmins] = useState<Admin[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  // Fetch all admins on mount
  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/all");
      if (!response.ok) throw new Error("Failed to fetch admins");
      const data: Admin[] = await response.json();
      setAdmins(data);
    } catch (error) {
      console.error("Error fetching admins:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch admins from server.",
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, mobile, password, confirmPassword } = formData;

    if (!name || !email || !mobile || !password || !confirmPassword) {
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

    try {
      const response = await fetch("http://localhost:5000/api/admin/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          mobile,
          password,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: result.message || "Admin Created Successfully!",
          timer: 1000,
          showConfirmButton: false,
        });

        // Refresh admins list after successful creation
        fetchAdmins();

        setFormData({
          name: "",
          email: "",
          mobile: "",
          password: "",
          confirmPassword: "",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: result.error || "Something went wrong.",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Server error. Please try again later.",
      });
    }
  };

  const handleDeleteAdmin = async (id: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This admin will be permanently deleted! This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete!",
      cancelButtonText: "Cancel",
      didOpen: () => {
        const confirmButton = Swal.getConfirmButton();
        const cancelButton = Swal.getCancelButton();

        if (confirmButton) {
          confirmButton.style.backgroundColor = "#dc2626";
          confirmButton.style.color = "#ffffff";
          confirmButton.style.border = "none";
          confirmButton.style.padding = "8px 16px";
          confirmButton.style.borderRadius = "4px";
          confirmButton.style.cursor = "pointer";
        }

        if (cancelButton) {
          cancelButton.style.backgroundColor = "#6b7280";
          cancelButton.style.color = "#ffffff";
          cancelButton.style.border = "none";
          cancelButton.style.padding = "8px 16px";
          cancelButton.style.borderRadius = "4px";
          cancelButton.style.cursor = "pointer";
        }
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`http://localhost:5000/api/admin/delete/${id}`, {
            method: "DELETE",
          });

          if (!response.ok) throw new Error("Failed to delete admin");

          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Admin has been deleted.",
            timer: 1000,
            showConfirmButton: false,
          });

          // Refresh admins list after deletion
          fetchAdmins();
        } catch (error) {
          console.error("Delete error:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to delete admin. Please try again.",
          });
        }
      }
    });
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
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8 font-jura mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-center gap-2">
              <UserIcon className="h-8 w-8 text-green-500" />
              New Admin Profile Creation
            </h2>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 text-black"
            >
              {/* Form Fields */}
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

              <div className="md:col-span-2 flex justify-center mt-4">
                <button
                  type="submit"
                  className="bg-green-600 text-white font-semibold px-6 py-3 rounded hover:bg-green-700 transition duration-300"
                >
                  Create Admin Profile
                </button>
              </div>
            </form>
          </div>

          {/* Admin List Section */}
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 font-jura">
            <h3 className="text-xl font-bold mb-4 text-green-600">All Admins</h3>
            {admins.length === 0 ? (
              <p className="text-gray-500">No Admins registered yet.</p>
            ) : (
              <ul className="space-y-4">
                {admins.map((admin) => (
                  <li
                    key={admin.id}
                    className="flex items-center justify-between border-b pb-2 text-gray-700"
                  >
                    <div>
                      <p className="font-semibold">{admin.name}</p>
                      <p className="text-sm">
                        {admin.email} | {admin.mobile}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteAdmin(admin.id)}
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

export default AdminCreateAdmin;
