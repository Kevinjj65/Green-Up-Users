import React, { useEffect, useState } from "react";
import { supabase } from "./../../services/supabaseClient";
import Maps from "./../Maps/Maps";

const OrganizerEventsMap = () => {
  const [eventLocations, setEventLocations] = useState([]);
  const [highlightedIds, setHighlightedIds] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
        return;
      }
      if (user) {
        setUserId(user.id);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!userId) return; // Ensure userId is available before fetching events

    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, description, latitude, longitude, organizer_id");

      if (error) {
        console.error("Error fetching events:", error);
      } else {
        setEventLocations(data);
        // Identify events where the organizer_id matches the logged-in user
        const userEventIds = data.filter(event => event.organizer_id === userId).map(event => event.id);
        setHighlightedIds(userEventIds);
      }
    };

    fetchEvents();
  }, [userId]); // Depend on userId to fetch events only after it's available

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50">
      <h1>Your Organized Events</h1>
      <Maps eventLocations={eventLocations} highlightedIds={highlightedIds} />
    </div>
  );
};

export default OrganizerEventsMap;
