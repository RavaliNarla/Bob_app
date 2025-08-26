import React, { useState } from "react";
import axios from "axios";
import "../css/Login.css";
import pana from "../assets/pana.png";
import boblogo from "../assets/bob-logo.png";
import { useNavigate } from "react-router-dom";
import apiService from "../services/apiService";


const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
   
     const res = await apiService.forgotPassword(email);
      alert("Password reset link sent. Check your email.");
      navigate("/login");
    } catch (error) {
      console.error(error);
      setMessage("Failed to send reset link. Try again.");
    }
  };

  return (
        <div className="login-container">
      <div className="left-panel">
        <img src={pana} alt="Illustration" />
        <h2>बैंक ऑफ़ बड़ौदा</h2>
        <h3>Bank of Baroda</h3>
      </div>

      <div className="right-panel">
        <div className="logo" style={{ marginBottom: '20px' }}>
          <img src={boblogo} alt="Logo" />
          <h4>Forgot Password</h4>
        </div>

        <form className="login_form" onSubmit={handleSubmit}>
          <button
            className="back-button"
            onClick={() => navigate("/login")}
          >
            ← Login
          </button>

          <label>Enter your registered email:</label>
          <input
            type="email"
            value={email}
            required
            // placeholder="Enter email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@domain.com"
          />

          <button className="login-button" type="submit">
            SEND RESET LINK
          </button>
        </form>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default ForgotPassword;