// src/pages/Login.jsx
import React, { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../css/Login.css";
import pana from "../assets/pana.png";
import boblogo from "../assets/bob-logo.png";
import { useDispatch } from 'react-redux';
import { setUser, setAuthUser } from '../store/userSlice';

const Login = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [unverifiedUserId, setUnverifiedUserId] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://bobbe.sentrifugo.com/api/auth/recruiter-login", {
        email,
        password,
      });

      const dbRes = await axios.post("http://localhost:5000/api/getdetails/users", {
        email,
      });

      if (res.data.mfa_required) {
        localStorage.setItem("mfa_token", res.data.mfa_token);
        alert("MFA required. Please verify your Mail.");
        navigate("/verify-otp"); // ⬅️ You must build this page to complete OTP
      } else {
        const token = res.data.access_token;
        localStorage.setItem("access_token", token);
        setAuthUser(res.data);
        setUser(dbRes.data); // Store user details from DB in context
        dispatch(setUser(dbRes.data));
        dispatch(setAuthUser(res.data));
        // /api/getdetails/users
        // console.log("User logged in:", res.data);
        // console.log("User details from DB:", dbRes.data);
        navigate("/job-requisition");

        // // 🔍 Decode token to get roles
        // const decoded = jwtDecode(token);
        // const roles = decoded["https://your-app.com/claims/roles"] || []; // Change namespace if different

        // if (roles.includes("user")) {
        //   navigate("/dashboard");
        // } else {
        //   alert("You are not authorized to access this app.");
        //   localStorage.removeItem("access_token");
        // }
      }
    } catch (err) {
      const errorData = err.response?.data;

      if (
        errorData?.error ===
        "Email not verified. Please verify your email before login."
      ) {
        alert("Email not verified. Click below to resend verification email.");
        setUnverifiedUserId(errorData.user_id); // Send user_id from backend
      } else {
        alert(errorData?.error_description || "Login failed");
      }
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
        <div className="logo">
          <img src={boblogo} alt="Logo" />
          <h4>Recruitment</h4>
        </div>

        <form className="login_form" onSubmit={handleLogin}>
          <label>Email Id:</label>
          <input
            type="email"
            value={email}
            required
            placeholder="Enter email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password:</label>
          <input
            type="password"
            value={password}
            required
            placeholder="Enter password"
            onChange={(e) => setPassword(e.target.value)}
          />

          {unverifiedUserId && (
            <button
              className="resend-btn my-2 mb-3"
              style={{ borderRadius: "20px", backgroundColor: "#fff", border: "1px solid #ff6b00", padding: '4px 12px', color: "#ff6b00" }}
              onClick={async () => {
                try {
                  await axios.post(
                    "http://bobbe.sentrifugo.com/api/auth/recruiter-resend-verification",
                    {
                      user_id: unverifiedUserId,
                    }
                  );
                  alert("Verification email sent. Please check your inbox.");
                } catch (err) {
                  alert("Failed to resend verification email.");
                }
              }}
            >
              Resend Verification Email
            </button>
          )}

          {/* <div className="actions">
            <span className="forgot-link">Forgot password?</span>
          </div> */}

          <button className="login-button" type="submit">
            LOGIN
          </button>

          {/* <div className="divider">OR</div>

          <button type="button" className="google-button">
            <img src="/images/google-icon.png" alt="Google" />
            Sign up with Google
          </button> */}
          <p className="register-link">
            Forgot Password? <Link to="/forgot-password">Click here</Link>
          </p>

          {/* <p className="register-link">
            New User? <Link to="/register">Register Here</Link>
          </p> */}
        </form>
      </div>
    </div>
  );
};

export default Login;