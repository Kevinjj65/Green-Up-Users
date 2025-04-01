import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./../../services/supabaseClient";

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
    <div className="w-full max-w-md bg-gray-900 p-6 rounded-lg text-center mx-auto flex flex-col items-center shadow-md">
      <h2 className="text-white mb-4 text-xl font-semibold">Be an Organizer Now!</h2>

      <form onSubmit={handleSubmit} className="w-full flex flex-col">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full p-2 my-2 rounded-md bg-white text-black text-lg placeholder-gray-500 focus:outline-green-500"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full p-2 my-2 rounded-md bg-white text-black text-lg placeholder-gray-500 focus:outline-green-500"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full p-2 my-2 rounded-md bg-white text-black text-lg placeholder-gray-500 focus:outline-green-500"
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          required
          className="w-full p-2 my-2 rounded-md bg-white text-black text-lg placeholder-gray-500 focus:outline-green-500"
        />

        {/* Terms & Conditions Checkbox */}
        <label className="text-white text-sm flex items-center mt-2">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mr-2"
          />
          I agree to the Terms & Conditions
        </label>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="bg-green-500 text-white p-3 mt-3 rounded-md text-lg cursor-pointer w-full disabled:bg-green-300 disabled:cursor-not-allowed"
        >
          {loading ? "Signing Up..." : "Sign Up"}
        </button>
      </form>

      {/* Error Message */}
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      {/* Navigation Links */}
      <p className="text-white mt-4 text-sm">
        Already a Member?{" "}
        <span className="text-green-500 font-semibold cursor-pointer hover:underline" onClick={() => navigate("/organizerlogin")}>
          <u>Click Here</u>
        </span>
      </p>

      <p className="text-white mt-2 text-sm">
        Are you a Volunteer?{" "}
        <span className="text-green-500 font-semibold cursor-pointer hover:underline" onClick={() => navigate("/userlogin")}>
          <u>Click Here</u>
        </span>
      </p>
    </div>
  );
};

export default Signup;
