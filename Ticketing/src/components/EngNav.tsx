import React, { useRef } from "react";
import Logo from "../assets/logo.png";
import { NavLink, useNavigate } from "react-router-dom";
import { FaBell, FaBars } from "react-icons/fa";

interface NavbarProps {
  toggleSidebar: () => void;
}

const EngNav: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
    </header>
  );
};

export default EngNav;
