import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeSlash, Key, Person } from "react-bootstrap-icons";
import LoadingScreen from "../../components/common/LoadingScreen";

const AuthLogin = () => {
  const { login } = useAuth();
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const navigate = useNavigate();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const role = queryParams.get("role");

  const validRoles = ["Employee", "Doctor", "Technician", "Admin"];

  useEffect(() => {
    if (!role || !validRoles.includes(role)) {
      navigate("/");
    }
  }, [role, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(employeeId, password);

      if (res.role.toLowerCase() !== role.toLowerCase() && !res.role.toLowerCase() === "admin") {
        setError(`You are not authorized to log in as ${role}. Redirecting to the correct login page...`);

        setTimeout(() => {
          const formattedRole = res.role.charAt(0).toUpperCase() + res.role.slice(1).toLowerCase();
          navigate(`/auth/login?role=${formattedRole}`);
          setError(null);
        }, 2000);

        return;
      }

      if (res.firstTime) {
        sessionStorage.setItem("token", res.token);
        navigate(`/change-password?employeeId=${employeeId}&role=${res.role.toLowerCase()}`);
      } else if (res.role) {
        navigate(`/${res.role.toLowerCase()}/dashboard`);
      } else {
        throw new Error("Role is missing in the response.");
      }
    } catch (err) {
      if (err.response?.status === 429) {
        setError("Too many login attempts. Please try again later.");
      } else {
        setError(err.response?.data?.error || err.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShowHints = () => {
    setShowHints(!showHints);
  };

  if (loading) {
    return <LoadingScreen message="Logging in..." />;
  }

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg" style={{ maxWidth: "400px", width: "100%" }}>
        <div className="card-header bg-primary text-white text-center">
          <h3>{role} Login</h3>
        </div>
        <div className="card-body p-4">
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">{role} ID</label>
              <div className="input-group">
                <span className="input-group-text bg-light">
                  <Person />
                </span>
                <input
                  type="text"
                  className="form-control"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <div className="input-group">
                <span className="input-group-text bg-light">
                  <Key />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeSlash /> : <Eye />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary w-100 mb-3"
              disabled={loading || error === "Too many login attempts. Please try again later."}
            >
              Login
            </button>
          </form>
          <button
            className="btn btn-outline-secondary w-100 mb-3"
            onClick={() => navigate("/")}
          >
            Select Role?
          </button>
          <button
            className="btn btn-info w-100"
            onClick={handleShowHints}
          >
            {showHints ? "Hide Hints" : "Show Hints"}
          </button>
          {showHints && (
            <>
              <hr className="my-3" />
              <div className="mt-3">
                {role === "Employee" && (
                  <p className="text-muted">
                    <strong>Employee ID : </strong> EMP001, Password : EMP001
                  </p>
                )}
                {role === "Doctor" && (
                  <p className="text-muted">
                    <strong>DoctorID : </strong> DOC001, Password : DOC001
                  </p>
                )}
                {role === "Technician" && (
                  <p className="text-muted">
                    <strong>Technician ID : </strong> TEC001, Password : TEC001
                  </p>
                )}
                {role === "Admin" && (
                  <p className="text-muted">
                    <strong>Admin : </strong> Admin credentials are not displayed for security reasons.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthLogin;
