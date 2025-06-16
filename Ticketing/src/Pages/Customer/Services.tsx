import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import {useNavigate } from "react-router-dom";

// Benefits Section Component
const ServiceBenefits = () => {
  const benefits = [
    {
      icon: "🔒",
      title: "100% Remote Support",
      description:
        "Work from anywhere, stay secure everywhere. Our expert engineers proactively monitor and protect your systems 24/7, so you can focus on growing your business—without compromise.",
    },
    {
      icon: "👨‍💼",
      title: "Certified Expertise",
      description:
        "Our team of security professionals holds the highest certifications in the industry, including Fortinet ,Cisco , Sophos Certified Engineer, Palo Alto Networks, SonicWall and more. We combine these world-class credentials with real-world experience to deliver security you can trust",
    },
    {
      icon: "🛡️",
      title: "Complete Solutions",
      description:
        "We go beyond simple fixes—our approach covers your entire network security lifecycle. From secure remote access with VPNs to next-gen SD-WAN solutions, we ensure your network is not only protected, but also optimized for performance and growth",
    },
    {
      icon: "🎧",
      title: 'As easy as "Hello"',
      description:
        'Getting started is as simple as reaching out. With just a Hello, you unlock a team of experts ready to guide you, protect your assets, and deliver the peace of mind you deserve—all tailored to your needs',
    },
  ];

  return (
    <div className="w-3/4 mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-bold text-center mb-10 text-black font-jura">
        Benefits Of Managed Security Service
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 font-jura">
        {benefits.map((benefit, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md p-6 text-center transition hover:shadow-xl"
          >
            <div className="text-red-600 text-5xl mb-4">{benefit.icon}</div>
            <h3 className="text-xl font-semibold mb-2 text-black">{benefit.title}</h3>
            <p className="text-gray-600 text-sm">{benefit.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const Services = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/contact");
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
        <div className="flex-1 overflow-y-auto bg-gray-100 px-10">
          <ServiceBenefits />

          <div className="w-3/4 bg-white p-6 mx-auto rounded shadow text-gray-800 text-lg leading-relaxed font-jura px-10">
          
            <h1 className="text-3xl font-bold text-center text-Black mb-2 font-jura pt-7 pb-2">
            Our department offers a wide range of services designed to detect, defend, and respond to cyber threats with precision and speed. We specialize in:
            </h1>

            <h2 className="text-xl font-bold text-left text-red-600 mb-6 font-jura pt-10">
            🔥 Firewall & Network Security Support
            </h2>

            <p className="px-3 py-3">
             We go beyond installation—we optimize, integrate, and manage your firewall environment for maximum security and performance. Our support includes:
            </p>
            <p className="px-3 py-2">
              <ul className="space-y-4 list-none text-gray-800 text-lg leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 text-xl">🚀</span>
                  <span>
                    <strong>Access Control Lists (ACLs)</strong> 
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 text-xl">🚀</span>
                  <span>
                    <strong>Active Directory Integration with Single Sign-On</strong> 
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 text-xl">🚀</span>
                  <span>
                    <strong>SSL Deep Packet Inspection (DPMSSL) & Certificate Deployment</strong> 
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 text-xl">🚀</span>
                  <span>
                    <strong>Content Filtering</strong> 
                  </span>
                </li>
                                <li className="flex items-start gap-2">
                  <span className="text-red-500 text-xl">🚀</span>
                  <span>
                    <strong>Gateway & Remote VPN</strong> 
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 text-xl">🚀</span>
                  <span>
                    <strong>SD-WAN & Network Mapping</strong> 
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 text-xl">🚀</span>
                  <span>
                    <strong>Next Generation Firewall Support</strong> 
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 text-xl">🚀</span>
                  <span>
                    <strong>High Availability Setup</strong> 
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 text-xl">🚀</span>
                  <span>
                    <strong>Wireless & VOIP Security</strong> 
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 text-xl">🚀</span>
                  <span>
                    <strong>DPI/SSL & CA Certificate Deployment</strong> 
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 text-xl">🚀</span>
                  <span>
                    <strong>Gateway to Gateway VPN Tunnel</strong> 
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 text-xl">🚀</span>
                  <span>
                    <strong>Network Mapping</strong> 
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 text-xl">🚀</span>
                  <span>
                    <strong>Remote Access VPN</strong> 
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 text-xl">🚀</span>
                  <span>
                    <strong>Security Information & Event Management (SIEM)</strong> 
                  </span>
                </li>
                                <li className="flex items-start gap-2">
                  <span className="text-red-500 text-xl">🚀</span>
                  <span>
                    <strong>Two-Factor Authentication (2FA)</strong> 
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 text-xl">🚀</span>
                  <span>
                    <strong>VOIP</strong> 
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 text-xl">🚀</span>
                  <span>
                    <strong>EDR and XDR Monitoring</strong> 
                  </span>
                </li>
              </ul>
            </p>


            <h2 className="text-xl font-bold text-left text-red-600 mb-6 font-jura pt-10">
            🛡️ Security Operations Center (SOC) as a Service
            </h2>
            <p className="px-3 py-3">
              Our multi-tiered SOC provides 24/7 network visibility, threat hunting, and rapid incident response using advanced tools like Fortinet SIEM. Choose from four tiers of service based on your needs:
            </p>
            <p className="px-3 py-2">
              <ul className="space-y-4 list-none text-gray-800 text-lg leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 text-xl">🔱</span>
                  <span>
                    <strong>Sentinel Tier</strong> – Foundational monitoring & alerts
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 text-xl">🔱</span>
                  <span>
                    <strong>Guardian Tier</strong> – Adds threat hunting & basic mitigation
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 text-xl">🔱</span>
                  <span>
                    <strong>Fortifier Tier</strong> – Enhanced visibility with EDR, IDS, and honeypots
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 text-xl">🔱</span>
                  <span>
                    <strong>Vanguard Tier</strong> – Full-scale automation and rapid containment
                  </span>
                </li>
              </ul>
            </p>
            <p className="px-3 py-2">
              We don’t just alert you—we act, adapt, and evolve.
            </p>  

            <h2 className="text-xl font-bold text-left text-red-600 mb-4 font-jura pt-10">
            🔍 Vulnerability Assessments (VA)
            </h2>

            <p className="px-3 py-2">
              Understanding your weaknesses is the first step toward building resilience. Our VA services help you:
              <ul className="space-y-4 list-none text-gray-800 text-lg leading-relaxed mt-4">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 text-xl">⚠️</span>
                  <span>
                    <strong>Identify vulnerabilities across your IT infrastructure</strong> 
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 text-xl">⚠️</span>
                  <span>
                    <strong>Reduce the attack surface through targeted remediation</strong> 
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 text-xl">⚠️</span>
                  <span>
                    <strong>Strengthen overall security posture with detailed recommendations</strong> 
                  </span>
                </li>
              </ul>
            </p>
            <div className="mt-16 bg-gradient-to-r from-red-600 to-red-400 py-8 px-4 rounded-xl text-white text-center shadow-lg">
              <h3 className="text-2xl font-bold mb-2">Let’s Secure Your Future</h3>
              <p className="mb-4">Your network’s safety and performance deserve world-class protection. Let’s build it together.</p>
              <button
                className="bg-white text-red-600 font-semibold px-6 py-3 rounded-full shadow hover:bg-gray-100 transition"
                onClick={handleClick}
              >
                Book a Security Consultation
              </button>
              <p className="mt-2 text-sm opacity-80">Already trusted by 50+ businesses like yours.</p>
            </div>

          </div>
        </div>

        
      </div>
    </div>
  );
};

export default Services;
