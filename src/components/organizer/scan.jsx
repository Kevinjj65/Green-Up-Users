import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeScanner } from "html5-qrcode";
import { supabase } from "../../services/supabaseClient";

const QRScanner = () => {
  const [scannedData, setScannedData] = useState(null);
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: 250,
    });

    scanner.render(
      async (decodedText) => {
        handleScanSuccess(decodedText);
        scanner.clear(); // Stop scanning after a successful scan
      },
      (errorMessage) => {
        setError(`QR Scan Error: ${errorMessage}`);
      }
    );

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    };
  }, []);

  // 🔍 Function to handle QR scan success
  const handleScanSuccess = async (decodedText) => {
    setScannedData(decodedText);
    setError(null); // Clear previous errors

    try {
      const scanData = JSON.parse(decodedText);
      const { attendee_id, event_id } = scanData;

      // Check if an entry already exists for this attendee and event
      const { data: existingEntry, error: fetchError } = await supabase
        .from("registrations")
        .select("id, check_in_time, check_out_time")
        .eq("attendee_id", attendee_id)
        .eq("event_id", event_id)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error checking existing entry:", fetchError);
        return;
      }

      if (existingEntry && existingEntry.check_out_time === null) {
        // 🟢 Second scan: Update check-out time
        const { error: updateError } = await supabase
          .from("registrations")
          .update({ check_out_time: new Date().toISOString() })
          .eq("id", existingEntry.id);

        if (updateError) {
          console.error("Error updating check-out time:", updateError);
        } else {
          console.log("Check-out time recorded for Attendee ID:", attendee_id);
        }
      } else {
        // 🟢 First scan: Insert check-in time
        const { error: insertError } = await supabase
          .from("registrations")
          .insert([
            {
              attendee_id,
              event_id,
              check_in_time: new Date().toISOString(),
              created_at: new Date().toISOString(),
              points_awarded: 0, // Default points
            },
          ]);

        if (insertError) {
          console.error("Error inserting check-in time:", insertError);
        } else {
          console.log("Check-in time recorded for Attendee ID:", attendee_id);
        }
      }
    } catch (err) {
      console.error("Invalid QR data:", err);
      setError("Invalid QR code format.");
    }
  };

  // 📷 Handle QR Code Image Upload
  const scanQRFromFile = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const html5QrCode = new Html5Qrcode("reader");

    try {
      const result = await html5QrCode.scanFile(file, true);
      handleScanSuccess(result);
    } catch (err) {
      console.error("Error decoding QR:", err);
      setError("Failed to read QR code from file.");
    }
  };

  return (
    <div>
      <h2>Scan QR Code</h2>
      
      {/* 📸 Live Scanner */}
      <div id="reader"></div>

      {/* 🖼 Upload QR Code Image */}
      <input type="file" accept="image/*" onChange={scanQRFromFile} />

      {/* ✅ Show Scanned Data */}
      {scannedData && <p>Scanned Data: {scannedData}</p>}

      {/* ❌ Show Errors */}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default QRScanner;
