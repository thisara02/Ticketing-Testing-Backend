import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { FaUser, FaExclamationTriangle, FaFileAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Select from "react-select";

const CreateSR = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  const [selectedSubject, setSelectedSubject] = useState<{ value: string; label: string } | null>(null);

  const inquiryOptions = [
  { value: "Access Point Configurations", label: "Access Point Configurations" },
  { value: "Add/Change/Remove Traffic Shaping Profiles and Policies (QoS)", label: "Add/Change/Remove Traffic Shaping Profiles and Policies (QoS)" },
  { value: "Alert Generation", label: "Alert Generation" },
  { value: "Application & URL Filter Configuration", label: "Application & URL Filter Configuration" },
  { value: "Backup", label: "Backup" },
  { value: "Certificate Import/Export Install", label: "Certificate Import/Export Install" },
  { value: "Change User Password", label: "Change User Password" },
  { value: "Cloud Configurations and Report Generation", label: "Cloud Configurations and Report Generation" },
  { value: "Compliance", label: "Compliance" },
  { value: "Create/Modify/Delete Administrator Account", label: "Create/Modify/Delete Administrator Account" },
  { value: "Create/Modify/Delete IP Address", label: "Create/Modify/Delete IP Address" },
  { value: "Create/Modify/Delete MAC Address", label: "Create/Modify/Delete MAC Address" },
  { value: "Create/Modify/Delete User", label: "Create/Modify/Delete User" },
  { value: "DCHP", label: "DCHP" },
  { value: "DiallUp Tunnel Configuration", label: "DiallUp Tunnel Configuration" },
  { value: "DNS Configuration", label: "DNS Configuration" },
  { value: "Documentation (Customer)", label: "Documentation (Customer)" },
  { value: "Documentation (Internal)", label: "Documentation (Internal)" },
  { value: "DOS Policy Configuration", label: "DOS Policy Configuration" },
  { value: "Enable Two-Factor-Authentication", label: "Enable Two-Factor-Authentication" },
  { value: "Feasibility Study", label: "Feasibility Study" },
  { value: "File Filter Configuration", label: "File Filter Configuration" },
  { value: "Firmware Flash", label: "Firmware Flash" },
  { value: "Firmware OS Upgrade", label: "Firmware OS Upgrade" },
  { value: "HA Configurations", label: "HA Configurations" },
  { value: "HA requirement", label: "HA requirement" },
  { value: "Hardware Test", label: "Hardware Test" },
  { value: "House Keeping", label: "House Keeping" },
  { value: "Interface Configuration", label: "Interface Configuration" },
  { value: "IP - MAC Bind", label: "IP - MAC Bind" },
  { value: "IP Sec Tunnel Configuration", label: "IP Sec Tunnel Configuration" },
  { value: "IPS Configurations", label: "IPS Configurations" },
  { value: "IPv4 Policy Configuration", label: "IPv4 Policy Configuration" },
  { value: "License Renewal", label: "License Renewal" },
  { value: "Link Changes", label: "Link Changes" },
  { value: "Load Balancing Configuration", label: "Load Balancing Configuration" },
  { value: "Meeting", label: "Meeting" },
  { value: "MIS", label: "MIS" },
  { value: "Migration", label: "Migration" },
  { value: "Multicast", label: "Multicast" },
  { value: "Multicast Path Changes", label: "Multicast Path Changes" },
  { value: "NAT - DNAT configuration", label: "NAT - DNAT configuration" },
  { value: "NAT - New DNAT configuration", label: "NAT - New DNAT configuration" },
  { value: "NAT - New SNAT configuration", label: "NAT - New SNAT configuration" },
  { value: "NAT - SNAT configuration changes", label: "NAT - SNAT configuration changes" },
  { value: "New Firewall Deployment", label: "New Firewall Deployment" },
  { value: "New Router Configuration (Customers/Node)", label: "New Router Configuration (Customers/Node)" },
  { value: "Node Issues", label: "Node Issues" },
  { value: "Other", label: "Other" },
  { value: "OSPF/BGP Changes in Nodes", label: "OSPF/BGP Changes in Nodes" },
  { value: "Reboot", label: "Reboot" },
  { value: "Remote Support", label: "Remote Support" },
  { value: "Report Generation", label: "Report Generation" },
  { value: "Resource / Logs Monitoring", label: "Resource / Logs Monitoring" },
  { value: "Routing I Added", label: "Routing I Added" },
  { value: "Routing I Changed", label: "Routing I Changed" },
  { value: "Routing I Issue", label: "Routing I Issue" },
  { value: "Routing - Policy Route Configurations", label: "Routing - Policy Route Configurations" },
  { value: "Routing - Static Route Configurations", label: "Routing - Static Route Configurations" },
  { value: "Routing Protocol I OSPF", label: "Routing Protocol I OSPF" },
  { value: "Rule Optimization", label: "Rule Optimization" },
  { value: "SD WAN Configuration", label: "SD WAN Configuration" },
  { value: "Security I Other", label: "Security I Other" },
  { value: "Security I Report Generate", label: "Security I Report Generate" },
  { value: "Security I Vulnerability Scan", label: "Security I Vulnerability Scan" },
  { value: "Security IPenetration Testing", label: "Security IPenetration Testing" },
  { value: "Services / Ports - Create/Edit/Delete", label: "Services / Ports - Create/Edit/Delete" },
  { value: "Special Event", label: "Special Event" },
  { value: "SSL VPN Client Configuration", label: "SSL VPN Client Configuration" },
  { value: "SSL VPN Configuration", label: "SSL VPN Configuration" },
  { value: "System Change (Customers/Nodes)", label: "System Change (Customers/Nodes)" },
  { value: "TAC Ticket - Global", label: "TAC Ticket - Global" },
  { value: "TAC Ticket - Local", label: "TAC Ticket - Local" },
  { value: "Testing", label: "Testing" },
  { value: "Training", label: "Training" },
  { value: "Upstream [AirTel / Dialog / SLT ]", label: "Upstream [AirTel / Dialog / SLT ]" },
  { value: "Upstream Traffic Change", label: "Upstream Traffic Change" },
  { value: "User Authentication LDAP Configuration", label: "User Authentication LDAP Configuration" },
  { value: "User Authentication RADIUS Configuration", label: "User Authentication RADIUS Configuration" },
  { value: "User Authentication SSO Configuration", label: "User Authentication SSO Configuration" },
  { value: "Video Filter Configuration", label: "Video Filter Configuration" },
  { value: "Virtual IP Configuration", label: "Virtual IP Configuration" },
  { value: "VLAN Configuration", label: "VLAN Configuration" },
  { value: "Web Filter Configuration", label: "Web Filter Configuration" },
  { value: "Whitelist / Blacklist Application", label: "Whitelist / Blacklist Application" },
  { value: "Whitelist Blacklist I-IRUIP", label: "Whitelist Blacklist I-IRUIP" },
  { value: "Work Assigned", label: "Work Assigned" },
  { value: "ZTNA Configuration", label: "ZTNA Configuration" }
];

  // Form fields
  const [fullName, setFullName] = useState("");
  const [designation, setDesignation] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [company, setCompany] = useState("");
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
                timer: 1500,
                showConfirmButton: false,
              });
              navigate("/login");
            }
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          setFullName(data.name || "");
          setCompany(data.company || "");
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
  const handleSubmit = async (override = false) => {
  if (!selectedSubject || !description || !priority) {
    Swal.fire({
      icon: "warning",
      title: "All fields are required!",
      text: "Please complete all fields before submitting.",
      timer: 1500,
      showConfirmButton: false,
    });
    return;
  }

  const formData = new FormData();
  formData.append("subject", selectedSubject?.value || "");
  formData.append("description", description);
  formData.append("priority", priority);
  if (file) formData.append("document", file);
  if (override) formData.append("override", "true"); // ✅ Only if override is confirmed

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
    const data = error.response?.data;

    // 🔁 If server returns quota warning with override option
    if (error.response?.status === 409 && data?.allow_override) {
      Swal.fire({
        title: "Quota Exceeded",
        html: data.warning || "You are allowed to submit one extra SR this month.<br>Proceed?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Proceed Anyway",
        cancelButtonText: "Cancel",
        customClass: {
          confirmButton: 'bg-green-500 hover:bg-green-600 text-black font-semibold px-4 py-2 rounded mr-2',
          cancelButton: 'bg-gray-300 hover:bg-gray-400 text-black font-semibold px-4 py-2 rounded',
        },
        buttonsStyling: false, // important to allow Tailwind styles to apply
      }).then((result) => {
        if (result.isConfirmed) {
          handleSubmit(true); // 🔁 Call again with override=true
        }
      });
    } else if (data?.show_add_bundle_prompt) {
        Swal.fire({
          title: "Attention!",
          html: `
            <p class="text-lg font-semibold text-gray-800">
              ${data.error}
            </p>
            <p class="mt-4 text-lg text-gray-600">
              Would you like to add additional Service Request Bundles?<br>
            </p>
            <p class="mt-4 text-sm text-red-600">
              <strong>Note:</strong> Additional bundle charges will be added to your monthly bill, in addition to the support type you already purchased.
            </p>
          `,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Proceed to Add Additional ",
          cancelButtonText: "Cancel",
          customClass: {
            confirmButton:
              "bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded mr-2",
            cancelButton:
              "bg-gray-300 hover:bg-gray-400 text-black font-semibold px-4 py-2 rounded",
          },
          buttonsStyling: false,
        }).then((result) => {
          if (result.isConfirmed) {
            // 👇 Call your bundle function or open modal here
            // Example: setShowAddBundleModal(true);
            console.log("User wants to add bundle");
            navigate("/add-bundle");
            // Or directly call a function like:
            // await handleAddBundleSubmit();
          }
        });
      }
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
                  placeholder="Company"
                  value={company}
                  readOnly
                  onChange={(e) => setCompany(e.target.value)}
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
               <div className="w-full md:w-1/2">
                <Select
                  options={inquiryOptions}
                  value={selectedSubject}
                  onChange={(option) => setSelectedSubject(option)}
                  placeholder="Select Inquiry Type"
                  isSearchable
                  className="font-jura text-m text-black"
                  classNamePrefix="react-select"
                />
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
                onClick={() => handleSubmit()}
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
