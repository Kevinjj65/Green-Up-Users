import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabaseClient.jsx";
import { MapPinIcon, ClockIcon, ArrowsRightLeftIcon } from "@heroicons/react/24/solid";
import Footer from "../user/Footer/Footer.jsx";

const Events = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]); // ✅ Stores events within 10km
  const [isMapView, setIsMapView] = useState(false);

  const [userLocation, setUserLocation] = useState(null);
  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY; // ✅ Get API Key from .env file


  // Fetch Events with Location Details
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("id, title, images, date, latitude, longitude");

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

  // Get User's Location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => console.error("Error getting location:", error.message)
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  // Filter Events Based on 10 km Range
  useEffect(() => {
    if (userLocation && events.length > 0) {
      const filtered = events.filter((event) =>
        event.latitude && event.longitude &&
        calculateDistance(userLocation.latitude, userLocation.longitude, event.latitude, event.longitude) <= 10
      );
      setFilteredEvents(filtered);
    }
  }, [userLocation, events]);

  // Haversine Formula to Calculate Distance Between Two Coordinates
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

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
    <div className="bg-green-50 min-h-screen flex flex-col">
      {/* Sticky Header (No Text Overflow) */}
      <header className="bg-green-700 py-4 px-6 flex items-center justify-between text-white sticky top-0 left-0 right-0 z-10 h-16 overflow-hidden">
        {/* Title - With max width */}
        <h1 className="text-xl font-bold truncate flex-1 max-w-[30vw]">
          All Events
        </h1>

        {/* Toggle Button - With max width */}
        <button

         onClick={() => navigate("/usermaps")}
          className="flex items-center justify-center bg-green-500 text-xs px-3 py-1 rounded-md hover:bg-green-600 transition !h-auto !w-auto"

        >
          <ArrowsRightLeftIcon className="h-3 w-3 mr-1" />
          {isMapView ? "Events View" : "Map View"}
        </button>
      </header>


      {/* Events List */}
      <div className="p-6 overflow-x-auto">
        <h2 className="text-3xl font-semibold mb-4">Upcoming Events</h2>
        <div className="flex space-x-6 overflow-x-scroll scrollbar-hide">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (

              <div
                key={event.id}
                className="bg-green-200 p-4 rounded-lg shadow-md cursor-pointer hover:bg-green-300 transition"
                onClick={() => navigate(`/registerevent/${event.id}`)}
              >
                <img
                  src={event.images}
                  alt={event.title}
                  className="w-full h-40 object-cover rounded-t-lg"
                />
                <h3 className="text-lg font-semibold mt-2 text-center truncate max-w-full">{event.title}</h3>
                <div className="mt-2 text-sm flex flex-col space-y-1">
                  {/* 📅 Event Date */}
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 text-green-700 mr-2" />
                    <span className="truncate max-w-full">{event.date}</span>
                  </div>
                  {/* 📍 Event Location */}
                  <div className="flex items-center">
                    <MapPinIcon className="h-5 w-5 text-red-600 mr-2" />
                    <span className="truncate max-w-full">{event.address}</span>
                  </div>
                </div>
              </div>

            ))
          ) : (
            <p className="text-gray-500">No events available within 10 km.</p>
          )}
        </div>
      </div>


      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Events;
