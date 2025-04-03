import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../../services/supabaseClient.jsx";

function RewardPoints() {
  const { attendee_id } = useParams();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRegistrations = async () => {
      if (!attendee_id) {
        setError("Invalid Attendee ID.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      // Fetch event_id and points_awarded for the given attendee_id
      const { data: registrationsData, error: registrationsError } = await supabase
        .from("registrations")
        .select("event_id, points_awarded")
        .eq("attendee_id", attendee_id)
        .not("points_awarded", "is", null); // Filter out null points_awarded

      if (registrationsError) {
        setError("Failed to fetch registrations.");
        setLoading(false);
        return;
      }

      if (registrationsData.length === 0) {
        setRegistrations([]);
        setLoading(false);
        return;
      }

      // Fetch event names for the event_ids retrieved
      const eventIds = registrationsData.map((entry) => entry.event_id);
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("id, title")
        .in("id", eventIds);

      if (eventsError) {
        setError("Failed to fetch event names.");
        setLoading(false);
        return;
      }

      // Map event names to their respective event_ids
      const eventMap = eventsData.reduce((acc, event) => {
        acc[event.id] = event.title;
        return acc;
      }, {});

      // Merge event names into registrations data
      const enrichedRegistrations = registrationsData.map((entry) => ({
        ...entry,
        title: eventMap[entry.event_id] || "Unknown Event",
      }));

      setRegistrations(enrichedRegistrations);
      setLoading(false);
    };

    fetchRegistrations();
  }, [attendee_id]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1E1E1E] text-[#F5F5F5]">
      <h1 className="text-2xl font-bold mb-4">Reward Points</h1>
      <p className="text-lg">Attendee ID: {attendee_id || "Not Found"}</p>

      {loading ? (
        <p className="text-gray-400 mt-4">Loading...</p>
      ) : error ? (
        <p className="text-red-400 mt-4">{error}</p>
      ) : registrations.length === 0 ? (
        <p className="text-gray-400 mt-4">No points awarded yet.</p>
      ) : (
        <div className="mt-6 w-full max-w-md">
          <h2 className="text-xl font-semibold mb-2">Events & Points</h2>
          <ul className="w-full space-y-2">
            {registrations.map((entry, index) => (
              <li key={index} className="bg-gray-800 p-3 rounded-md">
                <p>🎟 Event: {entry.title}</p>
                <p>🏆 Points Awarded: {entry.points_awarded}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default RewardPoints;
