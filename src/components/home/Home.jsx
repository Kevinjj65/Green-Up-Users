import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabaseClient"; // Import Supabase client
import AuthModal from "../authentication/AuthModal";
import "./Home.css"; // Import CSS file

const Home = () => {
  
  const [events, setEvents] = useState([]); // Store events
  const navigate = useNavigate();

  useEffect(() => {
    // Function to fetch events from Supabase
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from("events") // Fetch from the "events" table
          .select("title, location, images, date");

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
    <div className="home-container">
      {/* Header */}
      <header className="home-header">
        <h1 className="home-title">GREEN UP</h1>

        {/* Fixed Login Button - Side-aligned */}
        <button onClick={() => navigate('/userlogin')} className="home-login-btn">
          Login
        </button>
      </header>

    
      {/* Main Section */}
      <main className="home-main">
        <h2 className="home-section-title">Upcoming Events</h2>

        {/* Event Grid */}
        <div className="home-event-grid">
          {events.length > 0 ? (
            events.map((event, index) => (
              <div key={index} className="home-event-card">
                {/* Event Image */}
                <img src={event.images} alt={event.title} className="home-event-image" />
                
                {/* Event Title */}
                <h3 className="home-event-title">{event.title}</h3>

                {/* Event Location */}
                <p className="home-event-location">{event.location}</p>

                {/* Event Date */}
                <p className="home-event-date">{event.date}</p>
              </div>
            ))
          ) : (
            <p className="home-no-events">No upcoming events available.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;