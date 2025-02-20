import React from "react";
import Footer from "../footer/Footer";
import { PlusCircleIcon } from "@heroicons/react/24/solid";


const Events = () => {
  return (
    <div className="min-h-screen bg-green-50 text-green-900">
      <header className="bg-green-700 py-4 px-6 flex justify-between items-center text-white">
        <h1 className="text-2xl font-bold">Events</h1>
        <nav className="space-x-4">
          <a href="/" className="hover:text-green-300">Home</a>
          <a href="/maps" className="hover:text-green-300">Maps</a>
          <a href="/user" className="hover:text-green-300">Profile</a>
        </nav>
      </header>

      {/* Scrollable Events Section */}
      <div className="p-6 overflow-x-auto">
        <h2 className="text-3xl font-semibold mb-4">All Events</h2>
        <div className="flex space-x-6">
          {[...Array(7)].map((_, index) => (
            index < 6 ? (
              <div key={index} className="bg-green-200 p-4 rounded-lg shadow-md w-56">
                <img
                  src="https://via.placeholder.com/150"
                  alt="Event"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <h3 className="text-lg font-semibold mt-2">Event {index + 1}</h3>
                <p className="text-green-700">Location | Date</p>
              </div>
            ) : (
              <div
                key={index}
                className="bg-green-200 p-4 rounded-lg shadow-md w-56 flex flex-col items-center justify-center cursor-pointer hover:bg-green-300 transition"
              >
                <PlusCircleIcon className="h-12 w-12 text-green-600" />
                <p className="text-green-700 mt-2 font-semibold">Add More Events</p>
              </div>
            )
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Events;
