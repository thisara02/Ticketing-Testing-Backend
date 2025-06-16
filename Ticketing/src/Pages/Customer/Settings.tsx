import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";


const Settings = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
     <div className="h-screen w-screen flex overflow-hidden">
      {/* Sidebar (fixed size) */}
      <div className="flex-shrink-0">
        <Sidebar isOpen={isSidebarOpen} />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col h-screen min-h-0">
        {/* Navbar (fixed height) */}
        <div className="flex-shrink-0">
          <Navbar toggleSidebar={toggleSidebar} />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-gray-100">


        </div>
      </div>
    </div>
  );
};

export default Settings;
