import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabaseClient";
import { MapPinIcon, ArrowsRightLeftIcon } from "@heroicons/react/24/solid";
import Footer from "../user/Footer/Footer.jsx";

const Events = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [userLocation, setUserLocation] = useState({ latitude: null, longitude: null });
  const [userAddress, setUserAddress] = useState("Fetching location...");
  const [userName, setUserName] = useState("");
  const [isMapView, setIsMapView] = useState(false);

  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY; // ✅ Get API Key from .env file

  // Fetch User Details
  useEffect(() => {
    const fetchUserData = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        console.error("User not found");
        return;
      }

      const userId = data.user.id;
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("full_name")
        .eq("id", userId)
        .single();

      if (userError) {
        console.error("Error fetching user data:", userError.message);
        return;
      }

      const firstName = userData.full_name.split(" ")[0];
      setUserName(firstName);
    };

    fetchUserData();
  }, []);

  // Fetch Nearby Events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("id, title, images");

        if (error) throw error;
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error.message);
      }
    };

    fetchEvents();
  }, []);

  // Get User's Current Location & Perform Reverse Geocoding
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          setUserLocation({ latitude, longitude });

          // ✅ Reverse Geocode to get the address
          await fetchAddressFromCoordinates(latitude, longitude);
        },
        (error) => console.error("Error getting location:", error),
        { enableHighAccuracy: true } // ✅ High accuracy for better location precision
      );
    }
  }, []);

  // Function to Reverse Geocode using Google Maps API
  async function fetchAddressFromCoordinates(lat, lon) {
    if (!API_KEY) {
      console.error("Google Maps API Key is missing!");
      setUserAddress("Location not available");
      return;
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${API_KEY}`;

    try {
      const response = await fetch(url);
      const result = await response.json();
      if (result.status === "OK") {
        setUserAddress(result.results[0]?.formatted_address || "Location not found");
      } else {
        console.error("Geocoding failed:", result.status);
        setUserAddress("Unknown Location");
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      setUserAddress("Unknown Location");
    }
  }

  return (
    <div className="min-h-screen bg-green-50 text-green-900">
      <header className="bg-green-700 py-4 px-6 flex items-center justify-between text-white sticky top-0 z-10">
        <div className="flex items-center space-x-2">
          <MapPinIcon className="h-6 w-6 text-white" />
          <p className="text-sm">{userAddress}</p> {/* ✅ Show human-readable address */}
        </div>

        <h1 className="text-xl font-bold">Welcome, {userName}</h1>

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
        <h2 className="text-3xl font-semibold mb-4">All Events</h2>
        <div className="flex space-x-6 overflow-x-scroll scrollbar-hide">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-green-200 p-4 rounded-lg shadow-md w-56 cursor-pointer hover:bg-green-300 transition"
              onClick={() => navigate(`/registerevent/${event.id}`)} // ✅ Pass event ID
            >
              <img
                src={event.images}
                alt={event.title}
                className="w-full h-32 object-cover rounded-t-lg"
              />
              <h3 className="text-lg font-semibold mt-2 text-center">{event.title}</h3>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Events;
