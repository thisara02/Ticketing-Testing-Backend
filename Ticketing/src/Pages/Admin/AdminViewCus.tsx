import { useState } from "react";
import Sidebar from "../../components/AdminSide";
import Navbar from "../../components/AdminNav";
import {
  UserIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  TicketIcon,
} from "@heroicons/react/24/outline";

interface Customer {
  id: number;
  name: string;
  email: string;
  mobile: string;
  designation: string;
  address: string;
  company: string;
}

const mockCustomers: Customer[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    mobile: "1234567890",
    designation: "Manager",
    address: "123 Main St",
    company: "ABC Corp",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    mobile: "9876543210",
    designation: "Developer",
    address: "456 Park Ave",
    company: "XYZ Inc",
  },
  {
    id: 3,
    name: "Alice Johnson",
    email: "alice@example.com",
    mobile: "5555555555",
    designation: "Designer",
    address: "789 Broadway",
    company: "ABC Corp",
  },
  {
    id: 4,
    name: "Bob Williams",
    email: "bob@example.com",
    mobile: "4444444444",
    designation: "Analyst",
    address: "1010 Wall St",
    company: "XYZ Inc",
  },
  {
    id: 5,
    name: "Charlie Brown",
    email: "charlie@example.com",
    mobile: "2222222222",
    designation: "HR",
    address: "500 Market St",
    company: "123 Solutions",
  },
  // Add more as needed
];

const TOTAL_TICKETS_PER_MONTH = 20;

const AdminViewCus = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  // Group customers by company
  const groupedCustomers: Record<string, Customer[]> = mockCustomers.reduce(
    (groups, customer) => {
      if (!groups[customer.company]) {
        groups[customer.company] = [];
      }
      groups[customer.company].push(customer);
      return groups;
    },
    {} as Record<string, Customer[]>
  );

  // Filter companies by search query
  const filteredCompanies = Object.entries(groupedCustomers).filter(
    ([company]) =>
      company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      {/* Sidebar */}
      <div className="flex-shrink-0">
        <Sidebar isOpen={isSidebarOpen} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col h-screen min-h-0">
        {/* Navbar */}
        <div className="flex-shrink-0">
          <Navbar toggleSidebar={toggleSidebar} />
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-8">
          <div className="max-w-6xl mx-auto font-jura">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Customer List
            </h2>

            {/* Search Filter */}
            <div className="flex justify-center mb-6">
              <input
                type="text"
                placeholder="Search Company Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-black"
              />
            </div>

            {/* Grouped and Filtered by Company */}
            {filteredCompanies.length === 0 ? (
              <p className="text-center text-gray-500">No companies found.</p>
            ) : (
              filteredCompanies.map(([company, customers]) => {
                const usedTickets = customers.length;
                const balancedTickets =
                  TOTAL_TICKETS_PER_MONTH - usedTickets;

                return (
                  <div
                    key={company}
                    className="mb-8 bg-white rounded shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-blue-600 text-white px-4 py-2 rounded-t">
                      <div className="flex items-center gap-2 mb-2 md:mb-0">
                        <BuildingOfficeIcon className="h-5 w-5" />
                        <h3 className="text-lg font-semibold">{company}</h3>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <TicketIcon className="h-4 w-4 text-green-300" />
                          <span>Balanced Tickets:</span>
                          <span className="font-semibold">
                            {balancedTickets}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TicketIcon className="h-4 w-4 text-yellow-300" />
                          <span>Used Tickets:</span>
                          <span className="font-semibold">
                            {usedTickets}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TicketIcon className="h-4 w-4 text-yellow-300" />
                          <span>Pending Ticket Count:</span>
                          <span className="font-semibold">
                            {usedTickets}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TicketIcon className="h-4 w-4 text-yellow-300" />
                          <span>Ongoing Ticket Count:</span>
                          <span className="font-semibold">
                            {usedTickets}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {customers.map((customer) => (
                        <div
                          key={customer.id}
                          className="border border-gray-200 rounded p-4 shadow-sm bg-white"
                        >
                          <h4 className="text-md font-semibold text-gray-800 flex items-center gap-2 mb-2">
                            <UserIcon className="h-5 w-5 text-blue-500" />
                            {customer.name}
                          </h4>
                          <p className="text-gray-600 flex items-center gap-2 text-sm mb-1">
                            <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                            {customer.email}
                          </p>
                          <p className="text-gray-600 flex items-center gap-2 text-sm mb-1">
                            <DevicePhoneMobileIcon className="h-4 w-4 text-gray-400" />
                            {customer.mobile}
                          </p>
                          <p className="text-gray-600 text-sm mb-1">
                            Designation: {customer.designation}
                          </p>
                          <p className="text-gray-600 text-sm">
                            Address: {customer.address}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminViewCus;
