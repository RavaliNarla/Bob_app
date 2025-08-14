// src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import panaImage from "../assets/pana.png";
import logoImage from "../assets/bob-logo.png";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
//   const [otp, setOtp] = useState("");
// const [mfaToken, setMfaToken] = useState("");
// const [showOtpInput, setShowOtpInput] = useState(false);


  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

 const handleRegister = async (e) => {
  e.preventDefault();
  const { name, email, phone, password, confirmPassword } = form;

  if (!name || !email || !phone || !password || !confirmPassword) {
    return alert("All fields are required");
  }
  if (password !== confirmPassword) {
    return alert("Passwords do not match");
  }

  try {
    // 1. Register user via your backend
    await axios.post("http://bobbe.sentrifugo.com/api/auth/register", {
      name,
      email,
      phone,
      password,
    });

    // 2. Immediately try to log in (to trigger MFA)
    // const loginRes = await axios.post("http://localhost:5000/api/auth/login", {
    //   email,
    //   password,
    // });

    // // 3. If MFA is required, show OTP input
    // if (loginRes.data.mfa_required) {
    //   setMfaToken(loginRes.data.mfa_token);
    //   setShowOtpInput(true);
    // } else {
    //   // No MFA required, login directly
    //   localStorage.setItem("access_token", loginRes.data.access_token);
    //   navigate("/dashboard");
    // }
    // localStorage.setItem("access_token",loginRes.data.access_token);
    navigate("/login");
  } catch (err) {
    console.error(err);
    alert("Registration/Login failed");
  }
};
// const handleVerifyOtp = async () => {
//   try {
//     const res = await axios.post("https://dev-0rb6h2oznbwkonhz.us.auth0.com/oauth/token", {
//       grant_type: "http://auth0.com/oauth/grant-type/mfa-otp",
//       client_id: "YOUR_CLIENT_ID", // 🔁 replace with real ID
//       mfa_token: mfaToken,
//       otp,
//     });

//     localStorage.setItem("access_token", res.data.access_token);
//     alert("Registration + OTP verified!");
//     navigate("/dashboard");
//   } catch (err) {
//     alert("OTP verification failed.");
//   }
// };



  return (
    <div className="login-container">
      <div className="left-panel">
        <img src={panaImage} alt="Illustration" />
        <h2>बैंक ऑफ़ बड़ौदा</h2>
        <h3>Bank of Baroda</h3>
      </div>

      <div className="right-panel">
        <div className="logo">
          <img src={logoImage} alt="Logo" />
          <h4>Recruitment</h4>
        </div>

        <form onSubmit={handleRegister} className="d-flex flex-column">
          <label>Full Name</label>
          <input name="name" onChange={handleChange} required style={{ borderRadius: "20px", backgroundColor: "#fff", border: "1px solid #ccc", padding: '8px 12px' }}/>

          <label>Email</label>
          <input type="email" name="email" onChange={handleChange} required style={{ borderRadius: "20px", backgroundColor: "#fff", border: "1px solid #ccc", padding: '8px 12px' }}/>

          <label>Phone</label>
          <input type="text" name="phone" onChange={handleChange} required style={{ borderRadius: "20px", backgroundColor: "#fff", border: "1px solid #ccc", padding: '8px 12px' }}/>

          <label>Password</label>
          <input type="password" name="password" onChange={handleChange} required style={{ borderRadius: "20px", backgroundColor: "#fff", border: "1px solid #ccc", padding: '8px 12px' }}/>

          <label>Confirm Password</label>
          <input type="password" name="confirmPassword" onChange={handleChange} required style={{ borderRadius: "20px", backgroundColor: "#fff", border: "1px solid #ccc", padding: '8px 12px' }}/>

          <button type="submit" className="login-button mt-4">Register</button>
          {/* {showOtpInput && (
  <>
    <input
      placeholder="Enter OTP"
      value={otp}
      onChange={(e) => setOtp(e.target.value)}
    />
    <button onClick={handleVerifyOtp}>Verify OTP</button>
  </>
)} */}


          <p className="register-link">
            Already a user? <Link to="/login">Login here</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;