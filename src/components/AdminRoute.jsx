import React from "react";
import { Navigate } from "react-router-dom";
import { isAdminUser } from "../utils/api";

function AdminRoute({ children }) {
  if (!isAdminUser()) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export default AdminRoute;
