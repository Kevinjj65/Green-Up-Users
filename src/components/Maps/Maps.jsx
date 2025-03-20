import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { supabase } from "./../../services/supabaseClient";

// Custom small marker icon
const smallMarkerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [20, 30],
  iconAnchor: [10, 30],
  popupAnchor: [0, -25],
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
      const { data, error } = await supabase.from("events").select("title, latitude, longitude");
      if (error) {
        console.error("❌ Error fetching events:", error);
      } else {
        setEventLocations(data);
      }
    };
    fetchEvents();
  }, []);

  const handleMarkerClick = (title) => {
    navigate(`/registerevent`);
  };

  return (
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
        {eventLocations.map((event, index) => (
          <Marker
            key={index}
            position={[event.latitude, event.longitude]}
            icon={smallMarkerIcon}
            eventHandlers={{ click: () => handleMarkerClick(event.title) }}
          >
            <Popup>{event.title}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Maps;