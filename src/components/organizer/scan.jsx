import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { supabase } from "../../services/supabaseClient";
import { useParams } from "react-router-dom";

const QRScanner = () => {
  const { eventId } = useParams();
  const [message, setMessage] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });

    scanner.render(
      async (decodedText) => {
        handleScanSuccess(decodedText);
        scanner.clear();
      },
      (errorMessage) => {
        console.error("QR Scan Error:", errorMessage);
      }
    );

    scannerRef.current = scanner;

    return () => scanner.clear();
  }, []);

  const handleScanSuccess = async (decodedText) => {
    const scanData = JSON.parse(decodedText);
    const { attendee_id } = scanData;

    const { data: existingEntry } = await supabase
      .from("registrations")
      .select("id, check_in_time, check_out_time")
      .eq("attendee_id", attendee_id)
      .eq("event_id", eventId)
      .single();

    const timestamp = new Date().toISOString();

    if (existingEntry && !existingEntry.check_out_time) {
      await supabase
        .from("registrations")
        .update({ check_out_time: timestamp })
        .eq("id", existingEntry.id);
      showPopup(`✅ Checked out at ${new Date(timestamp).toLocaleTimeString()}`);
    } else {
      await supabase.from("registrations").insert({
        attendee_id,
        event_id: eventId,
        check_in_time: timestamp,
      });
      showPopup(`✅ Checked in at ${new Date(timestamp).toLocaleTimeString()}`);
    }
  };

  const showPopup = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-bold">Scan QR Code</h2>
      <div id="reader"></div>
      {message && <div className="mt-4 text-green-600">{message}</div>}
    </div>
  );
};

export default QRScanner;
