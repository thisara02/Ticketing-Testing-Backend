import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { useState } from "react";
import Swal from "sweetalert2";

const AddBundle = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const bundles = [
    { id: 1, name: "Basic", tickets: 3, price: "LKR 1,500" },
    { id: 2, name: "Standard", tickets: 5, price: "LKR 2,400" },
    { id: 3, name: "Premium", tickets: 10, price: "LKR 4,500" },
  ];

  const handlePurchase = (bundle: any) => {
    Swal.fire({
      title: `Purchase ${bundle.tickets} Tickets Bundle?`,
      html: `
        <div class="text-center">
          <p ><strong>Bundle:</strong> ${bundle.name}</p>
          <p><strong>Tickets:</strong> ${bundle.tickets}</p>
          <p><strong>Price:</strong> ${bundle.price}</p>
          <p class="mt-4 text-sm text-red-600">
              <strong>Note:</strong> Additional bundle charges will be added to your monthly bill, in addition to the support type you already purchased.
        </p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Confirm",
      cancelButtonText: "No, Cancel",
      customClass: {
        confirmButton: 'bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700',
        cancelButton: 'bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 ml-2'
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.isConfirmed) {
        fetch("http://localhost:5000/api/customers/purchase-bundle", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("cusToken")}`,
          },
          body: JSON.stringify({ tickets: bundle.tickets }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
                Swal.fire({
                icon: "success",
                title: "Success",
                text: data.message,
                showConfirmButton: false,
                timer: 2000,
                });
            } else {
                Swal.fire({
                icon: "error",
                title: "Error",
                text: data.error || "Failed to purchase tickets",
                showConfirmButton: false,
                timer: 2000,
                });
            }
            })
            .catch(() => {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Server error. Please try again.",
                showConfirmButton: false,
                timer: 2000,
            });
            });

      }
    });
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-gray-100">
      <div className="flex-shrink-0">
        <Sidebar isOpen={isSidebarOpen} />
      </div>

      <div className="flex-1 flex flex-col h-screen min-h-0">
        <div className="flex-shrink-0">
          <Navbar toggleSidebar={toggleSidebar} />
        </div>

        <div className="flex-1 overflow-y-auto flex justify-center p-8">
          <div className="w-full md:w-4/5 bg-white rounded-2xl shadow-md p-8 space-y-10 font-jura">
            <h1 className="text-3xl font-bold text-gray-800 text-center border-b-2">
              Purchase Extra Service Request Bundles
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {bundles.map((bundle) => (
                <div
                  key={bundle.id}
                  className="bg-teal-50 p-6 rounded-xl shadow hover:shadow-lg transition duration-300 border border-teal-200 flex flex-col items-center"
                >
                  <h2 className="text-lg font-semibold text-teal-800">{bundle.name} Bundle</h2>
                  <p className="text-6xl font-bold text-teal-600 mt-3">{bundle.tickets}</p>
                  <p className="text-m text-gray-600 mt-1">Support Tickets</p>
                  <br />
                  <p className="text-3xl text-gray-800 mt-3">{bundle.price}</p>
                  <button
                    onClick={() => handlePurchase(bundle)}
                    className="mt-5 px-5 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                  >
                    Purchase
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md mt-10">
              <p className="text-lg text-red-600">
                <strong>Note:</strong> <br />
                Any remaining additional tickets from your previous purchase will be{" "}
                <span className="font-medium text-black">automatically carried forward</span> to the
                next month.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBundle;
