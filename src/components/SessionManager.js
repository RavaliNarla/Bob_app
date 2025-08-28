import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearUser } from "../store/userSlice";

const SessionManager = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const TIMEOUT = 15 * 60 * 1000; // 15 minutes
  let timer;

  const resetTimer = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      dispatch(clearUser());
      alert("You’ve been logged out due to inactivity.");
      navigate("/login");
    }, TIMEOUT);
  };

  useEffect(() => {
    const events = ["mousemove", "keydown", "click"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => events.forEach((e) => window.removeEventListener(e, resetTimer));
  }, []);

  return children;
};

export default SessionManager;
