import React, { useEffect, useRef } from 'react';
import { OlaMaps } from 'olamaps-web-sdk';

function Maps() {
    const mapRef = useRef(null);
    const mapInitialized = useRef(false);

    useEffect(() => {
        if (mapInitialized.current) return;
        mapInitialized.current = true;

        const olaMaps = new OlaMaps({
            apiKey: "k6XVrtPT5HPsK6moKq3OTZtojhhGCsvxKDPKcGhx",
        });

        let myMap;

        if (mapRef.current) {
            const center = [77.61648476788898, 12.931423492103944];
            const zoom = 15;

            console.log("Initializing map with center:", center, "and zoom:", zoom);

            try {
                myMap = olaMaps.init({
                    style: "https://api.olamaps.io/tiles/vector/v1/styles/default-dark-standard/style.json",
                    container: mapRef.current,
                    center: center ?? [0, 0],
                    zoom: zoom ?? 10,
                });

                myMap.on("style.load", () => {
                    if (myMap.getLayer("3d_model_data")) {
                        myMap.removeLayer("3d_model_data");
                    }
                    if (myMap.getLayer("3d_buildings")) {
                        myMap.removeLayer("3d_buildings");
                    }
                });

                const navigationControls = olaMaps.addNavigationControls({
                    showCompass: true,
                    showZoom: false,
                    visualizePitch: false,
                });

                myMap.addControl(navigationControls);

                const geolocate = olaMaps.addGeolocateControls({
                    positionOptions: {
                        enableHighAccuracy: true,
                    },
                    trackUserLocation: true,
                });

                myMap.addControl(geolocate);

                // ✅ Explicitly trigger geolocation
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        console.log("📍 Manually Fetched User Location");
                        console.log("Latitude:", position.coords.latitude);
                        console.log("Longitude:", position.coords.longitude);
                    },
                    (error) => {
                        console.error("❌ Geolocation error:", error.message);
                    }
                );

                geolocate.on("geolocate", (event) => {
                    console.log("📍 OlaMaps Geolocation Event Fired!");
                    console.log("Latitude:", event.coords.latitude);
                    console.log("Longitude:", event.coords.longitude);
                });

                myMap.on("load", () => {
                    setTimeout(() => {
                        console.log("🔄 Triggering OlaMaps geolocation...");
                        geolocate.trigger();
                    }, 1000);
                });

            } catch (error) {
                console.error("Error initializing OlaMaps:", error);
            }
        }

        return () => {
            if (myMap) {
                myMap.remove();
            }
        };
    }, []);

    return (
        <div 
            ref={mapRef} 
            style={{ 
                width: "100%", 
                height: "500px",
                backgroundColor: "#fff" 
            }} 
        />
    );
}

export default Maps;
