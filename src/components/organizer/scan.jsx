import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { supabase } from "../../services/supabaseClient"; 

const QRScanner = () => {
  const [scannedData, setScannedData] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: 250,
    });

    scanner.render(
      async (decodedText) => {
        setScannedData(decodedText);
        scanner.clear(); // Stop scanning after a successful scan

        try {
          const volunteerData = JSON.parse(decodedText);
          const { id } = volunteerData;

          // 🔍 Check if a check-in entry already exists
          const { data: existingEntry, error: fetchError } = await supabase
            .from("volunteer_checkins")
            .select("id, check_in_time, check_out_time")
            .eq("id", id)
            .single();

          if (fetchError && fetchError.code !== "PGRST116") {
            console.error("Error checking existing entry:", fetchError);
            return;
          }

          if (existingEntry && existingEntry.check_out_time === null) {
            // 🟢 Second scan: Update check-out time
            const { error: updateError } = await supabase
              .from("volunteer_checkins")
              .update({ check_out_time: new Date().toISOString() })
              .eq("id", id);

            if (updateError) {
              console.error("Error updating check-out time:", updateError);
            } else {
              console.log("Check-out time recorded for ID:", id);
            }
          } else {
            // 🟢 First scan: Insert check-in time
            const { error: insertError } = await supabase
              .from("volunteer_checkins")
              .insert([{ id, check_in_time: new Date().toISOString() }]);

            if (insertError) {
              console.error("Error inserting check-in time:", insertError);
            } else {
              console.log("Check-in time recorded for ID:", id);
            }
          }
        } catch (err) {
          console.error("Invalid QR data:", err);
        }
      },
      (errorMessage) => {
        console.warn("QR Scan Error:", errorMessage);
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

  return (
    <div>
      <h2>Scan QR Code</h2>
      <div id="reader"></div>
      {scannedData && <p>Scanned Data: {scannedData}</p>}
    </div>
  );
};

export default QRScanner;
