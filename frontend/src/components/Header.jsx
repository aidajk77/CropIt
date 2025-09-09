import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header style={{ 
        width: "100%",      
        padding: "1rem",
        backgroundColor: "#f0f0f0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxSizing: "border-box",
        position: "relative",
      }}>
      <h1>📸 Image Cropper</h1>
      <nav>
        <Link to="/" style={{ marginRight: "1rem" }}>Cropper</Link>
        <Link to="/config">Config</Link>
      </nav>
    </header>
  );
};

export default Header;
