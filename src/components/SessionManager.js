import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SessionManager = ({ children }) => {
  const navigate = useNavigate();
  const TIMEOUT = 15 * 60 * 1000; // 15 minutes
  let timer;

  const resetTimer = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
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
