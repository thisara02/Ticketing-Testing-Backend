import Navbar from "../../components/AmNav";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

interface Ticket {
  id: number;
  subject: string;
  type: string;
  priority: string;
  requester_company: string;
  status: string;
  created_at: string;
  closed_at?: string;
  engineer_name?: string;
  engineer_contact?: string;
  work_done_comment?: string;
  rectification_date?: string;
}

const AMTickets = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [companyFilter, setCompanyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [idFilter, setIdFilter] = useState("");

  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const token = localStorage.getItem("amToken");
    if (!token) {
      Swal.fire("Error", "Authentication token missing", "error");
      return;
    }

    fetch("http://localhost:5000/api/accountmanager/tickets", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.error || "Failed to fetch tickets");
        }
        return res.json();
      })
      .then((data: Ticket[]) => {
        setTickets(data);
        setFilteredTickets(data);
      })
      .catch((err) => {
        console.error(err);
        Swal.fire("Error", err.message || "Failed to load ticket data", "error");
      });
  }, []);

  useEffect(() => {
    let filtered = [...tickets];
    if (idFilter) {
      filtered = filtered.filter((ticket) =>
        ticket.id.toString().includes(idFilter)
      );
    }
    if (companyFilter) {
      filtered = filtered.filter((ticket) =>
        ticket.requester_company.toLowerCase().includes(companyFilter.toLowerCase())
      );
    }
    if (statusFilter) {
      filtered = filtered.filter((ticket) => ticket.status === statusFilter);
    }
    setFilteredTickets(filtered);
  }, [companyFilter, statusFilter, idFilter, tickets]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "border-yellow-500";
      case "Ongoing":
        return "border-green-500";
      case "Closed":
        return "border-red-600";
      default:
        return "border-gray-300";
    }
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      <div className="flex-shrink-0">{/* Sidebar placeholder */}</div>
      <div className="flex-1 flex flex-col h-screen min-h-0">
        <div className="flex-shrink-0">
          <Navbar toggleSidebar={toggleSidebar} />
        </div>

        <div className="flex-1 overflow-y-auto bg-purple-100 font-jura p-6 space-y-6">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-4">Company Tickets</h2>

          {/* Filters - single line */}
          <div className="w-4/5 mx-auto flex flex-col md:flex-row md:items-center gap-4">
            <input
              type="text"
              placeholder="Search by Ticket ID"
              value={idFilter}
              onChange={(e) => setIdFilter(e.target.value)}
              className="p-2 border rounded-md flex-1 shadow-sm bg-white text-black"
            />
            <input
              type="text"
              placeholder="Filter by Company"
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="p-2 border rounded-md flex-1 shadow-sm bg-white text-black"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 border rounded-md flex-1 shadow-sm bg-white text-black"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Ticket Cards */}
          <div className="w-4/5 mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTickets.length === 0 ? (
              <p className="text-gray-500 col-span-2 text-center">No tickets found.</p>
            ) : (
              filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => {
                    if (ticket.status === "Pending") {
                      navigate(`/am-view-pending/${ticket.id}`);
                    } else if (ticket.status === "Ongoing") {
                      navigate(`/am-viewon/${ticket.id}`);
                    } else if (ticket.status === "Closed") {
                      navigate(`/am-view-closed/${ticket.id}`);
                    }
                  }}
                  className={`border-l-4 ${getStatusColor(
                    ticket.status
                  )} bg-white p-6 rounded-xl shadow-md space-y-3 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-transform duration-200`}
                >
                  <h3 className="text-2xl font-semibold text-blue-700 mb-2">
                    {ticket.requester_company} /  Ticket ID :  #{ticket.id}
                  </h3>
                  <div className="grid grid-cols-1 gap-1 text-sm text-gray-700">
                    <p className="text-lg text-black"><strong>Subject :</strong> {ticket.subject}</p>
                    <p><strong>Type:</strong> {ticket.type}</p>
                    <p><strong>Priority:</strong> {ticket.priority}</p>
                    <p><strong>Status:</strong> {ticket.status}</p>
                    <p><strong>Created At:</strong> {ticket.created_at}</p>

                    {ticket.status !== "Pending" && (
                      <>
                        <p><strong>Engineer:</strong> {ticket.engineer_name}</p>
                        <p><strong>Engineer Contact:</strong> {ticket.engineer_contact}</p>
                      </>
                    )}

                    {ticket.status === "Closed" && (
                      <>
                        <p><strong>Work Done:</strong> {ticket.work_done_comment}</p>
                        <p><strong>Rectification Date:</strong> {ticket.rectification_date}</p>
                        <p><strong>Closed At:</strong> {ticket.closed_at}</p>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AMTickets;
