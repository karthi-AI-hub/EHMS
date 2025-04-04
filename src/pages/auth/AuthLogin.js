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
  const navigate = useNavigate();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const role = queryParams.get("role");

  const validRoles = ["Employee", "Doctor", "Technician", "Admin"];

  useEffect(() => {
    // Redirect to home page if role is missing or invalid
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

  if (loading) {
    return <LoadingScreen message="Logging in..." />;
  }

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow-lg" style={{ maxWidth: "400px", width: "100%" }}>
        <h3 className="text-center mb-4">{role} Login</h3>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>{role} ID</label>
            <div className="input-group">
              <span className="input-group-text">
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
            <label>Password</label>
            <div className="input-group">
              <span className="input-group-text">
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
          className="btn btn-outline-secondary w-100"
          onClick={() => navigate("/")}
        >
          Select Role?
        </button>
      </div>
    </div>
  );
};

export default AuthLogin;
