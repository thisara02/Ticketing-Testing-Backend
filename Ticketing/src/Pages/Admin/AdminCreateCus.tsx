import { useState, useEffect } from "react";
import Sidebar from "../../components/AdminSide";
import Navbar from "../../components/AdminNav";
import {
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  BriefcaseIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  KeyIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Swal from "sweetalert2";

interface Customer {
  id: number;
  name: string;
  email: string;
  designation: string;
  mobile: string;
  company: string;
  address: string;
}

interface Company {
  id: number | string;
  company: string;
  support_type: string;
}

const API_BASE_CUSTOMERS = "http://localhost:5000/api/customers";
const API_BASE_COMPANIES = "http://localhost:5000/api/admin/companies";

const AdminCreateCus = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    designation: "",
    mobile: "",
    company: "",
    password: "",
    confirmPassword: "",
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  useEffect(() => {
    fetchCustomers();
    fetchCompanies();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_BASE_CUSTOMERS);
      if (!res.ok) throw new Error("Failed to fetch customers");
      const data = await res.json();
      setCustomers(data.customers || []);
    } catch (error) {
      console.error("Fetch customers error:", error);
      Swal.fire("Error", "Failed to load customers", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await fetch(API_BASE_COMPANIES);
      if (!res.ok) throw new Error("Failed to fetch companies");
      const data = await res.json();
      console.log("Fetched companies:", data);
      // Backend returns array directly
      setCompanies(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch companies error:", error);
      Swal.fire("Error", "Failed to load companies", "error");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation checks omitted for brevity, include your existing ones here...

    if (formData.password.length < 8) {
      Swal.fire("Oops...", "Password must be at least 8 characters long.", "error");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Swal.fire("Oops...", "Passwords do not match.", "error");
      return;
    }

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        designation: formData.designation,
        mobile: formData.mobile,
        company: formData.company,
        password: formData.password,
      };

      const res = await fetch(API_BASE_CUSTOMERS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 201) {
        const data = await res.json();
        Swal.fire("Success", "Customer created successfully!", "success");
        setCustomers((prev) => [...prev, data.customer]);
        setFormData({
          name: "",
          email: "",
          designation: "",
          mobile: "",
          company: "",
          password: "",
          confirmPassword: "",
        });
      } else {
        const errorData = await res.json();
        Swal.fire("Error", errorData.error || "Failed to create customer", "error");
      }
    } catch (error) {
      console.error("Submit error:", error);
      Swal.fire("Error", "Failed to create customer", "error");
    }
  };

  const handleDeleteCustomer = async (id: number) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This user will be permanently deleted. This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      customClass: {
        confirmButton: "bg-red-600 text-white",
        cancelButton: "bg-gray-500 text-white",
      },
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API_BASE_CUSTOMERS}/${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
          setCustomers((prev) => prev.filter((c) => c.id !== id));
          Swal.fire("Deleted!", "Customer has been deleted.", "success");
        } else {
          const errorData = await res.json();
          Swal.fire("Error", errorData.error || "Failed to delete customer.", "error");
        }
      } catch (error) {
        console.error("Delete error:", error);
        Swal.fire("Error", "Failed to delete customer.", "error");
      }
    }
  };

  // Group customers by company
  const groupedCustomers = customers.reduce((acc, customer) => {
    if (!acc[customer.company]) {
      acc[customer.company] = [];
    }
    acc[customer.company].push(customer);
    return acc;
  }, {} as Record<string, Customer[]>);

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} />

      <div className="flex-1 flex flex-col h-screen min-h-0">
        <Navbar toggleSidebar={toggleSidebar} />

        <div className="flex-1 overflow-y-auto bg-gray-100 p-8">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 font-jura mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-center gap-2">
              <UserIcon className="h-8 w-8 text-blue-500" />
              Create Customer Profile
            </h2>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 text-black"
            >
              {[ 
                { label: "Full Name", icon: <UserIcon />, name: "name", type: "text" },
                { label: "Email", icon: <EnvelopeIcon />, name: "email", type: "email" },
                { label: "Designation", icon: <BriefcaseIcon />, name: "designation", type: "text" },
                { label: "Mobile", icon: <DevicePhoneMobileIcon />, name: "mobile", type: "text" },
              ].map((field) => (
                <div className="relative" key={field.name}>
                  <label className="block mb-2 font-medium text-gray-700">{field.label}</label>
                  <div className="absolute left-3 top-11 pointer-events-none text-gray-400 h-5 w-5">
                    {field.icon}
                  </div>
                  <input
                    type={field.type}
                    name={field.name}
                    value={(formData as any)[field.name]}
                    onChange={handleChange}
                    required
                    className="w-full p-3 pl-10 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                  />
                </div>
              ))}

              {/* Company dropdown */}
              <div className="relative">
                <label className="block mb-2 font-medium text-gray-700">Company</label>
                <select
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border rounded bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="" disabled>Select company</option>
                  {companies.map((c) => (
                    <option key={c.id || c.company} value={c.company}>
                      {c.company}
                    </option>
                  ))}
                </select>
              </div>

              {/* Password */}
              <div className="relative">
                <label className="block mb-2 font-medium text-gray-700">Password</label>
                <KeyIcon className="h-5 w-5 text-gray-400 absolute left-3 top-11 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="w-full p-3 pl-10 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute top-10 right-3 text-gray-500 hover:text-gray-800"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <label className="block mb-2 font-medium text-gray-700">Confirm Password</label>
                <KeyIcon className="h-5 w-5 text-gray-400 absolute left-3 top-11 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="w-full p-3 pl-10 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute top-10 right-3 text-gray-500 hover:text-gray-800"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>

              <div className="md:col-span-2 flex justify-center mt-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white font-semibold px-6 py-3 rounded hover:bg-blue-700 transition duration-300"
                >
                  Create Profile
                </button>
              </div>
            </form>
          </div>

          {/* Display current customers grouped by company */}
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 font-jura">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Current Customers</h2>

            {loading ? (
              <p>Loading customers...</p>
            ) : Object.entries(groupedCustomers).length === 0 ? (
              <p>No customers found.</p>
            ) : (
              Object.entries(groupedCustomers).map(([company, companyCustomers]) => (
                <div key={company} className="mb-6">
                  <h3 className="text-lg font-semibold text-blue-600 mb-2">{company}</h3>
                  <div className="space-y-2">
                    {companyCustomers.map((customer) => (
                      <div
                        key={customer.id}
                        className="flex justify-between items-center p-4 border rounded bg-gray-50"
                      >
                        <div>
                          <div className="flex items-center space-x-2 text-black font-medium">
                            <UserIcon className="h-5 w-5 text-gray-500" />
                            <p>Name : {customer.name}</p>
                          </div>
                          <div className="flex items-center space-x-2 text-black font-medium">
                            <EnvelopeIcon className="h-5 w-5 text-gray-500" />
                            <p>Email : {customer.email}</p>
                          </div>
                          <div className="flex items-center space-x-2 text-black font-medium">
                            <BriefcaseIcon className="h-5 w-5 text-gray-500" />
                            <p>Designation : {customer.designation}</p>
                          </div>
                          <div className="flex items-center space-x-2 text-black font-medium">
                            <DevicePhoneMobileIcon className="h-5 w-5 text-gray-500" />
                            <p>Contact : {customer.mobile}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteCustomer(customer.id)}
                          className="text-red-500 hover:text-red-700"
                          aria-label={`Delete customer ${customer.name}`}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCreateCus;
