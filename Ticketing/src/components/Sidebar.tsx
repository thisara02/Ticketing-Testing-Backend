import React, { useEffect, useState } from "react";
import { FaTachometerAlt, FaHistory } from "react-icons/fa";
import { FaPlus, FaTicket } from "react-icons/fa6";
import { useNavigate, NavLink } from "react-router-dom";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";
import Default from "../assets/default.jpg";

interface SidebarProps {
  isOpen: boolean;
}

interface DecodedToken {
  name: string;
  company: string;
  email: string;
  exp: number;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const navigate = useNavigate();
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  let customerName = "Guest";
  let customerCompany = "GuestCompany";
  let customerEmail = "guest@example.com";

  const token = localStorage.getItem("cusToken");

  if (token) {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      customerName = decoded.name;
      customerCompany = decoded.company;
      customerEmail = decoded.email;
    } catch (error) {
      console.error("Failed to decode JWT token:", error);
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
          const imageUrl = data.profile_image.startsWith("http")
            ? data.profile_image
            : `${baseUrl}${data.profile_image}`;

          const img = new Image();
          img.onload = () => {
            setProfileImagePreview(`${imageUrl}?t=${Date.now()}`);
            setImageLoaded(true);
          };
          img.onerror = () => {
            setProfileImagePreview(null);
            setImageLoaded(false);
          };
          img.src = imageUrl;
        } else {
          setProfileImagePreview(null);
          setImageLoaded(false);
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
      className={`bg-[#F9FAFB] h-screen border-r-4 border-black shadow-md transition-all duration-300 ${
        isOpen ? "w-60" : "w-0 md:w-70"
      } overflow-hidden`}
    >
      <div className="h-full flex flex-col p-2 pt-10">
        {/* User Profile */}
        <div className="flex items-center space-x-4 mb-6 pb-4 pt-4 justify-center border-b border-black">
          <div>
            {profileImagePreview && imageLoaded ? (
              <img
                src={profileImagePreview}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border border-gray-300 mx-auto cursor-pointer mb-2"
                onClick={() => navigate("/profile")}
              />
            ) : (
              <img
                src={Default}
                alt="Default Profile"
                className="w-16 h-16 rounded-full object-cover border border-gray-300 mx-auto cursor-pointer mb-2"
                onClick={() => navigate("/profile")}
              />
            )}
            <p className="font-semibold text-[#000000] font-jura text-center text-xl">
              {customerName}
            </p>
            <p className="text-[#372588] text-sm font-jura text-center">
              <b>{customerCompany}</b>
            </p>
            <p className="text-[#000000] text-sm font-jura text-center">
              {customerEmail}
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-3 pt-5 pl-5">
          <NavLink
            to="/home"
            className={({ isActive }) =>
              `group flex items-center space-x-3 px-4 py-2 rounded-md font-jura transition-all duration-300
              ${isActive ? "bg-gray-200 text-black" : "text-[#092635] hover:bg-teal-100 hover:text-black"}`
            }
          >
            <FaTachometerAlt className="transition text-xl" />
            <span className="transition">Dashboard</span>
          </NavLink>

          <NavLink
            to="/pending"
            className={({ isActive }) =>
              `group flex items-center space-x-3 px-4 py-2 rounded-md font-jura transition-all duration-300
              ${isActive ? "bg-gray-200 text-black" : "text-[#092635] hover:bg-teal-100 hover:text-black"}`
            }
          >
            <FaTicket className="transition text-2xl" />
            <span className="transition">Ongoing Requests Update</span>
          </NavLink>

          <NavLink
            to="/history"
            className={({ isActive }) =>
              `group flex items-center space-x-3 px-4 py-2 rounded-md font-jura transition-all duration-300
              ${isActive ? "bg-gray-200 text-black" : "text-[#092635] hover:bg-teal-100 hover:text-black"}`
            }
          >
            <FaHistory className="transition text-xl" />
            <span className="transition">Request History</span>
          </NavLink>

          <NavLink
            to="/add-bundle"
            className={({ isActive }) =>
              `group flex items-center space-x-3 px-4 py-2 rounded-md font-jura transition-all duration-300
              ${isActive ? "bg-gray-200 text-black" : "text-[#092635] hover:bg-teal-100 hover:text-black"}`
            }
          >
            <FaPlus className="transition text-3xl" />
            <span className="transition">Additional Service Requests</span>
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
