import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { supabase } from "./../../services/supabaseClient";

// Custom small marker icon
const smallMarkerIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: null, // Force disable shadow
});

// Component to re-center map on location update
const RecenterMap = ({ location }) => {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.setView(location, 13, { animate: true });
    }
  }, [location, map]);
  return null;
};

const Maps = () => {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState(null);
  const [eventLocations, setEventLocations] = useState([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log("📍 User Location:", latitude, longitude);
        setUserLocation([latitude, longitude]);
      },
      (error) => {
        console.error("❌ Failed to retrieve location:", error);
      }
    );
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, description, latitude, longitude"); // ✅ Added description

      if (error) {
        console.error("❌ Error fetching events:", error);
      } else {
        setEventLocations(data);
      }
    };
    fetchEvents();
  }, []);

  // ✅ Navigate to the specific event's registration page
  const handleMarkerClick = (eventId) => {
    navigate(`/registerevent/${eventId}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50">
      {/* Back to Events Button */}
      <button
        onClick={() => navigate("/events")}
        className="absolute top-4 right-4 bg-green-500 text-white text-xs px-3 py-1 rounded-md hover:bg-green-600 transition w-auto h-auto"
        style={{ minWidth: "80px", maxWidth: "120px", minHeight: "30px" }}
      >
        ← Back
      </button>
      <h1>Map View</h1>

      <div className="map-container" style={{ width: "70vw", height: "70vh" }}>
        <MapContainer
          center={userLocation || [40.7128, -74.006]} // Default to NYC if location isn't found
          zoom={13}
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {userLocation && (
            <>
              <RecenterMap location={userLocation} />
              <Marker position={userLocation} icon={smallMarkerIcon}>
                <Popup>📍 You are here!</Popup>
              </Marker>
            </>
          )}

          {eventLocations.map((event) => (
            <Marker
              key={event.id} // ✅ Use event ID as key
              position={[event.latitude, event.longitude]}
              icon={smallMarkerIcon}
              eventHandlers={{ click: () => handleMarkerClick(event.id) }} // ✅ Pass event ID
            >
              <Tooltip
                direction="top"
                offset={[0, -20]}
                opacity={1}
                permanent={false}
              >
                <div
                  style={{
                    backgroundColor: "white", // ✅ Solid white background
                    color: "black", // ✅ Ensure text is black
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.2)",
                    fontSize: "14px",
                    textAlign: "center",
                    maxWidth: "220px",
                  }}
                >
                  <strong
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      color: "black", // ✅ Force black text
                      background: "none", // ✅ Remove any background
                      textShadow: "none", // ✅ Ensure no unwanted shadow
                    }}
                  >
                    {event.title}
                  </strong>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#333",
                      background: "none", // ✅ Remove any background
                      textShadow: "none", // ✅ Ensure no shadow or highlight
                    }}
                  >
                    {event.description}
                  </span>
                </div>
              </Tooltip>


              <Popup>
                <strong>{event.title}</strong> <br />
                <p>{event.description}</p>
                <button
                  onClick={() => handleMarkerClick(event.id)}
                  className="bg-green-500 text-white px-2 py-1 rounded-md mt-2"
                >
                  Register
                </button>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default Maps;
