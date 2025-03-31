import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignUp.css";
import { FcGoogle } from "react-icons/fc";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone_number, setPhone] = useState("");
  const navigate = useNavigate();
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handlesignup = (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      alert("You must agree to the Terms and Conditions to proceed.");
      return;
    }
    console.log("Name:", name, "Email:", email, "Password:", password, "Phone Number:", phone_number);
  };

  const handleGooglesignup = () => {
    console.log("Signing up with Google...");
    // Google authentication logic 
  };

  const handleLoginClick = () => {
    navigate("/organizerlogin"); // Navigate to Login page when button is clicked
  };

  const handleCheckboxChange = () => {
    setAgreeTerms(!agreeTerms); // Toggle checkbox state
  };
  return (
    <div className="signup-container">
      <h1 className="signup-title">Be an Organizer Now!</h1>
      <form onSubmit={handlesignup} className="signup-form">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="tel"
          placeholder="Phone"
          value={phone_number}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
         <div className="terms-container">
          <input
            type="checkbox"
            id="terms"
            checked={agreeTerms}
            onChange={handleCheckboxChange}
          />
        <p className="terms">
          I agree to Terms and Conditions
        </p>
        </div>
        <button type="submit" className="signup-btn">
          Sign Up
        </button>
        <p className="or-text">or</p>
        <button type="button" className="google-btn" onClick={handleGooglesignup}>
          <FcGoogle size={24} />
          <span>Sign up with Google</span>
        </button>
        
        <p className="log-text">Already a Member?{" "}
        <button
            type="button"
            className="login-btn"
            onClick={handleLoginClick}
          >
            Login
          </button>
        </p>
        <p className="volunteer-text">Are you a Volunteer?{" "}
        <button
            type="button"
            className="volunteer-btn"
            onClick={handleLoginClick}
          >
            Click Here
          </button>
        </p>
      </form>
    </div>
  );
}
