import { useState } from "react";
import Sidebar from "../../components/EngSide";
import Navbar from "../../components/EngNav";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const EngCloseTicket = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // Example ticket ID
  const ticket = { id: "#784562" };

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const navigate = useNavigate();

  const handleClose = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // The browser automatically validates required fields before this is called

    Swal.fire({
      icon: "success",
      title: `Ticket ${ticket.id} closed successfully!`,
      showConfirmButton: false,
      timer: 1000,
    }).then(() => {
      navigate("/eng-myticket");
    });
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

        <div className="flex-1 overflow-y-auto bg-gray-100 p-8 font-jura">
          {/* White box at the top */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Close Ticket {ticket.id}
            </h2>

            {/* Two-column form */}
            <form
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              onSubmit={handleClose}
            >
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Actual Rectification Date and Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-black [color-scheme:light]"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Work Done Comments
                  </label>
                  <textarea
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-black"
                    rows={4}
                    placeholder="Add any final notes here..."
                  />
                </div>
              </div>

              {/* Full-width Close button spanning both columns */}
              <div className="md:col-span-2 flex justify-center">
                <button
                  type="submit"
                  className="w-1/2 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngCloseTicket;
