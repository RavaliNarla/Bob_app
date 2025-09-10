// src/components/PrivateRoute.js
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRoute = () => {
  const { user } = useSelector((state) => state.user);

  // ✅ Only allow if both exist
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />; // 🔑 renders the nested route (Layout, Dashboard, etc.)
};

export default PrivateRoute;
