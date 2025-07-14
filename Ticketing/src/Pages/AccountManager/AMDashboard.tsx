import Navbar from "../../components/AmNav";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";
import Default from "../../assets/default.jpg";

interface DecodedToken {
  name: string;
  email: string;
  mobile: string;
  exp: number;
}

interface Company {
  id: number;
  name: string;
  location: string;
  contact_person: string;
  contact_mobile: string;
  support_type: string;
}

const AMDash = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);

  let accountmanagerName = "Guest";
  let accountmanagerEmail = "guest@example.com";
  let accountmanagerMobile = "0910000000";

  const token = localStorage.getItem("amToken");

  if (token) {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      accountmanagerName = decoded.name;
      accountmanagerEmail = decoded.email;
      accountmanagerMobile = decoded.mobile;
    } catch (error) {
      console.error("Failed to decode JWT token:", error);
      localStorage.removeItem("amToken");
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("amToken");
    if (!token) {
      Swal.fire("Error", "Authentication token missing. Please login again.", "error");
      return;
    }

    const baseUrl = "http://localhost:5000";

    // Load profile image
    fetch(`${baseUrl}/api/accountmanager/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          throw new Error(errorData?.error || "Failed to fetch profile");
        }
        return res.json();
      })
      .then((data) => {
        if (data.profile_image) {
          const imageUrl = data.profile_image.startsWith("http")
            ? data.profile_image
            : `${baseUrl}${data.profile_image}`;
          setProfileImagePreview(imageUrl + `?t=${Date.now()}`);
        } else {
          setProfileImagePreview(null);
        }
      })
      .catch((err) => {
        console.error(err);
        Swal.fire("Error", err.message || "Failed to load profile data", "error");
      });

    // Load companies for account manager
    fetch(`${baseUrl}/api/accountmanager/customers`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          throw new Error(errorData?.error || "Failed to fetch companies");
        }
        return res.json();
      })
      .then((data: Company[]) => {
        setCompanies(data);
      })
      .catch((err) => {
        console.error(err);
        Swal.fire("Error", err.message || "Failed to load customer companies", "error");
      });
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      <div className="flex-shrink-0">{/* Sidebar placeholder */}</div>

      <div className="flex-1 flex flex-col h-screen min-h-0">
        <div className="flex-shrink-0">
          <Navbar toggleSidebar={toggleSidebar} />
        </div>

        <div className="flex-1 overflow-y-auto bg-purple-100 font-jura p-6 space-y-10">
          {/* My Profile Section */}
          <div className="w-2/5 mx-auto bg-white rounded-2xl shadow-lg p-6 space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 text-center">
              My Profile
            </h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                {profileImagePreview ? (
                  <img
                    src={profileImagePreview}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover border border-gray-300"
                    onClick={() => navigate("/am-profile")}
                  />
                ) : (
                  <img
                    src={Default}
                    alt="Default Profile"
                    className="w-16 h-16 rounded-full object-cover border border-gray-300 mx-auto cursor-pointer mb-2"
                    onClick={() => navigate("/am-profile")}
                  />
                )}
                <div>
                  <h2 className="text-xl font-semibold text-black">{accountmanagerName}</h2>
                  <p className="text-gray-600">{accountmanagerEmail}</p>
                  <p className="text-gray-600">{accountmanagerMobile}</p>
                </div>
              </div>
              <button
                onClick={() => navigate("/am-profile")}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Edit
              </button>
            </div>
          </div>

          {/* My Customers Section */}
          <div className="w-4/5 mx-auto bg-white rounded-2xl shadow-lg p-6 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">My Customers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {companies.length === 0 ? (
                <p className="text-gray-500">No customers assigned to you.</p>
              ) : (
                companies.map((company) => (
                  <div
                    key={company.id}
                    onClick={() => navigate(`/am-company/${encodeURIComponent(company.name)}`)}
                    className="cursor-pointer bg-gray-50 rounded-xl border border-gray-200 p-5 hover:shadow-md transition"
                  >
                    <h3 className="text-lg font-semibold text-black mb-3 border-b">
                      {company.name}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-gray-700 text-sm">
                      <p>
                        <span className="font-semibold">🗺️ Location:</span>{" "}
                        {company.location}
                      </p>
                      <p>
                        <span className="font-semibold">👤 Contact Person:</span>{" "}
                        {company.contact_person}
                      </p>
                      <p>
                        <span className="font-semibold">📦 Support Type:</span>{" "}
                        {company.support_type}
                      </p>
                      <p>
                        <span className="font-semibold">📞 Contact Mobile:</span>{" "}
                        {company.contact_mobile}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AMDash;
