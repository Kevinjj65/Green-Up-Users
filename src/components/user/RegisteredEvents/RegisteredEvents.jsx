import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import { supabase } from "../../../services/supabaseClient.jsx"; // Adjust path if needed
import Footer from "../Footer/Footer";

// ✅ Rectangle component to display event details
function EventRectangle({ event, userId }) {
  const navigate = useNavigate();

  return (
    <div
      className="bg-[#2A2A2A] p-4 rounded-md mb-4 w-full h-24 flex flex-col justify-center items-start border border-white cursor-pointer hover:bg-[#3A3A3A] transition"
      onClick={() => navigate(`/afterregistration/${event.id}/${userId}`)} // ✅ Navigate on click
    >
      <p className="text-lg font-semibold text-white">{event.title}</p>
      <p className="text-sm text-gray-400">{event.date}</p>
    </div>
  );
}

// ✅ Registered Events Page
function RegisteredEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchRegisteredEvents = async () => {
      setLoading(true);
      setError("");

      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError || !authData?.user) {
        setError("User not authenticated.");
        setLoading(false);
        return;
      }

      setUserId(authData.user.id); // ✅ Store user ID

      // ✅ Fetch registered events from "registrations" table with event details
      const { data, error: fetchError } = await supabase
        .from("registrations")
        .select("event_id, events(id, title, date)") // ✅ Ensure event ID is included
        .eq("attendee_id", authData.user.id);

      if (fetchError) {
        console.error("Supabase Error:", fetchError);
        setError("Failed to fetch registered events.");
      } else {
        setEvents(data || []);
      }

      setLoading(false);
    };

    fetchRegisteredEvents();
  }, []);

  return (
    <div className="bg-[#1E1E1E] w-screen min-h-screen flex flex-col text-white py-10 pt-24 pb-24">
      {/* Title fixed at the top */}
      <h1 className="text-2xl font-bold text-center fixed top-0 left-0 right-0 bg-[#1E1E1E] p-4 z-10">
        Registered Events
      </h1>

      {/* Events List */}
      <div className="w-[80%] max-w-lg mx-auto mt-28">
        {loading ? (
          <p className="text-gray-400">Loading events...</p>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : events.length === 0 ? (
          <p className="text-gray-400">No registered events found.</p>
        ) : (
          events.map((event, index) => (
            <EventRectangle key={index} event={event.events} userId={userId} /> // ✅ Pass userId to EventRectangle
          ))
        )}
      </div>

      <Footer />
    </div>
  );
}

export default RegisteredEvents;
