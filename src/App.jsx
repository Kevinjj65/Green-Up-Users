import Home from "./components/home/Home";
import Events from "./components/events/Events";
import AddNew from "./components/organizer/AddNew";
import Login from "./components/organizer/login";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { BrowserRouter, Route, Routes } from "react-router-dom";

// Initialize Supabase Client (Replace with your actual project details)
const supabase = createClient(
  "https://qpedcspyudeptjfwuwhl.supabase.co", 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwZWRjc3B5dWRlcHRqZnd1d2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3MzMyNDIsImV4cCI6MjA1NjMwOTI0Mn0._M89M93iD2Dayi1DKq3NB3xt7sGWHh5KTS2VEh75SKA"
);

function App() {
  const [instruments, setInstruments] = useState([]);

  useEffect(() => {
    getInstruments();
  }, []);

  async function getInstruments() {
    const { data, error } = await supabase.from("instruments").select();
    if (error) {
      console.error("Error fetching instruments:", error.message);
    } else {
      setInstruments(data);
    }
  }

  return (
    <>
      {/* Display instruments from Supabase */}
      <ul>
        {instruments.map((instrument) => (
          <li key={instrument.name}>{instrument.name}</li>
        ))}
      </ul>

      {/* Routing Setup */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/organizenew" element={<AddNew />} />
          <Route path="/organizerlogin" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
