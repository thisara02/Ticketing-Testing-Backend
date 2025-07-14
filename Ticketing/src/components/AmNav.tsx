import React, { useRef } from "react";
import Logo from "../assets/logo.png";
import { NavLink, useNavigate } from "react-router-dom";
import { FaBars, FaDoorOpen } from "react-icons/fa";
import Swal from "sweetalert2";
// import { FaCog} from "react-icons/fa"; 

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

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
          navigate("/am-login");
        }
      });
    };


  return (
    <header className="w-full bg-purple-50 shadow-md flex items-center px-4 h-20 relative z-50">
      {/* Left: Hamburger + Logo */}
      <div className="flex items-center space-x-3 md:space-x-4">
        <button
          className="text-black text-xl md:hidden focus:outline-none"
          onClick={toggleSidebar}
        >
          <FaBars />
        </button>
        <img src={Logo} alt="Logo" className="h-10" onClick={() => navigate("/home")}/>
      </div>

      {/* Center: Navigation Links */}
      <nav className="flex-1 flex justify-center space-x-8 items-center ml-4">
        {[
          { to: "/am-dash", label: "Dashboard" },
          { to: "/am-tickets", label: "Tickets" },
        ].map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `relative font-medium text-[#0F3460] transition duration-300 pb-1 
              ${isActive ? "after:w-full after:scale-100" : "after:w-0 after:scale-0"}
              after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:bg-red-500 after:transition-transform after:duration-300 after:origin-left
              hover:after:w-full hover:after:scale-100 font-jura`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Right: Icons + Dropdown Button */}
      <div className="flex items-center space-x-5 pr-6 relative" ref={dropdownRef}>
        {/* Settings Link */}
        {/* <NavLink
          to="/settings"
          className={({ isActive }) =>
            `relative text-black hover:text-red-600 group text-xl p-2 transition
            ${isActive ? "after:w-full" : ""}`
          }
        >
          <FaCog />
          <span className="absolute left-0 -bottom-1 h-0.5 bg-red-500 transition-all duration-300 w-0 group-hover:w-full"></span>
        </NavLink> */}

        {/* Notifications Link */}
        {/* <NavLink
          to="/notifications"
          className={({ isActive }) =>
            `relative text-[#000000] hover:text-red-600 group text-xl p-2 transition
            ${isActive ? "after:w-full" : ""}`
          }
        >
          <FaBell />
          <span className="absolute left-0 -bottom-1 h-0.5 bg-red-500 transition-all duration-300 w-0 group-hover:w-full"></span>
        </NavLink> */}

        {/* Dropdown Create SR Button */}
        <div className="relative">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 bg-[#b63232] hover:bg-red-700 text-white font-semibold py-2 px-5 rounded-lg shadow-lg transition-transform transform hover:scale-105 font-jura"
          >
            <FaDoorOpen className="text-2xl" />
            Logout 
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
