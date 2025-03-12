import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabaseClient"; // Import Supabase client
import AuthModal from "../authentication/AuthModal";

const Home = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [events, setEvents] = useState([]); // Store events
  const navigate = useNavigate();

  useEffect(() => {
    // Function to fetch events from Supabase
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from("events") // Fetch from the "events" table
          .select("title, location, images");

        if (error) throw error;

        // Update state with fetched events
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error.message);
      }
    };

    fetchEvents(); // Call function on component mount
  }, []);

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#39FF14]">
      {/* Header */}
      <header className="bg-[#1e1e1e] py-4 px-6 flex justify-between items-center border-b border-[#39FF14]">
        <h1 className="text-3xl font-bold">GREEN UP</h1>

        {/* Cute Login Button */}
        <button
          onClick={() => setIsAuthOpen(true)}
          className="bg-[#39FF14] text-[#1e1e1e] font-semibold px-6 py-2 rounded-full 
                     shadow-lg hover:scale-105 transition-all duration-300 border border-[#39FF14] 
                     hover:shadow-[#39FF14] hover:shadow-md"
        >
          Login
        </button>
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Main Section */}
      <main className="p-6">
        <h2 className="text-3xl font-semibold mb-4">Upcoming Events</h2>

        {/* Event Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {events.length > 0 ? (
            events.map((event, index) => (
              <div
                key={index}
                className="bg-[#39FF14] text-[#1e1e1e] p-4 rounded-lg shadow-lg"
              >
                {/* Event Image */}
                <img
                  src={event.images}
                  alt={event.title}
                  className="w-full h-40 object-cover rounded-lg"
                />
                {/* Event Title */}
                <h3 className="text-lg font-semibold mt-2">{event.title}</h3>
                {/* Event Location */}
                <p className="text-[#1e1e1e] font-medium">
                  {event.location} {/* Convert to readable format if needed */}
                  
                </p> <p className="text-[#1e1e1e] font-medium">
                  {event.date} 
                  
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No upcoming events available.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
