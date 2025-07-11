import { useEffect, useRef, useState } from "react";
import Sidebar from "../../components/AdminSide";
import Navbar from "../../components/AdminNav";
import { FaCamera } from "react-icons/fa";
import Swal from "sweetalert2";
import Default from "../../assets/default.jpg";

const AdminProfile = () => {

  const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
    const [isSidebarOpen, setSidebarOpen] = useState(true);
  
    const [formData, setFormData] = useState({
      name: "",
      email: "",
      mobile: "",
    });
  
    const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  
    const [passwords, setPasswords] = useState({
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });
  
    const [errors, setErrors] = useState({
      newPassword: "",
      confirmNewPassword: "",
    });
  
    // Update the useEffect to handle the full URL properly
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      Swal.fire("Error", "Authentication token missing. Please login again.", "error");
      return;
    }
  
    const baseUrl = "http://localhost:5000";
  
    fetch(`${baseUrl}/api/admin/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          throw new Error(errorData?.error || "Failed to fetch profile");
        }
        return res.json();
      })
      .then((data) => {
        setFormData({
          name: data.name || "",
          email: data.email || "",
          mobile: data.mobile || "",
        });
  
        if (data.profile_image) {
          // Use the full URL returned from backend
          const imageUrl = data.profile_image.startsWith('http') 
            ? data.profile_image 
            : `${baseUrl}${data.profile_image}`;
          setProfileImagePreview(imageUrl + `?t=${Date.now()}`);
        } else {
          setProfileImagePreview(null);
        }
      })
      .catch((err) => {
        console.error(err);
        Swal.fire("Error", err.message || "Failed to load profile data", "error");
      });
  }, []);
  
    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };
  
    const handleImageClick = () => {
      fileInputRef.current?.click();
    };
  
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setProfileImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setProfileImagePreview(reader.result as string);
        reader.readAsDataURL(file);
      }
    };
  
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const updatedPasswords = { ...passwords, [name]: value };
      setPasswords(updatedPasswords);
  
      if (name === "newPassword") {
        let errorMsg = "";
        if (value.length < 8) errorMsg = "Password must be at least 8 characters long.";
        else if (!/[A-Z]/.test(value)) errorMsg = "Password must include at least one uppercase letter.";
        else if (!/[a-z]/.test(value)) errorMsg = "Password must include at least one lowercase letter.";
        else if (!/[0-9]/.test(value)) errorMsg = "Password must include at least one number.";
        else if (!/[!@#$%^&*]/.test(value)) errorMsg = "Password must include at least one special character.";
  
        setErrors((prev) => ({ ...prev, newPassword: errorMsg }));
      }
  
      if (name === "confirmNewPassword") {
        setErrors((prev) => ({
          ...prev,
          confirmNewPassword: value !== updatedPasswords.newPassword ? "Passwords do not match." : "",
        }));
      }
    };
  
    const saveProfile = async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      Swal.fire("Error", "Authentication token missing. Please login again.", "error");
      return;
    }
  
    try {
      const formPayload = new FormData();
      formPayload.append("name", formData.name);
      formPayload.append("mobilep", formData.mobile); // backend expects "mobilep"
      if (profileImageFile) formPayload.append("profile_image", profileImageFile);
  
      const res = await fetch("http://localhost:5000/api/admin/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formPayload,
      });
  
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save profile");
  
      // Update the profile image preview with the new URL
      if (data.profile && data.profile.profile_image) {
        const baseUrl = "http://localhost:5000";
        const imageUrl = data.profile.profile_image.startsWith('http') 
          ? data.profile.profile_image 
          : `${baseUrl}${data.profile.profile_image}`;
        setProfileImagePreview(imageUrl + `?t=${Date.now()}`);
      }
  
      // Clear the file input
      setProfileImageFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
  
      Swal.fire("Success", "Your profile changes have been saved successfully", "success");
    } catch (error: any) {
      Swal.fire("Error", error.message || "Failed to save profile", "error");
    }
  };
  
    const changePassword = async () => {
      if (errors.newPassword || errors.confirmNewPassword) {
        Swal.fire("Error", "Please fix password errors before submitting", "error");
        return;
      }
  
      const token = localStorage.getItem("adminToken");
      if (!token) {
        Swal.fire("Error", "Authentication token missing. Please login again.", "error");
        return;
      }
  
      try {
        const res = await fetch("http://localhost:5000/api/admin/change-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            oldPassword: passwords.oldPassword,
            newPassword: passwords.newPassword,
          }),
        });
  
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to change password");
  
        Swal.fire("Success", "Your password has been changed successfully", "success");
        setPasswords({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
      } catch (error: any) {
        Swal.fire("Error", error.message || "Failed to change password", "error");
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

        <div className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
            {/* Profile Picture */}
            <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6 font-jura">
              Admin Edit Profile 
            </h2>

            <div className="flex justify-center mb-6">
              <div className="relative w-32 h-32">
                {profileImagePreview ? (
                  <img
                    src={profileImagePreview}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover border-4 border-gray-300"
                  />
                ) : (
                  <img
                    src={Default}
                    alt="Default Profile"
                    className="w-full h-full rounded-full object-cover border-4 border-gray-300"
                  />
                )}
                <div
                  onClick={handleImageClick}
                  className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow cursor-pointer hover:bg-gray-100 transition"
                  title="Change Profile Picture"
                >
                  <FaCamera className="text-gray-600" />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />
              </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 font-jura">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 w-full border border-gray-300 rounded px-3 py-2 bg-white  text-black font-jura"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 font-jura">
                  Email 
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  className="mt-1 w-full border border-gray-300 rounded px-3 py-2 bg-gray-200 cursor-not-allowed text-black font-jura"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 font-jura">
                  Mobile Number
                </label>
                <input
                  type="text"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="mt-1 w-full border border-gray-300 rounded px-3 py-2 bg-white text-black font-jura"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition font-jura"
                onClick={saveProfile}
              >
                Save Edits
              </button>
            </div>

            {/* Divider */}
            <hr className="my-8" />

            {/* Password Section */}
            <h3 className="text-xl font-semibold text-gray-800 mb-4 font-jura">
              Change Password
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 font-jura">
                  Old Password
                </label>
                <input
                  type="password"
                  name="oldPassword"
                  value={passwords.oldPassword}
                  onChange={handlePasswordChange}
                  className="mt-1 w-full border border-gray-300 rounded px-3 py-2 bg-white text-black font-jura"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 font-jura">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  className="mt-1 w-full border border-gray-300 rounded px-3 py-2 bg-white text-black font-jura"
                />
                {errors.newPassword && (
                    <div className="text-red-500 text-sm mt-1 space-y-1 font-jura">
                        <p>Password not meet the required validations:</p>
                    </div>
                )}

              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 font-jura">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmNewPassword"
                  value={passwords.confirmNewPassword}
                  onChange={handlePasswordChange}
                  className="mt-1 w-full border border-gray-300 rounded px-3 py-2 bg-white text-black font-jura"
                />
                {errors.confirmNewPassword && (
                  <p className="text-red-500 text-sm mt-1 font-jura">
                    {errors.confirmNewPassword}
                  </p>
                )}
              </div>
            </div>

            <div className="text-red-500 text-sm mt-1 space-y-1 mb-4 font-jura">
                <p>Password must be:</p>
                <ul className="list-disc pl-5">
                <li>Be at least 8 characters long</li>
                <li>Contain at least one uppercase letter</li>
                <li>Contain at least one lowercase letter</li>
                <li>Include at least one number</li>
                <li>Have at least one special character (!@#$%^&*)</li>
                </ul>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition font-jura"
                onClick={changePassword}
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
