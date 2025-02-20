import React from "react";

const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-green-800 py-2 flex justify-center space-x-6 text-white">
      {[
        { label: "H", tooltip: "Home", link: "/" },
        { label: "E", tooltip: "Events", link: "/events" },
        { label: "M", tooltip: "Maps", link: "/maps" },
        { label: "U", tooltip: "User Info", link: "/user" },
      ].map((item, index) => (
        <div key={index} className="relative group">
          <a href={item.link}>
            <button className="bg-green-700 p-3 rounded-full hover:bg-green-500 transition">
              {item.label}
            </button>
          </a>
          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-green-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
            {item.tooltip}
          </div>
        </div>
      ))}
    </footer>
  );
};

export default Footer;
