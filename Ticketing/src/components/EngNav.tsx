import React, { useState } from "react";
import Logo from "../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaTicketAlt } from "react-icons/fa";

interface NavbarProps {
  toggleSidebar: () => void;
}

const EngNav: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="w-full bg-[#ffffff] shadow-md flex items-center px-4 h-20 relative z-50 justify-between">
      {/* Left: Hamburger + Logo */}
      <div className="flex items-center space-x-3 md:space-x-4">
        <button
          className="text-black text-xl md:hidden focus:outline-none"
          onClick={toggleSidebar}
        >
          <FaBars />
        </button>
        <img
          src={Logo}
          alt="Logo"
          className="h-10 cursor-pointer"
          onClick={() => navigate("/eng-dash")}
        />
      </div>

      {/* Right: Notifications */}
      {/* <div className="flex items-center pr-6 relative" ref={dropdownRef}>
        <NavLink
          to="/eng-notifi"
          className={({ isActive }) =>
            `relative text-black hover:text-green-600 group text-xl p-2 transition
            ${isActive ? "after:w-full" : ""}`
          }
        >
          <FaBell />
          <span className="absolute left-0 -bottom-1 h-0.5 bg-green-500 transition-all duration-300 w-0 group-hover:w-full"></span>
        </NavLink>
      </div> */}
      {/* Dropdown Create SR Button */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 bg-[#007779] hover:bg-teal-700 text-white font-semibold py-2 px-5 rounded-lg shadow-lg transition-transform transform hover:scale-105 font-jura"
          >
            <FaTicketAlt className="text-2xl" />
            Create 
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-50">
              <Link
                to="/eng-create-sr"
                className="block px-4 py-2 text-green-600 hover:bg-gray-100"
              >
                New Service Request
              </Link>
              <Link
                to="/eng-create-ft"
                className="block px-4 py-2 text-blue-500 hover:bg-gray-100"
              >
                Faulty Ticket
              </Link>
            </div>
          )}
        </div>
    </header>
  );
};

export default EngNav;
