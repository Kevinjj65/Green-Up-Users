import React, { useState, useEffect, useRef } from "react";
import jsQR from "jsqr";
import { supabase } from "./../../services/supabaseClient";

const QRScanner = ({ eventId }) => {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(document.createElement("canvas"));

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

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const qrCode = jsQR(imageData.data, canvas.width, canvas.height);

        if (qrCode) {
          processQRCode(qrCode.data);
        } else {
          setError("No QR code found in the uploaded file.");
          setScanResult(null);
        }
      };
      image.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Start camera for QR scanning
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      videoRef.current.srcObject = stream;
      setIsCameraActive(true);
      requestAnimationFrame(scanCamera);
    } catch (err) {
      setError("Failed to access camera: " + err.message);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Scan QR code from camera feed
  const scanCamera = () => {
    if (!videoRef.current || !isCameraActive) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const qrCode = jsQR(imageData.data, canvas.width, canvas.height);

      if (qrCode) {
        processQRCode(qrCode.data);
        stopCamera();
        return;
      }
    }
    requestAnimationFrame(scanCamera);
  };

  // Process QR code data
  const processQRCode = (qrData) => {
    try {
      const scannedData = JSON.parse(qrData);
      if (scannedData.event_id !== eventId) {
        setError("Scanned QR code does not match the event.");
        setScanResult(null);
        return;
      }

      setScanResult(scannedData);
      setError(null);
      handleCheckInOut(scannedData.attendee_id, scannedData.event_id);
    } catch (err) {
      setError("Invalid QR Code format.");
      setScanResult(null);
    }
  };

  // Handle check-in/check-out
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

  // Cleanup camera on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center pb-20">
      {/* Added pb-20 to ensure padding at the bottom for footer clearance */}
      <div className="w-full max-w-md flex flex-col items-center space-y-6 overflow-y-auto">
        {/* max-w-md limits width, overflow-y-auto enables scrolling */}
        <h2 className="text-xl font-semibold mt-4">QR Code Scanner</h2>

        {/* File Upload for QR Code */}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="my-4 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />

        {/* Camera Scanner Controls */}
        <div className="my-4">
          {!isCameraActive ? (
            <button
              onClick={startCamera}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Start Camera Scanner
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              Stop Camera
            </button>
          )}
        </div>

        {/* Video Feed for Camera */}
        {isCameraActive && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full max-w-md rounded-lg shadow-md"
          />
        )}

        {/* Error or Success Message */}
        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* Display entire scanned QR code data */}
        {scanResult && (
          <div className="mt-4 w-full">
            <p className="font-semibold text-center">Scanned QR Code Data:</p>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              {JSON.stringify(scanResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;