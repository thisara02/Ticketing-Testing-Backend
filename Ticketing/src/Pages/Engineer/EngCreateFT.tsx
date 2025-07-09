import { useEffect, useState } from "react";
import Sidebar from "../../components/EngSide";
import Navbar from "../../components/EngNav";
import { FaExclamationTriangle } from "react-icons/fa";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

const faultyOptions = [
  { value: "Firewall down or unreachable", label: "Firewall down or unreachable" },
  { value: "Firewall rule not working", label: "Firewall rule not working" },
  { value: "Firmware/OS corruption", label: "Firmware/OS corruption" },
  { value: "HA / failover issue", label: "HA / failover issue" },
  { value: "High CPU or memory usage", label: "High CPU or memory usage" },
  { value: "Interface down or flapping", label: "Interface down or flapping" },
  { value: "License failure", label: "License failure" },
  { value: "Logging failure", label: "Logging failure" },
  { value: "NAT failure", label: "NAT failure" },
  { value: "Packet drops or session timeouts", label: "Packet drops or session timeouts" },
  { value: "Routing problem", label: "Routing problem" },
  { value: "Security service not functioning", label: "Security service not functioning" },
  { value: "Traffic disruption", label: "Traffic disruption" },
  { value: "Unexpected reboot", label: "Unexpected reboot" },
  { value: "VPN connection failure", label: "VPN connection failure" },
];

const EngCreateFT = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const [companyOptions, setCompanyOptions] = useState<{ label: string; value: string }[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<{ label: string; value: string } | null>(null);

  const [customerOptions, setCustomerOptions] = useState<{ label: string; value: string }[]>([]);
  const [fullCustomerList, setFullCustomerList] = useState<any[]>([]);
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

  useEffect(() => {
    const token = localStorage.getItem("engToken");
    if (!token) {
      Swal.fire({ icon: "error", title: "Please login", timer: 1500, showConfirmButton: false });
      navigate("/login");
      return;
    }

    fetch("http://localhost:5000/api/engineer/companies", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setCompanyOptions(data))
      .catch((err) => console.error(err));

    fetch("http://localhost:5000/api/engineer/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setEngineerName(data.name || "");
        setEngineerContact(data.contact || "");
      })
      .catch((err) => console.error(err));
  }, [navigate]);

  useEffect(() => {
    if (!selectedCompany) return;
    const token = localStorage.getItem("engToken");
    fetch(`http://localhost:5000/api/engineer/customers/${encodeURIComponent(selectedCompany.value)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setFullCustomerList(data);
        setCustomerOptions(data.map((c: any) => ({ label: c.label, value: c.value })));
      })
      .catch((err) => console.error(err));
  }, [selectedCompany]);

  useEffect(() => {
    const cust = fullCustomerList.find((c) => c.value === selectedCustomer?.value);
    if (cust) {
      setCustomerEmail(cust.email);
      setCustomerContact(cust.mobile);
    } else {
      setCustomerEmail("");
      setCustomerContact("");
    }
  }, [selectedCustomer, fullCustomerList]);

  const handleSubmit = async () => {
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

    try {
      const token = localStorage.getItem("engToken");
      const response = await fetch("http://localhost:5000/api/engineer/ft", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        Swal.fire({
          title: "Faulty Ticket Created",
          text: "Your request was successfully submitted.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        setTimeout(() => navigate("/eng-dash"), 1500);
      } else {
        Swal.fire({
          title: "Error!",
          text: data?.error || "Something went wrong.",
          icon: "error",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Network error or server unreachable.",
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
            <h1 className="text-3xl font-bold text-gray-800 border-b-4 border-blue-500 inline-block pb-2 font-jura">
              Create New Faulty Ticket
            </h1>
            <p className="text-gray-600 mt-2 text-sm font-jura">
              Fill out the details below to create a new Faulty Ticket.
            </p>
            <div className="mt-6 w-full md:w-1/2 text-black">
              <label className="font-jura font-semibold mb-1 block">Select Company</label>
              <Select options={companyOptions} value={selectedCompany} onChange={setSelectedCompany} isSearchable />
            </div>
            <div className="mt-4 w-full md:w-1/2 text-black">
              <label className="font-jura font-semibold mb-1 block">Select Customer</label>
              <Select
                options={customerOptions}
                value={selectedCustomer}
                onChange={setSelectedCustomer}
                isSearchable
                isDisabled={!selectedCompany}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <input type="email" value={customerEmail} readOnly className="bg-gray-200 rounded-md p-2 text-black cursor-not-allowed" />
              <input type="text" value={customerContact} readOnly className="bg-gray-200 rounded-md p-2 text-black cursor-not-allowed" />
            </div>
            <div className="mt-8">
              <h2 className="flex items-center text-xl font-semibold text-gray-800 font-jura mb-2">
                <FaExclamationTriangle className="mr-2 text-yellow-500" /> Incident Info
              </h2>
              <Select options={faultyOptions} value={selectedSubject} onChange={setSelectedSubject} className="mr-2 text-black"/>
              <textarea
                rows={5}
                placeholder="Describe the issue..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-4 w-full p-3 border border-gray-300 rounded-md font-jura bg-white text-black" 
              ></textarea>
              <div className="mt-4">
                <label className="block font-jura font-semibold text-black">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className={`w-1/2 p-2 border bg-white text-black border-gray-300 rounded-md font-jura ${priorityColors[priority]}`}
                >
                  <option value="">Select Priority</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div className="mt-4">
                <label className="block font-jura font-semibold mb-2 text-black">Upload File (Optional)</label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 text-black"
                />
              </div>
              <button
                onClick={handleSubmit}
                className="mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold shadow-md font-jura"
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

export default EngCreateFT;
