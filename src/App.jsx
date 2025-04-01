import Home from "./components/home/Home";
import Events from "./components/events/Events";
import AddNew from "./components/organizer/AddNew";
import Scan from './components/organizer/scan.jsx'
import RegisterEvent from "./components/user/RegisterEvent/RegisterEvent";
import Login from "./components/organizer/Login.jsx";
import SignUp from "./components/organizer/Signup";
import LLogin from '././components/user/Login/login.jsx'
import SSignup from '././components/user/Login/Signup.jsx'
import OrgMaps from '././components/organizer/OrganizerEventsMaps.jsx';
import UserMaps from './components/user/Map/EventsMap.jsx';
import OrganizerEvents from "./components/organizer/OrganizerEvents.jsx";
import OrganizerProfile from "./components/organizer/OrganizerProfile.jsx";
import EventDetailsOrg from "./components/organizer/EventDetailsOrg.jsx";
//import OrganizerEventsMap from "././components/organizer/OrganizerEventsMaps.jsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AfterRegistration from "./components/user/AfterRegistration/AfterRegistration";
import UserProfile from "./components/user/UserProfile/UserProfile.jsx";
import RegisteredEvents from "./components/user/RegisteredEvents/RegisteredEvents.jsx";

 function App() {


  return (
    <>


      {/* Routing Setup */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/userlogin" element={<LLogin />} />
          <Route path="/usersignup" element={<SSignup />} />
          <Route path="/usermaps" element={<UserMaps />} />
          <Route path="/userprofile" element={<UserProfile />} />
          <Route path="/registerevent/:id" element={<RegisterEvent />} />
          <Route path="/organizer/profile" element={<OrganizerProfile />} />
        <Route path="/organizer/events" element={<OrganizerEvents />} />
        <Route path="/organizer/event/:id" element={<EventDetailsOrg />} />
        <Route path="/organizenew" element={<AddNew />} />
        <Route path="/organizerlogin" element={<Login />} />
        <Route path="/orgmaps" element={<OrgMaps />} />
        <Route path="/organizersignup" element={<SignUp />} />
          <Route path="/scan" element={<Scan />} />
          <Route path = "/registeredevents" element={<RegisteredEvents/>}/>
          <Route path="/afterregistration/:eventId/:attendeeId" element={<AfterRegistration/>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
