import { useState, useMemo } from "react";
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

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  // Dummy data with 10 companies
  const customerGroups: Record<string, Customer[]> = {
    Wavenet: [
      { name: "Alice Johnson", designation: "Project Manager", mobile: "123-456-7890", email: "alice.johnson@wavenet.com" },
      { name: "Bob Smith", designation: "Developer", mobile: "234-567-8901", email: "bob.smith@wavenet.com" },
      { name: "Carol Davis", designation: "QA Engineer", mobile: "345-678-9012", email: "carol.davis@wavenet.com" },
    ],
    TechWave: [
      { name: "Daniel Craig", designation: "Team Lead", mobile: "456-789-0123", email: "daniel.craig@techwave.com" },
      { name: "Eva Brown", designation: "Developer", mobile: "567-890-1234", email: "eva.brown@techwave.com" },
    ],
    NetFusion: [
      { name: "Frank Miller", designation: "Support Specialist", mobile: "678-901-2345", email: "frank.miller@netfusion.com" },
      { name: "Grace Lee", designation: "UI Designer", mobile: "789-012-3456", email: "grace.lee@netfusion.com" },
      { name: "Henry Adams", designation: "Product Owner", mobile: "890-123-4567", email: "henry.adams@netfusion.com" },
    ],
    Cloudify: [
      { name: "Isabel Turner", designation: "Developer", mobile: "901-234-5678", email: "isabel.turner@cloudify.com" },
      { name: "Jack Wilson", designation: "QA Engineer", mobile: "012-345-6789", email: "jack.wilson@cloudify.com" },
    ],
    DigiWorks: [
      { name: "Karen Scott", designation: "Project Manager", mobile: "123-987-6543", email: "karen.scott@digiworks.com" },
      { name: "Larry King", designation: "Developer", mobile: "234-876-5432", email: "larry.king@digiworks.com" },
    ],
    SoftSolutions: [
      { name: "Mona Patel", designation: "Business Analyst", mobile: "345-765-4321", email: "mona.patel@softsolutions.com" },
      { name: "Nate Young", designation: "Developer", mobile: "456-654-3210", email: "nate.young@softsolutions.com" },
    ],
    InfoTech: [
      { name: "Olivia Martin", designation: "Team Lead", mobile: "567-543-2109", email: "olivia.martin@infotech.com" },
      { name: "Paul Walker", designation: "Developer", mobile: "678-432-1098", email: "paul.walker@infotech.com" },
    ],
    NetSphere: [
      { name: "Quinn Harris", designation: "Product Owner", mobile: "789-321-0987", email: "quinn.harris@netsphere.com" },
      { name: "Rachel Evans", designation: "Support Specialist", mobile: "890-210-9876", email: "rachel.evans@netsphere.com" },
    ],
    ByteWorks: [
      { name: "Steve Rogers", designation: "Developer", mobile: "901-109-8765", email: "steve.rogers@byteworks.com" },
      { name: "Tina Bell", designation: "QA Engineer", mobile: "012-098-7654", email: "tina.bell@byteworks.com" },
    ],
    CodeCraft: [
      { name: "Uma Nelson", designation: "UI Designer", mobile: "123-987-6540", email: "uma.nelson@codecraft.com" },
      { name: "Victor Reed", designation: "Developer", mobile: "234-876-5431", email: "victor.reed@codecraft.com" },
    ],
  };

  // Filtered data based on search term
  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) return customerGroups;

    const lowerSearch = searchTerm.toLowerCase();

    const filtered: Record<string, Customer[]> = {};

    for (const [company, customers] of Object.entries(customerGroups)) {
      const matchedCustomers = customers.filter((c) =>
        c.name.toLowerCase().includes(lowerSearch) ||
        c.designation.toLowerCase().includes(lowerSearch) ||
        c.mobile.toLowerCase().includes(lowerSearch) ||
        c.email.toLowerCase().includes(lowerSearch)
      );
      if (matchedCustomers.length > 0) {
        filtered[company] = matchedCustomers;
      }
    }
    return filtered;
  }, [searchTerm, customerGroups]);

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      <div className="flex-shrink-0">
        <Sidebar isOpen={isSidebarOpen} />
      </div>

      <div className="flex-1 flex flex-col h-screen min-h-0">
        <div className="flex-shrink-0">
          <Navbar toggleSidebar={toggleSidebar} />
        </div>

        <main className="flex-1 overflow-y-auto bg-gray-50 p-8 font-jura px-20">
          <h1 className="text-4xl font-extrabold mb-8 text-gray-900">
            Customer Contact List
          </h1>

          {/* Search Bar */}
          <div className="mb-8 max-w-md">
            <input
              type="search"
              placeholder="Search by name, designation, mobile, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white text-black"
              aria-label="Search customers"
              spellCheck={false}
              autoComplete="off"
            />
          </div>

          {/* Customer groups */}
          {Object.entries(filteredGroups).length === 0 && (
            <p className="text-gray-500 text-lg">No customers found.</p>
          )}

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
                      <th className="px-6 py-3 font-medium text-indigo-800 border-b border-indigo-200">
                        Name
                      </th>
                      <th className="px-6 py-3 font-medium text-indigo-800 border-b border-indigo-200">
                        Designation
                      </th>
                      <th className="px-6 py-3 font-medium text-indigo-800 border-b border-indigo-200">
                        Mobile
                      </th>
                      <th className="px-6 py-3 font-medium text-indigo-800 border-b border-indigo-200">
                        Email
                      </th>
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
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-semibold">
                          {cust.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          {cust.designation}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-mono">
                          {cust.mobile}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-indigo-600 underline">
                          {cust.email}
                        </td>
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
