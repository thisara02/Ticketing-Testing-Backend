import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import Banner from "../../assets/about-banner.jpg"

const About = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      {/* Sidebar */}
      <div className="flex-shrink-0">
        <Sidebar isOpen={isSidebarOpen} />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col h-screen min-h-0">
        {/* Navbar */}
        <div className="flex-shrink-0">
          <Navbar toggleSidebar={toggleSidebar} />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-gray-100 px-20 py-10">

          <div className="w-3/4 bg-white p-6 mx-auto rounded shadow text-gray-800 text-lg leading-relaxed font-jura px-10">
            

            <div className="w-full lg:w-full flex justify-center items-center">
              <img
                src={Banner} 
                alt="About Us"
                className="w-full object-contain"
              />
            </div>

            <h1 className="text-3xl font-bold text-center text-Black mb-2 font-jura pt-7 pb-2">
            LankaCom - Department of Cyber Security Operations
            </h1>

            <h2 className="text-xl font-bold text-left text-red-600 mb-6 font-jura pt-10">
            Deapartment of Cyber Security Operations
            </h2>
            <p className="px-3 py-3">
              At Lankacom’s Cybersecurity Department, we’re not just defending networks—we’re empowering organizations to thrive in a digital-first world with confidence and resilience. In today’s rapidly evolving threat landscape, cyber risks are no longer optional—they’re inevitable. That’s why we exist: to provide intelligent, adaptive, and personalized security services that protect what matters most to you.
            </p>

            <h2 className="text-xl font-bold text-left text-red-600 mb-4 font-jura pt-10">
            Our Mission
            </h2>
            
            <p className="px-3 py-2">
              To deliver cutting-edge, scalable cybersecurity solutions that are tailored to your organization’s unique needs—whether you’re a growing startup or a complex enterprise. We believe security should be proactive, not reactive, and that true protection comes from vigilance, collaboration, and continuous innovation.
            </p>

            <h2 className="text-xl font-bold text-left text-red-600 mb-4 font-jura pt-10">
            Why Lankacom Cybersecurity?
            </h2>

            <p className="px-3 py-2">
              <ul>
                <li>✅ <strong>Customer-Focused:</strong> With over 30 years of service excellence, we understand the value of trust and responsiveness.</li>
                <li>✅ <strong>Modern & Agile:</strong> We leverage top-tier tools and agile methodologies to deliver fast, effective protection.</li>
                <li>✅ <strong>Dedicated Experts:</strong> Our team is made up of passionate cybersecurity professionals committed to staying ahead of the curve.</li>
                <li>✅ <strong>Collaborative Approach:</strong> Security works best when we work together—your team and ours, unified.</li>
              </ul>
            </p>

            <h2 className="text-xl font-bold text-left text-red-600 mb-4 font-jura pt-10">
            Our Promise
            </h2>

            <p className="px-3 py-2">
              We know no system is unbreakable—but we also know that a prepared, alert, and responsive team makes all the difference. Our commitment is simple:
               <ul>
                <li>⭕<strong>Relentless Monitoring:</strong> Around-the-clock vigilance to detect and stop threats before they cause harm.</li>
                <li>⭕<strong>Rapid Response:</strong> Immediate action to contain, investigate, and resolve security incidents.</li>
                <li>⭕<strong>Continuous Improvement:</strong> We constantly refine our defenses to stay ahead of evolving cyber threats.</li>
                <li>⭕<strong>Meticulous Care:</strong> Every detail matters—we treat your security like it’s our own.</li>
              </ul>
            </p>

            <h2 className="text-xl font-bold text-left text-red-600 mb-4 font-jura pt-10">
            Let’s Build a Safer Tomorrow
            </h2>

            <p className="px-3 py-2">
              Your digital ecosystem deserves more than basic protection—it deserves a strategic partner. At Lankacom’s Cybersecurity Department, we’re here to deliver the defense you need with the personal touch you trust.
            </p>  
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
