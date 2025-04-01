import React, { useState } from "react";
import { supabase } from "./../../services/supabaseClient"; // Adjust the path if needed
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
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-80 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Welcome Back!</h2>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full p-2 my-2 border border-white rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-green-500"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full p-2 my-2 border border-white rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-green-500"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <button
            type="submit"
            className="w-full bg-green-400 hover:bg-green-500 text-black font-semibold py-2 mt-4 rounded-md transition duration-200"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="text-sm text-white mt-4">
          Not yet a Member?{" "}
          <span
            className="text-green-400 hover:text-blue-400 cursor-pointer underline"
            onClick={() => navigate("/organizersignup")}
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
