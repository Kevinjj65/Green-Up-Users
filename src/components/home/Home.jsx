import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthModal from "../authentication/AuthModal";

const Home = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#39FF14]">
      {/* Header */}
      <header className="bg-[#1e1e1e] py-4 px-6 flex justify-between items-center border-b border-[#39FF14]">
        <h1 className="text-3xl font-bold">GREEN UP</h1>
        
        {/* Cute Login Button */}
        <button
          onClick={() => setIsAuthOpen(true)}
          className="bg-[#39FF14] text-[#1e1e1e] font-semibold px-6 py-2 rounded-full 
                     shadow-lg hover:scale-105 transition-all duration-300 border border-[#39FF14] 
                     hover:shadow-[#39FF14] hover:shadow-md"
        >
          Login
        </button>
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Main Section */}
      <main className="p-6">
        <h2 className="text-3xl font-semibold mb-4">Upcoming Events</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-[#39FF14] text-[#1e1e1e] p-4 rounded-lg shadow-lg">
              <img
                src="https://via.placeholder.com/200"
                alt="Event"
                className="w-full h-40 object-cover rounded-lg"
              />
              <h3 className="text-lg font-semibold mt-2">Event {index + 1}</h3>
              <p className="text-[#1e1e1e] font-medium">Location | Date</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home;
