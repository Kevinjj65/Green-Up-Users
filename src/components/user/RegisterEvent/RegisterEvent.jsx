import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import Footer from "../Footer/Footer";
import Location from "../Location/Location";
import { supabase } from "../../../services/supabaseClient";
//import "./RegisterEvent.css";
import dateicon from "../../../assets/date.svg";
import timeicon from "../../../assets/time.svg";
import locationicon from "../../../assets/location.svg";

function RegisterEvent() {
  const { id } = useParams(); // ✅ Get event ID from URL
  const navigate = useNavigate(); // ✅ Initialize useNavigate
  const [eventData, setEventData] = useState(null);
  const [eventAddress, setEventAddress] = useState(""); // 🌍 Address from Geocoding
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState(""); // Success/Error messages

  useEffect(() => {
    async function fetchEvent() {
      if (!id) return;

      const { data, error } = await supabase
        .from("events")
        .select("images, title, description, date, start_time, end_time, latitude, longitude, reward_points")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching event:", error.message);
        setLoading(false);
        return;
      }

      setEventData({
        titleImage: data.images || "default-image-url.jpg",
        title: data.title,
        description: data.description,
        date: data.date,
        startTime: data.start_time,
        endTime: data.end_time,
        latitude: data.latitude,
        longitude: data.longitude,
        rewardPoints: data.reward_points,
      });

      fetchAddressFromCoordinates(data.latitude, data.longitude);
      setLoading(false);
    }

    fetchEvent();
  }, [id]);

  async function fetchAddressFromCoordinates(lat, lon) {
    const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!API_KEY) {
      console.error("Google Maps API Key is missing!");
      return;
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${API_KEY}`;

    try {
      const response = await fetch(url);
      const result = await response.json();
      if (result.status === "OK") {
        setEventAddress(result.results[0]?.formatted_address || "Location not found");
      } else {
        console.error("Geocoding failed:", result.status);
        setEventAddress("Unknown Location");
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      setEventAddress("Unknown Location");
    }
  }

  async function handleRegister() {
    if (!id) return;
  
    setRegistering(true);
    setRegistrationMessage("");
  
    // ✅ Fetch logged-in user
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.user?.id) {
      setRegistrationMessage("Please log in to register for the event.");
      setRegistering(false);
      return;
    }
  
    const userId = user.user.id; // 🔑 Get logged-in user's ID
    const eventId = id;
  
    // ✅ Insert into "registrations" table
    const { data, error } = await supabase
      .from("registrations")
      .insert([{ attendee_id: userId, event_id: eventId }]);
  
    if (error) {
      console.error("Error registering for event:", error.message);
      setRegistrationMessage("Failed to register. Try again.");
      setRegistering(false);
      return;
    }
  
    setRegistrationMessage("Successfully registered!");
  
    // ✅ Navigate to AfterRegistration and pass state
    navigate(`/afterregistration/${eventId}/${user.id}`);
  
    setRegistering(false);
  }

  if (loading) return <p>Loading event details...</p>;
  if (!eventData) return <p>Event not found.</p>;

  const formattedDate = eventData.date
    ? new Date(eventData.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Date not available";

  return (
    <>
      <main className="flex flex-col items-center bg-gray-900 text-green-400 bg-[#1E1E1E] w-full min-h-screen py-6">
        <Location latitude={eventData.latitude} longitude={eventData.longitude} />
        <div className="w-full max-w-lg bg-gray-800 p-6 rounded-lg shadow-lg text-center">
          <img className="w-full h-40 object-cover rounded-lg" src={eventData.titleImage} alt="Event" />
          <h1 className="text-2xl font-bold mt-4">{eventData.title}</h1>
          <p className="mt-2 text-lg text-gray-300">{eventData.description}</p>
          <div className="flex items-center justify-center mt-4 text-gray-400">
            <img src={dateicon} alt="Date Icon" className="w-5 h-5 mr-2" />
            <p>{formattedDate}</p>
          </div>
          <div className="flex items-center justify-center mt-2 text-gray-400">
            <img src={timeicon} alt="Time Icon" className="w-5 h-5 mr-2" />
            <p>{eventData.startTime} - {eventData.endTime}</p>
          </div>
          <div className="flex items-center justify-center mt-2 text-gray-400">
            <img src={locationicon} alt="Location Icon" className="w-5 h-5 mr-2" />
            <p>{eventAddress}</p>
          </div>
          <p className="mt-4 text-lg font-semibold text-green-300">{eventData.rewardPoints} Points</p>
          <button
            className="w-full bg-green-500 text-black font-bold py-3 mt-4 rounded-lg hover:bg-green-600 transition"
            onClick={handleRegister}
            disabled={registering}
          >
            {registering ? "Registering..." : "Register Now"}
          </button>
          {registrationMessage && <p className="mt-2 text-sm text-white">{registrationMessage}</p>}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default RegisterEvent;
