import { createContext, useState, useEffect, useContext } from "react";
import api from "../api/axiosConfig";

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      setUser(null);
      return;
    }

    try {
      const res = await api.get("/api/auth/me");
      setUser(res.data);
    } catch (err) {
      console.error("Session expired", err);
      logout();
    }
  };

  const login = async (data) => {
    if (!data?.token) {
      console.error("Invalid login response:", data);
      return;
    }

    sessionStorage.setItem("token", data.token);

    try {
      const res = await api.get("/api/auth/me");
      setUser(res.data);
    } catch (err) {
      console.error("Failed to load user after login", err);
      logout();
    }
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
