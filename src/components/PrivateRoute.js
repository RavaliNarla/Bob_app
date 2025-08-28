// src/components/PrivateRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRoute = ({ children }) => {
  const { authUser, user } = useSelector((state) => state.user);

  // ✅ Only allow if both exist
  if (!authUser || !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
