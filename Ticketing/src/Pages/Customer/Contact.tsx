import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import ContactImage from "../../assets/contact-us-banner.jpg";

interface GoogleMapEmbedProps {
  src: string;
  title?: string;
  width?: string;
  height?: string; // Keep height as string to allow 'px' or 'vh'
}

const GoogleMapEmbed: React.FC<GoogleMapEmbedProps> = ({
  src,
  title = "Google Map",
  width = "600",
  height = "450px", // Default for the component (though overridden in usage)
}) => {
  return (
    <div className="overflow-hidden rounded-lg shadow-lg w-full max-w-6xl mt-4">
      <iframe
        src={src}
        title={title}
        width={width}
        height={height} // Using the height prop here
        style={{ border: 0 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="w-full h-full"
      ></iframe>
    </div>
  );
};

const Contact = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  // !!! IMPORTANT: REPLACE THIS PLACEHOLDER WITH YOUR ACTUAL, VALID GOOGLE MAPS EMBED URL !!!
  // Go to Google Maps -> Search Location -> Share -> Embed a map -> Copy HTML -> Get the 'src' value
  const googleMapsEmbedSrc = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.812869039158!2d79.85217097570619!3d6.912964718513515!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae259699fb39847%3A0xec2f662ca1f932d5!2sLankaCom!5e0!3m2!1sen!2slk!4v1748579292813!5m2!1sen!2slk"; // This should be replaced


  return (
    <div className="h-screen w-screen flex overflow-hidden">
      {/* Sidebar (fixed size) */}
      <div className="flex-shrink-0">
        <Sidebar isOpen={isSidebarOpen} />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col h-screen min-h-0 justify-center">
        {/* Navbar (fixed height) */}
        <div className="flex-shrink-0">
          <Navbar toggleSidebar={toggleSidebar} />
        </div>

        {/* Scrollable Content */}
        {/* This div correctly has overflow-y-auto to enable scrolling */}
        <div className="flex-1 overflow-y-auto bg-gray-100 px-80 pt-10">

          <div className="w-full bg-white p-6 mx-auto rounded shadow text-gray-800 text-lg leading-relaxed font-jura px-10">

          {/* Image at the top */}
          <img
            src={ContactImage}
            alt="Contact Us"
            className="w-full md:w-full h-auto rounded shadow-lg mb-4"
          />

          {/* Contact Details Section */}
          <div className="bg-white p-6 rounded-lg shadow-lg mt-8 w-full max-w-6xl mb-4 md:w-full item-center justify-center text center  h-auto ">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800 text-center font-jura">Have questions or need assistance? Feel free to reach out to us!</h3>
            
            <p className="text-gray-700 leading-relaxed">
                  We are always here to help you with your inquiries. Whether you have technical questions, need support for our services, or want to explore partnership opportunities, our dedicated team is ready to assist. Please use the contact methods provided on the left, and we will get back to you as soon as possible. Your satisfaction is our priority, and we look forward to hearing from you.
            </p>
            {/* Two-column layout for medium screens and up */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
              
              {/* Left Section - Contact Details */}
              <div>
                <p className="text-gray-700 mb-2">
                  <strong className=" text-blue-500 font-extrabold">Inquiry Emails:</strong> <p>sec@lankacom.net | secops@lankacom.net</p>
                </p>
                <p className="text-gray-700 mb-2">
                  <strong className="text-blue-500 font-extrabold">Contact Shift Engineer:</strong> <p>+94 76 801 5688</p>
                </p>
                <p className="text-gray-700">
                  <strong className="text-blue-500 font-extrabold">Address:</strong><br />
                  Lanka Communication Services (Pvt.) Ltd,<br />
                  65 C, Dharmapala Mawatha,<br />
                  Colombo 07,<br />
                  Sri Lanka.
                </p>
              </div>

              {/* Right Section - Paragraph */}
              <div>
                <p className="text-gray-700 mb-2">
                  <strong className=" text-blue-500 font-extrabold">CUSTOMER SUPPORT CENTER</strong> <p>noc@lankacom.net</p>
                </p>
                <p className="text-gray-700 mb-2">
                  <strong className="text-blue-500 font-extrabold">Contact : </strong> <p>+94 11 244 0 644</p>
                </p>
              </div>
            </div>
          </div>
          

          {/* Our Location Heading */}
          <h2 className="text-2xl font-semibold mt-6 mb-4 text-gray-800 text-center w-full max-w-6xl font-jura">Our Location</h2>

          {/* Google Map Embed Section */}
          <GoogleMapEmbed
            src={googleMapsEmbedSrc}
            title="Our Business Location on Google Maps"
            width="100%"
            // --- CRITICAL CHANGE HERE ---
            height="500px" // Changed from 5000px to a more reasonable 500px
            // Consider "550px" or "60vh" if you want it taller or responsive.
          />
        </div>
      </div>
    </div>
    </div>
  );
};

export default Contact;