import { Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Login from "./Pages/Customer/Login";
import Home from "./Pages/Customer/Home";
import About from "./Pages/Customer/About";
import Contact from "./Pages/Customer/Contact";
import Services from "./Pages/Customer/Services";
import Settings from "./Pages/Customer/Settings";
import Notifications from "./Pages/Customer/Notifications";
import Landing from "./Pages/Customer/Landing";
import Pending from "./Pages/Customer/PendingRequests";
import History from "./Pages/Customer/RequestHistory";
import ViewClosed from "./Pages/Customer/ViewClosed"
import CreateSR from "./Pages/Customer/CreateSR"
import CreateFT from "./Pages/Customer/CreateFT"
import ViewSR from "./Pages/Customer/ViewClosed"
import ViewOngoing from "./Pages/Customer/ViewOngoing"
import CusProfile from "./Pages/Customer/Profile"
import ViewPending from "./Pages/Customer/ViewPending"
import AdminLogin from "./Pages/Admin/AdminLogin"
import ForgotPassword from "./Pages/Customer/ForgotPassword"
import ResetPass from "./Pages/Customer/ResetPassword"
import AdminDash from "./Pages/Admin/AdminDashboard"
import EngLogin from "./Pages/Engineer/EngLogin"
import AdminCreateCus from "./Pages/Admin/AdminCreateCus"
import AdminCreateEng from "./Pages/Admin/AdminCreateEng"
import AdminCreateAdmin from "./Pages/Admin/AdminCreateAdmin"
import AdminNotification from "./Pages/Admin/AdminNotifications"
import AdminProfile from "./Pages/Admin/AdminProfile"
import AdminViewCus from "./Pages/Admin/AdminViewCus"
import AdminHistory from "./Pages/Admin/AdminHistory"
import AdminForgotPass from "./Pages/Admin/AdminForgotPassword"
import AdminResetPass from "./Pages/Admin/AdminResetPassword"
import AdminViewPending from "./Pages/Admin/AdminViewPending"
import AdminViewClosed from "./Pages/Admin/AdminViewClosed"
import AdminViewOngoing from "./Pages/Admin/AdminViewOngoing"
import EngDash from "./Pages/Engineer/EngDashboard"
import EngForgotPass from "./Pages/Engineer/EngForgotPassword"
import EngResetPass from "./Pages/Engineer/EngResetPassword"
import EngProfile from "./Pages/Engineer/EngProfile"
import EngNotification from "./Pages/Engineer/EngNotifications"
import EngAssignedTicket from "./Pages/Engineer/EngMyTicket";
import EngHistory from "./Pages/Engineer/EngHistory"
import EngViewPending from "./Pages/Engineer/EngViewPending"
import EngViewClosed from "./Pages/Engineer/EngViewClosed"
import EngViewOngoing from "./Pages/Engineer/EngViewOngoing"
import EngViewAssigned from "./Pages/Engineer/EngViewAssigned"
import EngCloseTicket from "./Pages/Engineer/EngCloseTicket"
import EngCustomerDetails from "./Pages/Engineer/EngCustomerDetails"


const App: React.FC = () => {
  return (
    <AnimatePresence mode="wait">
    <Routes>
      {/* Default route redirects to /home */}
      <Route path="/" element={<Navigate to="/land" replace />} />
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />    
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/services" element={<Services />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/land" element={<Landing />} />
      <Route path="/pending" element={<Pending />} />
      <Route path="/history" element={<History />} />
      <Route path="/view-closed" element={<ViewClosed />} />
      <Route path="/view-sr" element={<ViewSR />} />
      <Route path="/create-sr" element={<CreateSR />} />
      <Route path="/create-ft" element={<CreateFT />} />
      <Route path="/view-pending/:ticketId" element={<ViewPending />} />
      <Route path="/viewon/:ticketId" element={<ViewOngoing />} />
      <Route path="/profile" element={<CusProfile />} />
      <Route path="/forgot-pass" element={<ForgotPassword />} />
      <Route path="/reset-pass" element={<ResetPass />} />

      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin-dash" element={<AdminDash />} />
      <Route path="/create-cus" element={<AdminCreateCus />} />
      <Route path="/create-eng" element={<AdminCreateEng />} />
      <Route path="/create-admin" element={<AdminCreateAdmin />} />
      <Route path="/admin-notifi" element={<AdminNotification />} />
      <Route path="/admin-profile" element={<AdminProfile />} />
      <Route path="/admin-viewcus" element={<AdminViewCus />} />
      <Route path="/admin-history" element={<AdminHistory />} />
      <Route path="/admin-forgot" element={<AdminForgotPass />} />
      <Route path="/admin-reset" element={<AdminResetPass />} />
      <Route path="/admin-view-closed" element={<AdminViewClosed />} />
      <Route path="/admin-view-pending" element={<AdminViewPending />} />
      <Route path="/admin-viewon" element={<AdminViewOngoing />} />
      

      <Route path="/eng-login" element={<EngLogin />} />
      <Route path="/eng-dash" element={<EngDash />} />
      <Route path="/eng-forgot" element={<EngForgotPass />} />
      <Route path="/eng-reset" element={<EngResetPass />} />
      <Route path="/eng-profile" element={<EngProfile />} />
      <Route path="/eng-notifi" element={<EngNotification />} />
      <Route path="/eng-myticket" element={<EngAssignedTicket />} />
      <Route path="/eng-history" element={<EngHistory />} />
      <Route path="/eng-view-closed" element={<EngViewClosed />} />
      <Route path="/eng-view-pending/:ticketId" element={<EngViewPending />} />
      <Route path="/eng-viewon/:ticketId" element={<EngViewOngoing />} />
      <Route path="/eng-view-assign/:ticketId" element={<EngViewAssigned />} />
      <Route path="/eng-close-ticket" element={<EngCloseTicket />} />
      <Route path="/eng-cus-details" element={<EngCustomerDetails />} />
      
    </Routes>
    </AnimatePresence>
  );
};

export default App;
