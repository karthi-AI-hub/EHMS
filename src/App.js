import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import SplashScreen from "./pages/SplashScreen";
import NotFound from "./pages/NotFound";
import AuthLogin from "./pages/auth/AuthLogin";
import EmployeeDashboard from "./pages/dashboard/EmployeeDashboard";
import Profile from "./pages/Profile";
import Reports from "./pages/employee/Reports";
import DoctorDashboard from "./pages/dashboard/DoctorDashboard";
import TechnicianDashboard from "./pages/dashboard/TechnicianDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import ChangePassword from "./pages/auth/ChangePassword";
import ProtectedRoute from "./utils/ProtectedRoute";
import Unauthorized from "./pages/auth/Unauthorized";
import UnifiedLayout from "./layouts/UnifiedLayout"; 
import EmployeeDirectory from "./pages/EmployeeDirectory";
import TechnicianReports from "./pages/technician/TechnicianReports";
import FileUploadPage from "./pages/technician/FileUpload";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/auth/login" element={<AuthLogin />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Unified Layout for All Roles */}
          <Route
            path="/employee/*"
            element={
              <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
                <UnifiedLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<EmployeeDashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="reports" element={<Reports />} />
            <Route
              path="directory"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <EmployeeDirectory />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route
            path="/doctor/*"
            element={
              <ProtectedRoute allowedRoles={["DOCTOR"]}>
                <UnifiedLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<DoctorDashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="employeesList" element={<EmployeeDirectory />} />
          </Route>

          <Route
            path="/technician/*"
            element={
              <ProtectedRoute allowedRoles={["TECHNICIAN"]}>
                <UnifiedLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<TechnicianDashboard />} />
            <Route path="employeesList" element={<EmployeeDirectory />} />
            <Route path="profile" element={<Profile />} />
            <Route path="reports/:employeeId" element={<TechnicianReports />} />
            <Route path="upload-reports/:employeeId" element={<FileUploadPage />} />
          </Route>

          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <UnifiedLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
          </Route>

          {/* 404 Page */}
          <Route path="*" element={<NotFound/>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
