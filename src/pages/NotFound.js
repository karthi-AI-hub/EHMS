import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
const NotFound = () => {
  const navigate = useNavigate(); 
  return (
    <div style={{ textAlign: "center", padding: "50px", fontFamily: "Arial, sans-serif" }}>
      <img src={logo} alt="Sail Icon" height="300" />
      <h1 style={{ color: "red" }}>404 - Page Not Found</h1>
      <p>Oops! The page you’re looking for doesn’t exist.</p>
      <button
        onClick={() => navigate(-1)} // Navigate to the previous page
        style={{
          color: "white",
          backgroundColor: "blue",
          fontSize: "18px",
          padding: "10px 20px",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          textDecoration: "none",
        }}
      >
        Go Back
      </button>
    </div>
  );
};

export default NotFound;
