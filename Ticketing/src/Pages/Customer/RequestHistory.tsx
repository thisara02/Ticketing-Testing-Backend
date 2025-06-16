import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { useNavigate } from "react-router-dom";
import { FaTicketAlt } from "react-icons/fa";

type Ticket = {
  id: string;
  subject: string;
  ticketType: "Service Request" | "Faulty Ticket";
  description: string;
  createdDate: string;
  assignedEngineer?: string;
  status: "Closed" | "Pending" | "Ongoing";
};

const History = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"Pending" | "Ongoing" | "Closed">("Pending");
  const navigate = useNavigate();

  const tickets: Ticket[] = [
    {
      id: "#123456",
      subject: "VPN not working",
      ticketType: "Faulty Ticket",
      description: "Unable to connect to VPN from home.",
      createdDate: "2020/05/29 19:12",
      assignedEngineer: "Engineer A",
      status: "Ongoing",
    },
    {
      id: "#789012",
      subject: "Install antivirus",
      ticketType: "Service Request",
      description: "Request to install McAfee antivirus.",
      createdDate: "2020/05/29 19:12",
      status: "Pending",
    },
    {
      id: "#456789",
      subject: "Replace broken keyboard",
      ticketType: "Faulty Ticket",
      description: "Keyboard keys are not working properly.",
      createdDate: "2020/05/29 19:12",
      assignedEngineer: "Engineer B",
      status: "Closed",
    },
    {
      id: "#222333",
      subject: "Email setup",
      ticketType: "Service Request",
      description: "Setup new email account.",
      createdDate: "2020/05/29 19:12",
      assignedEngineer: "Engineer C",
      status: "Pending",
    },
    {
      id: "#444555",
      subject: "Computer slow",
      ticketType: "Faulty Ticket",
      description: "PC is very slow.",
      createdDate: "2020/05/29 19:12",
      assignedEngineer: "Engineer A",
      status: "Ongoing",
    },
    {
      id: "#666777",
      subject: "Printer issue",
      ticketType: "Faulty Ticket",
      description: "Printer not working.",
      createdDate: "2020/05/29 19:12",
      assignedEngineer: "Engineer D",
      status: "Closed",
    },
  ];

  const filteredTickets = tickets.filter((ticket) => ticket.status === activeTab);

  const getBorderColor = (status: string) => {
    switch (status) {
      case "Closed":
        return "border-red-500";
      case "Pending":
        return "border-yellow-500";
      case "Ongoing":
        return "border-purple-500";
      default:
        return "border-gray-300";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Closed":
        return "text-red-600";
      case "Pending":
        return "text-yellow-600";
      case "Ongoing":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  // Navigation based on status
  const handleNavigate = (ticket: Ticket) => {
    if (ticket.status === "Pending") {
      navigate("/view-pending");
    } else if (ticket.status === "Ongoing") {
      navigate("/viewon");
    } else if (ticket.status === "Closed") {
      navigate("/view-closed");
    }
  };

  return (
    <div className="h-screen w-screen flex bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div className="flex-shrink-0">
        <Sidebar isOpen={isSidebarOpen} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full">
        {/* Navbar */}
        <Navbar toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />

        <main className="p-6 flex-1 overflow-auto font-jura">
          <div className="mb-8 bg-white p-6 rounded-lg shadow-md mx-10 mt-5">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 border-b-4 inline-block pb-2 font-jura mb-6">
              Issue History
            </h1>

            {/* Tabs */}
            <div className="flex space-x-4 mb-6">
              {(["Pending", "Ongoing", "Closed"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-full font-medium ${
                    activeTab === tab
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tickets */}
            {filteredTickets.length === 0 ? (
              <p className="text-gray-600">No tickets in this category.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredTickets.map((ticket) => (
                  <div
                    key={`${ticket.id}-${ticket.status}`}
                    onClick={() => handleNavigate(ticket)}
                    className={`bg-white p-6 rounded-lg shadow border-l-8 ${getBorderColor(
                      ticket.status
                    )} flex justify-between items-start cursor-pointer`}
                  >
                    <div className="space-y-2">
                      <p className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <FaTicketAlt className="h-5 w-5" />
                        Ticket ID: {ticket.id}
                      </p>
                      <p className="text-md font-medium text-gray-700">{ticket.subject}</p>
                      <p className="text-sm text-gray-600 font-semibold">
                        Ticket Type: {ticket.ticketType}
                      </p>
                      <p className="text-sm text-gray-700">Description: {ticket.description}</p>
                      <p className="text-sm text-gray-700">Created: {ticket.createdDate}</p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Assigned Engineer:</span>{" "}
                        {ticket.status === "Pending" ? "Not Assigned" : ticket.assignedEngineer}
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-lg font-semibold px-3 py-1 rounded-full bg-gray-100 ${getStatusColor(
                          ticket.status
                        )}`}
                      >
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default History;
