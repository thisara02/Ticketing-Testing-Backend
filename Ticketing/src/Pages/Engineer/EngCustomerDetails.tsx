import { useEffect, useState, useMemo } from "react";
import Sidebar from "../../components/EngSide";
import Navbar from "../../components/EngNav";

type Customer = {
  name: string;
  designation: string;
  mobile: string;
  email: string;
};

const EngCustomerDetails = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerGroups, setCustomerGroups] = useState<Record<string, Customer[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem("engToken");
        const response = await fetch("http://localhost:5000/api/engineer/customers/grouped", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch customer data");
        }

        const data = await response.json();
        setCustomerGroups(data);
      } catch (err: any) {
        setError(err.message || "Error loading customers");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) return customerGroups;

    const lowerSearch = searchTerm.toLowerCase();
    const filtered: Record<string, Customer[]> = {};

    for (const [company, customers] of Object.entries(customerGroups)) {
      const matched = customers.filter((c) =>
        c.name.toLowerCase().includes(lowerSearch) ||
        c.designation.toLowerCase().includes(lowerSearch) ||
        c.mobile.toLowerCase().includes(lowerSearch) ||
        c.email.toLowerCase().includes(lowerSearch)
      );
      if (matched.length > 0) filtered[company] = matched;
    }

    return filtered;
  }, [searchTerm, customerGroups]);

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      <div className="flex-shrink-0">
        <Sidebar isOpen={isSidebarOpen} />
      </div>

      <div className="flex-1 flex flex-col h-screen min-h-0">
        <Navbar toggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-y-auto bg-gray-50 p-8 font-jura px-20">
          <h1 className="text-4xl font-extrabold mb-8 text-gray-900">Customer Contact List</h1>

          {/* Search Input */}
          <div className="mb-8 max-w-md">
            <input
              type="search"
              placeholder="Search by name, designation, mobile, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-black"
              aria-label="Search customers"
              autoComplete="off"
            />
          </div>

          {/* Loading and Error States */}
          {loading && <p className="text-gray-600">Loading customer data...</p>}
          {error && <p className="text-red-600">Error: {error}</p>}
          {!loading && !error && Object.keys(filteredGroups).length === 0 && (
            <p className="text-gray-500 text-lg">No customers found.</p>
          )}

          {/* Render Groups */}
          {Object.entries(filteredGroups).map(([company, customers]) => (
            <section
              key={company}
              className="mb-10 bg-white rounded-lg shadow-lg p-6 border border-gray-200"
            >
              <h2 className="text-2xl font-semibold text-green-700 mb-5 border-b border-indigo-300 pb-2">
                {company}
              </h2>

              <div className="overflow-x-auto">
                <table className="min-w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-green-50">
                      <th className="px-6 py-3 font-medium text-indigo-800 border-b border-indigo-200">Name</th>
                      <th className="px-6 py-3 font-medium text-indigo-800 border-b border-indigo-200">Designation</th>
                      <th className="px-6 py-3 font-medium text-indigo-800 border-b border-indigo-200">Mobile</th>
                      <th className="px-6 py-3 font-medium text-indigo-800 border-b border-indigo-200">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((cust, idx) => (
                      <tr
                        key={idx}
                        className={`${
                          idx % 2 === 0 ? "bg-white" : "bg-green-50"
                        } hover:bg-indigo-100 transition-colors cursor-pointer`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-semibold">{cust.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">{cust.designation}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-mono">{cust.mobile}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-indigo-600 underline">{cust.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </main>
      </div>
    </div>
  );
};

export default EngCustomerDetails;
