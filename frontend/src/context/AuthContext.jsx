import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi, getErrorMessage, setAuthToken } from "../services/api.js";

const AuthContext = createContext(null);
const STORAGE_KEY = "teleglobals_auth";

export function AuthProvider({ children }) {
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const saved = JSON.parse(raw);
        if (!saved?.token) return;
        setAuthToken(saved.token);
        setToken(saved.token);
        const response = await authApi.me();
        setUser(response.data.employee);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        setAuthToken("");
        setToken("");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restore();
  }, []);

  const persist = (nextToken, employee) => {
    setAuthToken(nextToken);
    setToken(nextToken);
    setUser(employee);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: nextToken }));
  };

  const login = async (email, password) => {
    const response = await authApi.login({ email, password });
    persist(response.data.token, response.data.employee);
    return response.data.employee;
  };

  const register = async (payload) => {
    const response = await authApi.register(payload);
    persist(response.data.token, response.data.employee);
    return response.data.employee;
  };

  const refreshMe = async () => {
    const response = await authApi.me();
    setUser(response.data.employee);
    return response.data.employee;
  };

  const updateProfile = async (payload) => {
    const response = await authApi.updateMe(payload);
    setUser(response.data.employee);
    return response.data.employee;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAuthToken("");
    setToken("");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token && user),
      isAdmin: user?.role === "ADMIN",
      login,
      register,
      logout,
      refreshMe,
      updateProfile,
      getErrorMessage,
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
