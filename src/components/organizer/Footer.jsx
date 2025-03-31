import React from "react";
import { FaHome, FaPlus, FaUser} from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      {[
        { icon: <FaHome />, tooltip: "Home", link: "/home" },
        { icon: <FaPlus />, tooltip: "Create New", link: "/organizenew" },
        { icon: <FaUser />, tooltip: "Organizer Info", link: "/organizer/profile page" },
      ].map((item, index) => (
        <div key={index} className="button-wrapper">
          <a href={item.link}>
            <button className="icon-button" aria-label={item.tooltip}>
              {item.icon}
            </button>
          </a>
          <div className="tooltip">{item.tooltip}
          </div>
        </div>
      ))}
    </footer>
  );
};

export default Footer;
