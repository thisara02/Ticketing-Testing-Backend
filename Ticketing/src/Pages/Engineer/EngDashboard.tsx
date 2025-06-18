import { useEffect, useState } from "react";
import Sidebar from "../../components/EngSide";
import Navbar from "../../components/EngNav";
import { TicketIcon } from "lucide-react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import BannerImage from "../../assets/eng-back.jpg";

interface Ticket {
  id: string;
  subject: string;
  type: string;
  description: string;
  priority: string;
  requester_name: string;
  requester_company: string;
  requester_email: string;
  requester_contact: string;
  created_at: string;
}


const EngDash = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [pendingRequests, setPendingRequests] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const navigate = useNavigate();

  const [totalPendingTickets, setTotalPendingTickets] = useState<number>(0);
  const [myOngoingTickets, setMyOngoingTickets] = useState<number>(0); // Replace with actual ongoing logic later

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const handleAssign = async (id: string) => {
  Swal.fire({
    title: "Assign Ticket",
    text: `Are you sure you want to assign ticket ${id}?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes, assign it!",
    cancelButtonText: "Cancel",
    buttonsStyling: false,
    customClass: {
      confirmButton: "bg-green-500 text-white px-4 py-2 rounded mr-2",
      cancelButton: "bg-gray-100 text-black px-4 py-2 rounded mr-2",
    },
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("engToken");

        const response = await fetch(`http://localhost:5000/api/ticket/assign/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        Swal.fire({
          title: "Assigned!",
          text: `Ticket ${id} has been assigned.`,
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });

        // Optionally refresh pending tickets list
        setPendingRequests((prev) => prev.filter((ticket) => ticket.id !== id));
      } catch (error) {
        console.error("Error assigning ticket:", error);
        Swal.fire("Error", "Failed to assign ticket", "error");
      }
    }
  });
};

  const getBorderColor = (type: string) => {
    switch (type) {
      case "Service Request":
        return "border-green-400";
      case "Faulty Ticket":
        return "border-blue-400";
      default:
        return "border-yellow-400";
    }
  };

  useEffect(() => {
  const fetchPendingTickets = async () => {
    try {
      const token = localStorage.getItem("engToken");
      const response = await fetch("http://localhost:5000/api/ticket/pending", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPendingRequests(data);
    } catch (error) {
      console.error("Error fetching pending tickets:", error);
      Swal.fire("Error", "Failed to load pending tickets", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
      try {
        const token = localStorage.getItem("engToken");
        const res = await fetch("http://localhost:5000/api/ticket/summary", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const summary = await res.json();
        setTotalPendingTickets(summary.total_pending_tickets);
        setMyOngoingTickets(summary.my_ongoing_tickets);
      } catch (error) {
        console.error("Error fetching ticket summary:", error);
      }
  };

  fetchPendingTickets();
  fetchSummary();
  function combinedFetch() {
  fetchSummary();
  fetchPendingTickets();
}

const interval = setInterval(combinedFetch, 1000);
  return () => clearInterval(interval);
}, []);


  return (
    <div className="h-screen w-screen flex overflow-hidden">
      <div className="flex-shrink-0">
        <Sidebar isOpen={isSidebarOpen} />
      </div>

      <div className="flex-1 flex flex-col h-screen min-h-0">
        <div className="flex-shrink-0">
          <Navbar toggleSidebar={toggleSidebar} />
        </div>

        <div className="flex-1 overflow-y-auto bg-[#DDE6ED] font-jura">
          <div
            className="w-full h-80 bg-cover bg-center relative"
            style={{ backgroundImage: `url(${BannerImage})` }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-50 flex pt-20 justify-left pl-8">
              <h1 className="text-white text-4xl font-bold text-left font-jura">
                Department of
                <br />
                Cyber Security Operations
                <br />
                Engineer Portal
                <br />
                Lanka Communication Services (Pvt.) Ltd
              </h1>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 mx-20">
            <div className="bg-white shadow rounded-lg p-6 flex flex-col justify-center items-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Total Pending Tickets
              </h2>
              <p className="text-4xl font-bold text-yellow-500">
                {totalPendingTickets}
              </p>
            </div>

            <div className="bg-white shadow rounded-lg p-6 flex flex-col justify-center items-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                My Ongoing Tickets
              </h2>
              <p className="text-4xl font-bold text-purple-500">
                {myOngoingTickets}
              </p>
            </div>
          </div>

          {/* Pending Tickets Section */}
          <div className="bg-white p-6 rounded shadow mx-20">
            <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center gap-2 font-jura">
              <TicketIcon className="w-7 h-7" />
              Pending Tickets
            </h2>

            {loading ? (
              <p className="text-center text-gray-500 py-10">Loading tickets...</p>
            ) : pendingRequests.length === 0 ? (
              <p className="text-center text-gray-500 py-10">No pending tickets found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingRequests.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`bg-gray-50 border-l-4 ${getBorderColor(
                      ticket.type
                    )} rounded-lg shadow p-6 relative flex flex-col gap-4`}
                  >
                    <div className="flex-1 grid grid-cols-1 gap-2 text-gray-700">
                      <div>
                        <p
                          className="font-semibold text-red-600 cursor-pointer hover:underline"
                          onClick={() => navigate(`/eng-view-pending/${ticket.id}`)}
                        >
                          <span>Ticket ID: </span>
                          {ticket.id}
                        </p>
                        <p className="text-2xl font-bold">{ticket.requester_company}</p>
                        <p className="text-m font-bold">
                          <span>Subject: </span>
                          {ticket.subject}
                        </p>
                        <p>
                          <span className="font-semibold">Type: </span>
                          {ticket["type"]}
                        </p>
                        <p>
                          <span className="font-semibold">Description: </span>
                          {ticket.description}
                        </p>
                      </div>
                      <div>
                        <p>
                          <span className="font-semibold">Requester: </span>
                          {ticket.requester_name}
                        </p>
                        <p>
                          <span className="font-semibold">Email: </span>
                          {ticket.requester_email}
                        </p>
                        <p>
                          <span className="font-semibold">Contact: </span>
                          {ticket.requester_contact}
                        </p>
                        <p>
                          <span className="font-semibold">Created At: </span>
                          {new Date(ticket.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="absolute bottom-4 right-4">
                      <button
                        onClick={() => handleAssign(ticket.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold"
                      >
                        Assign
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngDash;
