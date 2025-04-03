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
  const [showModal, setShowModal] = useState(false); // Modal state

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
          .select("title, description, latitude, longitude, organizer_id")
          .eq("id", eventId)
          .single();

        if (error) throw error;
        setEvent(data);
        setOrganizerId(data.organizer_id);

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

  if (!event) return <p>Loading event details...</p>;

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={() => navigate("/events")}
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
        <QRCodeCanvas value={JSON.stringify({ attendee_id: attendeeId, event_id: eventId })} size={200} />
      </div>

      {/* Chat Button to navigate to chat page with event creator */}
      {organizerId && (
        <button
          onClick={() => navigate(`/chat/${organizerId}/${eventId}/${attendeeId}`)}
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all"
        >
          Chat with Event Creator
        </button>
      )}

      {/* Unregister Button */}
      <button
        onClick={() => setShowModal(true)}
        className="mt-6 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all"
      >
        Unregister from Event
      </button>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md text-center">
            <p className="text-lg font-semibold">Are you sure you want to unregister from "{event.title}"?</p>
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={handleUnregister}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all"
              >
                Yes, Unregister
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AfterRegistration;
