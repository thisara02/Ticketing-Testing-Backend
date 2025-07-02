import React from "react";
import { useNavigate } from "react-router-dom";
import IntroVideo from "../../videos/LandVID.mp4"; // Replace with your actual video path

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const handleVideoEnd = () => {
    navigate("/login");
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Background video */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        src={IntroVideo}
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnd}
      />

      {/* Overlay content
      <div className="absolute inset-0 flex flex-col bg-black bg-opacity-30 text-center px-8">
        <h1 className="text-white text-9xl sm:text-9xl md:text-6xl font-bold font-jura animate-glow-text pt-80">
          Welcome
        </h1>
        <h1 className="text-white text-9xl sm:text-6xl md:text-6xl font-bold font-jura animate-glow-text">
          to
        </h1>
        <h1 className="text-white text-9xl sm:text-6xl md:text-6xl font-bold font-jura animate-glow-text">
          Cyber Security Support Portal
        </h1>
        <h1 className="text-white text-4xl sm:text-7xl md:text-4xl font-bold font-jura animate-glow-text pt-10">
          Lanka Communication Services Pvt Ltd
        </h1>
      </div> */}
    </div>
  );
};

export default Landing;
