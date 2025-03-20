import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabaseClient";
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY; // Store in .env

const Home = () => {
  const [events, setEvents] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
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

  const fetchAllEvents = async () => {
    try {
      const { data, error } = await supabase.from("events").select("*");

      if (error) throw error;

      console.log("Fetched All Events:", data);

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
      {/* Header - Fixed at the top */}
      <header className="bg-[#1e1e1e] py-4 px-6 flex justify-between items-center border-b border-[#39FF14] sticky top-0 z-50">
        <h1 className="text-2xl font-bold">GREEN UP</h1>
        <button
          onClick={() => navigate("/userlogin")}
          className="bg-[#39FF14] text-[#1e1e1e] font-semibold px-5 py-1.5 text-sm rounded-full 
                     shadow-lg hover:scale-105 transition-all duration-300 border border-[#39FF14] 
                     hover:shadow-[#39FF14] hover:shadow-md"
        >
          Login
        </button>
      </header>

      {/* Main Section */}
      <main className="p-6">
        <h2 className="text-3xl font-semibold mb-4">Nearby Events</h2>

        {/* Horizontally Scrollable Event List */}
        <div className="flex space-x-6 overflow-x-auto scrollbar-hide p-2">
          {events.length > 0 ? (
            events.map((event) => (
              <div
                key={event.id}
                className="bg-[#39FF14] text-[#1e1e1e] p-4 rounded-lg shadow-lg w-64 flex-shrink-0"
              >
                <img
                  onClick={() => navigate("/userlogin")}
                  src={event.images}
                  alt={event.title}
                  className="w-full h-40 object-cover rounded-lg"
                />
                <h3 className="text-lg font-semibold mt-2">{event.title}</h3>
                <p className="text-sm font-medium">{event.address}</p>
                <p className="text-sm font-medium">
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
