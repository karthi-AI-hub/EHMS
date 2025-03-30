import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeSlash, Key } from "react-bootstrap-icons";
import api from "../../utils/api"; // Use centralized API
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import LoadingScreen from "../../components/common/LoadingScreen";

const ChangePassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const employeeId = new URLSearchParams(location.search).get("employeeId");
  const role = new URLSearchParams(location.search).get("role"); // Retrieve the role from query parameters

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/unauthorized");
    }
  }, [navigate]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!newPassword || !confirmPassword) {
      setError("❌ Both fields are required.");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("❌ Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      await api.post("/auth/change-password", {
        employeeId,
        currentPassword: employeeId,
        newPassword,
      });
      alert("✅ Password changed successfully!");

      // Redirect to the role-based dashboard
      navigate(`/${role}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.error || "Password change failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Changing password..." />;
  }

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="card p-4 shadow-lg"
        style={{ width: "400px", borderRadius: "12px" }}
      >
        <h3 className="text-center mb-3">Change Password</h3>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="alert alert-danger">
            {error}
          </motion.div>
        )}

        <form onSubmit={handleChangePassword}>
          {/* Employee ID */}
          <div className="mb-3">
            <label htmlFor="employeeId" className="form-label">Employee ID</label>
            <input
              type="text"
              id="employeeId"
              className="form-control"
              value={employeeId}
              disabled
            />
          </div>

          {/* New Password */}
          <div className="mb-3">
            <label htmlFor="newPassword" className="form-label">New Password</label>
            <div className="input-group">
              <span className="input-group-text"><Key size={20} /></span>
              <input
                type={showPassword ? "text" : "password"}
                id="newPassword"
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeSlash /> : <Eye />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="mb-3">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <div className="input-group">
              <span className="input-group-text"><Key size={20} /></span>
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm text-light"></span> : "Change Password"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ChangePassword;
