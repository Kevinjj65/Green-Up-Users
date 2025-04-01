import React, { useState } from "react";
import jsQR from "jsqr";
import { supabase } from "./../../services/supabaseClient";

const QRScanner = ({ eventId }) => {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);

  // Handle file upload for QR code scanning
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0);

        // Get image data and pass it to jsQR for decoding
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const qrCode = jsQR(imageData.data, canvas.width, canvas.height);

        if (qrCode) {
          try {
            const scannedData = JSON.parse(qrCode.data); // Parse QR code data
            if (scannedData.event_id !== eventId) {
              setError("Scanned QR code does not match the event.");
              setScanResult(null);
              return;
            }

            setScanResult(scannedData);
            setError(null);

            // Process the check-in/check-out
            handleCheckInOut(scannedData.attendee_id, scannedData.event_id);
          } catch (err) {
            setError("Invalid QR Code format.");
            setScanResult(null);
          }
        } else {
          setError("No QR code found in the uploaded file.");
          setScanResult(null);
        }
      };
      image.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Function to handle check-in/check-out
  const handleCheckInOut = async (attendeeId, eventId) => {
    if (!attendeeId || !eventId) {
      setError("Invalid QR Code: Missing attendeeId or eventId.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("registrations")
        .select("check_in_time, check_out_time")
        .eq("attendee_id", attendeeId)
        .eq("event_id", eventId)
        .single();

      if (error) {
        setError("Error fetching registration details.");
        return;
      }

      const currentTime = new Date().toISOString();

      if (!data.check_in_time) {
        // Check-in
        await supabase
          .from("registrations")
          .update({ check_in_time: currentTime })
          .eq("attendee_id", attendeeId)
          .eq("event_id", eventId);
        setScanResult((prev) => ({
          ...prev,
          check_in_time: currentTime,
        }));
      } else if (!data.check_out_time) {
        // Check-out
        await supabase
          .from("registrations")
          .update({ check_out_time: currentTime })
          .eq("attendee_id", attendeeId)
          .eq("event_id", eventId);
        setScanResult((prev) => ({
          ...prev,
          check_out_time: currentTime,
        }));
      } else {
        setError("Already checked out.");
      }
    } catch (err) {
      setError("Database update failed.");
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-semibold mt-4">QR Code Scanner</h2>

      {/* File Upload for QR Code */}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="my-4"
      />

      {/* Error or Success Message */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Display entire scanned QR code data */}
      {scanResult && (
        <div className="mt-4">
          <p className="font-semibold">Scanned QR Code Data:</p>
          <pre>{JSON.stringify(scanResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
