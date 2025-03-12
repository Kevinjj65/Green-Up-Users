
import React from "react";
import  { useState } from "react";
import "./Login.css";
import { FcGoogle } from "react-icons/fc";
export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Username:", username, "Password:", password);
  };
  const handleGoogleLogin = () => {
    console.log("Signing in with Google...");
    // Add Google authentication logic here
  };
  return (
    <div className="login-container">
      <h1 className="login-title">Welcome Back!</h1>
      <form onSubmit={handleLogin} className="login-form">
        <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
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
      </form>
    </div>
  
  );
}
