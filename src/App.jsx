import Home from "./components/home/Home";
import Events from "./components/events/Events";
import AddNew from "./components/organizer/AddNew";
<<<<<<< HEAD
import RegisterEvent from "./components/user/RegisterEvent";
import Login from "./components/organizer/login page/Login.jsx";
import SignUp from "./components/organizer/signup page/Signup.jsx";
import Footer from "./components/organizer/Footer.jsx";

// import { useEffect, useState } from "react";
// import { supabase } from "./services/supabaseClient.jsx";
=======
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
>>>>>>> 27ab7e49b1cb6768142c25d579f8e9686ad6e5f4
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AfterRegistration from "./components/user/AfterRegistration/AfterRegistration";
import UserProfile from "./components/user/UserProfile/UserProfile.jsx";
import RegisteredEvents from "./components/user/RegisteredEvents/RegisteredEvents.jsx";
//import OrganizerEventChat from "./components/organizer/OrganizerAttendeeChat.jsx";
import Chat from './components/Chat/Chat.jsx'
import OrganizerChatList from "./components/organizer/OrganizerChatList.jsx";
import OrganizerChat from "./components/organizer/OrganizerChat.jsx";
 function App() {


  return (
    <>


      {/* Routing Setup */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
<<<<<<< HEAD
          <Route path="/organizenew" element={<AddNew />} />
          <Route path="/organizerlogin" element={<Login />} />
          <Route path="/registerevent" element={<RegisterEvent />} />
          <Route path="/organizersignup" element={<SignUp />} />
          <Route path="/Footer"element={<Footer />} />
=======
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
          <Route path="/chat/:organizerId/:eventId/:attendeeId" element={<Chat />} />
          <Route path="/organizer/event/:eventId/chat" element={<OrganizerChatList />} />
          <Route path="/organizer/chat/:eventId/:attendeeId" element={<OrganizerChat />} />

>>>>>>> 27ab7e49b1cb6768142c25d579f8e9686ad6e5f4
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
