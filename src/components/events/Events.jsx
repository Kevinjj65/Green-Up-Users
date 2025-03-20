import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./../../services/supabaseClient.jsx";
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
          .select("id, title, images, date, time, latitude, longitude");

        if (error) throw error;

        // Convert lat/lng to human-readable addresses
        const eventsWithAddresses = await Promise.all(
          data.map(async (event) => {
            if (event.latitude && event.longitude) {
              event.address = await fetchAddressFromCoordinates(event.latitude, event.longitude);
            } else {
              event.address = "Location not available";
            }
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
      <header className="bg-green-700 py-4 px-6 flex items-center justify-between text-white sticky top-0 z-10">
        <h1 className="text-xl font-bold">All Events</h1>

        <button
          onClick={() => setIsMapView(!isMapView)}
          className="flex items-center bg-green-500 px-4 py-2 rounded-lg hover:bg-green-600 transition"
        >
          <ArrowsRightLeftIcon className="h-5 w-5 mr-2" />
          {isMapView ? "Events View" : "Map View"}
        </button>
      </header>

      {isMapView && navigate("/maps")}

      <div className="p-6 overflow-x-auto">
        <h2 className="text-3xl font-semibold mb-4">Upcoming Events</h2>
        <div className="flex space-x-6 overflow-x-scroll scrollbar-hide">
          {events.map((event) => (
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
                  <span>{event.date} | {event.time}</span>
                </div>
                {/* 📍 Event Location */}
                <div className="flex items-center">
                  <MapPinIcon className="h-5 w-5 text-red-600 mr-2" />
                  <span>{event.address}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Events;
