
import React from "react";
import { useNavigate } from "react-router-dom";
import  { useState } from "react";
import "./Login.css";
import { FcGoogle } from "react-icons/fc";
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Email:", email, "Password:", password);
  };
  const handleGoogleLogin = () => {
    console.log("Signing in with Google...");
    // Add Google authentication logic here
  };
  const handleSignUpClick = () => {
    navigate("/organizersignup"); // Navigate to Login page when button is clicked
  };
  return (
    <div className="login-container">
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
          </button>
        </p>
      </form>
    </div>
  
  );
}
