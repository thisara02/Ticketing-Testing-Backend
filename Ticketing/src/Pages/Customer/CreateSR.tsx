import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { FaUser, FaExclamationTriangle, FaFileAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CreateSR = () => {
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
      "http://localhost:5000/api/ticket/sr",
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
      title: "Service Request Created",
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
      <div className="flex-shrink-0">
        <Sidebar isOpen={isSidebarOpen} />
      </div>

      <div className="flex-1 flex flex-col h-screen min-h-0">
        <div className="flex-shrink-0">
          <Navbar toggleSidebar={toggleSidebar} />
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-100 p-8 rounded-xl shadow-md space-y-10">
          <div className="mb-8 bg-white p-6 rounded-lg shadow-md mx-10 mt-5">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 border-b-4 border-teal-500 inline-block pb-2 font-jura">
              Create New Service Request
            </h1>
            <p className="text-gray-600 mt-2 text-sm md:text-base font-jura">
              Fill out the details below to create a new service request.
            </p>

            {/* Requester Info */}
            <div>
              <h2 className="flex items-center text-xl font-semibold text-gray-800 mb-4 mt-8 font-jura">
                <FaUser className="mr-2 text-teal-600" />
                Requester Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  readOnly
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-200 text-gray-800 font-jura cursor-not-allowed"
                />
                <input
                  type="text"
                  placeholder="Designation"
                  value={designation}
                  readOnly
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-200 text-gray-800 font-jura cursor-not-allowed"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  readOnly
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-200 text-gray-800 font-jura cursor-not-allowed"
                />
                <input
                  type="text"
                  placeholder="Contact Number"
                  value={mobile}
                  readOnly
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-200 text-gray-800 font-jura cursor-not-allowed"
                />
              </div>
            </div>

            {/* Incident Info */}
            <div>
              <h2 className="flex items-center text-xl font-semibold text-gray-800 mb-4 mt-8 font-jura">
                <FaExclamationTriangle className="mr-2 text-yellow-500" />
                Incident Related Info
              </h2>
              <div className="space-y-4">
                <div>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-1/2 px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-800 font-jura"
                  >
                    <option value="" disabled>- Select Inquiry Type -</option>
                    <option value="Access Point Configurations">Access Point Configurations</option>
                    <option value="Add/Change/Remove Traffic Shaping Profiles and Policies (QoS)">Add/Change/Remove Traffic Shaping Profiles and Policies (QoS)</option>
                    <option value="Alert Generation">Alert Generation</option>
                    <option value="Application & URL Filter Configuration">Application & URL Filter Configuration</option>
                    <option value="Backup">Backup</option>
                    <option value="Certificate Import/Export Install">Certificate Import/Export Install</option>
                    <option value="Change User Password">Change User Password</option>
                    <option value="Cloud Configurations and Report Generation">Cloud Configurations and Report Generation</option>
                    <option value="Compliance">Compliance</option>
                    <option value="Create/Modify/Delete Administrator Account">Create/Modify/Delete Administrator Account</option>
                    <option value="Create/Modify/Delete IP Address">Create/Modify/Delete IP Address</option>
                    <option value="Create/Modify/Delete MAC Address">Create/Modify/Delete MAC Address</option>
                    <option value="Create/Modify/Delete User">Create/Modify/Delete User</option>
                    <option value="DCHP">DCHP</option>
                    <option value="DiallUp Tunnel Configuration">DiallUp Tunnel Configuration</option>
                    <option value="DNS Configuration">DNS Configuration</option>
                    <option value="Documentation (Customer)">Documentation (Customer)</option>
                    <option value="Documentation (Internal)">Documentation (Internal)</option>
                    <option value="DOS Policy Configuration">DOS Policy Configuration</option>
                    <option value="Enable Two-Factor-Authentication">Enable Two-Factor-Authentication</option>
                    <option value="Feasibility Study">Feasibility Study</option>
                    <option value="File Filter Configuration">File Filter Configuration</option>
                    <option value="Firmware Flash">Firmware Flash</option>
                    <option value="Firmware OS Upgrade">Firmware OS Upgrade</option>
                    <option value="HA Configurations">HA Configurations</option>
                    <option value="HA requirement">HA requirement</option>
                    <option value="Hardware Test">Hardware Test</option>
                    <option value="House Keeping">House Keeping</option>
                    <option value="Interface Configuration">Interface Configuration</option>
                    <option value="IP - MAC Bind">IP - MAC Bind</option>
                    <option value="IP Sec Tunnel Configuration">IP Sec Tunnel Configuration</option>
                    <option value="IPS Configurations">IPS Configurations</option>
                    <option value="IPv4 Policy Configuration">IPv4 Policy Configuration</option>
                    <option value="License Renewal">License Renewal</option>
                    <option value="Link Changes">Link Changes</option>
                    <option value="Load Balancing Configuration">Load Balancing Configuration</option>
                    <option value="Meeting">Meeting</option>
                    <option value="MIS">MIS</option>
                    <option value="Migration">Migration</option>
                    <option value="Multicast">Multicast</option>
                    <option value="Multicast Path Changes">Multicast Path Changes</option>
                    <option value="NAT - DNAT configuration">NAT - DNAT configuration</option>
                    <option value="NAT - New DNAT configuration">NAT - New DNAT configuration</option>
                    <option value="NAT - New SNAT configuration">NAT - New SNAT configuration</option>
                    <option value="NAT - SNAT configuration changes">NAT - SNAT configuration changes</option>
                    <option value="New Firewall Deployment">New Firewall Deployment</option>
                    <option value="New Router Configuration (Customers/Node)">New Router Configuration (Customers/Node)</option>
                    <option value="Node Issues">Node Issues</option>
                    <option value="Other">Other</option>
                    <option value="OSPF/BGP Changes in Nodes">OSPF/BGP Changes in Nodes</option>
                    <option value="Reboot">Reboot</option>
                    <option value="Remote Support">Remote Support</option>
                    <option value="Report Generation">Report Generation</option>
                    <option value="Resource / Logs Monitoring">Resource / Logs Monitoring</option>
                    <option value="Routing I Added">Routing I Added</option>
                    <option value="Routing I Changed">Routing I Changed</option>
                    <option value="Routing I Issue">Routing I Issue</option>
                    <option value="Routing - Policy Route Configurations">Routing - Policy Route Configurations</option>
                    <option value="Routing - Static Route Configurations">Routing - Static Route Configurations</option>
                    <option value="Routing Protocol I OSPF">Routing Protocol I OSPF</option>
                    <option value="Rule Optimization">Rule Optimization</option>
                    <option value="SD WAN Configuration">SD WAN Configuration</option>
                    <option value="Security I Other">Security I Other</option>
                    <option value="Security I Report Generate">Security I Report Generate</option>
                    <option value="Security I Vulnerability Scan">Security I Vulnerability Scan</option>
                    <option value="Security IPenetration Testing">Security IPenetration Testing</option>
                    <option value="Services / Ports - Create/Edit/Delete">Services / Ports - Create/Edit/Delete</option>
                    <option value="Special Event">Special Event</option>
                    <option value="SSL VPN Client Configuration">SSL VPN Client Configuration</option>
                    <option value="SSL VPN Configuration">SSL VPN Configuration</option>
                    <option value="System Change (Customers/Nodes)">System Change (Customers/Nodes)</option>
                    <option value="TAC Ticket - Global">TAC Ticket - Global</option>
                    <option value="TAC Ticket - Local">TAC Ticket - Local</option>
                    <option value="Testing">Testing</option>
                    <option value="Training">Training</option>
                    <option value="Upstream [AirTel 1 Dialog f SLT ]">Upstream [AirTel / Dialog / SLT ]</option>
                    <option value="Upstream Traffic Change">Upstream Traffic Change</option>
                    <option value="User Authentication LDAP Configuration">User Authentication LDAP Configuration</option>
                    <option value="User Authentication RADIUS Configuration">User Authentication RADIUS Configuration</option>
                    <option value="User Authentication SSO Configuration">User Authentication SSO Configuration</option>
                    <option value="Video Filter Configuration">Video Filter Configuration</option>
                    <option value="Virtual IP Configuration">Virtual IP Configuration</option>
                    <option value="VLAN Configuration">VLAN Configuration</option>
                    <option value="Web Filter Configuration">Web Filter Configuration</option>
                    <option value="Whitelist / Blacklist Application">Whitelist / Blacklist Application</option>
                    <option value="Whitelist Blacklist I-IRUIP">Whitelist Blacklist I-IRUIP</option>
                    <option value="Work Assigned">Work Assigned</option>
                    <option value="ZTNA Configuration">ZTNA Configuration</option>
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
                  <label
                    className="block text-gray-700 font-medium mb-2 font-jura"
                  >
                    Priority
                  </label>
                  <div className="flex flex-wrap gap-6">
                    {["Critical", "High", "Medium", "Low"].map((level) => (
                      <label
                        key={level}
                        className="inline-flex items-center font-jura"
                      >
                        <input
                          type="radio"
                          name="priority"
                          value={level}
                          checked={priority === level}
                          onChange={() => setPriority(level)}
                          className="appearance-none w-4 h-4 border border-gray-400 rounded-full bg-white checked:bg-blue-500 checked:border-black focus:outline-none"
                        />
                        <span
                          className={`ml-2 font-semibold ${priorityColors[level]}`}
                        >
                          {level}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Attachments */}
            <div>
              <h2 className="flex items-center text-xl font-semibold text-gray-800 mb-4 mt-10 font-jura">
                <FaFileAlt className="mr-2 text-teal-600" />
                Related Documents
              </h2>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block w-full text-gray-700 bg-white border border-gray-300 rounded-md cursor-pointer py-2 px-3 font-jura"
              />
            </div>

            {/* Submit */}
            <div className="text-left">
              <button
                onClick={handleSubmit}
                className="bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 transition mt-10 p-5 font-jura"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSR;
