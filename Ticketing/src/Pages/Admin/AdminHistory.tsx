import { useState } from "react";
import Sidebar from "../../components/AdminSide";
import Navbar from "../../components/AdminNav";
import { useNavigate } from "react-router-dom";
import { FaTicketAlt } from "react-icons/fa";

type Ticket = {
  id: string;
  Company: string;
  subject: string;
  ticketType: "Service Request" | "Faulty Ticket";
  description: string;
  createdDate: string;
  assignedEngineer?: string;
  status: "Closed" | "Pending" | "Ongoing";
};

const AdminHistory = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [searchCompany, setSearchCompany] = useState("");
  const [searchTicketId, setSearchTicketId] = useState("");
  const navigate = useNavigate();

  const tickets: Ticket[] = [
    {
      id: "#123456",
      Company: "Wavenet",
      subject: "VPN not working",
      ticketType: "Faulty Ticket",
      description: "Unable to connect to VPN from home.",
      createdDate: "2020/05/29 19:12",
      assignedEngineer: "Engineer A",
      status: "Ongoing",
    },
    {
      id: "#789012",
      Company: "LankaCom",
      subject: "Install antivirus",
      ticketType: "Service Request",
      description: "Request to install McAfee antivirus.",
      createdDate: "2020/05/29 19:12",
      status: "Pending",
    },
    {
      id: "#456789",
      Company: "Dialog",
      subject: "Replace broken keyboard",
      ticketType: "Faulty Ticket",
      description: "Keyboard keys are not working properly.",
      createdDate: "2020/05/29 19:12",
      assignedEngineer: "Engineer B",
      status: "Closed",
    },
    {
      id: "#222333",
      Company: "Wavenet",
      subject: "Email setup",
      ticketType: "Service Request",
      description: "Setup new email account.",
      createdDate: "2020/05/29 19:12",
      assignedEngineer: "Engineer C",
      status: "Pending",
    },
    {
      id: "#444555",
      Company: "LankaCom",
      subject: "Computer slow",
      ticketType: "Faulty Ticket",
      description: "PC is very slow.",
      createdDate: "2020/05/29 19:12",
      assignedEngineer: "Engineer A",
      status: "Ongoing",
    },
    {
      id: "#666777",
      Company: "Dialog",
      subject: "Printer issue",
      ticketType: "Faulty Ticket",
      description: "Printer not working.",
      createdDate: "2020/05/29 19:12",
      assignedEngineer: "Engineer D",
      status: "Closed",
    },
  ];

  // Filtered tickets based on search
  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.Company.toLowerCase().includes(searchCompany.toLowerCase()) &&
      ticket.id.toLowerCase().includes(searchTicketId.toLowerCase())
  );

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
              Ticket History
              
            </h1>

            {/* Search Filters Only */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-end mb-6 gap-4 text-black">
              <input
                type="text"
                placeholder="Search by Company"
                value={searchCompany}
                onChange={(e) => setSearchCompany(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              />
              <input
                type="text"
                placeholder="Search by Ticket ID"
                value={searchTicketId}
                onChange={(e) => setSearchTicketId(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              />
            </div>

            {/* Tickets */}
            {filteredTickets.length === 0 ? (
              <p className="text-gray-600">No tickets match your search.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredTickets.map((ticket) => (
                  <div
                    key={`${ticket.id}-${ticket.status}`}
                    onClick={() => {
                      if (ticket.status === "Pending") {
                        navigate("/admin-view-pending");
                      } else if (ticket.status === "Ongoing") {
                        navigate("/admin-viewon");
                      } else if (ticket.status === "Closed") {
                        navigate("/admin-view-closed");
                      }
                    }}
                    className={`bg-white p-6 rounded-lg shadow border-l-8 ${getBorderColor(
                      ticket.status
                    )} flex justify-between items-start cursor-pointer hover:shadow-lg transition-shadow duration-200`}
                  >
                    <div className="space-y-2">
                      <p className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <FaTicketAlt className="h-5 w-5" />
                        Ticket ID: {ticket.id} - {ticket.Company}
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

export default AdminHistory;
