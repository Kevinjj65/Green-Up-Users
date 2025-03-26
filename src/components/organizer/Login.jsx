import React, { useState } from "react";
import { supabase } from "./../../services/supabaseClient"; // Adjust the path if needed
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { email, password } = formData;

    // Step 1: Attempt to log in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        setError("Incorrect email or password.");
      } else if (error.message.includes("Email not confirmed")) {
        setError("Please verify your email before logging in.");
      } else {
        setError(error.message);
      }
      setLoading(false);
      return;
    }

    // Step 2: Check if the email exists in 'organizers' table
    const { data: organizer, error: organizerError } = await supabase
      .from("organizers")
      .select("email_id")
      .eq("email_id", email)
      .single();

    if (organizerError || !organizer) {
      setError("You are not registered as an organizer.");
      await supabase.auth.signOut(); // Sign out the user
      setLoading(false);
      return;
    }

    // Step 3: Navigate to home page if email exists
    alert("Login successful!");
    navigate("/organizenew");
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Welcome Back!</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="input-field"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="input-field"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {error && <p className="error">{error}</p>}
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="signup-text">
          Not yet a Member?{" "}
          <span className="signup-link" onClick={() => navigate("/organizersignup")}>
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
