import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/reducers/rootReducer";
import StudentLayout from "@/components/layout/StudentLayout";
import AdminLayout from "@/components/layout/AdminLayout";
import CompanyLayout from "@/components/layout/CompanyLayout";

const RouteOutlet: React.FC = () => {
     const location = useLocation();
    const { isAuthenticated, userType } = useSelector(
        (state: RootState) => state.auth
    );

  if (!isAuthenticated) {
    if (location.pathname.startsWith("/superadmin")) {
      return <Navigate to="/login" replace state={{ from: location }} />;
    }
    return <Navigate to="/login" replace />;
  }

  // 🔥 Check route path and enforce role matching
  const role = userType?.toLowerCase();

  if (location.pathname.startsWith("/student")) {
    if (role !== "student") return <Navigate to="/login" replace />;
    return <StudentLayout />;
  }

  if (location.pathname.startsWith("/admin")) {
    if (role !== "admin") return <Navigate to="/login" replace />;
    return <AdminLayout />;
  }

  if (location.pathname.startsWith("/superadmin")) {
    if (role !== "super_admin" && role !== "superadmin") {
      return <Navigate to="/login" replace />;
    }
    return <AdminLayout />;
  }

  if (location.pathname.startsWith("/company")) {
    if (role !== "company") return <Navigate to="/login" replace />;
    return <CompanyLayout />;
  }

  return <Navigate to="/login" replace />;
};

export default RouteOutlet;