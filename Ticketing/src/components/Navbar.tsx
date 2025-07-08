import React, { useState, useRef, useEffect } from "react";
import Logo from "../assets/logo.png";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaBars, FaTicketAlt } from "react-icons/fa";
// import { FaCog} from "react-icons/fa"; 

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="w-full bg-[#F9FAFB] shadow-md flex items-center px-4 h-20 relative z-50">
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
          { to: "/home", label: "Dashboard" },
          { to: "/about", label: "About Us" },
          { to: "/services", label: "Our Services" },
          { to: "/contact", label: "Contact Us" },
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
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 bg-[#007779] hover:bg-teal-700 text-white font-semibold py-2 px-5 rounded-lg shadow-lg transition-transform transform hover:scale-105 font-jura"
          >
            <FaTicketAlt className="text-2xl" />
            Create 
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-50">
              <Link
                to="/create-sr"
                className="block px-4 py-2 text-green-600 hover:bg-gray-100"
              >
                New Service Request
              </Link>
              <Link
                to="/create-ft"
                className="block px-4 py-2 text-blue-500 hover:bg-gray-100"
              >
                Faulty Ticket
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
