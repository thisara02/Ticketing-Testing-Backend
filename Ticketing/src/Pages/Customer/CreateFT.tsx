import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { FaUser, FaExclamationTriangle, FaFileAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

const CreateFaultyRequest = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [designation, setDesignation] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // Priority color mapping
  const priorityColors: Record<string, string> = {
    Critical: "text-red-500",
    High: "text-orange-500",
    Medium: "text-yellow-500",
    Low: "text-green-600",
  };

  // Fetch user info from backend on mount using fetch
  useEffect(() => {
    const token = localStorage.getItem("cusToken");
    if (token) {
      fetch("http://localhost:5000/api/ticket/userinfo", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(async (res) => {
          if (!res.ok) {
            if (res.status === 401) {
              Swal.fire({
                icon: "error",
                title: "Session expired",
                text: "Please login again.",
              });
              navigate("/login");
            }
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          setFullName(data.name || "");
          setDesignation(data.designation || "");
          setEmail(data.email || "");
          setMobile(data.mobile || "");
        })
        .catch((error) => {
          console.error("Failed to fetch user info:", error);
        });
    }
  }, [navigate]);

  // Submit handler (still using axios for POST)
  const handleSubmit = async () => {
  if (!subject || !description || !priority) {
    Swal.fire({
      icon: "warning",
      title: "All fields are required!",
      text: "Please complete all fields before submitting.",
    });
    return;
  }

  const formData = new FormData();
  formData.append("subject", subject);
  formData.append("description", description);
  formData.append("priority", priority);
  if (file) formData.append("document", file); // ✅ Make sure it's named "document"

  try {
    const res = await axios.post(
      "http://localhost:5000/api/ticket/ft",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("cusToken")}`,
        },
      }
    );

    console.log("Success:", res.data);
    Swal.fire({
      title: "Faulty Ticket Created",
      text: "Your request was successfully submitted.",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
    });
    setTimeout(() => navigate("/home"), 1500);
  } catch (error: any) {
    console.error("Error creating request:", error.response?.data || error.message);
    Swal.fire({
      title: "Error",
      text: error.response?.data?.error || "Something went wrong.",
      icon: "error",
    });
  }
};

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      {/* Sidebar */}
      <div className="flex-shrink-0">
        <Sidebar isOpen={isSidebarOpen} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen min-h-0">
        <div className="flex-shrink-0">
          <Navbar toggleSidebar={toggleSidebar} />
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-8 rounded-xl shadow-md space-y-10">
          {/* Page Heading */}
          <div className="mb-8 bg-white p-6 rounded-lg shadow-md mx-10 mt-5">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 border-b-4 border-blue-500 inline-block pb-2 font-jura">
              Create New Faulty Ticket
            </h1>
            <p className="text-gray-600 mt-2 text-sm md:text-base font-jura">
              Fill out the details below to create a new Faulty Ticket.
            </p>

            {/* Section 1: Requester Information */}
            <div>
              <h2 className="flex items-center text-xl font-semibold text-gray-800 mb-4 mt-8 font-jura">
                <FaUser className="mr-2 text-blue-600" />
                Requester Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  readOnly
                  onChange={(e) => setFullName(e.target.value)}
                  className="cursor-not-allowed w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-800 font-jura"
                />
                <input
                  type="text"
                  placeholder="Designation"
                  value={designation}
                  readOnly
                  onChange={(e) => setDesignation(e.target.value)}
                  className="cursor-not-allowed w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-800 font-jura"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  readOnly
                  onChange={(e) => setEmail(e.target.value)}
                  className="cursor-not-allowed w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-800 font-jura"
                />
                <input
                  type="text"
                  placeholder="Contact Number"
                  value={mobile}
                  readOnly
                  onChange={(e) => setMobile(e.target.value)}
                  className="cursor-not-allowed w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-800 font-jura"
                />
              </div>
            </div>

            {/* Section 2: Incident Info */}
            <div>
              <h2 className="flex items-center text-xl font-semibold text-gray-800 mb-4 mt-8 font-jura">
                <FaExclamationTriangle className="mr-2 text-yellow-500" />
                Incident Related Info
              </h2>
              <div className="space-y-4">
                <div className="mb-4">
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-1/2 px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-800 font-jura"
                  >
                    <option value="" disabled selected>- Select Inquiry Type -</option>
                    <option value="Firewall down or unreachable">Firewall down or unreachable</option>
                    <option value="Firewall rule not working">Firewall rule not working</option>
                    <option value="Firmware/OS corruption">Firmware/OS corruption</option>
                    <option value="HA / failover issue">HA / failover issue</option>
                    <option value="High CPU or memory usage">High CPU or memory usage</option>
                    <option value="Interface down or flapping">Interface down or flapping</option>
                    <option value="License failure">License failure</option>
                    <option value="Logging failure">Logging failure</option>
                    <option value="NAT failure">NAT failure</option>
                    <option value="Packet drops or session timeouts">Packet drops or session timeouts</option>
                    <option value="Routing problem">Routing problem</option>
                    <option value="Security service not functioning">Security service not functioning</option>
                    <option value="Traffic disruption">Traffic disruption</option>
                    <option value="Unexpected reboot">Unexpected reboot</option>
                    <option value="VPN connection failure">VPN connection failure</option>
                  </select>
                </div>

                <textarea
                  rows={5}
                  placeholder="Describe the issue in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-800 font-jura"
                ></textarea>

                <div className="mb-6 ml-2">
                  <label className="block text-gray-700 font-medium mb-2 font-jura">Priority</label>
                  <div className="flex flex-wrap gap-6">
                    {["Critical", "High", "Medium", "Low"].map((level) => (
                      <label key={level} className="inline-flex items-center font-jura">
                        <input
                          type="radio"
                          name="priority"
                          value={level}
                          checked={priority === level}
                          onChange={() => setPriority(level)}
                          className="appearance-none w-4 h-4 border border-gray-400 rounded-full bg-white checked:bg-blue-500 checked:border-black focus:outline-none"
                        />
                        <span className={`ml-2 font-semibold ${priorityColors[level]}`}>{level}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Attachments */}
            <div>
              <h2 className="flex items-center text-xl font-semibold text-gray-800 mb-4 mt-10 font-jura">
                <FaFileAlt className="mr-2 text-blue-600" />
                Related Documents
              </h2>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block w-full text-gray-700 bg-white border border-gray-300 rounded-md cursor-pointer py-2 px-3 font-jura"
              />
            </div>

            {/* Submit Button */}
            <div className="text-left">
              <button 
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 transition mt-10 p-5 font-jura">
                Submit Request
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateFaultyRequest;
