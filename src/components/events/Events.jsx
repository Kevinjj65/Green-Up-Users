import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabaseClient.jsx";
import { MapPinIcon, ClockIcon, ArrowsRightLeftIcon } from "@heroicons/react/24/solid";
import Footer from "../user/Footer/Footer.jsx";

const Events = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [isMapView, setIsMapView] = useState(false);
  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY; // ✅ Get API Key from .env file

  // Fetch Events with Location Details
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("id, title, images, date, latitude, longitude"); // Removed 'time'

        if (error) throw error;

        // Convert lat/lng to human-readable addresses
        const eventsWithAddresses = await Promise.all(
          data.map(async (event) => {
            event.address = event.latitude && event.longitude
              ? await fetchAddressFromCoordinates(event.latitude, event.longitude)
              : "Location not available";
            return event;
          })
        );

        setEvents(eventsWithAddresses);
      } catch (error) {
        console.error("Error fetching events:", error.message);
      }
    };

    fetchEvents();
  }, []);

  // Handle Map View Navigation Properly
  useEffect(() => {
    if (isMapView) {
      navigate("/maps");
    }
  }, [isMapView, navigate]);

  // Function to Convert Lat/Lng to Address using Google Maps API
  async function fetchAddressFromCoordinates(lat, lon) {
    if (!API_KEY) {
      console.error("Google Maps API Key is missing!");
      return "Location not available";
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${API_KEY}`;
    try {
      const response = await fetch(url);
      const result = await response.json();
      if (result.status === "OK") {
        return result.results[0]?.formatted_address || "Unknown Location";
      }
    } catch (error) {
      console.error("Error fetching address:", error);
    }
    return "Unknown Location";
  }

  return (
    <div className="min-h-screen bg-green-50 text-green-900">
      {/* Header */}
      <header className="bg-green-700 py-4 px-6 flex items-center justify-between text-white sticky top-0 z-10">
        <h1 className="text-xl font-bold">All Events</h1>

        <button
          onClick={() => setIsMapView(!isMapView)}
          className="flex items-center justify-center bg-green-500 text-xs px-3 py-1 rounded-md hover:bg-green-600 transition !h-auto !w-auto"
        >
          <ArrowsRightLeftIcon className="h-4 w-4 mr-1" />
          {isMapView ? "Events View" : "Map View"}
        </button>


      </header>

      {/* Events List */}
      <div className="p-6 overflow-x-auto">
        <h2 className="text-3xl font-semibold mb-4">Upcoming Events</h2>
        <div className="flex space-x-6 overflow-x-scroll scrollbar-hide">
          {events.length > 0 ? (
            events.map((event) => (
              <div
                key={event.id}
                className="bg-green-200 p-4 rounded-lg shadow-md w-64 cursor-pointer hover:bg-green-300 transition"
                onClick={() => navigate(`/registerevent/${event.id}`)}
              >
                <img
                  src={event.images}
                  alt={event.title}
                  className="w-full h-32 object-cover rounded-t-lg"
                />
                <h3 className="text-lg font-semibold mt-2 text-center">{event.title}</h3>
                <div className="mt-2 text-sm flex flex-col space-y-1">
                  {/* 📅 Event Date */}
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 text-green-700 mr-2" />
                    <span>{event.date}</span>
                  </div>
                  {/* 📍 Event Location */}
                  <div className="flex items-center">
                    <MapPinIcon className="h-5 w-5 text-red-600 mr-2" />
                    <span>{event.address}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No events available.</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Events;
