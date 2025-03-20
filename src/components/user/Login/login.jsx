import React, { useState } from "react";
import { supabase } from "./../../../services/supabaseClient.jsx"; // Adjust the path if needed
import { useNavigate } from "react-router-dom";

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

    // Step 1: Attempt to log in with Supabase Auth
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

    // Step 2: Check if email exists in the 'participants' table
    const { data: participant, error: participantError } = await supabase
      .from("participants")
      .select("email_id")
      .eq("email_id", email)
      .single();

    if (participantError || !participant) {
      setError("You are not registered as a participant.");
      await supabase.auth.signOut(); // Sign out if email is not found
      setLoading(false);
      return;
    }

    // Step 3: Proceed to events page if email exists in 'participants'
    alert("Login successful!");
    navigate("/events");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-green-700 text-center">Welcome Back!</h2>
        <form onSubmit={handleSubmit} className="mt-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full p-3 border border-green-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-green-700"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full p-3 mt-3 border border-green-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-green-700"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <button
            type="submit"
            className="w-full bg-green-600 text-white p-3 rounded-lg mt-4 hover:bg-green-700 transition"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="text-center text-green-700 mt-3">
          Not yet a Member?{" "}
          <span
            className="text-green-500 cursor-pointer font-semibold hover:underline"
            onClick={() => navigate("/usersignup")}
          >
            Sign Up
          </span>
        </p>
        <p className="text-center text-green-700 mt-1">
          Are you an Organizer?{" "}
          <span
            className="text-green-500 cursor-pointer font-semibold hover:underline"
            onClick={() => navigate("/organizerlogin")}
          >
            Click here
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
