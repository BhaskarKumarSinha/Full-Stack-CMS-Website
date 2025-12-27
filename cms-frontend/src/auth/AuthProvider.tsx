import { useEffect, useState } from "react";
import api from "../api/api";
import { AuthContext } from "./AuthContext";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem("cms_token");
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (token) localStorage.setItem("cms_token", token);
      else localStorage.removeItem("cms_token");
    } catch {
      // Ignore storage errors (e.g., in private browsing mode)
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    const t = res.data?.token;
    if (!t) throw new Error("No token returned from server");
    setToken(t);
  };

  const logout = () => setToken(null);

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
