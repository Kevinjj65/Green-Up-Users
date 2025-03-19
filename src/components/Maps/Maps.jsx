import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./Maps.css";

const Maps = () => {
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    const getUserLocation = async () => {
      try {
        const response = await fetch(
          `https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyB8BX4S5k4NF_k9__zYxw7xNZdnoRhpXb0`,
          {
            method: "POST",
          }
        );
        const data = await response.json();
        if (data.location) {
          const { lat, lng } = data.location;
          console.log("📍 User location:", lat, lng);
          setUserLocation([lat, lng]);
        } else {
          console.error("Failed to retrieve location:", data);
        }
      } catch (error) {
        console.error("Error fetching location:", error);
      }
    };

    getUserLocation();
  }, []);

  return (
    <div className="map-container">
      <h2>Leaflet Map</h2>
      <MapContainer
        center={userLocation || [40.7128, -74.006]} // Default to NYC if location not found
        zoom={10}
        style={{ width: "100%", height: "500px" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {userLocation && (
          <Marker position={userLocation} icon={L.icon({ iconUrl: "https://leafletjs.com/examples/custom-icons/leaf-red.png", iconSize: [25, 41], iconAnchor: [12, 41] })}>
            <Popup>📍 You are here!</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default Maps;
