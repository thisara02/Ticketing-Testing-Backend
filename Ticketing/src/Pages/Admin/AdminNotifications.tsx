import { useState } from "react";
import Sidebar from "../../components/AdminSide";
import Navbar from "../../components/AdminNav";
import { motion } from "framer-motion";

type Notification = {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  expanded: boolean;
};

const initialNotifications: Notification[] = [
  {
    id: 1,
    title: "System Update Scheduled",
    message: "A scheduled system update will occur on Friday at 10 PM.",
    isRead: false,
    expanded: false,
  },
  {
    id: 2,
    title: "New Ticket Assigned",
    message: "You have been assigned a new support ticket. Your ticked was assigned by Madura Jayasundara- Associate Engineer. Check your dashboard.",
    isRead: false,
    expanded: false,
  },
  {
    id: 3,
    title: "Password Change Successful",
    message: "Your password has been updated successfully.",
    isRead: true,
    expanded: false,
  },
];

const AdminNotifications = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState(initialNotifications);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const handleNotificationClick = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, isRead: true, expanded: !n.expanded }
          : { ...n, expanded: false }
      )
    );
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      {/* Sidebar */}
      <div className="flex-shrink-0">
        <Sidebar isOpen={isSidebarOpen} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col h-screen min-h-0">
        <div className="flex-shrink-0">
          <Navbar toggleSidebar={toggleSidebar} />
        </div>

        {/* Scrollable area */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2 font-jura">
            Notifications
          </h1>

          <div className="space-y-4">
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                onClick={() => handleNotificationClick(notification.id)}
                className={`cursor-pointer transition-all duration-300 border border-gray-200 rounded-lg shadow px-6 py-4 ${
                  notification.isRead ? "bg-gray-200" : "bg-white"
                }`}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex justify-between items-center">
                  <div className="font-semibold text-lg text-gray-800">{notification.title}</div>
                  {!notification.isRead && (
                    <span className="w-3 h-3 bg-red-500 rounded-full ml-2"></span>
                  )}
                </div>
                {notification.expanded && (
                  <p className="text-gray-700 mt-2">{notification.message}</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;
