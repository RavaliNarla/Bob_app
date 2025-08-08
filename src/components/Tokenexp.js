// src/components/TokenGuard.jsx
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {jwtDecode} from "jwt-decode";

const Tokenexp = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        const { exp } = jwtDecode(token);
        if (Date.now() >= exp * 1000) {
          alert("Session expired. Please log in again.");
          localStorage.removeItem("access_token");
          navigate("/login");
        }
      } catch (err) {
        console.error("Invalid token", err);
        localStorage.removeItem("access_token");
        navigate("/login");
      }
    }
  }, [location.pathname, navigate]);

  return children;
};

export default Tokenexp;