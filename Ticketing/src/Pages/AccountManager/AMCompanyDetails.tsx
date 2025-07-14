import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../../components/AmNav";
import Swal from "sweetalert2";

interface Bundle {
  month: string;
  additional_tickets: number;
  created_at: string;
  added_by:string;
}

interface CompanyDetail {
  name: string;
  location: string;
  contact_person: string;
  contact_mobile: string;
  support_type: string;
  bundles: Bundle[];
}

const AMCompanyDetail = () => {
  const { companyName } = useParams();
  const [data, setData] = useState<CompanyDetail | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("amToken");

    if (!token) {
      Swal.fire("Error", "No token found", "error");
      return;
    }

    fetch(`http://localhost:5000/api/accountmanager/company-details/${companyName}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err?.error || "Failed to load company details");
        }
        return res.json();
      })
      .then((company: CompanyDetail) => setData(company))
      .catch((err) => {
        Swal.fire("Error", err.message, "error");
      });
  }, [companyName]);

  if (!data) return <p className="p-10 text-center">Loading...</p>;

  return (
    <div className="h-screen w-screen flex overflow-hidden font-jura">
      <div className="flex-1 flex flex-col h-screen min-h-0">
        <Navbar toggleSidebar={() => {}} />
        <div className="flex-1 overflow-y-auto bg-purple-100 p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Company Details */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4">
                Company: {data.name}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-gray-700">
                <p><strong>📍 Location:</strong> {data.location}</p>
                <p><strong>👤 Contact Person:</strong> {data.contact_person}</p>
                <p><strong>📞 Contact Mobile:</strong> {data.contact_mobile}</p>
                <p><strong>🛠️ Support Type:</strong> {data.support_type}</p>
              </div>
            </div>

            {/* Bundle History */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
                Additional Ticket Bundles
              </h3>
              {data.bundles.length === 0 ? (
                <p className="text-gray-500">No bundles added yet.</p>
              ) : (
                <ul className="space-y-3">
                {data.bundles.map((b, i) => (
                    <li
                    key={i}
                    className="border-l-4 border-blue-600 pl-4 py-2 bg-gray-50 rounded hover:bg-gray-100 transition text-black"
                    >
                    <p><strong>Month:</strong> {b.month}</p>
                    <p><strong>Tickets:</strong> {b.additional_tickets}</p>
                    <p><strong>Added On:</strong> {b.created_at}</p>
                    <p><strong>Added By:</strong> {b.added_by}</p> {/* ✅ Added this */}
                    </li>
                ))}
                </ul>

              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AMCompanyDetail;
