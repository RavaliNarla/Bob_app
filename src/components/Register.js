// src/pages/Register.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Button, Modal, Table } from "react-bootstrap";
// import panaImage from "../assets/pana.png";
// import logoImage from "../assets/bob-logo.png";

const Register = () => {
  const navigate = useNavigate();
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
//   const [otp, setOtp] = useState("");
// const [mfaToken, setMfaToken] = useState("");
// const [showOtpInput, setShowOtpInput] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("https://bobbe.sentrifugo.com/api/getdetails/users/all"); // Update URL if needed
      setUsersData(res.data);
      console.log("Fetched users:", res.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

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
    // 1. Register user via your backend
    await axios.post("https://bobbe.sentrifugo.com/api/auth/recruiter-register", {
      name,
      email,
      phone,
      password,
      role
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
    <div className="login-container register_container d-flex flex-column p-3 py-4">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '18px !important', color: '#FF7043', marginBottom: '0px' }}>User Registration</h5>
        <Button 
          onClick={() => setShowModal(true)}
          style={{ backgroundColor: '#FF7043', borderColor: '#FF7043', color: '#fff' }}
        >
          + Add
        </Button>
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
          {usersData.map((user, index) => (
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
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>User Registration</Modal.Title>
          </Modal.Header>
          <Modal.Body className="align-self-center">
            <form onSubmit={handleRegister} className="d-flex flex-column my-3" style={{ minWidth: '15vw' }}>
              <label>Role</label>
              <select
                name="role"
                onChange={handleChange}
                required
                style={{ borderRadius: "20px", backgroundColor: "#fff", border: "1px solid #ccc", padding: '8px 12px' }}
                value={form.role}
              >
                <option value="">Select Role</option>
                <option value="Admin">Admin</option>
                <option value="Recruiter">Recruiter</option>
              </select>
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