import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Default Green Marker Icon
const greenMarkerIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Blue Marker Icon for Highlighted Events
const blueMarkerIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Recenter Map Component
const RecenterMap = ({ location }) => {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.setView(location, 13, { animate: true });
    }
  }, [location, map]);
  return null;
};

const Maps = ({ eventLocations, highlightedIds }) => {
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      },
      (error) => console.error("Error retrieving location:", error)
    );
  }, []);

  return (
    <div className="w-[70vw] h-[70vh]">
      <MapContainer center={userLocation || [40.7128, -74.006]} zoom={13} className="w-full h-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {userLocation && (
          <>
            <RecenterMap location={userLocation} />
            <Marker position={userLocation} icon={greenMarkerIcon}>
              <Popup>You are here!</Popup>
            </Marker>
          </>
        )}

        {eventLocations.map((event) => (
          <Marker
            key={event.id}
            position={[event.latitude, event.longitude]}
            icon={highlightedIds.includes(event.id) ? blueMarkerIcon : greenMarkerIcon}
          >
            <Tooltip direction="top" offset={[0, -20]} opacity={1}>
              <strong>{event.title}</strong>
              <br />
              {event.description}
            </Tooltip>
            <Popup>
              <strong>{event.title}</strong> <br />
              {event.description}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Maps;
