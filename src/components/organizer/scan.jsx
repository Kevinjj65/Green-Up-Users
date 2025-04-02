import React, { useState, useEffect, useRef } from "react";
import jsQR from "jsqr";
import { supabase } from "./../../services/supabaseClient";

const QRScanner = ({ eventId }) => {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null); // We'll initialize this in useEffect

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }
  }, []);

  // Handle file upload for QR code scanning
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const image = new Image();
      image.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        processQRCode(imageData, canvas.width, canvas.height);
      };
      image.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Start camera
  const startCamera = async () => {
    if (!videoRef.current) {
      setError("Video element not initialized");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play();
        setIsCameraActive(true);
      };
    } catch (err) {
      setError("Failed to access camera: " + err.message);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  // Scan QR code from camera
  const scanFromCamera = () => {
    if (!videoRef.current || !isCameraActive || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    processQRCode(imageData, canvas.width, canvas.height);
  };

  // Process QR code (shared between file and camera)
  const processQRCode = (imageData, width, height) => {
    const qrCode = jsQR(imageData.data, width, height);

    if (qrCode) {
      try {
        const scannedData = JSON.parse(qrCode.data);
        if (scannedData.event_id !== eventId) {
          setError("Scanned QR code does not match the event.");
          setScanResult(null);
          return;
        }

        setScanResult(scannedData);
        setError(null);
        handleCheckInOut(scannedData.attendee_id, scannedData.event_id);
        stopCamera();
      } catch (err) {
        setError("Invalid QR Code format.");
        setScanResult(null);
      }
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

  // Camera scanning loop
  useEffect(() => {
    let interval;
    if (isCameraActive) {
      interval = setInterval(scanFromCamera, 100);
    }
    return () => clearInterval(interval);
  }, [isCameraActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-semibold mt-4">QR Code Scanner</h2>

      {/* File Upload */}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="my-4"
      />

      {/* Camera Controls */}
      <div className="my-4">
        {!isCameraActive ? (
          <button
            onClick={startCamera}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Start Camera Scan
          </button>
        ) : (
          <button
            onClick={stopCamera}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Stop Camera
          </button>
        )}
      </div>

      {/* Video Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`w-64 h-64 object-cover ${isCameraActive ? 'block' : 'hidden'}`}
      />

      {/* Error or Success Message */}
      {error && <p className="text-red-500 mt-2">{error}</p>}

      {/* Display scanned QR code data */}
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