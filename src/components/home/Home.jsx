import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabaseClient";
import AuthModal from "../authentication/AuthModal";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY; // Store in .env

const Home = () => {
  const [events, setEvents] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user's location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
      },
      (error) => {
        console.error("Error getting user location:", error);
      }
    );
  }, []);

  useEffect(() => {
    fetchAllEvents();
  }, []);
  

  const fetchNearbyEvents = async (userLat, userLon) => {
    try {
      const { data, error } = await supabase.rpc("get_nearby_events", {
        user_lat: userLat,
        user_lon: userLon,
        radius_km: 10, // Find events within 10 km
      });

      if (error) throw error;

      console.log("Fetched Nearby Events:", data);

      // Convert lat/lon to readable addresses
      const eventsWithAddresses = await Promise.all(
        data.map(async (event) => {
          const address = await getReadableAddress(event.latitude, event.longitude);
          return { ...event, address };
        })
      );

      setEvents(eventsWithAddresses);
    } catch (error) {
      console.error("Error fetching events:", error.message);
    }
  };

  const fetchAllEvents = async () => {
    try {
      const { data, error } = await supabase.from("events").select("*");
  
      if (error) throw error;
  
      console.log("Fetched All Events:", data);
  
      // Convert lat/lon to readable addresses
      const eventsWithAddresses = await Promise.all(
        data.map(async (event) => {
          const address = await getReadableAddress(event.latitude, event.longitude);
          return { ...event, address };
        })
      );
  
      setEvents(eventsWithAddresses);
    } catch (error) {
      console.error("Error fetching events:", error.message);
    }
  };
  

  // Function to get the human-readable address from Google Maps API
  const getReadableAddress = async (lat, lon) => {
    if (!lat || !lon) return "Unknown Location";

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${GOOGLE_MAPS_API_KEY}`
      );

      if (!response.ok) throw new Error(`API error: ${response.statusText}`);

      const data = await response.json();
      return data.results[0]?.formatted_address || "Unknown Location";
    } catch (error) {
      console.error("Error fetching address:", error.message);
      return "Unknown Location";
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#39FF14]">
      {/* Header */}
      <header className="bg-[#1e1e1e] py-4 px-6 flex justify-between items-center border-b border-[#39FF14]">
        <h1 className="text-3xl font-bold">GREEN UP</h1>
        <button
          onClick={() => navigate("/userlogin")}
          className="bg-[#39FF14] text-[#1e1e1e] font-semibold px-6 py-2 rounded-full 
                     shadow-lg hover:scale-105 transition-all duration-300 border border-[#39FF14] 
                     hover:shadow-[#39FF14] hover:shadow-md"
        >
          Login
        </button>
      </header>

      {/* Main Section */}
      <main className="p-6">
        <h2 className="text-3xl font-semibold mb-4">Nearby Events</h2>

        {/* Event Grid */}
        <div className="grid grid-cols-2 md-grid-cols-3 lg-grid-cols-4 gap-6">
          {events.length > 0 ? (
            events.map((event) => (
              <div key={event.id} className="bg-[#39FF14] text-[#1e1e1e] p-4 rounded-lg shadow-lg">
                <img onClick={()=> navigate("/userlogin")}
                  src={event.images}
                  alt={event.title}
                  className="w-full h-40 object-cover rounded-lg"
                />
                <h3 className="text-lg font-semibold mt-2">{event.title}</h3>
                <p className="text-[#1e1e1e] font-medium">{event.address}</p>
                <p className="text-[#1e1e1e] font-medium">
                  {new Date(event.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No nearby events found.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
