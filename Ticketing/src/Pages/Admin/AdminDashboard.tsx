// Same imports as before
import { useEffect, useState } from "react";
import Sidebar from "../../components/AdminSide";
import Navbar from "../../components/AdminNav";
import { useNavigate } from "react-router-dom";
import { FaTicketAlt } from "react-icons/fa";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Ticket {
  id: number;
  subject: string;
  type: string;
  requester_name: string;
  requester_company: string;
  description: string;
  created_at: string;
  engineer_name?: string;
}

const AdminDash = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const [pendingTickets, setPendingTickets] = useState<Ticket[]>([]);
  const [ongoingTickets, setOngoingTickets] = useState<Ticket[]>([]);
  const [engineerStats, setEngineerStats] = useState<any>({});
  const [pendingTab, setPendingTab] = useState<"service" | "faulty">("service");
  const [ongoingTab, setOngoingTab] = useState<"service" | "faulty">("service");

  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/dashboard/tickets-summary")
      .then((res) => res.json())
      .then((data) => {
        setPendingTickets(data.pending);
        setOngoingTickets(data.ongoing);
        setEngineerStats(data.engineer_stats);
      })
      .catch((err) => console.error("Failed to fetch dashboard data", err));
  }, []);

  const getBorderColor = (type: string) =>
    type === "Service Request" ? "border-green-500" : "border-blue-500";
  const getTextColor = (type: string) =>
    type === "Service Request" ? "text-green-800" : "text-blue-800";

  const filterByType = (list: Ticket[], type: string) =>
    list.filter((t) => t.type === type);

  const engineerNames = Object.keys(engineerStats);
  const ongoingCounts = engineerNames.map((name) => engineerStats[name].ongoing || 0);
  const closedCounts = engineerNames.map((name) => engineerStats[name].closed || 0);

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} />
      <div className="flex-1 flex flex-col h-screen min-h-0">
        <Navbar toggleSidebar={toggleSidebar} />
        <div className="flex-1 overflow-y-auto bg-gray-100">
          {/* Chart Section */}
          <div className="p-4 font-jura w-8/9 mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-6 mt-5">
              Engineer Ticket Overview
            </h2>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 bg-white rounded shadow p-4">
                <h3 className="text-lg font-semibold text-center mb-2 text-gray-700">
                  Ongoing Tickets
                </h3>
                <Bar
                  data={{
                    labels: engineerNames,
                    datasets: [
                      {
                        label: "Ongoing Tickets",
                        data: ongoingCounts,
                        backgroundColor: "rgba(75, 192, 192, 0.7)"
                      }
                    ]
                  }}
                />
              </div>
              <div className="flex-1 bg-white rounded shadow p-4">
                <h3 className="text-lg font-semibold text-center mb-2 text-gray-700">
                  Closed Tickets (This Month)
                </h3>
                <Bar
                  data={{
                    labels: engineerNames,
                    datasets: [
                      {
                        label: "Closed Tickets",
                        data: closedCounts,
                        backgroundColor: "rgba(255, 99, 132, 0.7)"
                      }
                    ]
                  }}
                />
              </div>
            </div>
          </div>

          {/* Dashboard Cards */}
          <div className="p-4 px-20 pt-10 font-jura flex flex-col sm:flex-row justify-center gap-10">
            <div className="bg-yellow-200 rounded-xl shadow-md p-10 w-full sm:w-1/2">
              <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center">
                All Pending Ticket Count
              </h2>
              <p className="text-5xl text-center text-gray-700">{pendingTickets.length}</p>
            </div>
            <div className="bg-teal-300 rounded-xl shadow-md p-10 w-full sm:w-1/2">
              <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center">
                All Ongoing Ticket Count
              </h2>
              <p className="text-5xl text-center text-gray-700">{ongoingTickets.length}</p>
            </div>
          </div>

          {/* Pending and Ongoing Tickets */}
          <div className="flex flex-col md:flex-row gap-6 px-20 mt-8 pb-10 font-jura">
            {/* Pending */}
            <div className="w-full md:w-1/2">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">All Pending Tickets</h2>
              <div className="flex space-x-4 mb-4">
                {["service", "faulty"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setPendingTab(tab as any)}
                    className={`px-4 py-2 rounded font-medium ${
                      pendingTab === tab ? (tab === "service" ? "bg-green-600 text-white" : "bg-blue-600 text-white") : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {tab === "service" ? "Service Requests" : "Faulty Tickets"}
                  </button>
                ))}
              </div>
              {filterByType(pendingTickets, pendingTab === "service" ? "Service Request" : "Faulty Ticket").map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => navigate(`/admin-view-pending/${ticket.id}`)}
                  className={`cursor-pointer border-l-4 ${getBorderColor(ticket.type)} p-4 rounded shadow bg-white hover:bg-gray-50 mt-5`}
                >
                  <h3 className={`flex items-center gap-2 font-semibold ${getTextColor(ticket.type)}`}>
                    <FaTicketAlt className="h-5 w-5" />
                    Ticket #{ticket.id} - {ticket.requester_company}
                  </h3>
                  <p className="text-xl text-black">Subject: {ticket.subject}</p>
                  <p className="text-sm text-black">Created By: {ticket.requester_name}</p>
                  <p className="text-sm text-black">Type: {ticket.type}</p>
                  <p className="text-sm text-black">Description: {ticket.description}</p>
                </div>
              ))}
            </div>

            {/* Ongoing */}
            <div className="w-full md:w-1/2">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">All Ongoing Tickets</h2>
              <div className="flex space-x-4 mb-4">
                {["service", "faulty"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setOngoingTab(tab as any)}
                    className={`px-4 py-2 rounded font-medium ${
                      ongoingTab === tab ? (tab === "service" ? "bg-green-600 text-white" : "bg-blue-600 text-white") : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {tab === "service" ? "Service Requests" : "Faulty Tickets"}
                  </button>
                ))}
              </div>
              {filterByType(ongoingTickets, ongoingTab === "service" ? "Service Request" : "Faulty Ticket").map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => navigate(`/admin-viewon/${ticket.id}`)}
                  className={`cursor-pointer border-l-4 ${getBorderColor(ticket.type)} p-4 rounded shadow bg-white hover:bg-gray-50 mt-5`}
                >
                  <h3 className={`flex items-center gap-2 font-semibold ${getTextColor(ticket.type)}`}>
                    <FaTicketAlt className="h-5 w-5" />
                    Ticket #{ticket.id} - {ticket.requester_company}
                  </h3>
                  <p className="text-xl text-black">Subject: {ticket.subject}</p>
                  <p className="text-sm text-black">Created By: {ticket.requester_name}</p>
                  <p className="text-sm text-black">Type: {ticket.type}</p>
                  <p className="text-sm text-black">Description: {ticket.description}</p>
                  <p className="text-sm text-red-600">Assigned Engineer: {ticket.engineer_name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDash;
