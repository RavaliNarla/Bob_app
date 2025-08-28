import React, { createContext, useContext, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser, setAuthUser, logout as logoutAction } from "../store/userSlice";
import { apiService } from "../services/apiService";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user, authUser } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(true);

  // token comes from redux now
  const token = authUser?.access_token;

  useEffect(() => {
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiService.login(email, password);
      const { user: userData, token: userToken } = response;

      // ✅ Save in Redux
      dispatch(setAuthUser({ access_token: userToken }));
      dispatch(setUser(userData));

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Login failed",
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await apiService.register(name, email, password);
      const { user: userData, token: userToken } = response;

      // ✅ Save in Redux
      dispatch(setAuthUser({ access_token: userToken }));
      dispatch(setUser(userData));

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Registration failed",
      };
    }
  };

  const logout = () => {
    dispatch(logoutAction()); // ✅ clears redux-persist automatically
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
