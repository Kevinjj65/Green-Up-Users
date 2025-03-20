import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // ✅ Added useNavigate for redirection
import Footer from "../Footer/Footer";
import Location from "../Location/Location";
import { supabase } from "../../../services/supabaseClient";
import "./RegisterEvent.css";
import dateicon from "../../../assets/date.svg";
import timeicon from "../../../assets/time.svg";
import locationicon from "../../../assets/location.svg";

function RegisterEvent() {
  const { id } = useParams(); // ✅ Get event ID from URL
  const navigate = useNavigate(); // ✅ Navigation for redirection
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
      } else {
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

        // 🌍 Convert lat/lon to human-readable address
        fetchAddressFromCoordinates(data.latitude, data.longitude);
      }
      setLoading(false);
    }

    fetchEvent();
  }, [id]);

  // 🌍 Function to get human-readable address using Google Geocoding API
  async function fetchAddressFromCoordinates(lat, lon) {
    const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY; // ✅ Ensure API Key is in .env
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${API_KEY}`;

    try {
      const response = await fetch(url);
      const result = await response.json();
      if (result.status === "OK") {
        const address = result.results[0]?.formatted_address || "Location not found";
        setEventAddress(address);
      } else {
        console.error("Geocoding failed:", result.status);
        setEventAddress("Unknown Location");
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      setEventAddress("Unknown Location");
    }
  }

  if (loading) {
    return <p>Loading event details...</p>;
  }

  if (!eventData) {
    return <p>Event not found.</p>;
  }

  async function handleRegister() {
    if (!id) return;
  
    setRegistering(true);
    setRegistrationMessage("");
  
    // Get the logged-in user
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.user) {
      setRegistrationMessage("Please log in to register for the event.");
      setRegistering(false);
      return;
    }
  
    const userId = user.user.id; // 🔑 Get logged-in user's ID
    const eventId = id;
  
    // Insert registration into the "registrations" table
    const { data, error } = await supabase
      .from("registrations")
      .insert([
        {
          attendee_id: userId,
          event_id: eventId,
          check_in_time: null,  // Default null
          check_out_time: null, // Default null
          points_awarded: null, // Default null
        }
      ]);
  
    if (error) {
      console.error("Error registering for event:", error.message);
      setRegistrationMessage("Failed to register. Try again.");
    } else {
      setRegistrationMessage("Successfully registered!");
      
      // ✅ Redirect to AfterRegistration page
      navigate(`/afterregistration/${eventId}/${userId}`);
    }
  
    setRegistering(false);
  }

  // Format Date
  const formattedDate = new Date(eventData.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <main>
        <Location latitude={eventData.latitude} longitude={eventData.longitude} />
        <div className="register-event">
          <div className="title-card">
            <img className="title-image" src={eventData.titleImage} alt="Event" />
            <p className="title">{eventData.title}</p>
          </div>
          <p className="description">{eventData.description}</p>
          <div className="date">
            <img src={dateicon} alt="Date Icon" />
            <p>{formattedDate}</p>
          </div>
          <div className="time">
            <img src={timeicon} alt="Time Icon" />
            <p className="start-time">{eventData.startTime}</p>
            <p className="end-time">{eventData.endTime}</p>
          </div>
          <div className="location">
            <img src={locationicon} alt="Location Icon" />
            <p>{eventAddress}</p> {/* 🌍 Display Human-Readable Address */}
          </div>
          <div className="rew-pts">{eventData.rewardPoints} Points</div>
          
          {/* ✅ Neon Green "Register Now" Button */}
          <button className="register-btn" onClick={handleRegister} disabled={registering}>
            {registering ? "Registering..." : "Register Now"}
          </button>
          {registrationMessage && <p className="registration-message">{registrationMessage}</p>}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default RegisterEvent;
