import { useRef, useState } from "react";
import Sidebar from "../../components/AdminSide";
import Navbar from "../../components/AdminNav";
import ProfileImage from "../../assets/test-profile.jpg"; // Replace with actual path
import { FaCamera } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const AdminProfile = () => {

  const navigate = useNavigate();

  const ProfileEdited = () => {
        Swal.fire({
          title: "Your Changes Saved Sucessfully",
          text: "Your profile changes has been saved sucessfully",
          icon: "info",
          showCancelButton: false,
          confirmButtonColor: "#f5365c",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Continue",
          cancelButtonText: "Cancel",
          customClass: {
          popup: "swal2-text-black",
          confirmButton: "swal2-confirm-button",
          cancelButton: "swal2-cancel-button"}
  
        }).then((result) => {
          if (result.isConfirmed) {
            // Perform logout logic (e.g., clear auth tokens, call API, etc.)
            // Then navigate to the login page
            navigate("/admin-profile");
          }
        });
      };

      const NewPass = () => {
        Swal.fire({
          title: "Your Password Changed Sucessfully",
          text: "Your profile password has been changed sucessfully.",
          icon: "info",
          showCancelButton: false,
          confirmButtonColor: "#f5365c",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Continue",
          cancelButtonText: "Cancel",
          customClass: {
          popup: "swal2-text-black",
          confirmButton: "swal2-confirm-button",
          cancelButton: "swal2-cancel-button"}
  
        }).then((result) => {
          if (result.isConfirmed) {
            // Perform logout logic (e.g., clear auth tokens, call API, etc.)
            // Then navigate to the login page
            navigate("/admin-profile");
          }
        });
      };

    const fileInputRef = useRef<HTMLInputElement | null>(null);

const handleImageClick = () => {
  if (fileInputRef.current) {
    fileInputRef.current.click(); // Trigger file input on icon click
  }
};

const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    // You can handle preview upload or send it to server here
    console.log("Selected image:", file);
  }
};
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const [formData, setFormData] = useState({
    name: "Thisara Madusanka",
    email: "thisaram@lankacom.net",
    mobile: "0740563227",
  });

  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [errors, setErrors] = useState({
    newPassword: "",
    confirmNewPassword: "",
  });

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedPasswords = { ...passwords, [name]: value };
    setPasswords(updatedPasswords);

    if (name === "newPassword") {
        const pwd = value;
        let errorMsg = "";

        if (pwd.length < 8) {
            errorMsg = "Password must be at least 8 characters long.";
        } else if (!/[A-Z]/.test(pwd)) {
            errorMsg = "Password must include at least one uppercase letter.";
        } else if (!/[a-z]/.test(pwd)) {
            errorMsg = "Password must include at least one lowercase letter.";
        } else if (!/[0-9]/.test(pwd)) {
            errorMsg = "Password must include at least one number.";
        } else if (!/[!@#$%^&*]/.test(pwd)) {
            errorMsg = "Password must include at least one special character.";
        }

        setErrors((prev) => ({
            ...prev,
            newPassword: errorMsg,
        }));
     }

    if (
      name === "confirmNewPassword" &&
      value !== updatedPasswords.newPassword
    ) {
      setErrors((prev) => ({
        ...prev,
        confirmNewPassword: "Passwords do not match.",
      }));
    } else {
      setErrors((prev) => ({ ...prev, confirmNewPassword: "" }));
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
                    <img
                    src={ProfileImage}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover border-4 border-gray-300 "
                    />

                    {/* Camera icon overlay */}
                    <div
                    onClick={handleImageClick}
                    className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow cursor-pointer hover:bg-gray-100 transition"
                    >
                    <FaCamera className="text-gray-600" />
                    </div>

                    {/* Hidden file input */}
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
              <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition font-jura" onClick={ProfileEdited}>
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
              <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg--700 transition font-jura" onClick={NewPass}>
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
