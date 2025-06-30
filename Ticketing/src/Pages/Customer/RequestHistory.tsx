import { useEffect, useState } from "react";
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
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = localStorage.getItem("cusToken");
        const res = await fetch("http://localhost:5000/api/customers/ticket-history", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to fetch tickets");
        }

        const data: Ticket[] = await res.json();
        setTickets(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

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

  const handleNavigate = (ticket: Ticket) => {
  if (ticket.status === "Pending") {
    navigate(`/view-pending/${ticket.id}`);
  } else if (ticket.status === "Ongoing") {
    navigate(`/viewon/${ticket.id}`);
  } else if (ticket.status === "Closed") {
    navigate(`/view-closed/${ticket.id}`);
  }
};


  return (
    <div className="h-screen w-screen flex bg-gray-100 overflow-hidden">
      <div className="flex-shrink-0">
        <Sidebar isOpen={isSidebarOpen} />
      </div>

      <div className="flex-1 flex flex-col w-full">
        <Navbar toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />

        <main className="p-6 flex-1 overflow-auto font-jura">
          <div className="mb-8 bg-white p-6 rounded-lg shadow-md mx-10 mt-5">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 border-b-4 inline-block pb-2 font-jura mb-6">
              Issue History
            </h1>

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

            {loading ? (
              <p className="text-gray-500">Loading tickets...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : filteredTickets.length === 0 ? (
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
