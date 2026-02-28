import React from "react";
import { useNavigate } from "react-router-dom";

export default function ExitButton({ to }) {
  const navigate = useNavigate();

  const handleExit = () => {
    if (to) {
      navigate(to);
    } else {
      const lastPath = sessionStorage.getItem("lastPath") || "/home";
      navigate(lastPath);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "flex-start", margin: "5px 0 40px 0" }}>
      <button className="exit-btn" onClick={handleExit}>
        ⬅ Exit
      </button>
    </div>
  );
}