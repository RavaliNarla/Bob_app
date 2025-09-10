// src/components/TokenGuard.jsx
import { useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useDispatch, useSelector } from "react-redux";
import { clearUser, setAuthUser } from "../store/userSlice";
import apiService from "../services/apiService";

const Tokenexp = ({ children }) => {
  // const navigate = useNavigate();
  // const dispatch = useDispatch();
  // const location = useLocation();
  // const auth = useSelector((state) => state.user.authUser);
  // const token = auth?.access_token;
  // const refreshToken = auth?.refresh_token;

  // const logoutUser = (msg = "Session expired. Please log in again.") => {
  //   alert(msg);
  //   dispatch(clearUser());
  //   navigate("/login");
  // };

  // const tryRefresh = async () => {
  //   if (!refreshToken) return logoutUser();

  //   try {
  //     const refreshed = await apiService.refreshToken(
  //       refreshToken,
  //       auth?.user?.role === "Candidate" ? "candidate" : "recruiter"
  //     );
  //     // merge refreshed access_token into redux
  //     dispatch(setAuthUser({ ...auth, ...refreshed, refresh_token: refreshToken }));
  //     console.log("🔄 Token refreshed successfully", refreshed);
  //   } catch (err) {
  //     console.error("Token refresh failed", err);
  //     logoutUser();
  //   }
  // };

  // useEffect(() => {
  //   if (token) {
  //     try {
  //       const { exp } = jwtDecode(token);
  //       const timeLeft = exp * 1000 - Date.now();
  //       console.log("🕒 Token expires at:", exp.toLocaleString());
  //       console.log("⏳ Time left (ms):", timeLeft);
  //       if (timeLeft <= 0) {
  //         console.warn("⚠️ Token already expired");
  //         // already expired
  //         logoutUser("Session expired. Please log in again.");
  //       } else if (timeLeft < 60 * 1000) {
  //         console.warn("⚠️ Token expiring soon, refreshing...");
  //         // less than 1 min left → refresh proactively
  //         tryRefresh();
  //       } else {
  //         console.info("✅ Token still valid");
  //       }
  //     } catch (err) {
  //       console.error("Invalid token", err);
  //       logoutUser("Invalid session. Please log in again.");
  //     }
  //   }
  // }, [token, location.pathname]);

  return (
    <div>
      {/* Any global wrapper UI, like header, layout, etc. */}
      <Outlet /> {/* <-- This renders the nested routes (Dashboard, etc.) */}
    </div>
  );
};

export default Tokenexp;
