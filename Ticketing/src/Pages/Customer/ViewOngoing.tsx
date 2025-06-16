import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

const ViewOngoing = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [commentText, setCommentText] = useState("");

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);


    // Sample data
    const ticket = {
        id: "#784562",
        subject: "VPN Access Issue",
        type: "Faulty Ticket",
        description: "User is unable to access VPN services since last night.",
        requesterName: "Thisara Madusanka",
        requesterEmail: "thisaram@lankacom.net",
        requesterContact: "0785509917",
        createdAt: "2025-05-26T09:45:00Z",
        status: "Ongoing",
        documents: ["vpn_error_screenshot.png"],
        engineerName: "Madura Jayasundara",
        engineerContact: "0740563227",
    };

    const comments = [
        {
        id: 1,
        author: "Engineer D",
        timestamp: "2025-05-26T12:00:00Z",
        content: "Investigating the VPN gateway issue.",
        },
        {
        id: 2,
        author: "Alice Johnson",
        timestamp: "2025-05-26T14:15:00Z",
        content: "Please prioritize, it’s impacting work.",
        },
        {
        id: 1,
        author: "Engineer D",
        timestamp: "2025-05-26T12:00:00Z",
        content: "Investigating the VPN gateway issue.",
        },
        {
        id: 2,
        author: "Alice Johnson",
        timestamp: "2025-05-26T14:15:00Z",
        content: "Please prioritize, it’s impacting work.",
        },
        {
        id: 1,
        author: "Engineer D",
        timestamp: "2025-05-26T12:00:00Z",
        content: "Investigating the VPN gateway issue.",
        },
        {
        id: 2,
        author: "Alice Johnson",
        timestamp: "2025-05-26T14:15:00Z",
        content: "Please prioritize, it’s impacting work.",
        },
        
    ];

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
                Ticket ID: <span className="text-teal-600">{ticket.id}</span>
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
                        <p className="text-base font-medium text-gray-800">{ticket.requesterName}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-md shadow-sm">
                        <p className="text-sm font-semibold text-gray-500">Email</p>
                        <p className="text-base font-medium text-gray-800">{ticket.requesterEmail}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-md shadow-sm">
                        <p className="text-sm font-semibold text-gray-500">Contact</p>
                        <p className="text-base font-medium text-gray-800">{ticket.requesterContact}</p>
                    </div>
                </div>
                <p className="text-gray-600 mt-2 text-m font-medium"><strong>Ticket Type:</strong> {ticket.type}</p>
                <p className="text-red-600 mt-2 text-lg font-medium"><strong>Inquiry Issue :</strong> {ticket.subject}</p>
                <p className="text-gray-600 mt-2 text-m font-medium"><strong>Description:</strong> {ticket.description}</p>
                <p className="text-gray-600 mt-2 text-m font-medium"><strong>Created At:</strong> {new Date(ticket.createdAt).toLocaleString()}</p>
                <p className="text-gray-600 mt-2 text-m font-medium"><strong>Status:</strong> {ticket.status}</p>
                {ticket.documents.length > 0 && (
                    <p className="text-gray-600 mt-2 text-m font-medium">
                    <strong>Documents:</strong>{" "}
                    {ticket.documents.map((doc, i) => (
                        <a key={i} href="#" className="text-blue-600 underline mr-2">{doc}</a>
                    ))}
                    </p>
                )}
                <p className="text-green-600 mt-2 text-m font-medium"><strong>Assigned Engineer : </strong> {ticket.engineerName}</p>
                <p className="text-green-600 mt-2 text-m font-medium"><strong>Engineer Contact Number :  </strong> {ticket.engineerContact}</p>
                </div>

                {/* Right Section (1/3): Comments */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Comments</h2>
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                    {comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-100 p-3 rounded-md">
                        <p className="text-xs text-gray-500">
                        {comment.author}, {new Date(comment.timestamp).toLocaleString()}
                        </p>
                        <p className="text-m text-gray-700 mb-1">{comment.content}</p>
                    </div>
                    ))}
                </div>

                {/* Add Comment */}
                <div className="mt-6">
                    <textarea
                    rows={3}
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md mb-2 bg-white text-black"
                    ></textarea>
                    <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-400 transition"
                    onClick={() => {
                        if (commentText.trim()) {
                        alert(`Comment posted: ${commentText}`);
                        setCommentText("");
                        }
                    }}
                    >
                    Post Comment
                    </button>
                </div>
                </div>
            </div>
            </div>
        </div>
        </div>
    );
    };

export default ViewOngoing;
