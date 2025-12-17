// src/components/FancyButton.jsx
import React from "react";
import "./FancyButton.css";

const CELLS = Array.from({ length: 300 }); // 30 x 10

function FancyButton({ children, onClick }) {
  return (
    <button className="base fancy-button" onClick={onClick} type="button">
      {CELLS.map((_, index) => (
        <span key={index} className="cell" />
      ))}
      <span className="bg">{children}</span>
    </button>
  );
}

export default FancyButton;
