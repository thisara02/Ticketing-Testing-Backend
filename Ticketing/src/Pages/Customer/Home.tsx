import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import BannerImage from "../../assets/about-banner-lcs.jpg";
import { Link } from "react-router-dom";
import { FaExclamationTriangle, FaTicketAlt, FaTools } from "react-icons/fa";
import { motion } from "framer-motion";

interface Ticket {
  id: number;
  subject: string;
  createdBy: string;
  type: string;
  description: string;
  assignedEngineer?: string;
}

type TicketType = "service" | "faulty";

interface TicketsByType {
  service: Ticket[];
  faulty: Ticket[];
}

interface TicketsData {
  pending: TicketsByType;
  ongoing: TicketsByType;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5, ease: "easeOut" }
  })
};

const Home = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [pendingTab, setPendingTab] = useState<TicketType>("service");
  const [ongoingTab, setOngoingTab] = useState<TicketType>("service");

  const [ticketsData, setTicketsData] = useState<TicketsData>({
    pending: { service: [], faulty: [] },
    ongoing: { service: [], faulty: [] },
  });


  const [ticketCounts, setTicketCounts] = useState({
    pending: 0,
    ongoing: 0,
    used_service_requests: 0,
    balance_service_requests: 0,
  });

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const getIcon = (type: string) => {
    if (type === "Service Request") return <FaTools className="text-gray-600 w-4 h-4" />;
    if (type === "Faulty Ticket") return <FaExclamationTriangle className="text-red-400 w-4 h-4" />;
    return <FaTicketAlt className="text-gray-400 w-5 h-5" />;
  };

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = localStorage.getItem("cusToken");
        if (!token) {
          console.error("No customer token found");
          return;
        }

        const res = await fetch("http://localhost:5000/api/customers/tickets", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.error("Failed to fetch tickets", res.statusText);
          return;
        }

        const data: TicketsData = await res.json();
        setTicketsData(data);
      } catch (error) {
        console.error("Error fetching tickets", error);
      }
    };

    const fetchTicketCounts = async () => {
      try {
        const token = localStorage.getItem("cusToken");
        if (!token) {
          console.error("No customer token found");
          return;
        }

        const res = await fetch("http://localhost:5000/api/customers/ticket-counts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.error("Failed to fetch ticket counts", res.statusText);
          return;
        }

        const data = await res.json();
        setTicketCounts(data);
      } catch (error) {
        console.error("Error fetching ticket counts", error);
      }
    };

    const combinedFetch = () => {
      fetchTickets();
      fetchTicketCounts();
    };

    combinedFetch();
    const interval = setInterval(combinedFetch, 1000);
    return () => clearInterval(interval);
  }, []);

  const getColors = (type: TicketType) => {
    if (type === "service") {
      return { borderColor: "border-green-500", textColor: "text-green-800" };
    }
    return { borderColor: "border-blue-500", textColor: "text-blue-800" };
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      <div className="flex-shrink-0">
        <Sidebar isOpen={isSidebarOpen} />
      </div>

      <div className="flex-1 flex flex-col h-screen min-h-0">
        <div className="flex-shrink-0">
          <Navbar toggleSidebar={toggleSidebar} />
        </div>

        <div className="flex-1 overflow-y-auto bg-[#F9FAFB]">
          <div
            className="w-full h-4/6 bg-cover bg-center relative"
            style={{ backgroundImage: `url(${BannerImage})` }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-70 flex pt-10 justify-center text-center pl-8">
              <div className="flex flex-col items-center space-y-4">
                <motion.h1
                  className="text-white text-5xl font-bold font-jura leading-tight"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7 }}
                >
                  Welcome<br />
                  Lankacom Cyber Security
                  Support Portal
                </motion.h1>

                <motion.p
                  className="text-white text-xl font-light max-w-2xl px-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                >
                  Your trusted partner in cybersecurity support, delivering efficient, secure, and transparent service request management.
                </motion.p>
              </div>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-8 px-20 font-jura pt-72">
              {[
                {
                  label: "Current Pending Requests Count",
                  count: ticketCounts.pending,
                },
                {
                  label: "Current Ongoing Requests Count",
                  count: ticketCounts.ongoing,
                },
                {
                  label: "Balance Service Request Count (This Month)",
                  count: ticketCounts.balance_service_requests,
                },
                {
                  label: "Used Service Request Count (This Month)",
                  count: ticketCounts.used_service_requests,
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  className={`p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 text-center cursor-default
                    bg-white bg-opacity-20 backdrop-blur-none border border-white/30 text-white`}
                >
                  <h2 className="text-xl font-semibold mb-2 drop-shadow-md"><b>{item.label}</b></h2>
                  <p className="text-5xl font-bold drop-shadow-md">{item.count}</p>
                </motion.div>
              ))}
            </div>

          </div>

          {/* Ticket Sections */}
          <div className="flex flex-col md:flex-row gap-6 px-20 mt-8 pb-10 font-jura ">
            {/* Pending Tickets */}
            <div className="w-full md:w-1/2">
              <h2 className="text-2xl font-bold text-[#0F3460] mb-4">Pending Requests / Issues</h2>

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

              <div className="space-y-4">
                {ticketsData.pending[pendingTab].map((ticket, index) => {
                  const colors = getColors(pendingTab);
                  return (
                    <Link to={`/view-pending/${ticket.id}`} key={ticket.id}>
                      <motion.div
                        custom={index}
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        className={`border-l-4 ${colors.borderColor} p-4 rounded shadow bg-gray-200 hover:bg-blue-50 hover:shadow-xl transition-all duration-300 ease-in-out mt-5 py-7`}
                      >
                        <h3 className={`flex items-center gap-2 font-semibold ${colors.textColor}`}>
                          {getIcon(ticket.type)}
                          Ticket #{ticket.id}
                        </h3>
                        <p className="text-xl text-black">Subject: {ticket.subject}</p>
                        <p className="text-sm text-black">Ticket Created By: {ticket.createdBy}</p>
                        <p className="text-sm text-black">Ticket Type: {ticket.type}</p>
                        <p className="text-sm text-black">Description: {ticket.description}</p>
                      </motion.div>
                    </Link>
                  );
                })}

              </div>
            </div>

            {/* Ongoing Tickets */}
            <div className="w-full md:w-1/2">
              <h2 className="text-2xl font-bold text-[#0F3460] mb-4">Ongoing Requests / Issues</h2>

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

              <div className="space-y-4">
                {ticketsData.ongoing[ongoingTab].map((ticket, index) => {
                  const colors = getColors(ongoingTab);
                  return (
                    <Link to={`/viewon/${ticket.id}`} key={ticket.id}>
                      <motion.div
                        custom={index}
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        className={`border-l-4 ${colors.borderColor} p-4 rounded shadow bg-gray-200 hover:bg-blue-50 hover:shadow-xl transition-all duration-300 ease-in-out mt-5`}
                      >
                        <h3 className={`flex items-center gap-2 text-lg font-semibold ${colors.textColor}`}>
                          {getIcon(ticket.type)}
                          Ticket #{ticket.id}
                        </h3>
                        <p className="text-xl text-black">Subject: {ticket.subject}</p>
                        <p className="text-sm text-black">Ticket Created By: {ticket.createdBy}</p>
                        <p className="text-sm text-black">Ticket Type: {ticket.type}</p>
                        <p className="text-sm text-black">Description: {ticket.description}</p>
                        {ticket.assignedEngineer && (
                          <p className="text-sm text-red-600">Assigned Engineer: {ticket.assignedEngineer}</p>
                        )}
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
