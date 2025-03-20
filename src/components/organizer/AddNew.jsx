import { useState } from 'react';
import { supabase } from './../../services/supabaseClient';
import Footer from './Footer';
import './Organizer.css';

function AddNew() {
    const [eventData, setEventData] = useState({
        title: '',
        description: '',
        date: '',
        start_time: '',
        end_time: '',
        location: '',
        latitude: '',  // Added latitude state
        longitude: '', // Added longitude state
        max_participants: '',
        reward_points: '',
        image_url: ''
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEventData({
            ...eventData,
            [name]: value
        });
    };

    // Function to fetch latitude & longitude using OpenStreetMap Nominatim API
    const getCoordinates = async (address) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
            );
            const data = await response.json();

            if (data.length > 0) {
                return {
                    latitude: parseFloat(data[0].lat),
                    longitude: parseFloat(data[0].lon)
                };
            } else {
                alert('Location not found. Please enter a valid address.');
                return { latitude: null, longitude: null };
            }
        } catch (error) {
            console.error('Error fetching coordinates:', error);
            return { latitude: null, longitude: null };
        }
    };

    const handleLocationBlur = async () => {
        if (eventData.location.trim() === '') return;

        const { latitude, longitude } = await getCoordinates(eventData.location);

        if (latitude !== null && longitude !== null) {
            setEventData((prev) => ({
                ...prev,
                latitude,
                longitude
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!eventData.latitude || !eventData.longitude) {
            alert('Please enter a valid location to get coordinates.');
            setLoading(false);
            return;
        }

        const { error } = await supabase
            .from('events')
            .insert([
                {
                    title: eventData.title,
                    description: eventData.description,
                    date: eventData.date,
                    start_time: eventData.start_time,
                    end_time: eventData.end_time,
                    latitude: eventData.latitude,
                    longitude: eventData.longitude,
                    max_participants: eventData.max_participants,
                    reward_points: eventData.reward_points,
                    images: eventData.image_url
                }
            ]);

        setLoading(false);

        if (error) {
            console.error('Error inserting event:', error);
            alert('Error adding event.');
        } else {
            alert('Event added successfully!');
        }
    };

    return (
        <div className='container'>
            <main>
                <h1>Be an Organizer Now</h1>
                <form onSubmit={handleSubmit}>
                    <input className='input name' type='text' name='title' placeholder='Name of the Event' onChange={handleChange} required />
                    <textarea className='input description' name='description' placeholder='Event Description' onChange={handleChange} required />
                    <input className='input date' type='date' name='date' onChange={handleChange} required />
                    <div className='time'>
                        <input className='input start' type='time' name='start_time' onChange={handleChange} required />
                        <input className='input end' type='time' name='end_time' onChange={handleChange} required />
                    </div>
                    <input
                        className='input loc'
                        type='text'
                        name='location'
                        placeholder='Location (City, Address)'
                        onChange={handleChange}
                        onBlur={handleLocationBlur} // Trigger fetching coordinates when user leaves input field
                        required
                    />
                    {eventData.latitude && eventData.longitude && (
                        <p>Coordinates: {eventData.latitude}, {eventData.longitude}</p>
                    )}
                    <input className='input nop' type='number' name='max_participants' placeholder='Max No. of Participants' onChange={handleChange} required />
                    <input className='input rewpts' type='number' name='reward_points' placeholder='Alloted Reward Points' onChange={handleChange} required />
                    <input className='input image' type='text' name='image_url' placeholder='Image URL' onChange={handleChange} />
                    <div className='check'>
                        <input className='checkbox' type='checkbox' required />
                        <span className='check-text'>I agree to Terms & Conditions</span>
                    </div>
                    <button className='btn1 regbtn' type='submit' disabled={loading}>
                        {loading ? 'Registering...' : 'Register Now'}
                    </button>
                </form>
            </main>
            <Footer />
        </div>
    );
}

export default AddNew;
