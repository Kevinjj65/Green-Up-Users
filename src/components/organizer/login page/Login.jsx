import React, { useState } from "react";
import { supabase } from "./../../services/supabaseClient"; // Adjust the path if needed
import { useNavigate } from "react-router-dom";
import "./Login.css";
<<<<<<< HEAD:src/components/organizer/login page/Login.jsx
import { FcGoogle } from "react-icons/fc";
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
=======

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
>>>>>>> 27ab7e49b1cb6768142c25d579f8e9686ad6e5f4:src/components/organizer/Login.jsx
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
<<<<<<< HEAD:src/components/organizer/login page/Login.jsx
    console.log("Email:", email, "Password:", password);
  };
  const handleGoogleLogin = () => {
    console.log("Signing in with Google...");
    // Add Google authentication logic here
  };
  const handleSignUpClick = () => {
    navigate("/organizersignup"); // Navigate to Login page when button is clicked
=======
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
>>>>>>> 27ab7e49b1cb6768142c25d579f8e9686ad6e5f4:src/components/organizer/Login.jsx
  };

  return (
    <div className="login-container">
<<<<<<< HEAD:src/components/organizer/login page/Login.jsx
      <h1 className="login-title">Welcome Back!</h1>
      <form onSubmit={handleLogin} className="login-form">
        <input
        type="text"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required/>
        <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required/>
        <button type="submit" className="login-btn"> 
          Login</button>
        <p className="or-text">or</p>
       
        <button type="button" className="google-btn" onClick={handleGoogleLogin}>
        <FcGoogle size={24} />
        <span>Sign in with Google</span>
        </button>
        <p className="sign-text">Not a Member?{" "}
        <button
            type="button"
            className="signup-btn"
            onClick={handleSignUpClick}
          >
            Sign Up
=======
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
>>>>>>> 27ab7e49b1cb6768142c25d579f8e9686ad6e5f4:src/components/organizer/Login.jsx
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
