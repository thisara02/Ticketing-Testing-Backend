import { useEffect, useState } from "react";
import Sidebar from "../../components/EngSide";
import Navbar from "../../components/EngNav";
import { useNavigate } from "react-router-dom";

interface Ticket {
  id: string;
  company: string;
  subject: string;
  description: string;
  status: string;
  type: string;
  assignedAt: string;
}

const EngAssignedTicket = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const fetchAssignedTickets = async () => {
      try {
        const token = localStorage.getItem("engToken");
        const response = await fetch("http://localhost:5000/api/ticket/assigned", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setTickets(data);
      } catch (error) {
        console.error("Error fetching assigned tickets:", error);
      }
    };

    fetchAssignedTickets();

    const interval = setInterval(fetchAssignedTickets, 1000);
    return () => clearInterval(interval);
  }, []);

  const serviceRequests = tickets.filter((ticket) => ticket.type === "Service Request");
  const faultyTickets = tickets.filter((ticket) => ticket.type === "Faulty Ticket");

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} />
      <div className="flex-1 flex flex-col h-screen min-h-0">
        <Navbar toggleSidebar={toggleSidebar} />
        <div className="flex-1 overflow-y-auto bg-gray-50 py-6 font-jura">
          <div className="bg-white rounded-lg shadow px-20 py-6 mx-4">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              My Assigned Tickets
            </h2>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Service Requests */}
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-green-600 mb-4">
                  Service Requests
                </h3>
                {serviceRequests.length === 0 ? (
                  <p className="text-gray-500 italic">No assigned service requests.</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {serviceRequests.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="border-l-4 border-green-400 shadow rounded-lg p-4 flex flex-col gap-2"
                      >
                        <p
                          className="text-red-500 font-bold text-xl cursor-pointer hover:underline"
                          onClick={() => navigate(`/eng-view-assign/${ticket.id}`)}
                        >
                          Ticket ID : #{ticket.id}
                        </p>
                        <p className="text-black font-bold text-lg">
                          Customer Name : {ticket.company}
                        </p>
                        <p className="font-bold text-black text-m">Subject : {ticket.subject}</p>
                        <p className="text-gray-600">Description : {ticket.description}</p>
                        <p>
                          <span className="text-gray-500">Status: </span>
                          <span className="text-green-600">{ticket.status}</span>
                        </p>
                        <p className="text-sm text-gray-500 italic">
                          Assigned at: {new Date(ticket.assignedAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Faulty Tickets */}
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-blue-600 mb-4">Faulty Tickets</h3>
                {faultyTickets.length === 0 ? (
                  <p className="text-gray-500 italic">No assigned faulty tickets.</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {faultyTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="border-l-4 border-blue-400 shadow rounded-lg p-4 flex flex-col gap-2"
                      >
                        <p
                          className="text-red-500 font-bold text-xl cursor-pointer hover:underline"
                          onClick={() => navigate(`/eng-view-assign/${ticket.id}`)}
                        >
                          Ticket ID : #{ticket.id}
                        </p>
                        <p className="text-black font-bold text-lg">
                          Customer Name : {ticket.company}
                        </p>
                        <p className="font-bold text-black text-m">Subject : {ticket.subject}</p>
                        <p className="text-gray-600">Description : {ticket.description}</p>
                        <p>
                          <span className="text-gray-500">Status: </span>
                          <span className="text-green-600">{ticket.status}</span>
                        </p>
                        <p className="text-sm text-gray-500 italic">
                          Assigned at: {new Date(ticket.assignedAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngAssignedTicket;
