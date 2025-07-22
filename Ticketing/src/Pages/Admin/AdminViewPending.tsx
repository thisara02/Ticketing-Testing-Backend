import { useEffect, useState } from "react";
import Sidebar from "../../components/AdminSide";
import Navbar from "../../components/AdminNav";
import { useParams } from "react-router-dom"; // Add at the top

interface Ticket {
  id: string;
  subject: string;
  type: string;
  description: string;
  requester_company:string;
  requester_name: string;
  requester_email: string;
  requester_contact: string;
  created_at: string;
  status: string;
  documents?: string[];
}

interface Comment {
  id: number;
  author: string;
  timestamp: string;
  content: string;
  role: string;
}

const AdminViewPending = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  // Check if URL is image
  const isImage = (url: string) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
  // Check if URL is PDF
  const isPdf = (url: string) => /\.pdf$/i.test(url);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const fetchTicketDetails = async () => {
      if (!ticketId) {
        setError("Ticket ID not provided");
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          setError("Authentication token not found");
          setLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:5000/api/admin/tickets/${ticketId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch ticket: ${response.statusText}`);
        }

        const data = await response.json();
        setTicket(data.ticket);
        setComments(data.comments || []);
      } catch (error) {
        console.error("Error fetching ticket details:", error);
        setError(error instanceof Error ? error.message : "Failed to load ticket details");
      } finally {
        setLoading(false);
      }
    };

    fetchTicketDetails();
    const interval = setInterval(fetchTicketDetails, 10000); // refresh every 10s instead of 1s for perf
    return () => clearInterval(interval);
  }, [ticketId]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex overflow-hidden">
        <div className="flex-shrink-0">
          <Sidebar isOpen={isSidebarOpen} />
        </div>
        <div className="flex-1 flex flex-col h-screen min-h-0">
          <Navbar toggleSidebar={toggleSidebar} />
          <div className="flex-1 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading ticket details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="h-screen w-screen flex overflow-hidden">
        <div className="flex-shrink-0">
          <Sidebar isOpen={isSidebarOpen} />
        </div>
        <div className="flex-1 flex flex-col h-screen min-h-0">
          <Navbar toggleSidebar={toggleSidebar} />
          <div className="flex-1 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <p className="text-red-600 text-lg">{error || "Ticket not found"}</p>
              <button
                onClick={() => window.history.back()}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      <div className="flex-shrink-0">
        <Sidebar isOpen={isSidebarOpen} />
      </div>

      <div className="flex-1 flex flex-col h-screen min-h-0">
        <Navbar toggleSidebar={toggleSidebar} />

        <div className="flex-1 overflow-y-auto bg-gray-100 p-8">
          {/* Header */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Ticket ID: <span className="text-teal-600">{ticket.id} </span>- {ticket.requester_company}
            </h1>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Section (2/3) */}
            <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md space-y-4 ">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Ticket Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 p-4 rounded-md shadow-sm">
                  <p className="text-sm font-semibold text-gray-500">Requester Name</p>
                  <p className="text-base font-medium text-gray-800">{ticket.requester_name}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-md shadow-sm">
                  <p className="text-sm font-semibold text-gray-500">Email</p>
                  <p className="text-base font-medium text-gray-800">{ticket.requester_email}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-md shadow-sm">
                  <p className="text-sm font-semibold text-gray-500">Contact</p>
                  <p className="text-base font-medium text-gray-800">{ticket.requester_contact}</p>
                </div>
              </div>
              <p className="text-gray-600 mt-2 text-m font-medium"><strong>Ticket Type:</strong> {ticket.type}</p>
              <p className="text-red-600 mt-2 text-lg font-medium"><strong>Inquiry Issue :</strong> {ticket.subject}</p>
              <p className="text-gray-600 mt-2 text-m font-medium"><strong>Description:</strong></p>
              <p className="text-gray-800 whitespace-pre-line bg-gray-200 rounded-md p-3">
                {ticket.description}
              </p>
              <p className="text-gray-600 mt-2 text-m font-medium"><strong>Created At:</strong> {new Date(ticket.created_at).toLocaleString()}</p>
              <p className="text-gray-600 mt-2 text-m font-medium"><strong>Status:</strong> {ticket.status}</p>

              {ticket.documents && ticket.documents.length > 0 && (
                <div className="mt-4 text-gray-600">
                  <strong>Attached Documents:</strong>
                  <div className="flex flex-wrap gap-4 mt-2">
                    {ticket.documents.map((doc, i) => {
                      if (isImage(doc)) {
                        return (
                          <img
                            key={i}
                            src={`http://localhost:5000/${doc}`}
                            alt={`Document ${i + 1}`}
                            className="w-32 h-32 object-cover rounded-md shadow-md cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => window.open(`http://localhost:5000/${doc}`, "_blank")}
                          />
                        );
                      } else if (isPdf(doc)) {
                        return (
                          <div
                            key={i}
                            className="w-24 h-32 flex flex-col items-center justify-center border rounded cursor-pointer hover:shadow-lg transition-shadow bg-gray-400"
                            onClick={() => window.open(`http://localhost:5000/${doc}`, "_blank")}
                          >
                            <img
                              src="https://cdn-icons-png.flaticon.com/512/337/337946.png"
                              alt="PDF Icon"
                              className="w-12 h-12 mb-2"
                            />
                          </div>
                        );
                      } else {
                        return (
                          <a
                            key={i}
                            href={`http://localhost:5000/${doc}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            Download {doc.split("/").pop()}
                          </a>
                        );
                      }
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right Section (1/3): Comments */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Comments</h2>
              <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-100 p-3 rounded-md">
                    <p className="text-xs text-blue-500">
                      {comment.author}, {new Date(comment.timestamp).toLocaleString()}
                    </p>
                    <p className="text-m text-gray-700 mb-1">{comment.content}</p>
                  </div>
                ))}
              </div>

              {/* Add Comment */}
              <div className="mt-6">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminViewPending;
