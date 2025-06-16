import { useState } from "react";
import Sidebar from "../../components/EngSide";
import Navbar from "../../components/EngNav";
import { TicketIcon } from "lucide-react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import BannerImage from "../../assets/eng-back.jpg";

const EngDash = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  // Dummy ticket counts
  const totalPendingTickets = 10;
  const myOngoingTickets = 2;

  // Mock pending tickets
  const pendingRequests = [
    {
      id: "#784562",
      subject: "VPN Access Issue",
      customer:"Duosoftware",
      type: "Faulty Ticket",
      description: "User is unable to access VPN services since last night.",
      requesterName: "Thisara Madusanka",
      requesterEmail: "thisaram@lankacom.net",
      requesterContact: "0785509917",
      createdAt: "2025-05-26T09:45:00Z",
    },
    {
      id: "#784545",
      subject: "VPN Access Issue",
      customer:"Duosoftware",
      type: "Faulty Ticket",
      description: "User is unable to access VPN services since last night.",
      requesterName: "Thisara Madusanka",
      requesterEmail: "thisaram@lankacom.net",
      requesterContact: "0785509917",
      createdAt: "2025-05-26T09:45:00Z",
    },
    {
      id: "#987654",
      subject: "Email not syncing",
      customer:"Duosoftware",
      type: "Service Request",
      description: "Outlook is not syncing emails properly.",
      requesterName: "Kavindu Perera",
      requesterEmail: "kavindup@lankacom.net",
      requesterContact: "0771234567",
      createdAt: "2025-05-28T14:30:00Z",
    },
    {
      id: "#123455",
      subject: "VPN Access Issue",
      customer:"Duosoftware",
      type: "Faulty Ticket",
      description: "User is unable to access VPN services since last night.",
      requesterName: "Thisara Madusanka",
      requesterEmail: "thisaram@lankacom.net",
      requesterContact: "0785509917",
      createdAt: "2025-05-26T09:45:00Z",
    },
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

const handleAssign = (id: string) => {
  Swal.fire({
    title: "Assign Ticket",
    text: `Are you sure you want to assign ticket ${id}?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes, assign it!",
    cancelButtonText: "Cancel",
    buttonsStyling: false, // disables default styling
    customClass: {
      confirmButton: "bg-green-500 text-white px-4 py-2 rounded mr-2",
      cancelButton: "bg-gray-100 text-black px-4 py-2 rounded mr-2",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: "Assigned!",
        text: `Ticket ${id} has been assigned.`,
        icon: "success",
        timer: 1000, // auto-close after 2 seconds
        showConfirmButton: false, // hides the confirm button
        buttonsStyling: false,
      });
    }
  });
};



  // Function to get border color based on type
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


  return (
    <div className="h-screen w-screen flex overflow-hidden">
      <div className="flex-shrink-0">
        <Sidebar isOpen={isSidebarOpen} />
      </div>

      <div className="flex-1 flex flex-col h-screen min-h-0">
        <div className="flex-shrink-0">
          <Navbar toggleSidebar={toggleSidebar} />
        </div>

        <div className="flex-1 overflow-y-auto bg-[#DDE6ED]  font-jura">
         
          <div
            className="w-full h-80 bg-cover bg-center relative"
            style={{ backgroundImage: `url(${BannerImage})` }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-50 flex pt-20 justify-left pl-8">
              <h1 className="text-white text-4xl font-bold text-left font-jura">
                Department of<br />Cyber Security Operations<br />Engineer Portal<br />Lanka Communication Services (Pvt.) Ltd
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

          {/* Heading */}
          {/* Container with white background */}
          <div className="bg-white p-6 rounded shadow mx-20">
            {/* Heading */}
            <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center gap-2 font-jura">
              <TicketIcon className="w-7 h-7" />
              Pending Tickets
            </h2>

            {/* Pending Tickets Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" >
              {pendingRequests.map((ticket) => (
                <div
                  key={ticket.id}
                  className={`bg-gray-50 border-l-4  ${getBorderColor(
                    ticket.type
                  )} rounded-lg shadow p-6 relative flex flex-col gap-4`}
                >
                  {/* Ticket Details */}
                  <div className="flex-1 grid grid-cols-1 gap-2 text-gray-700">
                    <div>
                      <p
                        className="font-semibold text-red-600 cursor-pointer hover:underline"
                        onClick={() => navigate("/eng-view-pending")}
                      >
                        <span>Ticket ID: </span>
                        {ticket.id}
                      </p>
                      <p className="text-2xl font-bold">
                        {ticket.customer}
                      </p>
                      <p className="text-m font-bold">
                        <span>Subject: </span>
                        {ticket.subject}
                      </p>
                      <p>
                        <span className="font-semibold">Type: </span>
                        {ticket.type}
                      </p>
                      <p>
                        <span className="font-semibold">Description: </span>
                        {ticket.description}
                      </p>
                    </div>
                    <div>
                      <p>
                        <span className="font-semibold">Requester: </span>
                        {ticket.requesterName}
                      </p>
                      <p>
                        <span className="font-semibold">Email: </span>
                        {ticket.requesterEmail}
                      </p>
                      <p>
                        <span className="font-semibold">Contact: </span>
                        {ticket.requesterContact}
                      </p>
                      <p>
                        <span className="font-semibold">Created At: </span>
                        {new Date(ticket.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Assign Button */}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngDash;
