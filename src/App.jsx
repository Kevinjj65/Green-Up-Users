import Home from "./components/home/Home";
import Events from "./components/events/Events";
import AddNew from "./components/organizer/AddNew";
import RegisterEvent from "./components/user/RegisterEvent/RegisterEvent";
import Login from "./components/organizer/Login.jsx";
import SignUp from "./components/organizer/Signup";
// import { useEffect, useState } from "react";
// import { supabase } from "./services/supabaseClient.jsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AfterRegistration from "./components/user/AfterRegistration/AfterRegistration";

 function App() {
//   const [instruments, setInstruments] = useState([]);

//   useEffect(() => {
//     getInstruments();
//   }, []);
//   async function getInstruments() {
//     const { data, error } = await supabase.from("instruments").select();
//     console.log("test madafaka");
//     if (error) {
//       console.error("Error fetching instruments:", error.message);
//     } else {
//       setInstruments(data);
//     }
//   }
  // async function getInstruments() {
  //   const { data, error } = await supabase.from("instruments").select();
  //   if (error) {
  //     console.error("Error fetching instruments:", error.message);
  //   } else {
  //     setInstruments(data);
  //   }
  // }

  return (
    <>
      {/* Display instruments from Supabase */}
      {/* <ul>
        {instruments.map((instrument) => (
          <li key={instrument.name}>{instrument.name}</li>
        ))}
      </ul> */}

      {/* Routing Setup */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/organizenew" element={<AddNew />} />
          <Route path="/organizerlogin" element={<Login />} />
          <Route path="/registerevent" element={<RegisterEvent />} />
          <Route path="/organizersignup" element={<SignUp />} />
          <Route path="/afterregistration" element={<AfterRegistration/>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
