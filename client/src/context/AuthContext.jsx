import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { AuthContext } from "./authContextValue";
import { TOKEN_KEY, USER_KEY } from "../utils/constants";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    const value = localStorage.getItem(USER_KEY);
    return value ? JSON.parse(value) : null;
  });
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Validate stored token on mount
  useEffect(() => {
    const validateToken = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (storedToken) {
        try {
          const { data } = await api.get("/auth/me");
          setUser(data.user);
          localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        } catch {
          // If token verification failed, clear local auth
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setToken(null);
          setUser(null);
        }
      }
      setLoadingAuth(false);
    };

    validateToken();
  }, []);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      delete api.defaults.headers.common.Authorization;
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [user]);

  const register = useCallback(async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const login = useCallback(async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    delete api.defaults.headers.common.Authorization;
    setToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const { data } = await api.put("/auth/profile", payload);
    setUser(data.user);
    return data;
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      loadingAuth,
      isAuthenticated: Boolean(token),
      register,
      login,
      logout,
      updateProfile
    }),
    [token, user, loadingAuth, register, login, logout, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
