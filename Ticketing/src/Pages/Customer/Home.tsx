import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import BannerImage from "../../assets/about-banner-lcs.jpg";
import { Link } from "react-router-dom";
import { FaTicketAlt } from "react-icons/fa";

const Home = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [pendingTab, setPendingTab] = useState<"service" | "faulty">("service");
  const [ongoingTab, setOngoingTab] = useState<"service" | "faulty">("service");

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const pendingTickets = {
    service: [
      {
        id: 10001,
        subject: "System Crash - Awaiting response",
        createdBy: "Shammi Herath",
        type: "Service Request",
        description: "Crash on systems while opening the forti-client",
        link: "/view-sr",
        borderColor: "border-green-500",
        textColor: "text-green-800"
      },
      {
        id: 10002,
        subject: "Email Issue - Awaiting response",
        createdBy: "Tharusha Kanishka",
        type: "Service Request",
        description: "Unable to send or receive emails",
        link: "/view-sr",
        borderColor: "border-green-500",
        textColor: "text-green-800"
      },
      {
        id: 10003,
        subject: "Printer Setup - Awaiting response",
        createdBy: "Shammi Herath",
        type: "Service Request",
        description: "New printer setup required in HR department",
        link: "/view-sr",
        borderColor: "border-green-500",
        textColor: "text-green-800"
      }
    ],
    faulty: [
      {
        id: 20001,
        subject: "Network Failure - Needs investigation",
        createdBy: "Shammi Herath",
        type: "Faulty Ticket",
        description: "Network down in second floor; faulty switch suspected",
        link: "/view-ft",
        borderColor: "border-blue-500",
        textColor: "text-blue-800"
      },
      {
        id: 20002,
        subject: "Printer Not Working - Needs fixing",
        createdBy: "Shammi Herath",
        type: "Faulty Ticket",
        description: "Printer jams frequently in finance department",
        link: "/view-ft",
        borderColor: "border-blue-500",
        textColor: "text-blue-800"
      },
      {
        id: 20003,
        subject: "Monitor Flickering - Needs checking",
        createdBy: "Shammi Herath",
        type: "Faulty Ticket",
        description: "Monitor display flickering at random times",
        link: "/view-ft",
        borderColor: "border-blue-500",
        textColor: "text-blue-800"
      }
    ]
  };

  const ongoingTickets = {
    service: [
      {
        id: 30001,
        subject: "Firewall Configuration - In progress",
        createdBy: "Shammi Herath",
        type: "Service Request",
        description: "Add New Firewall Policy for HR group",
        assignedEngineer: "Pasan Malith",
        link: "/create-sr",
        borderColor: "border-green-500",
        textColor: "text-green-800"
      },
      {
        id: 30002,
        subject: "VPN Setup - In progress",
        createdBy: "Shammi Herath",
        type: "Service Request",
        description: "Setup VPN access for remote staff",
        assignedEngineer: "Pasan Malith",
        link: "/create-sr",
        borderColor: "border-green-500",
        textColor: "text-green-800"
      },
      {
        id: 30003,
        subject: "Database Backup - In progress",
        createdBy: "Shammi Herath",
        type: "Service Request",
        description: "Implement automated database backups",
        assignedEngineer: "Pasan Malith",
        link: "/create-sr",
        borderColor: "border-green-500",
        textColor: "text-green-800"
      }
    ],
    faulty: [
      {
        id: 40001,
        subject: "Router reboot issue - In progress",
        createdBy: "Shammi Herath",
        type: "Faulty Ticket",
        description: "Router not responding after restart from dashboard",
        assignedEngineer: "Pasan Malith",
        link: "/create-ft",
        borderColor: "border-blue-500",
        textColor: "text-blue-800"
      },
      {
        id: 40002,
        subject: "Switch overheating - In progress",
        createdBy: "Shammi Herath",
        type: "Faulty Ticket",
        description: "Switch in server room overheating frequently",
        assignedEngineer: "Pasan Malith",
        link: "/create-ft",
        borderColor: "border-blue-500",
        textColor: "text-blue-800"
      },
      {
        id: 40003,
        subject: "PC Power Issue - In progress",
        createdBy: "Shammi Herath",
        type: "Faulty Ticket",
        description: "PC power supply unit unstable, needs replacement",
        assignedEngineer: "Pasan Malith",
        link: "/create-ft",
        borderColor: "border-blue-500",
        textColor: "text-blue-800"
      }
    ]
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      {/* Sidebar */}
      <div className="flex-shrink-0">
        <Sidebar isOpen={isSidebarOpen} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen min-h-0">
        {/* Navbar */}
        <div className="flex-shrink-0">
          <Navbar toggleSidebar={toggleSidebar} />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-[#F3F4F6]">
          {/* Banner */}
          <div
            className="w-full h-80 bg-cover bg-center relative"
            style={{ backgroundImage: `url(${BannerImage})` }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-50 flex pt-20 justify-left pl-8">
              <h1 className="text-white text-4xl font-bold text-left font-jura">
                Welcome to<br />Lankacom Cyber Security <br />Support Portal
              </h1>
            </div>
          </div>

          {/* Dashboard Cards */}
          <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-8 px-20 pt-10 font-jura">
            {[
              { label: "Pending Issue Count", count: 3 },
              { label: "Ongoing Issue Count", count: 2 },
              { label: "Balance Service Request Count (This Month)", count: 5 },
              { label: "Used Service Request Count (This Month)", count: 14 }
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-10">
                <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center">
                  {item.label}
                </h2>
                <p className="text-gray-600 text-5xl text-center">{item.count}</p>
              </div>
            ))}
          </div>

          {/* Ticket Sections */}
          <div className="flex flex-col md:flex-row gap-6 px-20 mt-8 pb-10 font-jura">
            {/* Pending Tickets */}
            <div className="w-full md:w-1/2">
              <h2 className="text-2xl font-bold text-[#000000] mb-4">Pending Issues</h2>

              {/* Tabs */}
              <div className="flex space-x-4 mb-4">
                <button
                  onClick={() => setPendingTab("service")}
                  className={`px-4 py-2 rounded font-medium ${
                    pendingTab === "service"
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  Service Requests
                </button>
                <button
                  onClick={() => setPendingTab("faulty")}
                  className={`px-4 py-2 rounded font-medium ${
                    pendingTab === "faulty"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  Faulty Tickets
                </button>
              </div>

              {/* Tickets */}
              <div className="space-y-4">
                {pendingTickets[pendingTab].map((ticket) => (
                  <Link to={ticket.link} key={ticket.id}>
                    <div
                      className={`border-l-4 ${ticket.borderColor} p-4 rounded shadow bg-white hover:bg-gray-50 mt-5`}
                    >
                      <h3 className={`flex items-center gap-2 font-semibold ${ticket.textColor}`}>
                        <FaTicketAlt className="h-5 w-5" />
                        Ticket #{ticket.id}
                      </h3>
                      <p className="text-xl text-black">Subject: {ticket.subject}</p>
                      <p className="text-sm text-black">Ticket Created By: {ticket.createdBy}</p>
                      <p className="text-sm text-black">Ticket Type: {ticket.type}</p>
                      <p className="text-sm text-black">Description: {ticket.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Ongoing Tickets */}
            <div className="w-full md:w-1/2">
              <h2 className="text-2xl font-bold text-[#000000] mb-4">Ongoing Issues</h2>

              {/* Tabs */}
              <div className="flex space-x-4 mb-4">
                <button
                  onClick={() => setOngoingTab("service")}
                  className={`px-4 py-2 rounded font-medium ${
                    ongoingTab === "service"
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  Service Requests
                </button>
                <button
                  onClick={() => setOngoingTab("faulty")}
                  className={`px-4 py-2 rounded font-medium ${
                    ongoingTab === "faulty"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  Faulty Tickets
                </button>
              </div>

              {/* Tickets */}
              <div className="space-y-4">
                {ongoingTickets[ongoingTab].map((ticket) => (
                  <Link to={ticket.link} key={ticket.id}>
                    <div
                      className={`border-l-4 ${ticket.borderColor} p-4 rounded shadow bg-white hover:bg-gray-50 mt-5`}
                    >
                      <h3
                        className={`flex items-center gap-2 text-lg font-semibold ${ticket.textColor}`}
                      >
                        <FaTicketAlt className="h-5 w-5" />
                        Ticket #{ticket.id}
                      </h3>
                      <p className="text-xl text-black">Subject: {ticket.subject}</p>
                      <p className="text-sm text-black">Ticket Created By: {ticket.createdBy}</p>
                      <p className="text-sm text-black">Ticket Type: {ticket.type}</p>
                      <p className="text-sm text-black">Description: {ticket.description}</p>
                      <p className="text-sm text-red-600">
                        Assigned Engineer: {ticket.assignedEngineer}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
