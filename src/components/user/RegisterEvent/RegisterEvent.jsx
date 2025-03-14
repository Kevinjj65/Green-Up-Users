import { useEffect, useState } from "react";
import Footer from "./../Footer/Footer";
import Location from "../Location/Location";
import {supabase} from "./../../../services/supabaseClient"; // Ensure supabaseClient.js is properly set up
import "./RegisterEvent.css";
import dateicon from "./../../../assets/date.svg";
import timeicon from "./../../../assets/time.svg";
import locationicon from "./../../../assets/location.svg"

function RegisterEvent() {
    const [eventData, setEventData] = useState({
        titleImage: "default-image-url.jpg", // Provide a default image URL
        title: "Revive",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin tincidunt congue vulputate. In egestas magna in magna lobortis ultricies. Mauris at iaculis nulla, hendrerit hendrerit odio. Suspendisse luctus at mauris quis dignissim. Ut id justo dictum, finibus orci ac, malesuada massa. Maecenas condimentum lacinia nisl id fermentum.",
        date: "2025-03-18",
        startTime: "09:00:00",
        endTime: "12:30:00",
        location: "Lions Club, ABC Nagar, Palakkad",
        rewardPoints: "40"
    });

    // useEffect(() => {
    //     async function fetchEvent() {
    //         const { data, error } = await supabase
    //             .from("events")
    //             .select("images, title, description, date, start_time, end_time, location, reward_points")
    //             .limit(1)
    //             .single();

    //         if (error) {
    //             console.error("Error fetching event:", error.message);
    //         } else {
    //             setEventData(prevData => ({
    //                 ...prevData,
    //                 ...data,
    //                 titleImage: data.images || "default-image-url.jpg" // Ensure image is always present
    //             }));
    //         }
    //     }
    //     fetchEvent();
    // }, []);

    const dateString = new Date(eventData.date);
    const formattedDate = dateString.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <>
            <main>
                <Location />
                <div className="register-event">
                    <div className="title-card">
                        <img className="title-image" src={eventData.titleImage} alt="Event" />
                        <p className="title">{eventData.title}</p>
                    </div>
                    <p className="description">{eventData.description}</p>
                    <div className="date" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <img src={dateicon} alt="Date Icon" style={{ width: "20px", height: "20px" }} />
                        <p>{formattedDate}</p>
                    </div>
                    <div className="time">
                        <img src={timeicon} />
                        <p className="start-time">{eventData.startTime}</p>
                        <p className="end-time">{eventData.endTime}</p>
                    </div>

                    <div className="location">{eventData.location}</div>
                    <div className="rew-pts">{eventData.rewardPoints}</div>
                </div>
            </main>
            <Footer />
        </>
    );
}

export default RegisterEvent;
