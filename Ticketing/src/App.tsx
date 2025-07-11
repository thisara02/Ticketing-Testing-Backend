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
import AddBundle from "./Pages/Customer/AdditionalBundle"
import AdminDash from "./Pages/Admin/AdminDashboard"
import EngLogin from "./Pages/Engineer/EngLogin"
import AdminCreateCus from "./Pages/Admin/AdminCreateCus"
import AdminCreateCompany from "./Pages/Admin/AdminCreateCompany"
import AdminCreateEng from "./Pages/Admin/AdminCreateEng"
import AdminCreateAdmin from "./Pages/Admin/AdminCreateAdmin"
import AdminCreateAM from "./Pages/Admin/AdminCreateAM"
import AdminNotification from "./Pages/Admin/AdminNotifications"
import AdminProfile from "./Pages/Admin/AdminProfile"
import AdminHistory from "./Pages/Admin/AdminHistory"
import AdminForgotPass from "./Pages/Admin/AdminForgotPassword"
import AdminAddBunldes from "./Pages/Admin/AdminAddBundle"
import AdminResetPass from "./Pages/Admin/AdminResetPassword"
import AdminViewPending from "./Pages/Admin/AdminViewPending"
import AdminViewClosed from "./Pages/Admin/AdminViewClosed"
import AdminViewOngoing from "./Pages/Admin/AdminViewOngoing"
import AdminOtp from "./Pages/Admin/AdminOtp";
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
import EngCustomerDetails from "./Pages/Engineer/EngCustomerDetails"
import EngCreateSR from "./Pages/Engineer/EngCreateSR"
import EngCreateFT from "./Pages/Engineer/EngCreateFT"
import AMProfile from "./Pages/AccountManager/AMProfile"
import AMForgotPass from "./Pages/AccountManager/AMForgotPassword"
import AMResetPass from "./Pages/AccountManager/AMResetPassword"
import AMDash from "./Pages/AccountManager/AMDashboard"
import AMLogin from "./Pages/AccountManager/AMLogin"
import AMTickets from "./Pages/AccountManager/AMTickets"
import AMViewPending from "./Pages/AccountManager/AMViewPending"
import AMViewClosed from "./Pages/AccountManager/AMViewClosed"
import AMViewOngoing from "./Pages/AccountManager/AMViewOngoing"
import AMCompanyDetail from "./Pages/AccountManager/AMCompanyDetails"


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
      <Route path="/view-closed/:ticketId" element={<ViewClosed />} />
      <Route path="/view-sr" element={<ViewSR />} />
      <Route path="/create-sr" element={<CreateSR />} />
      <Route path="/create-ft" element={<CreateFT />} />
      <Route path="/view-pending/:ticketId" element={<ViewPending />} />
      <Route path="/viewon/:ticketId" element={<ViewOngoing />} />
      <Route path="/profile" element={<CusProfile />} />
      <Route path="/forgot-pass" element={<ForgotPassword />} />
      <Route path="/reset-pass" element={<ResetPass />} />
      <Route path="/add-bundle" element={<AddBundle />} />

      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin-dash" element={<AdminDash />} />
      <Route path="/create-cus" element={<AdminCreateCus />} />
      <Route path="/create-company" element={<AdminCreateCompany />} />
      <Route path="/create-eng" element={<AdminCreateEng />} />
      <Route path="/create-admin" element={<AdminCreateAdmin />} />
      <Route path="/create-AM" element={<AdminCreateAM />} />
      <Route path="/admin-notifi" element={<AdminNotification />} />
      <Route path="/admin-profile" element={<AdminProfile />} />
      <Route path="/admin-history" element={<AdminHistory />} />
      <Route path="/admin-forgot" element={<AdminForgotPass />} />
      <Route path="/admin-reset" element={<AdminResetPass />} />
      <Route path="/admin-view-closed/:ticketId" element={<AdminViewClosed />} />
      <Route path="/admin-view-pending/:ticketId" element={<AdminViewPending />} />
      <Route path="/admin-viewon/:ticketId" element={<AdminViewOngoing />} />
      <Route path="/admin-otp" element={<AdminOtp />} />
      <Route path="/admin-add-bundle" element={<AdminAddBunldes />} />
      
      <Route path="/eng-login" element={<EngLogin />} />
      <Route path="/eng-dash" element={<EngDash />} />
      <Route path="/eng-forgot" element={<EngForgotPass />} />
      <Route path="/eng-reset" element={<EngResetPass />} />
      <Route path="/eng-profile" element={<EngProfile />} />
      <Route path="/eng-notifi" element={<EngNotification />} />
      <Route path="/eng-myticket" element={<EngAssignedTicket />} />
      <Route path="/eng-history" element={<EngHistory />} />
      <Route path="/eng-view-closed/:ticketId" element={<EngViewClosed />} />
      <Route path="/eng-view-pending/:ticketId" element={<EngViewPending />} />
      <Route path="/eng-viewon/:ticketId" element={<EngViewOngoing />} />
      <Route path="/eng-view-assign/:ticketId" element={<EngViewAssigned />} />
      <Route path="/eng-cus-details" element={<EngCustomerDetails />} />
      <Route path="/eng-create-sr" element={<EngCreateSR />} />
      <Route path="/eng-create-ft" element={<EngCreateFT />} />
      
      <Route path="/am-login" element={<AMLogin />} />
      <Route path="/am-dash" element={<AMDash />} />
      <Route path="/am-forgot" element={<AMForgotPass />} />
      <Route path="/am-reset" element={<AMResetPass />} />
      <Route path="/am-profile" element={<AMProfile />} />
      <Route path="/am-tickets" element={<AMTickets />} />
      <Route path="/am-view-closed/:ticketId" element={<AMViewClosed />} />
      <Route path="/am-view-pending/:ticketId" element={<AMViewPending />} />
      <Route path="/am-viewon/:ticketId" element={<AMViewOngoing />} />
      <Route path="/am-company/:companyName" element={<AMCompanyDetail />} />

      
    </Routes>
    </AnimatePresence>
  );
};

export default App;
