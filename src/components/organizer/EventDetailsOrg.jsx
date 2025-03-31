import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../services/supabaseClient";
import QRScanner from "./scan"; // Importing the scanner
import OrganizerFooter from "./OrganizerFooter";
const EventDetailsOrg = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (!error) setEvent(data);
    };

    fetchEvent();
  }, [id]);

  if (!event) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold">{event.title}</h1>
      <p className="text-gray-600 mt-2">{event.description}</p>
      <p className="text-gray-600 mt-2">
        📍 {event.location} | 🗓 {event.date}
      </p>
      <img src={event.images} alt="Event" className="mt-4 rounded-md" />
      <h2 className="text-xl font-semibold mt-6">Check-in Scanner</h2>
      <QRScanner eventId={event.id} />
      <OrganizerFooter />
    </div>
  );
};

export default EventDetailsOrg;
