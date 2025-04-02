import { useState } from "react";
import { supabase } from "../../../services/supabaseClient";

const Signup = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
    role: "user",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!agreed) {
      setError("You must agree to the Terms & Conditions to sign up.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

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

      if (data.user) {
        // Request location access
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const latitude = position.coords.latitude;
              const longitude = position.coords.longitude;

              // Insert user details into participants table
              const { error: insertError } = await supabase.from("participants").insert([
                {
                  id: data.user.id,
                  name,
                  email_id: email,
                  phone_number: phone,
                  latitude,
                  longitude,
                },
              ]);

              if (insertError) {
                console.error("Error inserting participant:", insertError);
              } else {
                alert("Location saved successfully!");
              }
            },
            (error) => {
              console.error("Error getting location:", error.message);
            }
          );
        } else {
          console.error("Geolocation is not supported by this browser.");
        }
      }
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>

      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
        className="w-full p-2 mb-2 border rounded"
      />
      
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
        className="w-full p-2 mb-2 border rounded"
      />
      
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        required
        className="w-full p-2 mb-2 border rounded"
      />

      <input
        type="password"
        placeholder="Confirm Password"
        value={formData.confirmPassword}
        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
        required
        className="w-full p-2 mb-2 border rounded"
      />

      <input
        type="text"
        placeholder="Phone Number"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        required
        className="w-full p-2 mb-2 border rounded"
      />

      <label className="flex items-center space-x-2">
        <input type="checkbox" checked={agreed} onChange={() => setAgreed(!agreed)} />
        <span>I agree to the Terms & Conditions</span>
      </label>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white p-2 mt-4 rounded hover:bg-green-700 transition"
      >
        {loading ? "Signing up..." : "Sign Up"}
      </button>
    </form>
  );
};

export default Signup;
