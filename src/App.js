import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import SplashScreen from "./pages/SplashScreen";
import NotFound from "./pages/NotFound";
import AuthLogin from "./pages/auth/AuthLogin";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/auth/ChangePassword";
import ProtectedRoute from "./utils/ProtectedRoute";
import Unauthorized from "./pages/auth/Unauthorized";
import UnifiedLayout from "./layouts/UnifiedLayout"; 
import EmployeeDirectory from "./pages/EmployeeDirectory";
import DoctorsList from "./pages/DoctorsList";
import TechniciansList from "./pages/TechnicianList";
import AdminDashboard from "./pages/admin/AdminDashboard";
import EmployeeReports from "./pages/EmployeeReports";
import FileUploadPage from "./utils/FileUpload";
import Analytics from "./pages/Analytics";

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
              <ProtectedRoute allowedRoles={["EMPLOYEE","DOCTOR","TECHNICIAN","ADMIN"]}>
                <UnifiedLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<EmployeeReports />} />
            <Route path="profile" element={<Profile />} />
            <Route path="reports/:employeeId" element={<EmployeeReports />} />
            <Route path="doctorsList" element={<DoctorsList />} />

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
            <Route path="dashboard" element={<Analytics />} />
            <Route path="profile" element={<Profile />} />
            <Route path="employeesList" element={<EmployeeDirectory />} />
            <Route path="techniciansList" element={<TechniciansList />} />
            <Route path="reports/:employeeId" element={<EmployeeReports />} />
          </Route>

          <Route
            path="/technician/*"
            element={
              <ProtectedRoute allowedRoles={["TECHNICIAN"]}>
                <UnifiedLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Analytics />} />
            <Route path="profile" element={<Profile />} />
            <Route path="reports/:employeeId" element={<EmployeeReports />} />
            <Route path="upload-reports/:employeeId" element={<FileUploadPage />} />
            <Route path="employeesList" element={<EmployeeDirectory />} />
            <Route path="doctorsList" element={<DoctorsList />} />
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
            <Route path="profile" element={<Profile />} />
            <Route path="reports/:employeeId" element={<EmployeeReports />} />
            <Route path="employeesList" element={<EmployeeDirectory />} />
            <Route path="doctorsList" element={<DoctorsList />} />
            <Route path="techniciansList" element={<TechniciansList />} />
            <Route path="reportAnalytics" element={<Analytics />} />
          </Route>

          {/* 404 Page */}
          <Route path="*" element={<NotFound/>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
