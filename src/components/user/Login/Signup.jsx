import React, { useState } from "react";
import { supabase } from "./../../../services/supabaseClient.jsx"; // Adjust path if needed
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "./Signup.css"; // Import CSS

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "", // Added phone number state
    role: "volunteer", // Default role (hidden, cannot be changed)
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false); // Track agreement checkbox
  const navigate = useNavigate(); // Initialize navigate function

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) {
      setError("You must agree to the Terms & Conditions to sign up.");
      return;
    }

    setLoading(true);
    setError("");

    const { email, password, name, phone, role } = formData;

    // Sign up user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role, name, phone }, // Store role & phone in auth metadata
      },
    });

    if (error) {
      setError(error.message);
    } else {
      alert("Signup successful! Check your email to verify your account.");

      // Insert into participants table if role is volunteer
      if (role === "volunteer" && data.user) {
        const { error: insertError } = await supabase.from("participants").insert([
          {
            id: data.user.id,
            name,
            email_id: email, // Corrected column name
            phone_number: phone, // Insert phone number into the table
          },
        ]);

        if (insertError) {
          console.error("Error inserting participant:", insertError);
        }
      }
    }

    setLoading(false);
  };

  return (
    <div className="signup-container">
      <h2>Be a Volunteer Now!</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        <label>
          <input 
            type="checkbox" 
            checked={agreed} 
            onChange={(e) => setAgreed(e.target.checked)} 
          /> 
          I agree to Terms & Conditions
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Signing Up..." : "Sign Up"}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <p>
        Already a Member? <span className="link" onClick={() => navigate("/userlogin")}>Login</span>
      </p>
      <p>
        Are you an Organizer? <span className="link" onClick={() => navigate("/organizerlogin")}>Click here</span>
      </p>
    </div>
  );
};

export default Signup;
