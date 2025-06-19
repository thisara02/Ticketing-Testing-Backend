import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { useNavigate } from "react-router-dom";
import { FaTicketAlt } from "react-icons/fa";

type Ticket = {
  id: string;
  ticketType: "Service Request" | "Faulty Ticket";
  ticketCreatedBy: string;
  assignedEngineer: string;
  type: string;
  description: string;
  createdAt: string;
  status: string;
};

const Pending = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"service" | "faulty">("service");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("cusToken");  // Use your actual token key here
        if (!token) throw new Error("User not authenticated");

        const response = await fetch("http://localhost:5000/api/customers/ongoing-tickets", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setTickets(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch tickets");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();

    const interval = setInterval(fetchTickets, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredTickets = tickets.filter(
    (ticket) =>
      (activeTab === "service" && ticket.ticketType === "Service Request") ||
      (activeTab === "faulty" && ticket.ticketType === "Faulty Ticket")
  );

  return (
    <div className="h-screen w-screen flex bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div className="flex-shrink-0">
        <Sidebar isOpen={isSidebarOpen} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full overflow-auto">
        {/* Navbar */}
        <Navbar toggleSidebar={toggleSidebar} />

        {/* Tickets Grid */}
        <main className="p-6 flex-1 overflow-auto font-jura">
          <div className="mb-8 bg-white p-6 rounded-lg shadow-md mx-10 mt-5">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 border-b-4 inline-block pb-2 font-jura mb-10">
              Ongoing Issues
            </h1>

            {/* Tabs */}
            <div className="flex space-x-4 mb-4">
              <button
                onClick={() => setActiveTab("service")}
                className={`px-4 py-2 rounded font-medium ${
                  activeTab === "service"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                Service Requests
              </button>
              <button
                onClick={() => setActiveTab("faulty")}
                className={`px-4 py-2 rounded font-medium ${
                  activeTab === "faulty"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                Faulty Tickets
              </button>
            </div>

            {loading && <p>Loading tickets...</p>}
            {error && <p className="text-red-600">Error: {error}</p>}

            {!loading && !error && filteredTickets.length === 0 && (
              <p>No {activeTab === "service" ? "Service Requests" : "Faulty Tickets"} found.</p>
            )}

            {!loading && !error && filteredTickets.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredTickets.map((ticket) => (
                  <div
                    onClick={() => navigate(`/viewon/${ticket.id}`)}
                    key={ticket.id}
                    className={`bg-white text-black shadow-md rounded-lg p-6 border-l-8 cursor-pointer ${
                      ticket.ticketType === "Service Request"
                        ? "border-green-500"
                        : "border-blue-500"
                    }`}
                  >
                    <h2 className="text-xl font-bold mb-1 flex items-center justify-between">
                      <span>{ticket.id} - {ticket.type}</span>
                      <FaTicketAlt className="text-2xl" />
                    </h2>
                    <p className="text-l font-bold text-gray-600 mb-3">{ticket.ticketType}</p>
                    <p className="text-gray-700 mb-3">{ticket.description}</p>

                    <div className="text-sm text-gray-500 mb-1">
                      <span className="font-semibold">Created By:</span> {ticket.ticketCreatedBy}
                    </div>
                    <div className="text-sm text-gray-500 mb-1">
                      <span className="font-semibold">Created At:</span>{" "}
                      {new Date(ticket.createdAt).toLocaleString()}
                    </div>
                    <div className="text-sm mb-3">
                      <span className="font-semibold text-red-600">Assigned Engineer:</span>{" "}
                      <span className="text-red-600">{ticket.assignedEngineer}</span>
                    </div>

                    <div
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        ticket.status === "Open"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {ticket.status}
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

export default Pending;
