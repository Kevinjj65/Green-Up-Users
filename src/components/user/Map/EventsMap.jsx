import React, { useEffect, useState } from "react";
import { supabase } from "./../../../services/supabaseClient";
import Maps from "./../../Maps/Maps";

const EventsMap = () => {
  const [eventLocations, setEventLocations] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase.from("events").select("id, title, description, latitude, longitude");
      if (error) {
        console.error("Error fetching events:", error);
      } else {
        setEventLocations(data);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50">
      <h1>All Events Map</h1>
      <Maps eventLocations={eventLocations} highlightedIds={[]} />
    </div>
  );
};

export default EventsMap;
