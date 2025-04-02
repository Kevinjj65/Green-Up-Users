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
    <div className="w-screen h-screen bg-[#1e1e1e] text-[#39FF14] flex flex-col">
      {/* Header - Fixed at the top */}
      <header className="bg-[#1e1e1e] py-4 px-6 flex justify-between items-center border-b border-[#39FF14] sticky top-0 z-50">
        <h1 className="text-2xl font-bold">GREEN UP</h1>
        <button
          onClick={() => navigate("/userlogin")}
          style={{
            backgroundColor: "#39FF14",
            color: "#1e1e1e",
            fontWeight: "bold",
            width: "100px",
            height: "35px",
            fontSize: "14px",
            borderRadius: "20px",
            border: "1px solid #39FF14",
            boxShadow: "0px 2px 4px rgba(57, 255, 20, 0.5)",
            cursor: "pointer",
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Login
        </button>
      </header>

      {/* Main Section - Enables Vertical Scrolling */}
      <main className="p-6 flex-1 overflow-y-auto">
        <h2 className="text-3xl font-semibold mb-4">Nearby Events</h2>

        {/* Event Grid - 2 Cards Per Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
          {events.length > 0 ? (
            events.map((event) => (
              <div
                key={event.id}
                className="bg-[#39FF14] text-[#1e1e1e] p-4 rounded-lg shadow-lg"
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
