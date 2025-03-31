import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./../../../services/supabaseClient";
import { QRCodeCanvas } from "qrcode.react";
import { useNavigate } from "react-router-dom";

const AfterRegistration = () => {
    const { eventId, attendeeId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [eventAddress, setEventAddress] = useState("Fetching location...");
    
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
                    .select("*")
                    .eq("id", eventId)
                    .single();

                if (error) throw error;
                setEvent(data);
                fetchAddressFromCoordinates(data.latitude, data.longitude);
            } catch (err) {
                console.error("Error fetching event details:", err.message);
            }
        };

        fetchEventDetails();
    }, [eventId]);

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
        } catch (err) {
            console.error("Error fetching address:", err);
            setEventAddress("Unknown Location");
        }
    }

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
        </div>
    );
};

export default AfterRegistration;
