import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LandImage from "../../assets/map.jpg";

const Landing: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Navigate to /login after 3 seconds
    const timer = setTimeout(() => {
      navigate("/login");
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, [navigate]);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Background image */}
      <img
        src={LandImage}
        alt="Landing"
        className="w-full h-full object-cover"
      />

      {/* Overlay content */}
      <div className="absolute inset-0 flex flex-col bg-black bg-opacity-0 text-center px-8">
        <h1 className="text-white text-9xl sm:text-9xl md:text-6xl font-bold font-jura animate-glow-text justify-center items-center text-center pt-80">
          Welcome
        </h1>
        <h1 className="text-white text-9xl sm:text-6xl md:text-6xl font-bold font-jura animate-glow-text justify-center items-center text-center">
          to
        </h1>
        <h1 className="text-white text-9xl sm:text-6xl md:text-6xl font-bold font-jura animate-glow-text justify-center items-center text-center">
          Cyber Security Support Portal
        </h1>
        <h1 className="text-white text-4xl sm:text-7xl md:text-4xl font-bold font-jura animate-glow-text justify-center items-center text-center pt-10">
          Lanka Communication Services pvt Ltd
        </h1>
      </div>
    </div>
  );
};

export default Landing;
