import React, { useEffect, useState } from "react";
import { FaBuilding, FaHistory, FaTachometerAlt, FaTicketAlt, FaUser, FaUserPlus} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";
import { FaPerson } from "react-icons/fa6";
import Default from "../assets/default.jpg";

// Sample user data — you can replace these with real props or context
interface DecodedToken {
  name: string;
  email: string;
  exp: number;
}


interface SidebarProps {
  isOpen: boolean;
}

const AdminSide: React.FC<SidebarProps> = ({ isOpen }) => {
    const navigate = useNavigate();
    const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
    let adminName = "Guest";
  let adminEmail = "guest@example.com";

  const token = localStorage.getItem("adminToken");
  
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        adminName = decoded.name;
        adminEmail = decoded.email;
      } catch (error) {
        console.error("Failed to decode JWT token:", error);
        // Optional: clear invalid token
        localStorage.removeItem("adminToken");
      }
    }

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

    const handleLogout = () => {
      Swal.fire({
        title: "Are you sure?",
        text: "Do you want to logout?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#000000",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, logout",
        cancelButtonText: "Cancel",
        customClass: {
        popup: "swal2-text-black",
        confirmButton: "swal2-confirm-button2",
        cancelButton: "swal2-cancel-button"}

      }).then((result) => {
        if (result.isConfirmed) {
          // Perform logout logic (e.g., clear auth tokens, call API, etc.)
          // Then navigate to the login page
          localStorage.removeItem("adminToken");
          navigate("/admin-login");
        }
      });
    };
  return (
    <aside
      className={`bg-[#c6d1e7] h-screen border-r shadow-md transition-all duration-300 ${
        isOpen ? "w-60" : "w-0 md:w-70"
      } overflow-hidden`}
    >
      <div className="h-full flex flex-col p-2">
        {/* User Profile */}
        <div className="flex items-center space-x-4 mb-6 pb-4 border-b pt-10 justify-center">
          <div>
        {profileImagePreview ? (
                  <img
                    src={profileImagePreview}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover border border-gray-300 mx-auto cursor-pointer mb-2"
                    onClick={() => navigate("/admin-profile")}
                  />
                ) : (
                  <img
                  src={Default}
                  alt="Default Profile"
                  className="w-16 h-16 rounded-full object-cover border border-gray-300 mx-auto cursor-pointer mb-2"
                  onClick={() => navigate("/admin-profile")}
                />
                )}
        
            <p className="font-semibold text-gray-800 text-base font-jura text-center">{adminName}</p>
            {/* <p className="text-gray-500 text-sm">{user.email}</p> */}
            <p className="text-gray-500 text-sm font-jura">{adminEmail}</p>
            
        </div>
        </div>

        
        {/* Navigation Links */}
        <nav className="space-y-7 pt-5 pl-5">
          <NavLink
            to="/admin-dash"
            className={({ isActive }) =>
              `relative flex items-center space-x-3 text-gray-800 transition font-jura
              hover:text-blue-600 after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:bg-blue-500 after:transition-all after:duration-300
              ${isActive ? 'after:w-full text-blue-600' : 'after:w-0 group-hover:after:w-full'}`
            }
          >
            <FaTachometerAlt />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/create-company"
            className={({ isActive }) =>
              `relative flex items-center space-x-3 text-gray-800 transition font-jura
              hover:text-blue-600 after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:bg-blue-500 after:transition-all after:duration-300
              ${isActive ? 'after:w-full text-blue-600' : 'after:w-0 group-hover:after:w-full'}`
            }
          >
            <FaBuilding />
            <span>Register Company</span>
          </NavLink>

          <NavLink
            to="/admin-add-bundle"
            className={({ isActive }) =>
              `relative flex items-center space-x-3 text-gray-800 transition font-jura
              hover:text-blue-600 after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:bg-blue-500 after:transition-all after:duration-300
              ${isActive ? 'after:w-full text-blue-600' : 'after:w-0 group-hover:after:w-full'}`
            }
          >
            <FaTicketAlt />
            <span>Additional Bundles Adding</span>
          </NavLink>

          <NavLink
            to="/create-cus"
            className={({ isActive }) =>
              `relative flex items-center space-x-3 text-gray-800 transition font-jura
              hover:text-blue-600 after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:bg-blue-500 after:transition-all after:duration-300
              ${isActive ? 'after:w-full text-blue-600' : 'after:w-0 group-hover:after:w-full'}`
            }
          >
            <FaUserPlus />
            <span>Create Customer</span>
          </NavLink>

          <NavLink
            to="/create-eng"
            className={({ isActive }) =>
              `relative flex items-center space-x-3 text-gray-800 transition font-jura
              hover:text-blue-600 after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:bg-blue-500 after:transition-all after:duration-300
              ${isActive ? 'after:w-full text-blue-600' : 'after:w-0 group-hover:after:w-full'}`
            }
          >
            <FaUser />
            <span>Create Engineer</span>
          </NavLink>
          <NavLink
            to="/admin-history"
            className={({ isActive }) =>
              `relative flex items-center space-x-3 text-gray-800 transition font-jura
              hover:text-blue-600 after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:bg-blue-500 after:transition-all after:duration-300
              ${isActive ? 'after:w-full text-blue-600' : 'after:w-0 group-hover:after:w-full'}`
            }
          >
            <FaHistory />
            <span>Ticket History</span>
          </NavLink>

          <NavLink
            to="/create-admin"
            className={({ isActive }) =>
              `relative flex items-center space-x-3 text-gray-800 transition font-jura
              hover:text-blue-600 after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:bg-blue-500 after:transition-all after:duration-300
              ${isActive ? 'after:w-full text-blue-600' : 'after:w-0 group-hover:after:w-full'}`
            }
          >
            <FaPerson />
            <span>Admin Management</span>
          </NavLink>

          <NavLink
            to="/create-AM"
            className={({ isActive }) =>
              `relative flex items-center space-x-3 text-gray-800 transition font-jura
              hover:text-blue-600 after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:bg-blue-500 after:transition-all after:duration-300
              ${isActive ? 'after:w-full text-blue-600' : 'after:w-0 group-hover:after:w-full'}`
            }
          >
            <FaUser />
            <span>Account Managers</span>
          </NavLink>
        </nav>

        <div className="mt-auto pt-6">
          <button 
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200 font-jura"
          onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSide;
