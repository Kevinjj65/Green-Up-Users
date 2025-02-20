import React from "react";
import Footer from "../footer/Footer";

const Home = () => {
  return (
    <div className="min-h-screen bg-green-50 text-green-900">
      {/* Header */}
      <header className="bg-green-700 py-4 px-6 flex justify-between items-center text-white">
        <h1 className="text-2xl font-bold align-center">GREEN UP</h1>
      </header>

      {/* Main Section */}
      <main className="p-6">
        <h2 className="text-3xl font-semibold mb-4">Upcoming Events</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-green-200 p-4 rounded-lg shadow-md">
              <img
                src="https://via.placeholder.com/200"
                alt="Event"
                className="w-full h-40 object-cover rounded-lg"
              />
              <h3 className="text-lg font-semibold mt-2">Event {index + 1}</h3>
              <p className="text-green-700">Location | Date</p>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
