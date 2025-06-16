import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import LandingVideo from "../../videos/land2.mov";

const Landing: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const video = videoRef.current;

    const handleEnded = () => {
      navigate("/login");
    };

    if (video) {
      video.addEventListener("ended", handleEnded);

      // Play only for 2 seconds
      const timer = setTimeout(() => {
        video.pause();
        video.currentTime = 0; // reset to start if needed
        navigate("/login");
      }, 3000);
      
      return () => {
        clearTimeout(timer);
        video.removeEventListener("ended", handleEnded);
      };
    }
  }, [navigate]);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Background video */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        muted
        playsInline
      >
        <source src={LandingVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay content */}
      <div className="absolute inset-0 flex flex-col bg-black bg-opacity-0 text-center px-8">
        <h1 className="text-white text-9xl sm:text-9xl md:text-6xl font-bold font-jura animate-glow-text justify-center items-center text-center pt-80">
          Welcome
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
