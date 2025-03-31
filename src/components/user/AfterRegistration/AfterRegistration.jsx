import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../../services/supabaseClient";
import { QRCodeCanvas } from "qrcode.react";

const AfterRegistration = () => {
  const { eventId, attendeeId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [eventAddress, setEventAddress] = useState("Fetching location...");

  // Generate QR Code Value as JSON string
  const qrCodeValue = JSON.stringify({ attendee_id: attendeeId, event_id: eventId });

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!eventId) {
        console.error("Error: eventId is undefined");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("events")
          .select("title, description, latitude, longitude")  // ✅ Select only necessary fields
          .eq("id", eventId)
          .single();

        if (error) throw error;
        setEvent(data);

        // ✅ Fetch address only if coordinates exist
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

  if (!event) return <p>Loading event details...</p>;

  return (
    <div className="flex flex-col items-center">
      {/* ✅ Back Button */}
      <button
        onClick={() => navigate("/events")} // ✅ Navigate back to Events page
        className="self-start ml-4 mt-4 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition"
      >
        ← Back to Events
      </button>

      <h1 className="text-2xl font-bold mt-4">{event.title}</h1>
      <p>{event.description}</p>
      <p>📍 {eventAddress}</p>

      {/* QR Code Display */}
      <div className="mt-6 p-4 border border-gray-300 rounded">
        <p className="text-lg font-semibold">Your QR Code</p>
        <QRCodeCanvas value={qrCodeValue} size={200} />
      </div>
    </div>
  );
};

export default AfterRegistration;
