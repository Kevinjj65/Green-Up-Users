import { useState } from "react";
import { supabase } from "./../../services/supabaseClient";
import Footer from "./Footer";
import "./Organizer.css";

function AddNew() {
    const [eventData, setEventData] = useState({
        title: "",
        description: "",
        date: "",
        start_time: "",
        end_time: "",
        location: "",
        latitude: null,
        longitude: null,
        max_participants: "",
        reward_points: "",
        image_url: "" // Stores uploaded image URL
    });

    const [loading, setLoading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEventData({
            ...eventData,
            [name]: value
        });

        // If location is updated, fetch coordinates
        if (name === "location") {
            fetchCoordinates(value);
        }
    };

    const fetchCoordinates = async (address) => {
        if (!address) return;
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
            );
            const data = await response.json();
            if (data.length > 0) {
                setEventData((prev) => ({
                    ...prev,
                    latitude: data[0].lat,
                    longitude: data[0].lon
                }));
                console.log("Coordinates found:", data[0].lat, data[0].lon);
            } else {
                console.warn("No coordinates found for location:", address);
            }
        } catch (error) {
            console.error("Error fetching coordinates:", error);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);
        setUploadStatus(`File selected: ${file.name}`);
    };

    // Uploads the file to Supabase Storage
    const handleUpload = async () => {
        if (!selectedFile) {
            setUploadStatus("No file selected.");
            return;
        }

        setUploadStatus("Uploading...");
        const fileName = `${Date.now()}_${selectedFile.name}`; // Unique filename

        const { data, error } = await supabase.storage
            .from("event_images") // Ensure this is the correct bucket name
            .upload(fileName, selectedFile);

        if (error) {
            console.error("Upload error:", error);
            setUploadStatus("Error uploading file.");
            return;
        }

        // Retrieve the public URL
        const { data: urlData } = supabase.storage
            .from("event_images")
            .getPublicUrl(fileName);

        const imageUrl = urlData.publicUrl;

        setEventData((prev) => ({
            ...prev,
            image_url: imageUrl // Store in state
        }));

        setUploadStatus("Upload successful!");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!eventData.image_url) {
            alert("Please upload an image before submitting.");
            setLoading(false);
            return;
        }

        // Get the logged-in user's ID
        const { data: user, error: authError } = await supabase.auth.getUser();
        if (authError || !user?.user) {
            alert("User not authenticated. Please log in.");
            setLoading(false);
            return;
        }

        const userId = user.user.id;

        console.log("Event Data before submission:", eventData);

        const { error } = await supabase
            .from("events")
            .insert([
                {
                    title: eventData.title,
                    description: eventData.description,
                    date: eventData.date,
                    start_time: eventData.start_time,
                    end_time: eventData.end_time,
                    latitude: eventData.latitude ? Number(eventData.latitude) : null, // Auto-filled
                    longitude: eventData.longitude ? Number(eventData.longitude) : null, // Auto-filled
                    max_participants: Number(eventData.max_participants),
                    reward_points: Number(eventData.reward_points),
                    images: eventData.image_url,
                    organizer_id: userId
                }
            ]);

        setLoading(false);

        if (error) {
            console.error("Error inserting event:", error);
            alert("Error adding event.");
        } else {
            alert("Event added successfully!");
        }
    };

    return (
        <div className="container">
            <main>
                <h1>Be an Organizer Now</h1>
                <form onSubmit={handleSubmit}>
                    <input className="input name" type="text" name="title" placeholder="Name of the Event" onChange={handleChange} required />
                    <textarea className="input description" name="description" placeholder="Event Description" onChange={handleChange} required />
                    <input className="input date" type="date" name="date" onChange={handleChange} required />
                    <div className="time">
                        <input className="input start" type="time" name="start_time" onChange={handleChange} required />
                        <input className="input end" type="time" name="end_time" onChange={handleChange} required />
                    </div>
                    <input className="input loc" type="text" name="location" placeholder="Location (City, Address)" onChange={handleChange} required />

                    <input className="input nop" type="number" name="max_participants" placeholder="Max No. of Participants" onChange={handleChange} required />
                    <input className="input rewpts" type="number" name="reward_points" placeholder="Allotted Reward Points" onChange={handleChange} required />

                    {/* File Upload Section */}
                    <input type="file" className="input file-upload" onChange={handleFileChange} />
                    <button type="button" className="upload-button" onClick={handleUpload}>
                        Upload Image
                    </button>
                    {uploadStatus && <p>{uploadStatus}</p>}

                    <div className="check">
                        <input className="checkbox" type="checkbox" required />
                        <span className="check-text">I agree to Terms & Conditions</span>
                    </div>
                    <button className="btn1 regbtn" type="submit" disabled={loading}>
                        {loading ? "Registering..." : "Register Now"}
                    </button>
                </form>
            </main>
            <Footer />
        </div>
    );
}

export default AddNew;
