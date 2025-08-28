// src/components/TokenGuard.jsx
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import { useDispatch, useSelector } from "react-redux";
import { clearUser } from "../store/userSlice";

const Tokenexp = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const token = useSelector((state) => state.user.auth?.access_token);

  useEffect(() => {
    if (token) {
      try {
        const { exp } = jwtDecode(token);
        if (Date.now() >= exp * 1000) {
          alert("Session expired. Please log in again.");
          dispatch(clearUser());
          navigate("/login");
        }
      } catch (err) {
        console.error("Invalid token", err);
        dispatch(clearUser());
        navigate("/login");
      }
    }
  }, [location.pathname, navigate]);

  return children;
};

export default Tokenexp;