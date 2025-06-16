import { useState } from "react";
import Sidebar from "../../components/EngSide";
import Navbar from "../../components/EngNav";
import { useNavigate } from "react-router-dom";

const EngAssignedTicket = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const navigate = useNavigate();

  // Dummy assigned tickets
  const assignedServiceRequests = [
    {
      id: "#784562",
      company: "Maliban",
      subject: "VPN Setup",
      description: "Setup VPN access for remote employees.",
      status: "Ongoing",
      assignedAt: "2025-06-01T10:00:00Z",
    },
  ];

  const assignedFaultyTickets = [
    {
      id: "#987654",
      company: "Windforce",
      subject: "Email not working",
      description: "Outlook is not syncing emails.",
      status: "Ongoing",
      assignedAt: "2025-06-02T15:30:00Z",
    },
  ];

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} />

      <div className="flex-1 flex flex-col h-screen min-h-0">
        <Navbar toggleSidebar={toggleSidebar} />

        <div className="flex-1 overflow-y-auto bg-gray-50 py-6 font-jura">
          {/* White background container wrapping header + columns */}
          <div className="bg-white rounded-lg shadow px-20 py-6 mx-4">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              My Assigned Tickets
            </h2>

            <div className="flex flex-col md:flex-row gap-6">
              {/* Assigned Service Requests */}
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-green-600 mb-4">
                  Service Requests
                </h3>
                {assignedServiceRequests.length === 0 ? (
                  <p className="text-gray-500 italic">No assigned service requests.</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {assignedServiceRequests.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="border-l-4 border-green-400 shadow rounded-lg p-4 flex flex-col gap-2"
                      >
                        <p className="text-red-500 font-bold text-xl cursor-pointer hover:underline" onClick={() => navigate("/eng-view-assign")}>Ticket ID : {ticket.id} </p>
                        <p className="text-black font-bold text-lg">Customer Name : {ticket.company} </p>
                        <p className="font-bold text-black text-m">Subject : {ticket.subject}</p>
                        <p className="text-gray-600">Description : {ticket.description}</p>
                        <p>
                          <span className=" text-gray-500">Status: </span>
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

              {/* Assigned Faulty Tickets */}
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-blue-600 mb-4">
                  Faulty Tickets
                </h3>
                {assignedFaultyTickets.length === 0 ? (
                  <p className="text-gray-500 italic">No assigned faulty tickets.</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {assignedFaultyTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="border-l-4 border-blue-400 shadow rounded-lg p-4 flex flex-col gap-2"
                      >
                        <p className="text-red-500 font-bold text-xl cursor-pointer hover:underline" onClick={() => navigate("/eng-view-assign")}>Ticket ID : {ticket.id}  </p>
                        <p className="text-black font-bold text-lg">Customer Name : {ticket.company} </p>
                        <p className="font-bold text-black text-m">Subject : {ticket.subject}</p>
                        <p className="text-gray-600">Description : {ticket.description}</p>
                        <p>
                          <span className=" text-gray-500">Status: </span>
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
