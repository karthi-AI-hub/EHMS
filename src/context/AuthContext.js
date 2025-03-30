import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (token) {
      try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const decodedToken = jwtDecode(token); // Decode the token
        setUser({
          name: decodedToken.name, // Retrieve name from the token
          employeeId: decodedToken.employeeId, // Extract employeeId from the token
          role: decodedToken.role, // Extract role from the token
        });
      } catch (error) {
        console.error("Invalid token:", error);
        sessionStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const login = async (employeeId, password) => {
    const res = await api.post("/auth/login", { employeeId, password });

    sessionStorage.setItem("token", res.data.token);

    api.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;

    const decodedToken = jwtDecode(res.data.token);
    setUser({
      name: decodedToken.name,
      employeeId: decodedToken.employeeId,
      role: decodedToken.role,
    });

    return {
      ...res.data,
      role: decodedToken.role,
    };
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("name");
      setUser(null);
      navigate("/", { replace: true });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
