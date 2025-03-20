import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./../../services/supabaseClient"; // Adjust path if needed
import "./Signup.css"; // Import CSS

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "organizer",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

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
        data: { role, name, phone },
      },
    });

    if (error) {
      setError(error.message);
    } else {
      alert("Signup successful! Check your email to verify your account.");

      // Insert into organizers table
      if (role === "organizer" && data.user) {
        const { error: insertError } = await supabase.from("organizers").insert([
          {
            id: data.user.id,
            name,
            email_id: email,
            phone_number: phone,
          },
        ]);

        if (insertError) {
          console.error("Error inserting organizer:", insertError);
        }
      }
    }

    setLoading(false);
  };

  return (
    <div className="signup-container">
      <h2>Be an Organizer Now!</h2>
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
          />{" "}
          I agree to Terms & Conditions
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Signing Up..." : "Sign Up"}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <p>
        Already a Member?{" "}
        <span className="link" onClick={() => navigate("/organizerlogin")}>
        <u>Click Here</u>
        </span>
      </p>
      <p>
        Are you a Volunteer?{" "}
        <span className="link" onClick={() => navigate("/userlogin")}>
          <u>Click Here</u>
        </span>
      </p>
    </div>
  );
};

export default Signup;
