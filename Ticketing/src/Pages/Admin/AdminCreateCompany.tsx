import { useEffect, useState } from "react";
import Sidebar from "../../components/AdminSide";
import Navbar from "../../components/AdminNav";
import {
  UserIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  PhoneIcon,
  UserGroupIcon,
  IdentificationIcon,
} from "@heroicons/react/24/outline";
import Swal from "sweetalert2";

const AdminCreateCompany = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const [formData, setFormData] = useState({
    company: "",
    location: "",
    contact_person: "",
    contact_mobile: "",
    account_manager: "",
    support_type: "",
  });

  const [companies, setCompanies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Standard");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fetchCompanies = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/companies");
      const data = await res.json();
      setCompanies(data);
    } catch (error) {
      console.error("Failed to fetch companies", error);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/admin/company-register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (res.ok) {
        Swal.fire("Success", "Company registered successfully", "success");
        setFormData({
          company: "",
          location: "",
          contact_person: "",
          contact_mobile: "",
          account_manager: "",
          support_type: "",
        });
        fetchCompanies();
      } else {
        Swal.fire("Error", result.error || "Failed to register company", "error");
      }
    } catch (error) {
      console.error("Submit error:", error);
      Swal.fire("Error", "An unexpected error occurred", "error");
    }
  };

  const filteredCompanies = companies.filter(
    (comp: any) =>
      comp.support_type === activeTab &&
      comp.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} />

      <div className="flex-1 flex flex-col h-screen min-h-0">
        <Navbar toggleSidebar={toggleSidebar} />

        <div className="flex-1 overflow-y-auto bg-gray-100 p-8">
          {/* Form */}
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 font-jura mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-center gap-2">
              <UserIcon className="h-8 w-8 text-blue-500" />
              Register New Company
            </h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-black">
              {/* Company */}
              <div className="relative">
                <label className="block mb-2 font-medium text-gray-700">Company</label>
                <div className="absolute left-3 top-11 pointer-events-none text-gray-400 h-5 w-5">
                  <BuildingOfficeIcon />
                </div>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                  className="w-full p-3 pl-10 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                />
              </div>

              {/* Location */}
              <div className="relative">
                <label className="block mb-2 font-medium text-gray-700">Location</label>
                <div className="absolute left-3 top-11 pointer-events-none text-gray-400 h-5 w-5">
                  <MapPinIcon />
                </div>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full p-3 pl-10 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                />
              </div>

              {/* Contact Person */}
              <div className="relative">
                <label className="block mb-2 font-medium text-gray-700">Main Contact Person</label>
                <div className="absolute left-3 top-11 pointer-events-none text-gray-400 h-5 w-5">
                  <UserGroupIcon />
                </div>
                <input
                  type="text"
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleChange}
                  required
                  className="w-full p-3 pl-10 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                />
              </div>

              {/* Contact Mobile */}
              <div className="relative">
                <label className="block mb-2 font-medium text-gray-700">Contact Mobile</label>
                <div className="absolute left-3 top-11 pointer-events-none text-gray-400 h-5 w-5">
                  <PhoneIcon />
                </div>
                <input
                  type="text"
                  name="contact_mobile"
                  value={formData.contact_mobile}
                  onChange={handleChange}
                  required
                  className="w-full p-3 pl-10 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                />
              </div>

              {/* Account Manager */}
              <div className="relative">
                <label className="block mb-2 font-medium text-gray-700">Account Manager</label>
                <div className="absolute left-3 top-11 pointer-events-none text-gray-400 h-5 w-5">
                  <IdentificationIcon />
                </div>
                <input
                  type="text"
                  name="account_manager"
                  value={formData.account_manager}
                  onChange={handleChange}
                  required
                  className="w-full p-3 pl-10 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                />
              </div>

              {/* Support Type */}
              <div>
                <label className="block mb-2 font-medium text-gray-700">Support Type</label>
                <select
                  name="support_type"
                  value={formData.support_type}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border rounded bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="" disabled>Select support type</option>
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                  <option value="Premium Plus">Premium Plus</option>
                </select>
              </div>

              {/* Submit */}
              <div className="md:col-span-2 flex justify-center mt-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white font-semibold px-6 py-3 rounded hover:bg-blue-700 transition duration-300"
                >
                  Register
                </button>
              </div>
            </form>

            <div className="flex justify-between items-center mb-4 pt-10">
              <h3 className="text-lg font-semibold text-gray-700">Registered Companies</h3>
              <input
                type="text"
                placeholder="Search by company name..."
                className="border px-4 py-2 rounded w-64 bg-white text-black"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {/*Company List down*/}
            <div className="flex gap-4 mb-4">
              {["Standard", "Premium", "Premium Plus"].map((type) => (
                <button
                  key={type}
                  className={`px-4 py-2 rounded ${
                    activeTab === type ? "bg-blue-300 text-white" : "bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => setActiveTab(type)}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {filteredCompanies.length > 0 ? (
                filteredCompanies.map((comp: any) => (
                  <div
                    key={comp.id}
                    className="border p-4 rounded shadow-sm bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <h4 className="text-lg font-bold text-gray-800">{comp.company}</h4>
                    <p className="text-sm text-gray-600">Location: {comp.location}</p>
                    <p className="text-sm text-gray-600">
                      Contact: {comp.contact_person} ({comp.contact_mobile})
                    </p>
                    <p className="text-sm text-gray-600">Account Manager: {comp.account_manager}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No companies found for this support type.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCreateCompany;
