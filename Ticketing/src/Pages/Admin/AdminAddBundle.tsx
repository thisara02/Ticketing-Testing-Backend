import { useState, useEffect } from "react";
import Sidebar from "../../components/AdminSide";
import Navbar from "../../components/AdminNav";
import Select from "react-select";
import Swal from "sweetalert2";

const bundleOptions = [
  { value: 3, label: "3 Tickets Bundle" },
  { value: 5, label: "5 Tickets Bundle" },
  { value: 10, label: "10 Tickets Bundle" },
];

const AdminAddBundle = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [companies, setCompanies] = useState<{ label: string; value: string }[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<{ label: string; value: string } | null>(null);
  const [selectedBundle, setSelectedBundle] = useState<{ value: number; label: string } | null>(null);
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/companies")
      .then(res => res.json())
      .then(data => {
        const formatted = data.map((c: any) => ({ label: c.company, value: c.company }));
        setCompanies(formatted);
      })
      .catch(err => {
        console.error("Failed to fetch companies", err);
        Swal.fire("Error", "Could not fetch companies.", "error");
      });
  }, []);

  const handleSubmit = async () => {
    if (!selectedCompany || !selectedBundle || !month) {
      Swal.fire("Incomplete", "Please fill out all fields.", "warning");
      return;
    }

    const payload = {
      company: selectedCompany.value,
      month,
      additional_tickets: selectedBundle.value,
    };

    try {
      const res = await fetch("http://localhost:5000/api/admin/add-bundle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        Swal.fire("Success", data.message || "Bundle added successfully!", "success");
        setSelectedCompany(null);
        setSelectedBundle(null);
      } else {
        throw new Error(data.error || "Failed to add bundle");
      }
    } catch (error: any) {
      Swal.fire("Error", error.message || "Something went wrong", "error");
    }
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} />
      <div className="flex-1 flex flex-col h-screen min-h-0">
        <Navbar toggleSidebar={toggleSidebar} />
        <div className="flex-1 overflow-y-auto bg-gray-100 p-8">
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8 font-jura mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Add Additional Ticket Bundle</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-black">
              <div>
                <label className="block mb-2 font-medium text-gray-700">Select Company</label>
                <Select
                  options={companies}
                  value={selectedCompany}
                  onChange={setSelectedCompany}
                  placeholder="Choose a company"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">Select Bundle</label>
                <Select
                  options={bundleOptions}
                  value={selectedBundle}
                  onChange={setSelectedBundle}
                  placeholder="Choose a ticket bundle"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">Select Month</label>
                <input
                    type="month"
                    className="border border-gray-300 rounded px-3 py-2 w-full bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                />
                </div>
            </div>

            <div className="flex justify-center mt-10">
              <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
              >
                Add Bundle
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAddBundle;
