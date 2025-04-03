import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../services/supabaseClient.jsx";
import {
  MapPinIcon,
  ClockIcon,
  ArrowsRightLeftIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";
import Footer from "../Footer/Footer.jsx";

const AllEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("date_new"); // Default filter
  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Fetch Events with Location Details
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("id, title, images, date, latitude, longitude, reward_points");

        if (error) throw error;

        const eventsWithAddresses = await Promise.all(
          data.map(async (event) => {
            event.address =
              event.latitude && event.longitude
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

  // Filter & Search Logic
  const filteredEvents = events
  .filter((event) => new Date(event.date) >= new Date())
    .filter
    (
      (event) =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.address.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (filter === "points_high") return b.reward_points - a.reward_points;
      if (filter === "points_low") return a.reward_points - b.reward_points;
      if (filter === "date_new") return new Date(b.date) - new Date(a.date);
      if (filter === "date_old") return new Date(a.date) - new Date(b.date);
      return 0;
    });

  return (
    <div className="min-h-screen bg-green-50 text-green-900">
      {/* Header */}
      <header className="bg-green-700 py-4 px-6 flex items-center justify-between text-white sticky top-0 z-10">
        <h1 className="text-xl font-bold">All Events</h1>

        {/* Search Bar */}
        <div className="flex bg-white text-black px-3 py-1 rounded-md items-center w-1/3">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-600 mr-2" />
          <input
            type="text"
            placeholder="Search by event name or location..."
            className="outline-none w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Dropdown */}
        <select
          className="bg-white text-black px-3 py-1 rounded-md cursor-pointer"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="date_new">Date: Newest First</option>
          <option value="date_old">Date: Oldest First</option>
          <option value="points_high">Reward Points: High to Low</option>
          <option value="points_low">Reward Points: Low to High</option>
        </select>
      </header>

      {/* Events List */}
      <div className="p-6 overflow-x-auto">
        <h2 className="text-3xl font-semibold mb-4">Upcoming Events</h2>
        <div className="flex space-x-6 overflow-x-scroll scrollbar-hide">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
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
                  {/* 🏆 Reward Points */}
                  <div className="flex items-center">
                    <span className="bg-yellow-300 text-yellow-800 px-2 py-1 rounded text-xs font-bold">
                      {event.reward_points} Points
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No events found.</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AllEvents;
