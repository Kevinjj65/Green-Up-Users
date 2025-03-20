import { useNavigate } from "react-router-dom";
import viewAll from "../../../assets/viewAll.svg";
import registeredEvents from "../../../assets/registeredEvents.svg";
import nearbyEvents from "../../../assets/nearbyEvents.svg";
import user from "../../../assets/user.svg";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="w-full h-[10vh] bg-[#2A2A2A] fixed bottom-0 left-0 flex justify-between items-center px-[10%]">
      <div 
        className="w-12 h-12 rounded-full bg-[#39FF14] flex justify-center items-center border border-white p-2 cursor-pointer" 
        onClick={() => navigate("/events")}
      >
        <img src={viewAll} alt="View All" className="w-6 h-6 object-contain" />
      </div>
      <div className="w-12 h-12 rounded-full bg-[#39FF14] flex justify-center items-center border border-white p-2">
        <img src={registeredEvents} alt="Registered Events" className="w-6 h-6 object-contain" />
      </div>
      <div className="w-12 h-12 rounded-full bg-[#39FF14] flex justify-center items-center border border-white p-2">
        <img src={nearbyEvents} alt="Nearby Events" className="w-6 h-6 object-contain" />
      </div>
      <div 
        className="w-12 h-12 rounded-full bg-[#39FF14] flex justify-center items-center border border-white p-2 cursor-pointer" 
        onClick={() => navigate("/userprofile")}
      >
        <img src={user} alt="User Profile" className="w-6 h-6 object-contain" />
      </div>
    </footer>
  );
};

export default Footer;
