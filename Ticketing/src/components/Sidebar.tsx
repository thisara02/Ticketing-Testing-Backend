import React, { useEffect, useState } from "react";
import { FaTachometerAlt, FaHistory } from "react-icons/fa";
import { FaTicket } from "react-icons/fa6";
import { useNavigate, NavLink } from "react-router-dom";
import Swal from "sweetalert2";
import {jwtDecode} from "jwt-decode";

interface SidebarProps {
  isOpen: boolean;
}

// Define the shape of your decoded JWT payload
interface DecodedToken {
  name: string;
  email: string;
  exp: number;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const navigate = useNavigate();
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);

  let customerName = "Guest";
  let customerEmail = "guest@example.com";

  const token = localStorage.getItem("cusToken");

  if (token) {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      customerName = decoded.name;
      customerEmail = decoded.email;
    } catch (error) {
      console.error("Failed to decode JWT token:", error);
      // Optional: clear invalid token
      localStorage.removeItem("cusToken");
    }
  }

  useEffect(() => {
        const token = localStorage.getItem("cusToken");
        if (!token) {
          Swal.fire("Error", "Authentication token missing. Please login again.", "error");
          return;
        }
  
        const baseUrl = "http://localhost:5000";
  
        fetch(`${baseUrl}/api/customers/profile`, {
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
        cancelButton: "swal2-cancel-button",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("cusToken");
        navigate("/login");
      }
    });
  };

  return (
    <aside
      className={`bg-[#F3F4F6] h-screen border-r-4 border-black shadow-md transition-all duration-300 ${
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
                    onClick={() => navigate("/profile")}
                  />
                ) : (
                  <div onClick={() => navigate("/profile")} className="w-16 h-16 rounded-full border-4 border-gray-300 bg-gray-200 flex items-center justify-center text-gray-500 object-cover mx-auto cursor-pointer text-center">
                    USER
                  </div>
                )}
            <p className="font-semibold text-[#000000] text-base font-jura text-center">
              {customerName}
            </p>
            <p className="text-[#000000] text-sm font-jura text-center">
              {customerEmail}
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-7 pt-5 pl-5">
          <NavLink
            to="/home"
            className={({ isActive }) =>
              `relative flex items-center space-x-3 text-[#000000] transition font-jura
              hover:text-red-600 after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:bg-red-500 after:transition-all after:duration-300
              ${isActive ? "after:w-full text-red-600" : "after:w-0 group-hover:after:w-full"}`
            }
          >
            <FaTachometerAlt />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/pending"
            className={({ isActive }) =>
              `relative flex items-center space-x-3 text-[#000000] transition font-jura
              hover:text-red-600 after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:bg-red-500 after:transition-all after:duration-300
              ${isActive ? "after:w-full text-red-600" : "after:w-0 group-hover:after:w-full"}`
            }
          >
            <FaTicket />
            <span>Ongoing Requests Update</span>
          </NavLink>

          <NavLink
            to="/history"
            className={({ isActive }) =>
              `relative flex items-center space-x-3 text-[#000000] transition font-jura
              hover:text-red-600 after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:bg-red-500 after:transition-all after:duration-300
              ${isActive ? "after:w-full text-red-600" : "after:w-0 group-hover:after:w-full"}`
            }
          >
            <FaHistory />
            <span>Request History</span>
          </NavLink>
        </nav>

        <div className="mt-auto pt-6">
          <button
            className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition duration-200 font-jura"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
