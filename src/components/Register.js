// src/pages/Register.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Button, Form, InputGroup, Modal, Table } from "react-bootstrap";
import apiService from "../services/apiService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faSearch } from "@fortawesome/free-solid-svg-icons";
// import panaImage from "../assets/pana.png";
// import logoImage from "../assets/bob-logo.png";
import CryptoJS from "crypto-js";
import '../css/Register.css';
import { useSelector } from "react-redux";

const Register = () => {
  const SECRET_KEY = "fdf4-832b-b4fd-ccfb9258a6b3";
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.user.authUser.user);
  // console.log(authUser);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "",
  });
  const [usersData, setUsersData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
//   const [otp, setOtp] = useState("");
// const [mfaToken, setMfaToken] = useState("");
// const [showOtpInput, setShowOtpInput] = useState(false);

  const encryptPassword = (password) => {
    return CryptoJS.AES.encrypt(password, SECRET_KEY).toString();
  };

  const fetchUsers = async () => {
    try {
      const res = await apiService.getRegister();
      setUsersData(res);
      // console.log("Fetched users:", res);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const filteredUsers = usersData.filter(
    (user) =>
      user?.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

 const handleRegister = async (e) => {
  e.preventDefault();
  const { name, email, phone, password, confirmPassword, role } = form;

  if (!name || !email || !phone || !password || !confirmPassword || !role) {
    return alert("All fields are required");
  }
  if (password !== confirmPassword) {
    return alert("Passwords do not match");
  }

  try {
    const encryptedPassword = encryptPassword(password);
    // 1. Register user via your backend
    await apiService.registerUser({
      name,
      email,
      phone,
      password: encryptedPassword,
      role,
      created_by: authUser?.sub,
    });

    // 2. Immediately try to log in (to trigger MFA)
    // const loginRes = await axios.post("http://bobbe.sentrifugo.com/api/auth/login", {
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
    // navigate("/login");
    alert("Registration successful!");
    await fetchUsers();
    setShowModal(false); // Close modal after successful registration
    setForm({
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: "",
    });
  } catch (err) {
    console.error(err);

    if (err.response) {
      // Example: API returns 409 Conflict if user exists
      if (err.response.status === 400) {
        alert("User already exists. Please login instead.");
      } else {
        // Or check message returned by backend
        const msg = err.response.data?.message || "Registration/Login failed";
        alert(msg);
      }
    }
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
    <div className="login-container register_container d-flex flex-column py-3 px-5">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 style={{ fontFamily: 'Noto Sans', fontWeight: 600, fontSize: '16px', color: '#FF7043', marginBottom: '0px' }}>Users</h5>
        <Button 
          onClick={() => setShowModal(true)}
          style={{ backgroundColor: '#FF7043', borderColor: '#FF7043', color: '#fff' }}
        >
          + Add
        </Button>
      </div>

      {/* 🔎 Search Bar */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <InputGroup className="w-50 fonreg searchinput">
          <InputGroup.Text style={{ backgroundColor: '#FF7043' }}>
            <FontAwesomeIcon icon={faSearch} style={{ color: '#fff' }} />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Search"
            value={searchTerm}
            className="title"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
      </div>

      <Table className="req_table mt-2" responsive hover>
        <thead className="table-header-orange">
          <tr>
            <th style={{ cursor: "pointer" }}>
              S No.
            </th>
            <th style={{ cursor: "pointer" }}>
              Role
            </th>
            <th style={{ cursor: "pointer" }}>
              Name
            </th>
            <th style={{ cursor: "pointer" }}>
              Email
            </th>
          </tr>
        </thead>
        <tbody className="table-body-orange">
          {usersData && filteredUsers.map((user, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{user?.role}</td>
              <td>{user?.name}</td>
              <td>{user?.email}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      {/* <div className="left-panel">
        <img src={panaImage} alt="Illustration" />
        <h2>बैंक ऑफ़ बड़ौदा</h2>
        <h3>Bank of Baroda</h3>
      </div> */}

      {/* <div className="right-panel"> */}
        {/* <div className="logo">
          <img src={logoImage} alt="Logo" />
          <h4>Recruitment</h4>
        </div> */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered className="user-register-modal">
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold text-orange fs-4">User Registration</Modal.Title>
          </Modal.Header>
          <Modal.Body className="align-self-center">
            <form onSubmit={handleRegister} className="d-flex flex-column my-3" style={{ minWidth: '15vw' }}>
              <div className="d-flex justify-content-between mb-4 gap-3">
                <div className="d-flex flex-column" style={{ width: '65%' }}>
                  <label>Role</label>
                  <select
                    name="role"
                    onChange={handleChange}
                    required
                    style={{ borderRadius: "5px", backgroundColor: "#fff", border: "1px solid #ccc", padding: '8px 12px' }}
                    value={form.role}
                  >
                    <option value="">Select Role</option>
                    <option value="Admin">Admin</option>
                    <option value="Recruiter">Recruiter</option>
                    <option value="Interviewer">Interviewer</option>
                    {/* <option value="L1">L1</option>
                    <option value="L2">L2</option> */}
                  </select>
                </div>
                <div className="d-flex flex-column" style={{ width: '65%' }}>
                  <label>Full Name</label>
                  <input name="name" onChange={handleChange} required style={{ borderRadius: "5px", backgroundColor: "#fff", border: "1px solid #ccc", padding: '8px 12px' }}/>
                </div>
              </div>

              <div className="d-flex justify-content-between mb-4 gap-3">
                <div className="d-flex flex-column" style={{ width: '65%' }}>
                  <label>Email</label>
                  <input type="email" name="email" onChange={handleChange} required style={{ borderRadius: "5px", backgroundColor: "#fff", border: "1px solid #ccc", padding: '8px 12px' }}/>
                </div>
                <div className="d-flex flex-column" style={{ width: '65%' }}>
                  <label>Phone</label>
                  <input type="text" name="phone" onChange={handleChange} required style={{ borderRadius: "5px", backgroundColor: "#fff", border: "1px solid #ccc", padding: '8px 12px' }}/>
                </div>
              </div>

              <div className="d-flex justify-content-between mb-4 gap-3">
                <div className="d-flex flex-column" style={{ width: '65%' }}>
                  <label>Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      onChange={handleChange}
                      required
                      style={{
                        borderRadius: "5px",
                        backgroundColor: "#fff",
                        border: "1px solid #ccc",
                        padding: "8px",
                        width: "100%",
                        paddingRight: "40px",
                      }}
                    />
                    <FontAwesomeIcon
                      icon={showPassword ? faEye : faEyeSlash}
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        cursor: "pointer",
                        color: "#666",
                      }}
                      title={showPassword ? "Hide password" : "Show password"}
                    />
                  </div>
                </div>
                <div className="d-flex flex-column" style={{ width: '65%' }}>
                  <label>Confirm Password</label>
                    <div style={{ position: "relative" }}>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      onChange={handleChange}
                      required
                      style={{
                        borderRadius: "5px",
                        backgroundColor: "#fff",
                        border: "1px solid #ccc",
                        padding: "8px",
                        width: "100%",
                        paddingRight: "40px",
                      }}
                    />
                    <FontAwesomeIcon
                      icon={showConfirmPassword ? faEye : faEyeSlash}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        cursor: "pointer",
                        color: "#666",
                      }}
                      title={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="login-button mt-4 mb-0">Register</button>
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


              {/* <p className="register-link">
                Already a user? <Link to="/login">Login here</Link>
              </p> */}
            </form>
          </Modal.Body>
        </Modal>
      </div>
    // </div>
  );
};

export default Register;