import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import BannerImage from "../../assets/about-banner-lcs.jpg";
import { Link } from "react-router-dom";
import { FaTicketAlt } from "react-icons/fa";

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

const Home = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [pendingTab, setPendingTab] = useState<TicketType>("service");
  const [ongoingTab, setOngoingTab] = useState<TicketType>("service");

  const [ticketsData, setTicketsData] = useState<TicketsData>({
    pending: { service: [], faulty: [] },
    ongoing: { service: [], faulty: [] },
  });

  const [ticketCounts, setTicketCounts] = useState({ pending: 0, ongoing: 0 });

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
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

    fetchTickets();
    fetchTicketCounts();
    
    function combinedFetch() {
      fetchTickets();
      fetchTicketCounts();
    }

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

        <div className="flex-1 overflow-y-auto bg-[#F3F4F6]">
          <div
            className="w-full h-80 bg-cover bg-center relative"
            style={{ backgroundImage: `url(${BannerImage})` }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-50 flex pt-20 justify-left pl-8">
              <h1 className="text-white text-4xl font-bold text-left font-jura">
                Welcome to
                <br />
                Lankacom Cyber Security <br />Support Portal
              </h1>
            </div>
          </div>

          {/* Dashboard Cards */}
          <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-8 px-20 pt-10 font-jura">
            {[
              {
                label: "Pending Issue Count",
                count: ticketCounts.pending,
              },
              {
                label: "Ongoing Issue Count",
                count: ticketCounts.ongoing,
              },
              {
                label: "Balance Service Request Count (This Month)",
                count: 5,
              },
              {
                label: "Used Service Request Count (This Month)",
                count: 14,
              },
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
                {ticketsData.pending[pendingTab].map((ticket) => {
                  const colors = getColors(pendingTab);
                  return (
                    <Link to={`/view-pending/${ticket.id}`} key={ticket.id}>
                      <div
                        className={`border-l-4 ${colors.borderColor} p-4 rounded shadow bg-white hover:bg-gray-50 mt-5`}
                      >
                        <h3 className={`flex items-center gap-2 font-semibold ${colors.textColor}`}>
                          <FaTicketAlt className="h-5 w-5" />
                          Ticket #{ticket.id}
                        </h3>
                        <p className="text-xl text-black">Subject: {ticket.subject}</p>
                        <p className="text-sm text-black">Ticket Created By: {ticket.createdBy}</p>
                        <p className="text-sm text-black">Ticket Type: {ticket.type}</p>
                        <p className="text-sm text-black">Description: {ticket.description}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Ongoing Tickets */}
            <div className="w-full md:w-1/2">
              <h2 className="text-2xl font-bold text-[#000000] mb-4">Ongoing Issues</h2>

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
                {ticketsData.ongoing[ongoingTab].map((ticket) => {
                  const colors = getColors(ongoingTab);
                  return (
                    <Link to={`/viewon/${ticket.id}`} key={ticket.id}>
                      <div
                        className={`border-l-4 ${colors.borderColor} p-4 rounded shadow bg-white hover:bg-gray-50 mt-5`}
                      >
                        <h3 className={`flex items-center gap-2 text-lg font-semibold ${colors.textColor}`}>
                          <FaTicketAlt className="h-5 w-5" />
                          Ticket #{ticket.id}
                        </h3>
                        <p className="text-xl text-black">Subject: {ticket.subject}</p>
                        <p className="text-sm text-black">Ticket Created By: {ticket.createdBy}</p>
                        <p className="text-sm text-black">Ticket Type: {ticket.type}</p>
                        <p className="text-sm text-black">Description: {ticket.description}</p>
                        {ticket.assignedEngineer && (
                          <p className="text-sm text-red-600">Assigned Engineer: {ticket.assignedEngineer}</p>
                        )}
                      </div>
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