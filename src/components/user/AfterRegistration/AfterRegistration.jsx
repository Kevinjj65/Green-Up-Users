import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../../services/supabaseClient";
import { QRCodeCanvas } from "qrcode.react";
import { Html5QrcodeScanner } from "html5-qrcode";

const AfterRegistration = () => {
  const { eventId, attendeeId } = useParams();
  const [event, setEvent] = useState(null);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [scanner, setScanner] = useState(null);
  const [eventAddress, setEventAddress] = useState("Fetching location..."); // 🌍 Address from Geocoding

  // Generate QR Code Value Dynamically
  const qrCodeValue = `${attendeeId}_${eventId}`;

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

        // 🌍 Convert latitude/longitude to address
        fetchAddressFromCoordinates(data.latitude, data.longitude);
      } catch (error) {
        console.error("Error fetching event details:", error.message);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  // 🌍 Convert lat/lon to human-readable address using Google Geocoding API
  async function fetchAddressFromCoordinates(lat, lon) {
    const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY; // ✅ Ensure API Key is in .env
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

  // 📌 Organizer QR Code Scanner Logic
  const startQRScanner = () => {
    if (scanner) return;

    const qrScanner = new Html5QrcodeScanner("qr-reader", {
      fps: 10,
      qrbox: 250,
    });

    qrScanner.render(async (decodedText) => {
      try {
        const [scannedAttendeeId, scannedEventId] = decodedText.split("_");

        if (scannedEventId !== eventId) {
          alert("🚫 Invalid QR Code for this event.");
          return;
        }

        const { data, error } = await supabase
          .from("registrations")
          .select("check_in_time, check_out_time")
          .eq("attendee_id", scannedAttendeeId)
          .eq("event_id", scannedEventId)
          .single();

        if (error || !data) {
          alert("🚫 Invalid QR Code. User not registered.");
          return;
        }

        // Determine whether to check in or check out
        const timestamp = new Date().toISOString();
        const updateField = data.check_in_time ? "check_out_time" : "check_in_time";

        const { error: updateError } = await supabase
          .from("registrations")
          .update({ [updateField]: timestamp })
          .eq("attendee_id", scannedAttendeeId)
          .eq("event_id", scannedEventId);

        if (updateError) throw updateError;

        alert(`✅ Successfully ${data.check_in_time ? "checked out" : "checked in"} user.`);
      } catch (error) {
        console.error("QR Code scanning error:", error.message);
        alert("🚫 Error processing QR Code.");
      }
    });

    setScanner(qrScanner);
  };

  if (!event) return <p className="text-center text-white text-lg">Loading event details...</p>;

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#0a0a0a] text-[#39FF14] p-6">
      <h1 className="text-3xl font-bold mb-4 neon-text">{event.title}</h1>
      <img src={event.images} alt={event.title} className="w-80 h-40 object-cover rounded-lg border-2 border-[#39FF14] mb-4" />
      <p className="text-lg">{event.description}</p>
      <p className="font-semibold mt-2">
        {new Date(event.date).toLocaleDateString()} | {event.start_time} - {event.end_time}
      </p>
      <p className="font-semibold mt-2">📍 {eventAddress}</p>

      {/* ✅ User QR Code Display */}
      {!isOrganizer && (
        <div className="mt-6 p-4 bg-[#111] border-2 border-[#39FF14] rounded-lg">
          <p className="font-semibold text-lg mb-2 text-[#39FF14]">Your QR Code</p>
          <QRCodeCanvas value={qrCodeValue} size={180} />
        </div>
      )}

      {/* ✅ Organizer QR Scanner */}
      {isOrganizer && (
        <div className="mt-6">
          <button
            onClick={startQRScanner}
            className="bg-[#39FF14] text-[#0a0a0a] px-6 py-2 rounded-lg font-bold hover:bg-[#2ecc71] transition-all"
          >
            Start QR Scanner
          </button>
          <div id="qr-reader" className="mt-4"></div>
        </div>
      )}
    </div>
  );
};

export default AfterRegistration;
