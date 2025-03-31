import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../../services/supabaseClient";
import { QRCodeCanvas } from "qrcode.react";

const AfterRegistration = () => {
  const { eventId, attendeeId } = useParams();
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
          .select("*")
          .eq("id", eventId)
          .single();

        if (error) throw error;
        setEvent(data);

        // Convert latitude/longitude to address
        fetchAddressFromCoordinates(data.latitude, data.longitude);
      } catch (error) {
        console.error("Error fetching event details:", error.message);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  // Function to convert lat/lon to an address using Google Geocoding API
  async function fetchAddressFromCoordinates(lat, lon) {
    const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${API_KEY}`;

    try {
      const response = await fetch(url);
      const result = await response.json();
      if (result.status === "OK") {
        const address = result.results[0]?.formatted_address || "Location not found";
        setEventAddress(address);
      } else {
        console.error("Geocoding failed:", result.status);
        setEventAddress("Unknown Location");
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      setEventAddress("Unknown Location");
    }
  }

  if (!event) return <p>Loading event details...</p>;

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold">{event.title}</h1>
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
