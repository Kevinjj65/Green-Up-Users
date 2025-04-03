import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "./../../../services/supabaseClient";
import { QRCodeCanvas } from "qrcode.react";
import Footer from "../Footer/Footer";

const AfterRegistration = () => {
  const { eventId, attendeeId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [eventAddress, setEventAddress] = useState("Fetching location...");
  const [organizerId, setOrganizerId] = useState(null);
  const [eventDate, setEventDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [rewardPoints, setRewardPoints] = useState(null); // ✅ Added reward points state

  console.log("Received eventId:", eventId, "attendeeId:", attendeeId);

  useEffect(() => {
    if (!eventId || !attendeeId) {
      console.error("Error: Missing eventId or attendeeId in the URL.");
    }
  }, [eventId, attendeeId]);

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!eventId) return;

      try {
        const { data, error } = await supabase
          .from("events")
          .select("title, description, latitude, longitude, organizer_id, date, start_time, end_time, reward_points") // ✅ Added reward_points
          .eq("id", eventId)
          .single();

        if (error) throw error;

        setEvent(data);
        setOrganizerId(data.organizer_id);
        setEventDate(data.date);
        setStartTime(data.start_time);
        setEndTime(data.end_time);
        setRewardPoints(data.reward_points); // ✅ Store reward points

        if (data.latitude && data.longitude) {
          fetchAddressFromCoordinates(data.latitude, data.longitude);
        } else {
          setEventAddress("Location data unavailable");
        }
      } catch (error) {
        console.error("Error fetching event details:", error.message);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  async function fetchAddressFromCoordinates(lat, lon) {
    const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!API_KEY) {
      console.error("Error: Google Maps API Key is missing!");
      setEventAddress("Location service unavailable");
      return;
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${API_KEY}`;

    try {
      const response = await fetch(url);
      const result = await response.json();

      if (result.status === "OK") {
        setEventAddress(result.results[0]?.formatted_address || "Location not found");
      } else {
        console.error("Geocoding failed:", result.status, result.error_message);
        setEventAddress("Unable to determine location");
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      setEventAddress("Error retrieving location");
    }
  }
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).replace(/\b(\d{1,2})\b/, (match) => {
      const suffix = ["th", "st", "nd", "rd"][
        (match % 10 > 3 || Math.floor((match % 100) / 10) === 1) ? 0 : match % 10
      ];
      return match + suffix;
    });
  };
  
  const convertToIST = (timeStr) => {
    if (!timeStr) return "N/A";
    const dateTime = new Date(`1970-01-01T${timeStr}Z`); // Append date and make it UTC
    return dateTime.toLocaleTimeString("en-IN", { 
      hour: "2-digit", 
      minute: "2-digit", 
      hour12: true, 
      timeZone: "Asia/Kolkata" 
    });
  };
  
  

  // Function to unregister from the event
  const handleUnregister = async () => {
    if (!eventId || !attendeeId) return;

    try {
      const { error } = await supabase
        .from("registrations")
        .delete()
        .eq("event_id", eventId)
        .eq("attendee_id", attendeeId);

      if (error) throw error;

      alert("Successfully unregistered from the event!");
      navigate("/events");
    } catch (error) {
      console.error("Error unregistering:", error.message);
      alert("Error unregistering. Please try again.");
    }
  };
  if (!event) return <p className="text-f5f5f5">Loading event details...</p>;

  return (
    <div className="bg-[#1E1E1E] text-[#F5F5F5] min-h-screen flex flex-col items-center py-10">
      <button
        onClick={() => navigate("/events")}
        className="self-start ml-4 px-4 py-2 bg-[#2A2A2A] text-white rounded-md hover:bg-gray-800 transition"
      >
        ← Back to Events
      </button>
      <h1 className="text-2xl font-bold mt-4">{event.title}</h1>
      <p className="mt-2">{event.description}</p>

      {/* QR Code Display */}
      <div className="mt-6 p-4 border border-gray-500 rounded">
        <p className="text-lg font-semibold">Your QR Code</p>
        <QRCodeCanvas value={JSON.stringify({ attendee_id: attendeeId, event_id: eventId })} size={200} />
      </div>

      {/* Date, Time, Location, and Reward Points Below QR Code */}
      <p className="mt-4">📅 Date: {eventDate || "N/A"}</p>
      <p className="mt-1">⏰ Time: {startTime || "N/A"} - {endTime || "N/A"}</p>
      <p className="mt-1">📍 {eventAddress}</p>
      <p className="mt-1">🎁 Reward Points: {rewardPoints !== null ? rewardPoints : "N/A"}</p>

      {/* Chat Button to navigate to chat page with event creator */}
      {organizerId && (
        <button
          onClick={() => navigate(`/chat/${organizerId}/${eventId}/${attendeeId}`)}
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all"
        >
          Chat with Event Creator
        </button>
      )}

      <Footer />
    </div>
  );
};

export default AfterRegistration;
