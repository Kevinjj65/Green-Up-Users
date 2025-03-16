import React, { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    location: "",
  });

  useEffect(() => {
    if (!isLogin) {
      getLocation();
    }
  }, [isLogin]);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            location: `${position.coords.latitude}, ${position.coords.longitude}`,
          }));
        },
        () => console.log("Location access denied")
      );
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      if (error) alert(error.message);
      else onClose();
    } else {
      const { error, data } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            phone: formData.phone,
            location: formData.location,
          },
        },
      });
      if (error) alert(error.message);
      else onClose();
    }
  };

  return isOpen ? (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center">
      <div className="bg-[#1e1e1e] p-6 rounded-lg shadow-lg w-80">
        <h2 className="text-[#39FF14] text-2xl font-bold mb-4">
          {isLogin ? "Login" : "Sign Up"}
        </h2>
        <form onSubmit={handleAuth} className="flex flex-col">
          {!isLogin && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="p-2 mb-2 rounded bg-[#292929] text-white"
              required
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="p-2 mb-2 rounded bg-[#292929] text-white"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="p-2 mb-2 rounded bg-[#292929] text-white"
            required
          />
          {!isLogin && (
            <>
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                className="p-2 mb-2 rounded bg-[#292929] text-white"
                required
              />
              <p className="text-sm text-gray-400">
                {formData.location ? `Location: ${formData.location}` : "Fetching location..."}
              </p>
            </>
          )}
          <button
            type="submit"
            className="bg-[#39FF14] text-[#1e1e1e] font-semibold py-2 mt-3 rounded-full hover:scale-105 transition"
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>
        <p className="text-gray-300 text-sm mt-3">
          {isLogin ? "New here?" : "Already have an account?"}{" "}
          <span
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#39FF14] cursor-pointer"
          >
            {isLogin ? "Sign up" : "Login"}
          </span>
        </p>
        <button onClick={onClose} className="text-gray-400 mt-3 hover:text-white">
          Close
        </button>
      </div>
    </div>
  ) : null;
};

export default AuthModal;
