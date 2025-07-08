import { useEffect, useState } from "react";
import Sidebar from "../../components/EngSide";
import Navbar from "../../components/EngNav";
import { FaExclamationTriangle } from "react-icons/fa";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

const CreateSREngineer = () => {
  const navigate = useNavigate();

  // Sidebar open toggle
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  // Inquiry options (same as customer)
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

  // Form states
  const [companyOptions, setCompanyOptions] = useState<{ label: string; value: string }[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<{ label: string; value: string } | null>(null);

  const [customerOptions, setCustomerOptions] = useState<{ label: string; value: string }[]>([]);
  const [fullCustomerList, setFullCustomerList] = useState<
    {
      id: number;
      label: string;
      value: string;
      email: string;
      designation: string;
      mobile: string;
    }[]
  >([]);
  const [selectedCustomer, setSelectedCustomer] = useState<{ label: string; value: string } | null>(null);

  const [customerEmail, setCustomerEmail] = useState("");
  const [customerContact, setCustomerContact] = useState("");

  const [selectedSubject, setSelectedSubject] = useState<{ value: string; label: string } | null>(null);

  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");

  const [file, setFile] = useState<File | null>(null);

  const [engineerName, setEngineerName] = useState("");
  const [engineerContact, setEngineerContact] = useState("");

  const priorityColors: Record<string, string> = {
    Critical: "text-red-500",
    High: "text-orange-500",
    Medium: "text-yellow-500",
    Low: "text-green-600",
  };

  // Fetch companies + engineer info on mount
  useEffect(() => {
    const token = localStorage.getItem("engToken");
    if (!token) {
      Swal.fire({ icon: "error", title: "Please login", timer: 1500, showConfirmButton: false });
      navigate("/login");
      return;
    }

    // Companies
    fetch("http://localhost:5000/api/engineer/companies", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch companies");
        return res.json();
      })
      .then((data) => setCompanyOptions(data))
      .catch((err) => console.error(err));

    // Engineer info
    fetch("http://localhost:5000/api/engineer/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch engineer info");
        return res.json();
      })
      .then((data) => {
        setEngineerName(data.name || "");
        setEngineerContact(data.contact || "");
      })
      .catch((err) => console.error(err));
  }, [navigate]);

  // Fetch customers on company change
  useEffect(() => {
    if (!selectedCompany) {
      setCustomerOptions([]);
      setFullCustomerList([]);
      setSelectedCustomer(null);
      setCustomerEmail("");
      setCustomerContact("");
      return;
    }
    const token = localStorage.getItem("engToken");
    fetch(`http://localhost:5000/api/engineer/customers/${encodeURIComponent(selectedCompany.value)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch customers");
        return res.json();
      })
      .then((data) => {
        setFullCustomerList(data);
        setCustomerOptions(data.map((c: { label: any; value: any; }) => ({ label: c.label, value: c.value })));
      })
      .catch((err) => console.error(err));
    setSelectedCustomer(null);
    setCustomerEmail("");
    setCustomerContact("");
  }, [selectedCompany]);

  // Autofill customer email/contact on customer select
  useEffect(() => {
    if (!selectedCustomer) {
      setCustomerEmail("");
      setCustomerContact("");
      return;
    }
    const cust = fullCustomerList.find((c) => c.value === selectedCustomer.value);
    if (cust) {
      setCustomerEmail(cust.email);
      setCustomerContact(cust.mobile);
    } else {
      setCustomerEmail("");
      setCustomerContact("");
    }
  }, [selectedCustomer, fullCustomerList]);

  // Submit handler
const handleSubmit = async (override = false) => {
  if (!selectedCompany || !selectedCustomer || !selectedSubject || !description || !priority) {
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
  formData.append("requester_company", selectedCompany.value);
  formData.append("requester_name", selectedCustomer.value);
  formData.append("requester_email", customerEmail);
  formData.append("requester_contact", customerContact);
  formData.append("subject", selectedSubject.value);
  formData.append("description", description);
  formData.append("priority", priority);
  formData.append("engineer_name", engineerName);
  formData.append("engineer_contact", engineerContact);
  if (file) formData.append("document", file);
  if (override) formData.append("override", "true");

  try {
    const token = localStorage.getItem("engToken");

    const response = await fetch("http://localhost:5000/api/engineer/create-sr", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      Swal.fire({
        title: "Service Request Created",
        text: "Your request was successfully submitted.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      setTimeout(() => navigate("/eng-dash"), 1500);
    } else if (response.status === 409 && data?.allow_override) {
      Swal.fire({
        title: "Quota Exceeded",
        html: data.warning || "You are allowed to submit one extra SR this month.<br>Proceed?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Proceed Anyway",
        cancelButtonText: "Cancel",
        customClass: {
          confirmButton: "bg-green-500 hover:bg-green-600 text-black font-semibold px-4 py-2 rounded mr-2",
          cancelButton: "bg-gray-300 hover:bg-gray-400 text-black font-semibold px-4 py-2 rounded",
        },
        buttonsStyling: false,
      }).then((result) => {
        if (result.isConfirmed) {
          handleSubmit(true);
        }
      });
    } else {
      Swal.fire({
        title: "Attention!",
        text: data?.error || "Something went wrong.",
        icon: "error",
        customClass: {
          confirmButton: "bg-green-500 hover:bg-green-600 text-black font-semibold px-4 py-2 rounded mr-2",
        },
      });
    }
  } catch (error) {
    Swal.fire({
      title: "Error!",
      text: "Network error or server unreachable.",
      icon: "error",
    });
    console.error("Submission failed:", error);
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

            {/* Select Company */}
            <div className="mt-8 w-full md:w-1/2 text-black">
              <label className="font-jura font-semibold mb-1 block">
                Select Company
              </label>
              <Select
                options={companyOptions}
                value={selectedCompany}
                onChange={(option) => setSelectedCompany(option)}
                placeholder="Select Company"
                isSearchable
                className="font-jura text-black"
                classNamePrefix="react-select"
              />
            </div>

            {/* Select Customer */}
            <div className="mt-6 w-full md:w-1/2 text-black">
              <label className="font-jura font-semibold mb-1 block">
                Select Customer
              </label>
              <Select
                options={customerOptions}
                value={selectedCustomer}
                onChange={(option) => setSelectedCustomer(option)}
                placeholder="Select Customer"
                isSearchable
                className="font-jura text-black"
                classNamePrefix="react-select"
                isDisabled={!selectedCompany}
              />
            </div>

            {/* Autofill email and contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <input
                type="email"
                placeholder="Customer Email"
                value={customerEmail}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-200 text-gray-800 font-jura cursor-not-allowed"
              />
              <input
                type="text"
                placeholder="Customer Contact Number"
                value={customerContact}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-200 text-gray-800 font-jura cursor-not-allowed"
              />
            </div>

            {/* Incident Info */}
            <div>
              <h2 className="flex items-center text-xl font-semibold text-gray-800 mb-4 mt-8 font-jura">
                <FaExclamationTriangle className="mr-2 text-red-600" />
            Inquiry Details
            </h2>
          <Select
            options={inquiryOptions}
            value={selectedSubject}
            onChange={(option) => setSelectedSubject(option)}
            placeholder="Select Inquiry Type"
            className="font-jura text-black"
            classNamePrefix="react-select"
          />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-4 w-full h-32 p-3 border border-gray-300 rounded-md font-jura bg-white text-black"
          ></textarea>

          <div className="mt-4">
            <label className="block font-semibold font-jura text-black">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className={`w-1/2 p-2 border border-gray-300 bg-white rounded-md font-jura text-black ${priorityColors[priority]}`}
            >
              <option value="">Select Priority</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="mt-4">
            <label className="block font-jura font-semibold mb-2">
              Upload File (Optional)
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-600 font-jura file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
            />
          </div>
        </div>

        <button
          onClick={() => handleSubmit()}
          className="mt-8 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-md font-semibold shadow-md font-jura"
        >
          Submit Request
        </button>
      </div>
    </div>
  </div>
</div>
);
};

export default CreateSREngineer;