import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../../services/supabaseClient";
import { QRCodeCanvas } from "qrcode.react";

const AfterRegistration = () => {
  const { eventId, attendeeId } = useParams(); // Use attendeeId instead of userId
  const [event, setEvent] = useState(null);
  const [qrCodeValue, setQrCodeValue] = useState("");

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!eventId) {
        console.error("Error: eventId is undefined");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("id", eventId)
          .single();

        if (error) throw error;
        setEvent(data);
      } catch (error) {
        console.error("Error fetching event details:", error.message);
      }
    };

    const generateQRCode = async () => {
      if (!attendeeId || !eventId) {
        console.error("Error: attendeeId or eventId is undefined");
        return;
      }

      const uniqueQRValue = `${attendeeId}_${eventId}`;
      setQrCodeValue(uniqueQRValue);

      try {
        const { error } = await supabase
          .from("registrations")
          .update({ qr_code: uniqueQRValue })
          .match({ attendee_id: attendeeId, event_id: eventId });

        if (error) throw error;
      } catch (error) {
        console.error("Error saving QR code:", error.message);
      }
    };

    fetchEventDetails();
    generateQRCode();
  }, [eventId, attendeeId]);

  if (!event) return <p>Loading event details...</p>;

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#1e1e1e] text-[#39FF14] p-6">
      <h1 className="text-3xl font-bold">{event.title}</h1>
      <img src={event.images} alt={event.title} className="w-80 h-40 object-cover rounded-lg mt-4" />
      <p className="mt-2 text-lg">{event.description}</p>
      <p className="mt-2 font-semibold">
        {new Date(event.date).toLocaleDateString()} | {event.start_time} - {event.end_time}
      </p>
      <p className="mt-2 font-semibold">📍 Location: {event.latitude}, {event.longitude}</p>

      <div className="mt-6 p-4 bg-white rounded-lg">
        <p className="text-black font-semibold text-lg mb-2">Your QR Code</p>
        <QRCodeCanvas value={qrCodeValue} size={150} />
      </div>
    </div>
  );
};

export default AfterRegistration;
